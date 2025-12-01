'use client';
import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, InputNumber, Select, Tag, message, DatePicker, Popconfirm } from 'antd';
import { Plus, Edit, Trash2, Zap, Droplets, Filter, Loader2 } from 'lucide-react';
import { readingsApi } from '@/lib/api/readings';
import { servicesApi } from '@/lib/api/services';
import { ServiceReading } from '@/types/reading';
import { Service, ServiceType } from '@/types/service';
import dayjs from 'dayjs';
import axios from '@/lib/axios-client';

export default function ReadingsPage() {
  const [readings, setReadings] = useState<ServiceReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  
  // Filters
  const [month, setMonth] = useState(dayjs().format('MM-YYYY'));
  const [selectedService, setSelectedService] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();
  const [contracts, setContracts] = useState<any[]>([]);
  const [oldIndex, setOldIndex] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [serviceData, buildingRes, readingData] = await Promise.all([
        servicesApi.getByType(ServiceType.INDEX),
        axios.get('/buildings'),
        readingsApi.findAll(month, selectedService || undefined)
      ]);
      
      setServices(serviceData);
      setBuildings(buildingRes.data);
      setReadings(readingData);
    } catch (error) {
      console.error(error);
      message.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, selectedService]);

  const handlePrepare = async (contractId: number, serviceId: number) => {
    try {
      const res = await readingsApi.prepare(contractId, serviceId, month);
      setOldIndex(res.oldIndex);
      form.setFieldsValue({ oldIndex: res.oldIndex });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setModalLoading(true);
      await readingsApi.create({
        ...values,
        month,
      });
      message.success('Chốt số thành công!');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi lưu chỉ số');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await readingsApi.delete(id);
      message.success('Đã xóa bản ghi!');
      fetchData();
    } catch (error) {
      message.error('Lỗi khi xóa');
    }
  };

  // Fetch contracts for modal
  const fetchContracts = async () => {
    try {
      const res = await axios.get('/contracts?isActive=true');
      setContracts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchContracts();
    }
  }, [isModalOpen]);

  const columns = [
    {
      title: 'Phòng / Tòa nhà',
      key: 'room',
      render: (_: any, record: ServiceReading) => (
        <div>
          <div className="font-bold">{record.contract?.room.name}</div>
          <div className="text-xs text-gray-500">{record.contract?.room.building.name}</div>
        </div>
      ),
    },
    {
      title: 'Dịch vụ',
      dataIndex: ['service', 'name'],
      key: 'service',
      render: (text: string) => {
        let Icon = Zap;
        if (text.toLowerCase().includes('nước')) Icon = Droplets;
        return (
            <div className="flex items-center gap-2 font-bold">
                <Icon size={16} /> {text}
            </div>
        );
      }
    },
    {
      title: 'Chỉ số cũ',
      dataIndex: 'oldIndex',
      key: 'oldIndex',
      align: 'right' as const,
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: 'Chỉ số mới',
      dataIndex: 'newIndex',
      key: 'newIndex',
      align: 'right' as const,
      render: (val: number) => <span className="font-bold text-blue-600">{val.toLocaleString()}</span>,
    },
    {
      title: 'Sử dụng',
      dataIndex: 'usage',
      key: 'usage',
      align: 'center' as const,
      render: (val: number, record: ServiceReading) => (
          <Tag color="blue" className="font-bold border-black">{val} {record.service.unit}</Tag>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalCost',
      key: 'totalCost',
      align: 'right' as const,
      render: (val: number) => <span className="font-black">{val.toLocaleString()} đ</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isBilled',
      key: 'isBilled',
      render: (isBilled: boolean) => (
        <Tag color={isBilled ? 'green' : 'orange'} className="font-bold border-black">
          {isBilled ? 'Đã lên HĐ' : 'Chưa lên HĐ'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: ServiceReading) => (
        !record.isBilled && (
            <Popconfirm title="Xóa bản ghi này?" onConfirm={() => handleDelete(record.id)}>
                <button className="w-8 h-8 flex items-center justify-center bg-[#FF6B6B] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all text-black">
                    <Trash2 size={16} />
                </button>
            </Popconfirm>
        )
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-black font-sans p-8">
      <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-1">Readings</h1>
          <p className="text-gray-500 font-medium">Ghi nhận chỉ số điện nước hàng tháng.</p>
        </div>
        
        <button 
          onClick={() => {
              form.resetFields();
              setOldIndex(null);
              setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-black text-white border-2 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all"
        >
          <Plus size={20} /> Chốt số mới
        </button>
      </div>

      <div className="flex gap-4 mb-8 bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] items-center">
        <div className="flex items-center gap-2">
          <Filter size={20} />
          <span className="font-bold uppercase">Bộ lọc:</span>
        </div>
        
        <DatePicker 
          picker="month" 
          format="MM-YYYY"
          allowClear={false}
          value={dayjs(month, 'MM-YYYY')}
          onChange={(date) => setMonth(date ? date.format('MM-YYYY') : dayjs().format('MM-YYYY'))}
          className="gumroad-input w-40"
        />

        <Select
          placeholder="Dịch vụ"
          allowClear
          className="gumroad-select w-40"
          onChange={(val) => setSelectedService(val)}
        >
            {services.map(s => (
                <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
            ))}
        </Select>
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
      `}</style>

      <div className="bg-white">
        <Table
          columns={columns}
          dataSource={readings}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="neobrutalism-table"
        />
      </div>

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        title={<span className="text-2xl font-black uppercase">Chốt số tháng {month}</span>}
        className="gumroad-modal"
        closeIcon={<span className="text-xl font-bold border-2 border-black w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition-colors">✕</span>}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} className="font-mono mt-6">
            <Form.Item label={<span className="font-bold">Hợp đồng / Phòng</span>} name="contractId" rules={[{ required: true }]}>
                <Select 
                    className="gumroad-select" 
                    showSearch
                    optionFilterProp="children"
                    onChange={(val) => {
                        const serviceId = form.getFieldValue('serviceId');
                        if (serviceId) handlePrepare(val, serviceId);
                    }}
                >
                    {contracts.map(c => (
                        <Select.Option key={c.id} value={c.id}>
                            {c.room.name} - {c.tenant.name}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label={<span className="font-bold">Dịch vụ</span>} name="serviceId" rules={[{ required: true }]}>
                <Select 
                    className="gumroad-select"
                    onChange={(val) => {
                        const contractId = form.getFieldValue('contractId');
                        if (contractId) handlePrepare(contractId, val);
                    }}
                >
                    {services.map(s => (
                        <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
                <Form.Item label={<span className="font-bold">Chỉ số cũ</span>} name="oldIndex">
                    <InputNumber className="w-full gumroad-input bg-gray-100" disabled />
                </Form.Item>
                <Form.Item label={<span className="font-bold">Chỉ số mới</span>} name="newIndex" rules={[{ required: true }]}>
                    <InputNumber className="w-full gumroad-input" autoFocus />
                </Form.Item>
            </div>

            <div className="flex justify-end gap-2 mt-8 border-t-2 border-black pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="gumroad-btn-secondary px-4 py-2 font-bold uppercase">Hủy</button>
                <button type="submit" disabled={modalLoading} className="bg-[#00E054] text-white border-2 border-black px-6 py-2 font-bold shadow-[4px_4px_0px_0px_black] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all uppercase">
                    {modalLoading ? 'Đang lưu...' : 'Lưu chỉ số'}
                </button>
            </div>
        </Form>
      </Modal>
    </div>
  );
}
