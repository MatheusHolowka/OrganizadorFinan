import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFamilyDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do grupo familiar é obrigatório (ex: Família Silva)' })
  name: string;
}
