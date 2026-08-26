import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly resendApiKey: string | null = null;
  private readonly frontendUrl: string;
  private readonly defaultFrom: string;

  constructor(private readonly configService: ConfigService) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://organizadorfinan.com.br');
    this.defaultFrom = this.configService.get<string>(
      'SMTP_FROM',
      'FinanOrganizador <noreply@organizadorfinan.com.br>',
    );

    this.resendApiKey =
      this.configService.get<string>('RESEND_API_KEY')?.trim() ||
      (this.configService.get<string>('SMTP_PASS')?.startsWith('re_')
        ? this.configService.get<string>('SMTP_PASS')?.trim() || null
        : null) ||
      null;

    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (this.resendApiKey) {
      const maskedKey = this.resendApiKey.substring(0, 7) + '...' + this.resendApiKey.slice(-4);
      this.logger.log(`🚀 Serviço de e-mail configurado com Resend API (Chave: ${maskedKey}) | Remetente: ${this.defaultFrom}`);
    } else if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP Transport inicializado para o host ${host}`);
    } else {
      this.logger.warn('⚠️ NENHUMA CHAVE RESEND_API_KEY ou credencial SMTP configurada. E-mails serão apenas simulados no log.');
    }
  }

  async sendEmailVerification(to: string, name: string, code: string) {
    const verifyLink = `${this.frontendUrl}/verify-email?email=${encodeURIComponent(to)}&code=${code}`;
    const subject = `✉️ Seu Código de Confirmação: ${code} - FinanOrganizador`;

    this.logger.log(`\n======================================================`);
    this.logger.log(`[CÓDIGO DE CONFIRMAÇÃO GERADO]`);
    this.logger.log(`Para: ${to}`);
    this.logger.log(`Código 6 dígitos: ${code}`);
    this.logger.log(`Link Direto: ${verifyLink}`);
    this.logger.log(`======================================================\n`);

    const html = `
      <div style="background-color: #030712; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #10b981;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">FinanOrganizador</h1>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Confirmação de E-mail</p>
        </div>

        <div style="background-color: #0f172a; padding: 30px; border-radius: 20px; border: 1px solid #334155; text-align: center;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Olá, ${name}!</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Seu cadastro foi realizado com sucesso. Digite o código de 6 dígitos abaixo na tela de confirmação para ativar sua conta:
          </p>

          <div style="background: #1e293b; border: 2px dashed #10b981; border-radius: 16px; padding: 18px 24px; margin: 28px auto; max-width: 320px;">
            <span style="font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #10b981; font-family: 'Courier New', monospace;">
              ${code}
            </span>
          </div>

          <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
            Este código é válido por <strong>30 minutos</strong>.
          </p>

          <div style="margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 20px;">
            <p style="color: #64748b; font-size: 12px; margin-bottom: 15px;">
              Ou clique no botão abaixo para confirmar automaticamente com 1 clique:
            </p>
            <a href="${verifyLink}" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 13px; display: inline-block;">
              Confirmar Automaticamente
            </a>
          </div>
        </div>

        <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 30px;">
          Se você não solicitou este cadastro no FinanOrganizador, ignore este e-mail.
        </p>
      </div>
    `;

    return this.sendMail(to, subject, html, verifyLink);
  }

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;
    const subject = '🔒 Redefinição de Senha - FinanOrganizador';

    this.logger.log(`\n======================================================`);
    this.logger.log(`[LINK DE RECUPERAÇÃO DE SENHA]`);
    this.logger.log(`Para: ${to}`);
    this.logger.log(`Link: ${resetLink}`);
    this.logger.log(`======================================================\n`);

    const html = `
      <div style="background-color: #030712; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #10b981; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">FinanOrganizador</h1>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Recuperação de Acesso</p>
        </div>

        <div style="background-color: #0f172a; padding: 30px; border-radius: 20px; border: 1px solid #334155;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Olá, ${name}!</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            Recebemos uma solicitação para redefinir a senha da sua conta no FinanOrganizador.
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-weight: 700; font-size: 14px; display: inline-block;">
              Criar Nova Senha
            </a>
          </div>

          <p style="color: #64748b; font-size: 11px; margin-top: 25px; border-top: 1px solid #1e293b; padding-top: 15px;">
            Link direto:<br/>
            <a href="${resetLink}" style="color: #38bdf8; word-break: break-all;">${resetLink}</a>
          </p>
        </div>

        <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 30px;">
          Se você não solicitou a alteração da sua senha, desconsidere este e-mail.
        </p>
      </div>
    `;

    return this.sendMail(to, subject, html, resetLink);
  }

  async sendAccountLockedEmail(to: string, name: string, token: string) {
    const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;
    const subject = '⚠️ Conta Bloqueada por Segurança - FinanOrganizador';

    const html = `
      <div style="background-color: #030712; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #e11d48;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f43f5e; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">Alerta de Segurança</h1>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px;">FinanOrganizador Pro</p>
        </div>

        <div style="background-color: #0f172a; padding: 30px; border-radius: 20px; border: 1px solid #334155;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Olá, ${name}!</h2>
          <p style="color: #fca5a5; font-size: 14px; line-height: 1.6; font-weight: 600;">
            Sua conta foi temporariamente bloqueada após 5 tentativas consecutivas de login com senha incorreta.
          </p>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
            Para proteger seus dados financeiros e desbloquear sua conta, clique no link abaixo para validar seu e-mail e cadastrar uma nova senha:
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #f43f5e, #be123c); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 10px 25px -5px rgba(244, 63, 94, 0.4);">
              Desbloquear Conta e Trocar Senha
            </a>
          </div>

          <p style="color: #64748b; font-size: 11px; margin-top: 25px; border-top: 1px solid #1e293b; padding-top: 15px;">
            Link direto:<br/>
            <a href="${resetLink}" style="color: #38bdf8; word-break: break-all;">${resetLink}</a>
          </p>
        </div>

        <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 30px;">
          Se não foi você que tentou acessar, recomendamos trocar a senha imediatamente.
        </p>
      </div>
    `;

    return this.sendMail(to, subject, html, resetLink);
  }

  async sendFamilyInviteEmail(to: string, inviterName: string, familyName: string) {
    const inviteLink = `${this.frontendUrl}/profile?tab=family`;
    const subject = `👨‍👩‍👧‍👦 Convite para a Família "${familyName}" - FinanOrganizador`;

    const html = `
      <div style="background-color: #030712; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 24px; border: 1px solid #6366f1;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #818cf8; font-size: 24px; margin: 0; font-weight: 800;">FinanOrganizador</h1>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Finanças Familiares Compartilhadas</p>
        </div>

        <div style="background-color: #0f172a; padding: 30px; border-radius: 20px; border: 1px solid #334155;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Você foi convidado(a)!</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
            <strong>${inviterName}</strong> convidou você para fazer parte do grupo financeiro familiar <strong>"${familyName}"</strong>.
          </p>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
            Ao aceitar, vocês poderão compartilhar visão consolidada de despesas, orçamentos e extratos bancários.
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${inviteLink}" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);">
              Acessar e Aceitar Convite
            </a>
          </div>
        </div>

        <p style="color: #475569; font-size: 11px; text-align: center; margin-top: 30px;">
          Se você não conhece quem enviou este convite, ignore este e-mail.
        </p>
      </div>
    `;

    return this.sendMail(to, subject, html, inviteLink);
  }

  private async sendMail(to: string, subject: string, html: string, actionLink: string) {
    // 1. Envio Direto via Resend API (se chave disponível)
    if (this.resendApiKey) {
      try {
        this.logger.log(`Enviando e-mail para ${to} via Resend API...`);
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: this.defaultFrom,
            to: [to],
            subject,
            html,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          this.logger.log(`✅ E-mail enviado com sucesso via Resend para ${to}. ID: ${data.id}`);
          return { success: true, messageId: data.id };
        } else {
          this.logger.error(`❌ Erro retornado pela API do Resend (${response.status}): ${JSON.stringify(data)}`);
          return { success: true, restricted: true, simulated: true, actionLink, error: data.message };
        }
      } catch (err: any) {
        this.logger.error(`❌ Falha na requisição HTTP ao Resend: ${err.message}`);
      }
    }

    // 2. Envio via SMTP Tradicional (Fallback)
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: this.defaultFrom,
          to,
          subject,
          html,
        });
        this.logger.log(`✅ E-mail enviado com sucesso via SMTP para ${to}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } catch (error: any) {
        this.logger.error(`❌ Falha ao enviar e-mail via SMTP para ${to}: ${error.message}`);
      }
    }

    // 3. Fallback de Desenvolvimento no Console
    this.logger.log(`\n======================================================`);
    this.logger.log(`[SIMULAÇÃO DE E-MAIL] Para: ${to} | Assunto: ${subject}`);
    this.logger.log(`Link de Ação: ${actionLink}`);
    this.logger.log(`======================================================\n`);

    return { success: true, simulated: true, actionLink };
  }
}
