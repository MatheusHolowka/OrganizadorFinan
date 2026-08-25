import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AccountType } from '@prisma/client';

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(AccountType)
  @IsOptional()
  type?: AccountType;

  @IsNumber()
  @IsOptional()
  initialBalance?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
