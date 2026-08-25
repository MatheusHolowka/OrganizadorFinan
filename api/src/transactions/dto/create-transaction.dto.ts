import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { TransactionStatus, TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'A conta de origem é obrigatória' })
  accountId: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  destinationAccountId?: string;

  @IsEnum(TransactionType, { message: 'Tipo deve ser INCOME, EXPENSE ou TRANSFER' })
  type: TransactionType;

  @IsNumber({}, { message: 'O valor deve ser numérico' })
  @IsPositive({ message: 'O valor deve ser positivo' })
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString({}, { message: 'Data inválida (formato YYYY-MM-DD)' })
  date: string;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsBoolean()
  @IsOptional()
  isReconciled?: boolean;
}
