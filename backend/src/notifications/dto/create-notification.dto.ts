import { IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  type?: string; // GENERAL, PAYMENT, SYSTEM

  @IsOptional()
  tenantId?: number;
}
