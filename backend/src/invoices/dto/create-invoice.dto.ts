import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO để tạo hóa đơn (generate draft)
 * Chỉ cần contractId và month, hệ thống tự tính toán
 */
export class GenerateInvoiceDto {
  @ApiProperty({ example: 1, description: 'ID hợp đồng' })
  @IsNumber()
  contractId: number;

  @ApiProperty({ example: '11-2025', description: 'Tháng hóa đơn (MM-YYYY)' })
  @IsString()
  month: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Tính tiền phòng theo ngày (prorated) nếu vào giữa tháng',
  })
  @IsOptional()
  @IsBoolean()
  proratedRent?: boolean;

  @ApiPropertyOptional({
    example: 15,
    description: 'Ngày bắt đầu tính (nếu prorated). Mặc định lấy từ startDate của hợp đồng',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  startDay?: number;
}

/**
 * DTO để thêm khoản phát sinh (extra charge)
 */
export class ExtraChargeDto {
  @ApiProperty({ example: 'Sửa vòi nước', description: 'Mô tả khoản phát sinh' })
  @IsString()
  name: string;

  @ApiProperty({ example: 50000, description: 'Số tiền' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'Sửa ngày 15/11', description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  note?: string;
}

/**
 * DTO để cập nhật hóa đơn (draft)
 */
export class UpdateInvoiceDto {
  @ApiPropertyOptional({
    type: [ExtraChargeDto],
    description: 'Danh sách khoản phát sinh',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExtraChargeDto)
  extraCharges?: ExtraChargeDto[];

  @ApiPropertyOptional({ example: 0, description: 'Giảm giá' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ example: '2025-11-30', description: 'Hạn thanh toán' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'Ghi chú hóa đơn', description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  note?: string;
}

/**
 * DTO để ghi nhận thanh toán
 */
export class RecordPaymentDto {
  @ApiProperty({ example: 2000000, description: 'Số tiền thanh toán' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    example: 'BANK',
    enum: ['CASH', 'BANK', 'MOMO', 'ZALOPAY', 'OTHER'],
    description: 'Phương thức thanh toán',
  })
  @IsString()
  method: 'CASH' | 'BANK' | 'MOMO' | 'ZALOPAY' | 'OTHER';

  @ApiPropertyOptional({ example: 'CK Vietcombank', description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ example: 'Chủ nhà', description: 'Người nhận tiền' })
  @IsOptional()
  @IsString()
  receivedBy?: string;

  @ApiPropertyOptional({
    example: '2025-11-15',
    description: 'Ngày thanh toán (mặc định là ngày hiện tại)',
  })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}
