import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { CardBrand } from '@prisma/client';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do cartão é obrigatório' })
  name: string;

  @IsEnum(CardBrand)
  @IsOptional()
  brand?: CardBrand;

  @IsNumber({}, { message: 'O limite deve ser numérico' })
  @IsPositive({ message: 'O limite deve ser positivo' })
  limit: number;

  @IsInt()
  @Min(1, { message: 'Dia de fechamento deve ser entre 1 e 31' })
  @Max(31, { message: 'Dia de fechamento deve ser entre 1 e 31' })
  closingDay: number;

  @IsInt()
  @Min(1, { message: 'Dia de vencimento deve ser entre 1 e 31' })
  @Max(31, { message: 'Dia de vencimento deve ser entre 1 e 31' })
  dueDay: number;

  @IsString()
  @IsOptional()
  paymentAccountId?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  lastDigits?: string;
}
