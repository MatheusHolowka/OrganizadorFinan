import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { VaultCategory } from '@prisma/client';

export class CreateVaultDto {
  @IsString()
  @IsNotEmpty({ message: 'O título da meta/cofre é obrigatório' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'O valor da meta deve ser numérico' })
  @IsPositive({ message: 'O valor da meta deve ser positivo' })
  targetAmount: number;

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

  @IsBoolean()
  @IsOptional()
  isolatedFromDailyBalance?: boolean;
}
