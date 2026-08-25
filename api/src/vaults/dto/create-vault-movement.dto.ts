import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { VaultMovementType } from '@prisma/client';

export class CreateVaultMovementDto {
  @IsEnum(VaultMovementType, { message: 'O tipo deve ser DEPOSIT ou WITHDRAWAL' })
  type: VaultMovementType;

  @IsNumber({}, { message: 'O valor deve ser numérico' })
  @IsPositive({ message: 'O valor deve ser positivo' })
  amount: number;

  @IsString()
  @IsOptional()
  accountId?: string; // Conta bancária a ser debitada/creditada

  @IsString()
  @IsOptional()
  description?: string;
}
