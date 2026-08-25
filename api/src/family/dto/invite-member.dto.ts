import { IsEmail } from 'class-validator';

export class InviteMemberDto {
  @IsEmail({}, { message: 'Informe um e-mail válido para o convite' })
  email: string;
}
