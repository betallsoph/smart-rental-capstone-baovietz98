import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateReadingDto } from './create-reading.dto';

// Chỉ cho phép sửa newIndex
export class UpdateReadingDto extends PartialType(
  OmitType(CreateReadingDto, ['contractId', 'serviceId', 'month'] as const),
) {}
