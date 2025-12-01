'use client';
import { useState, useEffect } from 'react';
import { Search, Plus, Phone, CreditCard, MapPin, Loader2, Edit, Trash2, Eye } from 'lucide-react';
import axios from '@/lib/axios-client';
import { message, Form, Input, Modal, Table, Tag } from 'antd';
import { useDebounce } from '@/hooks/useDebounce'; 

// Sub-component for Uploading CCCD
const UploadCCCD = ({ side, onUpload }: { side: 'front' | 'back', onUpload: (url: string) => void }) => {
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/upload/image/tenants', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const url = res.data.data.url;
            setImageUrl(url);
            onUpload(url);
            message.success('Upload ảnh thành công!');
        } catch (error) {
            console.error(error);
            message.error('Lỗi upload ảnh');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-2 border-black border-dashed p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors relative h-32 flex items-center justify-center">
            <input 
                type="file" 
                accept="image/*" 
                onChange={handleUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            {loading ? (
                <Loader2 className="animate-spin text-gray-400" />
            ) : imageUrl ? (
                <img src={imageUrl} alt="CCCD" className="h-full object-contain" />
            ) : (
                <div className="text-gray-400">
                    <Plus className="mx-auto mb-1" />
                    <span className="text-xs font-bold uppercase">{side === 'front' ? 'Mặt trước' : 'Mặt sau'}</span>
                </div>
            )}
        </div>
    );
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // State for viewing full details
  const [viewDetailModalOpen, setViewDetailModalOpen] = useState(false);
  const [selectedTenantDetail, setSelectedTenantDetail] = useState<any>(null);

  const fetchTenants = async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query ? `/tenants/search?q=${query}` : '/tenants';
      const res = await axios.get(endpoint);
      setTenants(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách khách thuê!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTenants(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSaveTenant = async (values: any) => {
    try {
      if (editingId) {
        await axios.patch(`/tenants/${editingId}`, values);
        message.success('Cập nhật khách thuê thành công! 🎉');
      } else {
        await axios.post('/tenants', values);
        message.success('Thêm khách thuê thành công! 🚀');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchTenants(searchTerm);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 409) {
        message.error('Số điện thoại đã tồn tại!');
      } else {
        message.error('Lỗi khi lưu khách thuê');
      }
    }
  };

  const handleEdit = (tenant: any) => {
    setEditingId(tenant.id);
    form.setFieldsValue(tenant);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await axios.delete(`/tenants/${deleteId}`);
        message.success('Đã xóa khách thuê! 🗑️');
        fetchTenants(searchTerm);
      } catch (error: any) {
           if (error.response?.status === 409) {
              message.error('Không thể xóa: Khách đang có hợp đồng!');
           } else {
              message.error('Lỗi khi xóa khách thuê');
           }
      } finally {
        setDeleteId(null);
      }
    }
  };

  const handleViewDetail = (tenant: any) => {
      setSelectedTenantDetail(tenant);
      setViewDetailModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (text: any) => <span className="font-bold text-gray-500">#{text}</span>,
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: any) => (
          <div className="cursor-pointer hover:text-blue-600 hover:underline" onClick={() => handleViewDetail(record)}>
              <span className="font-black uppercase text-lg">{text}</span>
          </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => (
          <div className="flex items-center gap-2 font-mono">
              <Phone size={14} /> {text}
          </div>
      ),
    },
    {
      title: 'Phòng / Tòa Nhà',
      key: 'room',
      render: (_: any, record: any) => {
        const activeContract = record.contracts?.[0];
        if (!activeContract) return <Tag color="default">Chưa thuê</Tag>;
        
        return (
          <div className="flex flex-col">
            <span className="font-bold text-base">{activeContract.room?.name}</span>
            <span className="text-xs text-gray-500">{activeContract.room?.building?.name}</span>
          </div>
        );
      },
    },
    {
      title: 'CCCD',
      dataIndex: 'cccd',
      key: 'cccd',
      render: (text: string) => text ? (
        <div className="flex items-center gap-2 font-mono text-gray-600">
            <CreditCard size={14} /> {text}
        </div>
      ) : <span className="text-gray-300 italic">Chưa có</span>,
    },
    {
        title: 'Quê quán',
        dataIndex: ['info', 'hometown'],
        key: 'hometown',
        render: (text: string) => text ? (
            <div className="flex items-center gap-2">
                <MapPin size={14} /> {text}
            </div>
        ) : '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleViewDetail(record)} 
            className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all text-black"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          <button 
            onClick={() => handleEdit(record)} 
            className="w-8 h-8 flex items-center justify-center bg-[#4DA2FF] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all text-black"
            title="Sửa thông tin"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => handleDelete(record.id)} 
            className="w-8 h-8 flex items-center justify-center bg-[#FF6B6B] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all text-black"
            title="Xóa khách thuê"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-black font-sans p-8">
      <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-1">Tenants</h1>
          <p className="text-gray-500 font-medium">Quản lý hồ sơ khách thuê trọ.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white border-2 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all"
        >
          <Plus size={20} /> Thêm khách mới
        </button>
      </div>

      <div className="mb-8 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm theo tên, SĐT, CCCD..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-all font-medium"
        />
      </div>

      <style jsx global>{`
        .neobrutalism-table .ant-table-thead > tr > th {
          background-color: #000 !important;
          color: #fff !important;
          text-transform: uppercase;
          font-weight: 900;
          border-right: 1px solid #fff !important;
          border-bottom: 2px solid #000 !important;
          border-radius: 0 !important;
        }
        .neobrutalism-table .ant-table-thead > tr > th:last-child {
          border-right: none !important;
        }
        .neobrutalism-table .ant-table-tbody > tr > td {
          border-bottom: 2px solid #000 !important;
          font-weight: 500;
        }
        .neobrutalism-table .ant-table-container {
          border: 2px solid #000 !important;
        }

        /* Modal Styles */
        .gumroad-modal .ant-modal-content {
            padding: 0 !important;
            border: 3px solid black !important;
            border-radius: 0 !important;
            box-shadow: 8px 8px 0px 0px #000 !important;
            overflow: visible !important;
        }
        .gumroad-modal .ant-modal-close {
            top: -20px !important;
            right: -20px !important;
            width: 40px !important;
            height: 40px !important;
            background: white !important;
            border: 3px solid black !important;
            opacity: 1 !important;
            border-radius: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 4px 4px 0px 0px #000 !important;
            z-index: 1000 !important;
            transition: all 0.2s ease;
        }
        .gumroad-modal .ant-modal-close:hover {
            background: #FF4D4D !important;
            color: white !important;
            transform: translate(2px, 2px);
            box-shadow: none !important;
        }
        .gumroad-modal .ant-modal-close-x {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 900;
        }
      `}</style>

      <div className="bg-white">
        <Table 
            columns={columns} 
            dataSource={tenants} 
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            className="neobrutalism-table"
        />
      </div>

      {/* ADD/EDIT MODAL */}
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        title={null}
        width={700}
        centered
        className="gumroad-modal"
        closeIcon={<span>✕</span>}
      >
        <div className="bg-white" style={{ backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(to right, #E5E7EB 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            {/* HEADER */}
            <div className="bg-[#FFD700] border-b-3 border-black p-6 flex items-center justify-between border-b-[3px]">
                <div className="bg-white border-2 border-black px-4 py-1 transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-2xl font-black uppercase m-0 tracking-tighter">
                        {editingId ? 'SỬA THÔNG TIN' : 'THÊM KHÁCH MỚI'}
                    </h2>
                </div>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
                <Form form={form} onFinish={handleSaveTenant} layout="vertical" className="font-mono">
                    
                    {/* SECTION 1 */}
                    <div className="mb-8">
                        <div className="inline-block bg-[#FF69B4] border-2 border-black px-3 py-1 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                            <span className="font-black text-sm uppercase text-white tracking-wide">1. THÔNG TIN CƠ BẢN</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Item name="fullName" rules={[{ required: true, message: 'Nhập họ tên!' }]} className="mb-0">
                                <div className="mb-1 font-bold uppercase text-xs">Họ và tên <span className="text-red-500">*</span></div>
                                <Input className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-2 px-3 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" placeholder="VD: Nguyễn Văn A" />
                            </Form.Item>
                            
                            <Form.Item name="phone" rules={[{ required: true, message: 'Nhập SĐT!' }, { len: 10, message: 'SĐT phải 10 số' }]} className="mb-0">
                                <div className="mb-1 font-bold uppercase text-xs">Số điện thoại <span className="text-red-500">*</span></div>
                                <Input className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-2 px-3 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" placeholder="VD: 0901234567" />
                            </Form.Item>

                            <Form.Item name="cccd" className="mb-0">
                                <div className="mb-1 font-bold uppercase text-xs">Số CCCD/CMND</div>
                                <Input className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-2 px-3 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" placeholder="VD: 001234567890" />
                            </Form.Item>

                            <Form.Item name={['info', 'dob']} className="mb-0">
                                <div className="mb-1 font-bold uppercase text-xs">Ngày sinh</div>
                                <Input className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-2 px-3 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" placeholder="DD/MM/YYYY" />
                            </Form.Item>

                            <Form.Item name={['info', 'email']} className="mb-0">
                                <div className="mb-1 font-bold uppercase text-xs">Email</div>
                                <Input className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-2 px-3 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" placeholder="example@gmail.com" />
                            </Form.Item>

                            <Form.Item name={['info', 'job']} className="mb-0">
                                <div className="mb-1 font-bold uppercase text-xs">Nghề nghiệp</div>
                                <Input className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-2 px-3 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" placeholder="VD: Sinh viên, NVVP" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* SECTION 2 */}
                    <div className="mb-8">
                        <div className="inline-block bg-[#4DA2FF] border-2 border-black px-3 py-1 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
                            <span className="font-black text-sm uppercase text-white tracking-wide">2. THÔNG TIN BỔ SUNG</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Item name={['info', 'hometown']} className="md:col-span-2 mb-0">
                                <div className="mb-1 font-bold uppercase text-xs">Quê quán / Địa chỉ thường trú</div>
                                <Input className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-2 px-3 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" placeholder="VD: Số 1, Đường A, Phường B, TP. Nam Định" />
                            </Form.Item>

                            <Form.Item name={['info', 'licensePlate']} className="mb-0">
                                <div className="mb-1 font-bold uppercase text-xs">Biển số xe</div>
                                <Input className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-2 px-3 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" placeholder="VD: 29A-123.45" />
                            </Form.Item>
                            
                            <Form.Item name={['info', 'note']} className="mb-0">
                                <div className="mb-1 font-bold uppercase text-xs">Ghi chú</div>
                                <Input className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-2 px-3 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" placeholder="Ghi chú thêm..." />
                            </Form.Item>
                        </div>
                    </div>

                    {/* SECTION 3 */}
                    <div className="mb-6">
                        <div className="inline-block bg-[#00E054] border-2 border-black px-3 py-1 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                            <span className="font-black text-sm uppercase text-white tracking-wide">3. ẢNH GIẤY TỜ TÙY THÂN</span>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <Form.Item className="mb-0">
                                <div className="mb-1 font-bold uppercase text-xs">Mặt Trước CCCD</div>
                                <UploadCCCD side="front" onUpload={(url) => form.setFieldValue(['info', 'cccdFront'], url)} />
                            </Form.Item>
                            <Form.Item className="mb-0">
                                <div className="mb-1 font-bold uppercase text-xs">Mặt Sau CCCD</div>
                                <UploadCCCD side="back" onUpload={(url) => form.setFieldValue(['info', 'cccdBack'], url)} />
                            </Form.Item>
                            <Form.Item name={['info', 'cccdFront']} hidden><Input /></Form.Item>
                            <Form.Item name={['info', 'cccdBack']} hidden><Input /></Form.Item>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t-2 border-black border-dashed">
                        <button type="button" onClick={handleCancel} className="px-6 py-3 font-black uppercase border-2 border-black bg-white hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                            Hủy bỏ
                        </button>
                        <button type="submit" className="px-6 py-3 font-black uppercase border-2 border-black bg-[#FFD700] text-black hover:bg-[#FFC000] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                            {editingId ? 'LƯU THAY ĐỔI' : 'TẠO KHÁCH HÀNG'}
                        </button>
                    </div>
                </Form>
            </div>
        </div>
      </Modal>

      {/* VIEW DETAIL MODAL */}
      <Modal
        open={viewDetailModalOpen}
        onCancel={() => setViewDetailModalOpen(false)}
        footer={null}
        width={700}
        centered
        title={null}
        className="gumroad-modal"
        closeIcon={<span>✕</span>}
      >
          {selectedTenantDetail && (
              <div className="bg-white" style={{ backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(to right, #E5E7EB 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                  {/* HEADER */}
                  <div className="bg-[#4DA2FF] border-b-[3px] border-black p-6 flex items-center gap-6">
                      <div className="w-24 h-24 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <span className="text-4xl font-black">
                              {selectedTenantDetail.fullName.charAt(0).toUpperCase()}
                          </span>
                      </div>
                      <div>
                          <div className="bg-white border-2 border-black px-4 py-1 transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block mb-2">
                            <h2 className="text-2xl font-black uppercase tracking-tight m-0">{selectedTenantDetail.fullName}</h2>
                          </div>
                          <div className="flex gap-2 mt-2">
                              <div className="bg-black text-white px-2 py-1 font-bold font-mono text-sm border-2 border-white">ID: #{selectedTenantDetail.id}</div>
                              {selectedTenantDetail.contracts?.[0] ? (
                                  <div className="bg-[#00E054] text-black px-2 py-1 font-bold font-mono text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                      {selectedTenantDetail.contracts[0].room?.name} - {selectedTenantDetail.contracts[0].room?.building?.name}
                                  </div>
                              ) : (
                                  <div className="bg-gray-200 text-black px-2 py-1 font-bold font-mono text-sm border-2 border-black">Chưa thuê phòng</div>
                              )}
                          </div>
                      </div>
                  </div>

                  <div className="p-8 max-h-[70vh] overflow-y-auto">
                      <div className="mb-8">
                        <div className="inline-block bg-[#FFD700] border-2 border-black px-3 py-1 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
                            <span className="font-black text-sm uppercase text-black tracking-wide">THÔNG TIN CÁ NHÂN</span>
                        </div>
                        
                        <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 font-mono">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">Số điện thoại</div>
                                    <div className="text-lg font-bold">{selectedTenantDetail.phone}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">CCCD/CMND</div>
                                    <div className="text-lg font-bold">{selectedTenantDetail.cccd || '---'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">Ngày sinh</div>
                                    <div className="text-lg font-bold">{selectedTenantDetail.info?.dob || '---'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">Email</div>
                                    <div className="text-lg font-bold">{selectedTenantDetail.info?.email || '---'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">Nghề nghiệp</div>
                                    <div className="text-lg font-bold">{selectedTenantDetail.info?.job || '---'}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase">Biển số xe</div>
                                    <div className="text-lg font-bold">{selectedTenantDetail.info?.licensePlate || '---'}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-xs font-bold text-gray-500 uppercase">Quê quán</div>
                                    <div className="text-lg font-bold">{selectedTenantDetail.info?.hometown || '---'}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-xs font-bold text-gray-500 uppercase">Ghi chú</div>
                                    <div className="text-lg font-bold">{selectedTenantDetail.info?.note || '---'}</div>
                                </div>
                            </div>
                        </div>
                      </div>

                      <div>
                          <div className="inline-block bg-[#FF90E8] border-2 border-black px-3 py-1 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                              <span className="font-black text-sm uppercase text-black tracking-wide">HỒ SƠ ẢNH</span>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                              <div className="text-center">
                                  <div className="mb-2 font-bold text-sm uppercase bg-black text-white inline-block px-2 py-0.5 transform -rotate-1">Mặt Trước</div>
                                  <div className="border-2 border-black bg-white h-48 flex items-center justify-center overflow-hidden relative group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                      {selectedTenantDetail.info?.cccdFront ? (
                                          <img src={selectedTenantDetail.info.cccdFront} alt="CCCD Front" className="w-full h-full object-contain" />
                                      ) : (
                                          <span className="text-gray-400 italic font-mono">Chưa có ảnh</span>
                                      )}
                                  </div>
                              </div>
                              <div className="text-center">
                                  <div className="mb-2 font-bold text-sm uppercase bg-black text-white inline-block px-2 py-0.5 transform rotate-1">Mặt Sau</div>
                                  <div className="border-2 border-black bg-white h-48 flex items-center justify-center overflow-hidden relative group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                      {selectedTenantDetail.info?.cccdBack ? (
                                          <img src={selectedTenantDetail.info.cccdBack} alt="CCCD Back" className="w-full h-full object-contain" />
                                      ) : (
                                          <span className="text-gray-400 italic font-mono">Chưa có ảnh</span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div>
          <div className="relative w-full max-w-md bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-0 animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="bg-[#FF4D4D] border-b-[3px] border-black p-4 flex items-center gap-4">
                <div className="bg-white border-2 border-black w-12 h-12 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Trash2 size={24} className="text-black" />
                </div>
                <h2 className="text-2xl font-black uppercase text-white tracking-tighter drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    XÓA KHÁCH THUÊ?
                </h2>
            </div>
            
            <div className="p-6 bg-white" style={{ backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(to right, #E5E7EB 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] mb-6">
                    <p className="text-lg font-bold mb-2">Bạn có chắc chắn muốn xóa khách thuê này?</p>
                    <p className="text-gray-500 font-mono text-sm">Hành động này không thể hoàn tác. Chỉ xóa được khi khách KHÔNG CÒN hợp đồng.</p>
                </div>

                <div className="flex justify-end gap-4">
                    <button 
                        onClick={() => setDeleteId(null)}
                        className="px-6 py-3 font-black uppercase border-2 border-black bg-white hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        HỦY BỎ
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-6 py-3 font-black uppercase border-2 border-black bg-[#FF4D4D] text-white hover:bg-[#ff3333] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        XÓA NGAY
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
