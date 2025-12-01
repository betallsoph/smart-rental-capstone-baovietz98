/**
 * Interface cho từng dòng trong hóa đơn (Line Item)
 * Được lưu trong field lineItems dưới dạng JSON Array
 */
export type LineItemType =
  | 'RENT' // Tiền phòng
  | 'ELECTRIC' // Điện
  | 'WATER' // Nước
  | 'FIXED' // Dịch vụ cố định (Wifi, Rác, Gửi xe...)
  | 'EXTRA' // Phát sinh
  | 'DEBT' // Nợ cũ
  | 'DISCOUNT'; // Giảm giá

export interface InvoiceLineItem {
  type: LineItemType;
  name: string; // Tên hiển thị (VD: "Tiền điện tháng 11")
  quantity: number; // Số lượng (kWh, m³, số người, hoặc 1)
  unit?: string; // Đơn vị (kWh, m³, tháng, người)
  unitPrice: number; // Đơn giá
  amount: number; // = quantity * unitPrice
  note?: string; // Ghi chú
  // Reference IDs để truy vết
  readingId?: number; // Link tới ServiceReading nếu là điện/nước
  serviceId?: number; // Link tới Service
}

/**
 * Interface cho lịch sử thanh toán
 */
export type PaymentMethod = 'CASH' | 'BANK' | 'MOMO' | 'ZALOPAY' | 'OTHER';

export interface PaymentRecord {
  date: string; // ISO date string
  amount: number;
  method: PaymentMethod;
  note?: string;
  receivedBy?: string; // Ai nhận tiền
}
