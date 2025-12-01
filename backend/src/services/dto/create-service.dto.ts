import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export enum ServiceType {
  INDEX = 'INDEX',
  FIXED = 'FIXED',
}

export enum CalculationType {
  PER_ROOM = 'PER_ROOM',
  PER_PERSON = 'PER_PERSON',
}

export class CreateServiceDto {
  @ApiProperty({ example: 'Điện', description: 'Tên dịch vụ' })
  @IsString()
  name: string;

  @ApiProperty({ example: 3500, description: 'Đơn giá' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'kWh', description: 'Đơn vị tính (kWh, m³, tháng)' })
  @IsString()
  unit: string;

  @ApiProperty({
    enum: ServiceType,
    example: ServiceType.INDEX,
    description: 'Loại dịch vụ: INDEX (theo chỉ số) hoặc FIXED (cố định)',
  })
  @IsEnum(ServiceType)
  type: ServiceType;

  @ApiPropertyOptional({
    enum: CalculationType,
    example: CalculationType.PER_ROOM,
    description:
      'Cách tính phí (cho dịch vụ FIXED): PER_ROOM (theo phòng) hoặc PER_PERSON (theo người)',
  })
  @IsOptional()
  @IsEnum(CalculationType)
  calculationType?: CalculationType;

  @ApiPropertyOptional({ example: true, description: 'Còn sử dụng không' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
