import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { VaultCategory, VaultStatus } from '@prisma/client';

export class UpdateVaultDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  targetAmount?: number;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(VaultCategory)
  @IsOptional()
  category?: VaultCategory;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsEnum(VaultStatus)
  @IsOptional()
  status?: VaultStatus;

  @IsBoolean()
  @IsOptional()
  isolatedFromDailyBalance?: boolean;
}
