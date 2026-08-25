import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class FilterTransactionDto {
  @IsNumberString()
  @IsOptional()
  month?: string; // 1 - 12

  @IsNumberString()
  @IsOptional()
  year?: string; // e.g. 2026

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  scope?: 'personal' | 'family';
}
