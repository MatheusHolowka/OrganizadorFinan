import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { FamilyMemberStatus, FamilyRole } from '@prisma/client';

@Injectable()
export class FamilyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async getMyFamily(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // 1. Busca grupo familiar ativo onde o usuário é membro aceito ou criador
    const membership = await this.prisma.familyMember.findFirst({
      where: {
        userId,
        status: FamilyMemberStatus.ACCEPTED,
      },
      include: {
        familyGroup: {
          include: {
            creator: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
    });

    // 2. Busca convites pendentes recebidos para o e-mail do usuário
    const pendingInvites = await this.prisma.familyMember.findMany({
      where: {
        email: user.email.toLowerCase().trim(),
        status: FamilyMemberStatus.PENDING,
      },
      include: {
        familyGroup: {
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return {
      hasFamily: !!membership?.familyGroup,
      familyGroup: membership?.familyGroup || null,
      myRole: membership?.role || null,
      pendingInvitesReceived: pendingInvites,
    };
  }

  async createFamily(userId: string, dto: CreateFamilyDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Checa se já possui grupo familiar aceito
    const existing = await this.prisma.familyMember.findFirst({
      where: {
        userId,
        status: FamilyMemberStatus.ACCEPTED,
      },
    });

    if (existing) {
      throw new BadRequestException('Você já pertence a um grupo familiar ativo.');
    }

    const family = await this.prisma.familyGroup.create({
      data: {
        name: dto.name.trim(),
        createdById: userId,
        members: {
          create: {
            userId,
            email: user.email.toLowerCase().trim(),
            role: FamilyRole.OWNER,
            status: FamilyMemberStatus.ACCEPTED,
            joinedAt: new Date(),
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });

    return family;
  }

  async inviteMember(userId: string, dto: InviteMemberDto) {
    const inviter = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!inviter) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const targetEmail = dto.email.toLowerCase().trim();

    if (targetEmail === inviter.email.toLowerCase().trim()) {
      throw new BadRequestException('Você não pode convidar seu próprio e-mail.');
    }

    // Busca o grupo familiar do usuário
    const membership = await this.prisma.familyMember.findFirst({
      where: {
        userId,
        status: FamilyMemberStatus.ACCEPTED,
      },
      include: {
        familyGroup: true,
      },
    });

    if (!membership || !membership.familyGroup) {
      throw new BadRequestException('Você precisa criar um grupo familiar antes de convidar membros.');
    }

    const familyGroup = membership.familyGroup;

    // Checa se o e-mail já foi adicionado/convidado
    const existingMember = await this.prisma.familyMember.findUnique({
      where: {
        familyGroupId_email: {
          familyGroupId: familyGroup.id,
          email: targetEmail,
        },
      },
    });

    if (existingMember) {
      if (existingMember.status === FamilyMemberStatus.ACCEPTED) {
        throw new BadRequestException('Este usuário já é um membro ativo da sua família.');
      } else {
        // Reenvia e-mail de convite
        await this.mailService.sendFamilyInviteEmail(targetEmail, inviter.name, familyGroup.name);
        return { message: 'Convite reenviado com sucesso por e-mail!', member: existingMember };
      }
    }

    // Checa se usuário já existe no sistema para associar userId
    const targetUser = await this.prisma.user.findUnique({
      where: { email: targetEmail },
    });

    const newMember = await this.prisma.familyMember.create({
      data: {
        familyGroupId: familyGroup.id,
        email: targetEmail,
        userId: targetUser ? targetUser.id : null,
        role: FamilyRole.MEMBER,
        status: FamilyMemberStatus.PENDING,
      },
    });

    // Envia e-mail de convite
    await this.mailService.sendFamilyInviteEmail(targetEmail, inviter.name, familyGroup.name);

    return {
      message: `Convite enviado com sucesso para ${targetEmail}!`,
      member: newMember,
    };
  }

  async acceptInvite(userId: string, memberId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const member = await this.prisma.familyMember.findUnique({
      where: { id: memberId },
      include: { familyGroup: true },
    });

    if (!member) {
      throw new NotFoundException('Convite não encontrado.');
    }

    if (member.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException('Este convite não pertence ao seu e-mail.');
    }

    // Atualiza status para ACCEPTED
    await this.prisma.familyMember.update({
      where: { id: memberId },
      data: {
        userId,
        status: FamilyMemberStatus.ACCEPTED,
        joinedAt: new Date(),
      },
    });

    return { message: `Você ingressou na família "${member.familyGroup.name}" com sucesso!` };
  }

  async removeOrLeaveMember(userId: string, memberId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const member = await this.prisma.familyMember.findUnique({
      where: { id: memberId },
      include: { familyGroup: true },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado.');
    }

    // Permite se for o próprio membro saindo OU se for o criador da família
    const isOwner = member.familyGroup.createdById === userId;
    const isSelf = member.userId === userId || member.email.toLowerCase() === user.email.toLowerCase();

    if (!isOwner && !isSelf) {
      throw new ForbiddenException('Você não tem permissão para remover este membro.');
    }

    await this.prisma.familyMember.delete({
      where: { id: memberId },
    });

    return { message: 'Membro removido da família com sucesso.' };
  }

  async getFamilyUserIds(userId: string): Promise<string[]> {
    const membership = await this.prisma.familyMember.findFirst({
      where: {
        userId,
        status: FamilyMemberStatus.ACCEPTED,
      },
      include: {
        familyGroup: {
          include: {
            members: {
              where: { status: FamilyMemberStatus.ACCEPTED, userId: { not: null } },
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!membership || !membership.familyGroup) {
      return [userId];
    }

    const ids = membership.familyGroup.members.map((m) => m.userId).filter(Boolean) as string[];
    return ids.length > 0 ? ids : [userId];
  }
}
