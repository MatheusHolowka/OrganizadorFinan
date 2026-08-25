import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CategoryType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 1800000); // 30 minutos

    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name,
        passwordHash,
        avatarUrl: dto.avatarUrl,
        failedLoginAttempts: 0,
        isLocked: false,
        isEmailVerified: false,
        emailVerificationToken: verificationCode,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Cria conta bancária inicial padrão
    await this.prisma.account.create({
      data: {
        userId: user.id,
        name: 'Conta Corrente Principal',
        type: 'CHECKING',
        initialBalance: 0,
        currentBalance: 0,
        color: '#10B981',
        icon: 'bank',
      },
    });

    // Seed de categorias padrão
    await this.seedDefaultCategories(user.id);

    // Se houver convites de família pendentes para este e-mail, associa o usuário
    await this.prisma.familyMember.updateMany({
      where: { email, userId: null },
      data: { userId: user.id },
    });

    // Envia e-mail com código de confirmação de 6 dígitos
    await this.mailService.sendEmailVerification(user.email, user.name, verificationCode);

    return {
      message: 'Conta criada com sucesso! Enviamos um código de 6 dígitos para o seu e-mail.',
      email: user.email,
      requiresEmailVerification: true,
    };
  }

  async verifyEmail(data: { email?: string; code?: string; token?: string }) {
    const inputCode = (data.code || data.token || '').trim();
    if (!inputCode) {
      throw new BadRequestException('Código de confirmação não informado.');
    }

    let user;
    if (data.email) {
      const email = data.email.toLowerCase().trim();
      user = await this.prisma.user.findFirst({
        where: {
          email,
          emailVerificationToken: inputCode,
          emailVerificationExpires: { gt: new Date() },
        },
      });
    } else {
      user = await this.prisma.user.findFirst({
        where: {
          emailVerificationToken: inputCode,
          emailVerificationExpires: { gt: new Date() },
        },
      });
    }

    if (!user) {
      throw new BadRequestException('Código de verificação incorreto ou expirado. Verifique os 6 dígitos ou solicite um novo código.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    const jwtToken = this.generateToken(user.id, user.email);

    return {
      message: 'E-mail confirmado com sucesso! Bem-vindo ao FinanOrganizador.',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        currency: user.currency,
      },
    };
  }

  async resendVerificationEmail(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return { message: 'Se o e-mail estiver cadastrado, um novo código de confirmação será enviado.' };
    }

    if (user.isEmailVerified) {
      return { message: 'Este e-mail já está confirmado. Você já pode fazer login normalmente.' };
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 1800000); // 30 minutos

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationCode,
        emailVerificationExpires: verificationExpires,
      },
    });

    await this.mailService.sendEmailVerification(user.email, user.name, verificationCode);

    return {
      message: `Novo código de 6 dígitos enviado para ${user.email}.`,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 🔒 Checa se a conta está bloqueada por excesso de tentativas
    if (user.isLocked) {
      let token = user.resetPasswordToken;
      if (!token || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora
        await this.prisma.user.update({
          where: { id: user.id },
          data: { resetPasswordToken: token, resetPasswordExpires: expires },
        });
        await this.mailService.sendAccountLockedEmail(user.email, user.name, token);
      }

      throw new UnauthorizedException(
        'Conta bloqueada por segurança após 5 tentativas incorretas. Enviamos um e-mail com o link seguro para você trocar a senha e desbloquear sua conta.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isMatch) {
      const currentAttempts = (user.failedLoginAttempts || 0) + 1;

      if (currentAttempts >= 5) {
        const resetToken = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: currentAttempts,
            isLocked: true,
            resetPasswordToken: resetToken,
            resetPasswordExpires: expires,
          },
        });

        await this.mailService.sendAccountLockedEmail(user.email, user.name, resetToken);

        throw new UnauthorizedException(
          'Conta bloqueada por segurança após 5 tentativas com senha errada. Um e-mail com o link de troca de senha foi enviado para você.',
        );
      } else {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: currentAttempts },
        });

        const remaining = 5 - currentAttempts;
        throw new UnauthorizedException(
          `E-mail ou senha incorretos. Você tem mais ${remaining} ${remaining === 1 ? 'tentativa' : 'tentativas'} antes do bloqueio da conta.`,
        );
      }
    }

    // ✉️ Checa se o e-mail foi confirmado
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        `Seu endereço de e-mail (${user.email}) ainda não foi confirmado. Por favor, acesse sua caixa de entrada e clique no link de ativação antes de fazer login.`,
      );
    }

    // Login com sucesso: reseta tentativas e desbloqueio
    if (user.failedLoginAttempts > 0 || user.isLocked) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          isLocked: false,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        currency: user.currency,
      },
      token,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const resetToken = randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hora

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: expires,
        },
      });

      await this.mailService.sendPasswordResetEmail(user.email, user.name, resetToken);
    }

    return {
      message: 'Se o e-mail informado estiver cadastrado, enviamos um link seguro para a troca de senha.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('O link de recuperação é inválido ou já expirou. Solicite um novo link.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        isLocked: false,
        isEmailVerified: true,
        failedLoginAttempts: 0,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return {
      message: 'Sua senha foi redefinida com sucesso e sua conta foi desbloqueada. Você já pode fazer login!',
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        currency: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }

  private generateToken(userId: string, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  private async seedDefaultCategories(userId: string) {
    const defaultCategories: Array<{ name: string; type: CategoryType; color: string; icon: string }> = [
      { name: 'Alimentação & Restaurantes', type: CategoryType.EXPENSE, color: '#F59E0B', icon: 'utensils' },
      { name: 'Transporte & Combustível', type: CategoryType.EXPENSE, color: '#3B82F6', icon: 'car' },
      { name: 'Moradia & Contas', type: CategoryType.EXPENSE, color: '#8B5CF6', icon: 'home' },
      { name: 'Lazer & Entretenimento', type: CategoryType.EXPENSE, color: '#EC4899', icon: 'film' },
      { name: 'Saúde & Cuidados', type: CategoryType.EXPENSE, color: '#EF4444', icon: 'heart-pulse' },
      { name: 'Educação & Cursos', type: CategoryType.EXPENSE, color: '#06B6D4', icon: 'graduation-cap' },
      { name: 'Compras & Vestuário', type: CategoryType.EXPENSE, color: '#F97316', icon: 'shopping-bag' },
      { name: 'Salário & Renda Fixa', type: CategoryType.INCOME, color: '#10B981', icon: 'badge-dollar-sign' },
      { name: 'Investimentos & Rendimentos', type: CategoryType.INCOME, color: '#14B8A6', icon: 'trending-up' },
      { name: 'Freelance & Outras Rendas', type: CategoryType.INCOME, color: '#6366F1', icon: 'briefcase' },
    ];

    for (const cat of defaultCategories) {
      await this.prisma.category.create({
        data: {
          userId,
          name: cat.name,
          type: cat.type,
          color: cat.color,
          icon: cat.icon,
        },
      });
    }
  }
}
