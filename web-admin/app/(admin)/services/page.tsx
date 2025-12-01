'use client';
import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Switch, message } from 'antd';
import { Plus, Edit, Trash2, Zap, Droplets, Wifi, Box } from 'lucide-react';
import { servicesApi } from '@/lib/api/services';
import { Service, ServiceType, CalculationType } from '@/types/service';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await servicesApi.getAll(true); // Include inactive
      setServices(data);
    } catch (error) {
      console.error(error);
      message.error('Lỗi tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (values: any) => {
    try {
      setSubmitting(true);
      if (editingId) {
        await servicesApi.update(editingId, values);
        message.success('Cập nhật dịch vụ thành công!');
      } else {
        await servicesApi.create(values);
        message.success('Thêm dịch vụ thành công!');
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
      fetchServices();
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi lưu dịch vụ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (record: Service) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await servicesApi.delete(id);
      message.success('Đã xóa dịch vụ!');
      setDeleteId(null);
      fetchServices();
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi xóa dịch vụ');
    }
  };

  const handleSeed = async () => {
    try {
      await servicesApi.seed();
      message.success('Đã khởi tạo dữ liệu mẫu!');
      fetchServices();
    } catch (error) {
      message.error('Lỗi khởi tạo');
    }
  };

  const columns = [
    {
      title: 'Tên dịch vụ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Service) => {
        let Icon = Box;
        if (text.toLowerCase().includes('điện')) Icon = Zap;
        if (text.toLowerCase().includes('nước')) Icon = Droplets;
        if (text.toLowerCase().includes('wifi') || text.toLowerCase().includes('internet')) Icon = Wifi;
        
        return (
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-black text-white flex items-center justify-center border-2 border-black">
                <Icon size={16} />
            </div>
            {text}
          </div>
        );
      },
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (val: number) => <span className="font-mono font-bold">{val.toLocaleString()} đ</span>,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      render: (text: string) => <Tag className="font-bold border-black">{text}</Tag>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: ServiceType) => (
        <Tag color={type === ServiceType.INDEX ? 'blue' : 'orange'} className="font-bold border-black">
          {type === ServiceType.INDEX ? 'Theo chỉ số' : 'Cố định'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'} className="font-bold border-black">
          {isActive ? 'Đang dùng' : 'Ngưng dùng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Service) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEdit(record)}
            className="w-8 h-8 flex items-center justify-center bg-[#4DA2FF] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all text-black"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => setDeleteId(record.id)}
            className="w-8 h-8 flex items-center justify-center bg-[#FF6B6B] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all text-black"
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
          <h1 className="text-4xl font-black tracking-tight mb-1">Services</h1>
          <p className="text-gray-500 font-medium">Quản lý giá điện, nước và các dịch vụ khác.</p>
        </div>
        
        <div className="flex gap-2">
            {services.length === 0 && (
                <Button onClick={handleSeed} className="gumroad-btn-secondary">Khởi tạo mẫu</Button>
            )}
            <button 
            onClick={() => {
                setEditingId(null);
                form.resetFields();
                setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-black text-white border-2 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all"
            >
            <Plus size={20} /> Thêm dịch vụ
            </button>
        </div>
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
            overflow: hidden !important;
        }
        .gumroad-modal .ant-modal-close {
            top: -15px !important;
            right: -15px !important;
            width: 40px !important;
            height: 40px !important;
            background: white !important;
            border: 2px solid black !important;
            opacity: 1 !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 2px 2px 0px 0px #000 !important;
            z-index: 1000 !important;
        }
        .gumroad-modal .ant-modal-close:hover {
            background: black !important;
            color: white !important;
            transform: translate(1px, 1px);
            box-shadow: none !important;
        }
      `}</style>

      <div className="bg-white">
        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={loading}
          pagination={false}
          className="neobrutalism-table"
        />
      </div>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        title={null}
        className="gumroad-modal"
        width={500}
        closeIcon={<span className="text-xl font-bold">✕</span>}
      >
        <div className="bg-white" style={{ backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(to right, #E5E7EB 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            {/* HEADER */}
            <div className="bg-[#FFD700] border-b-3 border-black p-6 flex items-center justify-between border-b-[3px]">
                <div className="bg-white border-2 border-black px-4 py-1 transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-2xl font-black uppercase m-0 tracking-tighter">
                        {editingId ? 'SỬA DỊCH VỤ' : 'THÊM DỊCH VỤ'}
                    </h2>
                </div>
            </div>

            <div className="p-8">
                <Form form={form} layout="vertical" onFinish={handleSave} className="font-mono">
                    
                    {/* NAME */}
                    <div className="mb-6">
                        <div className="inline-block bg-[#FF69B4] border-2 border-black px-3 py-1 mb-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                            <span className="font-black text-sm uppercase text-white tracking-wide">TÊN DỊCH VỤ</span>
                        </div>
                        <Form.Item name="name" rules={[{ required: true }]} className="mb-0">
                            <Input 
                                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-2 px-3 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" 
                                placeholder="VD: Điện sinh hoạt" 
                            />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* PRICE */}
                        <div>
                            <div className="inline-block bg-[#4DA2FF] border-2 border-black px-3 py-1 mb-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
                                <span className="font-black text-sm uppercase text-white tracking-wide">ĐƠN GIÁ</span>
                            </div>
                            <Form.Item name="price" rules={[{ required: true }]} className="mb-0">
                                <InputNumber 
                                    className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-1 px-1 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" 
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
                                />
                            </Form.Item>
                        </div>

                        {/* UNIT */}
                        <div>
                            <div className="inline-block bg-[#00E054] border-2 border-black px-3 py-1 mb-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                                <span className="font-black text-sm uppercase text-white tracking-wide">ĐƠN VỊ</span>
                            </div>
                            <Form.Item name="unit" rules={[{ required: true }]} className="mb-0">
                                <Input 
                                    className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-lg py-2 px-3 focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all rounded-none" 
                                    placeholder="VD: kWh" 
                                />
                            </Form.Item>
                        </div>
                    </div>

                    {/* TYPE */}
                    <div className="mb-6">
                        <div className="inline-block bg-[#FFD700] border-2 border-black px-3 py-1 mb-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
                            <span className="font-black text-sm uppercase text-black tracking-wide">LOẠI DỊCH VỤ</span>
                        </div>
                        <Form.Item name="type" rules={[{ required: true }]} className="mb-0">
                            <Select 
                                className="h-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!h-full [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!items-center"
                                dropdownStyle={{ border: '2px solid black', borderRadius: 0, boxShadow: '4px 4px 0px 0px #000' }}
                            >
                                <Select.Option value={ServiceType.INDEX}>Theo chỉ số (Điện/Nước)</Select.Option>
                                <Select.Option value={ServiceType.FIXED}>Cố định (Wifi/Rác)</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    
                    <Form.Item 
                        noStyle
                        shouldUpdate={(prev, current) => prev.type !== current.type}
                    >
                        {({ getFieldValue }) => 
                            getFieldValue('type') === ServiceType.FIXED ? (
                                <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                                    <div className="inline-block bg-[#FF90E8] border-2 border-black px-3 py-1 mb-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                                        <span className="font-black text-sm uppercase text-black tracking-wide">CÁCH TÍNH</span>
                                    </div>
                                    <Form.Item name="calculationType" className="mb-0">
                                        <Select 
                                            className="h-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!h-full [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!items-center"
                                            dropdownStyle={{ border: '2px solid black', borderRadius: 0, boxShadow: '4px 4px 0px 0px #000' }}
                                        >
                                            <Select.Option value={CalculationType.PER_ROOM}>Theo phòng</Select.Option>
                                            <Select.Option value={CalculationType.PER_PERSON}>Theo người</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </div>
                            ) : null
                        }
                    </Form.Item>

                    <div className="mb-8 border-2 border-black p-4 bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-lg uppercase">TRẠNG THÁI</span>
                            <Form.Item name="isActive" valuePropName="checked" initialValue={true} className="mb-0">
                                <Switch checkedChildren="ON" unCheckedChildren="OFF" className="bg-gray-300 [&.ant-switch-checked]:bg-[#00E054]" />
                            </Form.Item>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t-2 border-black border-dashed">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-6 py-3 font-black uppercase border-2 border-black bg-white hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            Hủy bỏ
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="px-6 py-3 font-black uppercase border-2 border-black bg-[#FFD700] text-black hover:bg-[#FFC000] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                        >
                            {submitting ? 'ĐANG LƯU...' : 'LƯU DỊCH VỤ'}
                        </button>
                    </div>
                </Form>
            </div>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div>
          <div className="relative w-full max-w-md bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000] p-0 animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="bg-[#FF4D4D] border-b-[3px] border-black p-4 flex items-center gap-4">
                <div className="bg-white border-2 border-black w-12 h-12 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Trash2 size={24} className="text-black" />
                </div>
                <h2 className="text-2xl font-black uppercase text-white tracking-tighter drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    XÓA DỊCH VỤ?
                </h2>
            </div>
            
            <div className="p-6 bg-white" style={{ backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(to right, #E5E7EB 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] mb-6">
                    <p className="text-lg font-bold mb-2">Bạn có chắc chắn muốn xóa dịch vụ này?</p>
                    <p className="text-gray-500 font-mono text-sm">Hành động này không thể hoàn tác và có thể ảnh hưởng đến các hợp đồng đang sử dụng dịch vụ này.</p>
                </div>

                <div className="flex justify-end gap-4">
                    <button 
                        onClick={() => setDeleteId(null)}
                        className="px-6 py-3 font-black uppercase border-2 border-black bg-white hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        HỦY BỎ
                    </button>
                    <button 
                        onClick={() => handleDelete(deleteId)}
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
