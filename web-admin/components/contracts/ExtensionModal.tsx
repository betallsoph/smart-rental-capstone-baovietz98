import { Modal, Form, DatePicker, InputNumber } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';

interface ExtensionModalProps {
    open: boolean;
    onCancel: () => void;
    onConfirm: (values: any) => void;
    contract: any;
    loading?: boolean;
}

export default function ExtensionModal({ open, onCancel, onConfirm, contract, loading }: ExtensionModalProps) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open && contract) {
            form.setFieldsValue({
                endDate: contract.endDate ? dayjs(contract.endDate).add(6, 'month') : dayjs().add(6, 'month'),
                price: contract.price,
            });
        }
    }, [open, contract, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            onConfirm(values);
        } catch (error) {
            // Form validation error
        }
    };

    if (!contract) return null;

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            title={null}
            className="gumroad-modal"
            width={500}
            closeIcon={<span className="text-xl font-bold">✕</span>}
            centered
        >
            <div className="bg-white" style={{ backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(to right, #E5E7EB 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                {/* HEADER */}
                <div className="bg-[#4DA2FF] border-b-[3px] border-black p-6 flex items-center justify-between">
                    <div className="bg-white border-2 border-black px-4 py-1 transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <h2 className="text-2xl font-black uppercase m-0 tracking-tighter text-blue-600">
                            GIA HẠN HỢP ĐỒNG
                        </h2>
                    </div>
                </div>

                <div className="p-8">
                    <div className="bg-blue-50 border-2 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                        <p className="font-bold text-blue-700 uppercase mb-1">Gia hạn hợp đồng cho:</p>
                        <p className="text-lg font-black">{contract.room?.name} - {contract.room?.building?.name}</p>
                        <p className="text-gray-600 font-mono text-sm">Hiện tại: {dayjs(contract.startDate).format('DD/MM/YYYY')} - {contract.endDate ? dayjs(contract.endDate).format('DD/MM/YYYY') : 'Vô thời hạn'}</p>
                    </div>

                    <Form form={form} layout="vertical" className="font-mono">
                        <Form.Item name="endDate" label={<span className="font-bold uppercase">Ngày kết thúc mới</span>} rules={[{ required: true }]}>
                            <DatePicker className="w-full h-10 border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" format="DD/MM/YYYY" />
                        </Form.Item>
                        
                        <Form.Item name="price" label={<span className="font-bold uppercase">Giá thuê mới (nếu thay đổi)</span>} rules={[{ required: true }]}>
                            <InputNumber 
                                className="w-full h-10 border-2 border-black pt-1 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" 
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                            />
                        </Form.Item>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={onCancel} className="px-6 py-2 font-bold border-2 border-black hover:bg-gray-100 uppercase">
                                Hủy bỏ
                            </button>
                            <button 
                                onClick={handleSubmit} 
                                disabled={loading}
                                className="px-6 py-2 font-bold bg-[#4DA2FF] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all uppercase"
                            >
                                {loading ? 'Đang xử lý...' : 'Xác nhận gia hạn'}
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        </Modal>
    );
}
