import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { VaultCategory } from '@prisma/client';

export class CreateVaultDto {
  @IsString()
  @IsNotEmpty({ message: 'O título da meta/cofre é obrigatório' })
  title: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  description?: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'O valor da meta deve ser numérico' })
  @IsPositive({ message: 'O valor da meta deve ser positivo' })
  targetAmount: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' || !value ? undefined : value))
  @IsDateString({}, { message: 'Data de prazo inválida' })
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

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  isolatedFromDailyBalance?: boolean;
}
