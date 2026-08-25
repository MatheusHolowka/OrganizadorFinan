import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da conta é obrigatório' })
  name: string;

  @IsEnum(AccountType, { message: 'Tipo de conta inválido' })
  @IsOptional()
  type?: AccountType;

  @IsNumber({}, { message: 'O saldo inicial deve ser um número' })
  @IsOptional()
  initialBalance?: number;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
