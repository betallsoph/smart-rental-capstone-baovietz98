'use client';
import { useState, useEffect } from 'react';
import { Table, Tag, Select, message, DatePicker, Popconfirm } from 'antd';
import { Eye, Plus, Filter, Loader2 } from 'lucide-react';
import { invoicesApi } from '@/lib/api/invoices';
import { Invoice, InvoiceStatus } from '@/types/invoice';
import InvoiceDetailModal from '@/components/invoices/InvoiceDetailModal';
import dayjs from 'dayjs';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: dayjs().format('MM-YYYY'),
    status: undefined as InvoiceStatus | undefined,
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await invoicesApi.getAll(filters);
      setInvoices(data);
    } catch (error) {
      console.error(error);
      message.error('Lỗi tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleGenerateBulk = async () => {
    try {
      setGenerating(true);
      const res = await invoicesApi.generateBulk(filters.month);
      message.success(`Đã tạo ${res.success} hóa đơn thành công! (Lỗi: ${res.failed})`);
      fetchInvoices();
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tạo hóa đơn hàng loạt');
    } finally {
      setGenerating(false);
    }
  };

  const columns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text: number) => <span className="font-bold text-gray-500">#{text}</span>,
    },
    {
      title: 'Phòng',
      key: 'room',
      render: (_: unknown, record: Invoice) => (
        <div>
          <div className="font-black text-lg">{record.contract?.room.name}</div>
          <div className="text-xs text-gray-500">{record.contract?.room.building.name}</div>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      render: (val: number) => <span className="font-bold">{val.toLocaleString()}</span>,
    },
    {
      title: 'Đã trả',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      align: 'right' as const,
      render: (val: number) => <span className="text-green-600 font-bold">{val.toLocaleString()}</span>,
    },
    {
      title: 'Còn nợ',
      dataIndex: 'debtAmount',
      key: 'debtAmount',
      align: 'right' as const,
      render: (val: number) => <span className="text-red-600 font-black">{val.toLocaleString()}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: InvoiceStatus) => {
        let color = 'default';
        if (status === InvoiceStatus.PAID) color = 'green';
        if (status === InvoiceStatus.PARTIAL) color = 'blue';
        if (status === InvoiceStatus.OVERDUE) color = 'red';
        if (status === InvoiceStatus.PUBLISHED) color = 'cyan';
        
        return (
          <Tag color={color} className="font-bold border-black">
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: Invoice) => (
        <button
          onClick={() => {
            setSelectedInvoice(record);
            setIsDetailOpen(true);
          }}
          className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all text-black"
          title="Xem chi tiết"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-black font-sans p-8">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-1">Invoices</h1>
          <p className="text-gray-500 font-medium">Quản lý hóa đơn và thanh toán.</p>
        </div>
        
        <Popconfirm 
          title={`Tạo hóa đơn cho tháng ${filters.month}?`}
          description="Hệ thống sẽ tự động tính toán tiền phòng và dịch vụ cho tất cả hợp đồng đang hoạt động."
          onConfirm={handleGenerateBulk}
          okText="Tạo ngay"
          cancelText="Hủy"
        >
          <button 
            disabled={generating}
            className="flex items-center gap-2 bg-black text-white border-2 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all disabled:opacity-50"
          >
            {generating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />} 
            Tạo hóa đơn tháng này
          </button>
        </Popconfirm>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4 mb-8 bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] items-center">
        <div className="flex items-center gap-2">
          <Filter size={20} />
          <span className="font-bold uppercase">Bộ lọc:</span>
        </div>
        
        <DatePicker 
          picker="month" 
          format="MM-YYYY"
          allowClear={false}
          value={dayjs(filters.month, 'MM-YYYY')}
          onChange={(date) => setFilters(prev => ({ ...prev, month: date ? date.format('MM-YYYY') : dayjs().format('MM-YYYY') }))}
          className="gumroad-input w-40"
        />

        <Select
          placeholder="Trạng thái"
          allowClear
          className="gumroad-select w-40"
          onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
        >
          {Object.values(InvoiceStatus).map(status => (
            <Select.Option key={status} value={status}>{status}</Select.Option>
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

      {/* TABLE */}
      <div className="bg-white">
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="neobrutalism-table"
        />
      </div>

      {/* DETAIL MODAL */}
      <InvoiceDetailModal
        isOpen={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        invoice={selectedInvoice}
        onUpdate={() => {
            fetchInvoices();
            // Refresh selected invoice data
            if (selectedInvoice) {
                invoicesApi.getOne(selectedInvoice.id).then(setSelectedInvoice);
            }
        }}
      />
    </div>
  );
}
