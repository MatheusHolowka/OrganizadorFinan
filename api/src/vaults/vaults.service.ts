import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaultDto } from './dto/create-vault.dto';
import { UpdateVaultDto } from './dto/update-vault.dto';
import { CreateVaultMovementDto } from './dto/create-vault-movement.dto';
import { TransactionType, VaultMovementType, VaultStatus } from '@prisma/client';

@Injectable()
export class VaultsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const vaults = await this.prisma.vault.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    let totalTarget = 0;
    let totalCurrent = 0;
    let totalIsolated = 0;

    const formattedVaults = vaults.map((vault) => {
      const target = Number(vault.targetAmount);
      const current = Number(vault.currentAmount);
      const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
      const remaining = Math.max(0, target - current);

      totalTarget += target;
      totalCurrent += current;
      if (vault.isolatedFromDailyBalance) {
        totalIsolated += current;
      }

      return {
        ...vault,
        targetAmount: target,
        currentAmount: current,
        progress,
        remaining,
      };
    });

    return {
      summary: {
        totalVaults: vaults.length,
        totalTarget,
        totalCurrent,
        totalIsolated, // Montante total isolado que não compõe o saldo de gastos diários
      },
      vaults: formattedVaults,
    };
  }

  async findOne(userId: string, id: string) {
    const vault = await this.prisma.vault.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          include: { account: true },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!vault) {
      throw new NotFoundException('Cofre não encontrado');
    }

    const target = Number(vault.targetAmount);
    const current = Number(vault.currentAmount);
    const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

    return {
      ...vault,
      targetAmount: target,
      currentAmount: current,
      progress,
      remaining: Math.max(0, target - current),
    };
  }

  async create(userId: string, dto: CreateVaultDto) {
    return this.prisma.vault.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        targetAmount: dto.targetAmount,
        currentAmount: 0,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        category: dto.category || 'OTHER',
        icon: dto.icon || 'piggy-bank',
        color: dto.color || '#8B5CF6',
        isolatedFromDailyBalance: dto.isolatedFromDailyBalance !== undefined ? dto.isolatedFromDailyBalance : true,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateVaultDto) {
    await this.findOne(userId, id);

    return this.prisma.vault.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        targetAmount: dto.targetAmount,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        category: dto.category,
        icon: dto.icon,
        color: dto.color,
        status: dto.status,
        isolatedFromDailyBalance: dto.isolatedFromDailyBalance,
      },
    });
  }

  async createMovement(userId: string, vaultId: string, dto: CreateVaultMovementDto) {
    const vault = await this.findOne(userId, vaultId);
    const currentAmount = Number(vault.currentAmount);
    const targetAmount = Number(vault.targetAmount);

    if (dto.type === VaultMovementType.WITHDRAWAL && currentAmount < dto.amount) {
      throw new BadRequestException(`Saldo insuficiente no cofre. Disponível: R$ ${currentAmount.toFixed(2)}`);
    }

    return this.prisma.$transaction(async (tx) => {
      let linkedTxId: string | undefined;

      // Se informou conta bancária, movimenta o saldo da conta e cria transação
      if (dto.accountId) {
        const account = await tx.account.findFirst({
          where: { id: dto.accountId, userId },
        });

        if (!account) {
          throw new NotFoundException('Conta bancária não encontrada');
        }

        if (dto.type === VaultMovementType.DEPOSIT) {
          // Aporte: Debita da conta bancária
          await tx.account.update({
            where: { id: dto.accountId },
            data: { currentBalance: { decrement: dto.amount } },
          });

          const financialTx = await tx.transaction.create({
            data: {
              userId,
              accountId: dto.accountId,
              type: TransactionType.EXPENSE,
              amount: dto.amount,
              description: `Aporte no Cofre: ${vault.title}`,
              notes: dto.description,
              date: new Date(),
              status: 'COMPLETED',
              isReconciled: true,
            },
          });
          linkedTxId = financialTx.id;
        } else {
          // Resgate: Credita na conta bancária
          await tx.account.update({
            where: { id: dto.accountId },
            data: { currentBalance: { increment: dto.amount } },
          });

          const financialTx = await tx.transaction.create({
            data: {
              userId,
              accountId: dto.accountId,
              type: TransactionType.INCOME,
              amount: dto.amount,
              description: `Resgate do Cofre: ${vault.title}`,
              notes: dto.description,
              date: new Date(),
              status: 'COMPLETED',
              isReconciled: true,
            },
          });
          linkedTxId = financialTx.id;
        }
      }

      // Cria movimentação no cofre
      const movement = await tx.vaultTransaction.create({
        data: {
          vaultId,
          accountId: dto.accountId || null,
          type: dto.type,
          amount: dto.amount,
          description: dto.description || (dto.type === VaultMovementType.DEPOSIT ? 'Aporte manual' : 'Resgate manual'),
        },
      });

      // Vincula transação se foi criada
      if (linkedTxId) {
        await tx.transaction.update({
          where: { id: linkedTxId },
          data: { vaultTransactionId: movement.id },
        });
      }

      // Atualiza saldo do cofre e status
      const newCurrentAmount =
        dto.type === VaultMovementType.DEPOSIT ? currentAmount + dto.amount : currentAmount - dto.amount;

      const isCompleted = newCurrentAmount >= targetAmount;

      const updatedVault = await tx.vault.update({
        where: { id: vaultId },
        data: {
          currentAmount: newCurrentAmount,
          status: isCompleted ? VaultStatus.COMPLETED : VaultStatus.IN_PROGRESS,
        },
      });

      return {
        message: dto.type === VaultMovementType.DEPOSIT ? 'Aporte realizado com sucesso' : 'Resgate realizado com sucesso',
        movement,
        vault: updatedVault,
      };
    });
  }

  async remove(userId: string, id: string) {
    const vault = await this.findOne(userId, id);
    if (Number(vault.currentAmount) > 0) {
      throw new BadRequestException('Não é possível excluir um cofre com saldo. Realize o resgate primeiro.');
    }

    return this.prisma.vault.delete({
      where: { id },
    });
  }
}
