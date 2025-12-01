import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateContractDto } from './create-contract.dto';

// Không cho phép thay đổi roomId và tenantId
export class UpdateContractDto extends PartialType(
  OmitType(CreateContractDto, ['roomId', 'tenantId'] as const),
) {}
