import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateCardTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'A descrição da compra é obrigatória' })
  description: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'O valor total deve ser numérico' })
  @IsPositive({ message: 'O valor total deve ser positivo' })
  totalAmount: number;

  @IsDateString({}, { message: 'Data da compra inválida (YYYY-MM-DD)' })
  purchaseDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'O número de parcelas deve ser no mínimo 1' })
  @IsOptional()
  installments?: number;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  categoryId?: string;
}
