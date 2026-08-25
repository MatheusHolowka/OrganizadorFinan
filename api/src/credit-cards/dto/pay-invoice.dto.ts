import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class PayInvoiceDto {
  @IsString()
  @IsNotEmpty({ message: 'A conta de pagamento é obrigatória' })
  accountId: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number;
}
