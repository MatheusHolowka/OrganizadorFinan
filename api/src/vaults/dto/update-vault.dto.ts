import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { VaultCategory, VaultStatus } from '@prisma/client';

export class UpdateVaultDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsOptional()
  targetAmount?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' || !value ? undefined : value))
  @IsDateString()
  deadline?: string;

  @IsEnum(VaultCategory)
  @IsOptional()
  category?: VaultCategory;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  icon?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  color?: string;

  @IsEnum(VaultStatus)
  @IsOptional()
  status?: VaultStatus;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  isolatedFromDailyBalance?: boolean;
}
