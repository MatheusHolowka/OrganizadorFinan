import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ConfirmImportItemDto {
  @IsString()
  importItemId: string;

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsString()
  date: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  shouldImport: boolean;
}

export class ConfirmImportDto {
  @IsString()
  @IsNotEmpty()
  batchId: string;

  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmImportItemDto)
  items: ConfirmImportItemDto[];
}
