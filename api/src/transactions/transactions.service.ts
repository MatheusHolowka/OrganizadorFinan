import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, filter: FilterTransactionDto) {
    const now = new Date();
    const month = filter.month ? parseInt(filter.month, 10) : now.getMonth() + 1;
    const year = filter.year ? parseInt(filter.year, 10) : now.getFullYear();

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    let userIds = [userId];
    if (filter.scope === 'family') {
      const membership = await this.prisma.familyMember.findFirst({
        where: { userId, status: 'ACCEPTED' },
        include: {
          familyGroup: {
            include: {
              members: {
                where: { status: 'ACCEPTED', userId: { not: null } },
                select: { userId: true },
              },
            },
          },
        },
      });

      if (membership?.familyGroup?.members?.length) {
        userIds = membership.familyGroup.members.map((m) => m.userId).filter(Boolean) as string[];
      }
    }

    const whereClause: any = {
      userId: userIds.length > 1 ? { in: userIds } : userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (filter.type) {
      whereClause.type = filter.type;
    }

    if (filter.accountId) {
      whereClause.OR = [
        { accountId: filter.accountId },
        { destinationAccountId: filter.accountId },
      ];
    }

    if (filter.categoryId) {
      whereClause.categoryId = filter.categoryId;
    }

    if (filter.search) {
      whereClause.description = {
        contains: filter.search,
      };
    }

    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      include: {
        account: true,
        destinationAccount: true,
        category: true,
      },
      orderBy: { date: 'desc' },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of transactions) {
      const amount = Number(t.amount);
      if (t.type === TransactionType.INCOME) {
        totalIncome += amount;
      } else if (t.type === TransactionType.EXPENSE) {
        totalExpense += amount;
      }
    }

    const netPeriod = totalIncome - totalExpense;

    return {
      period: { month, year },
      summary: {
        totalIncome,
        totalExpense,
        netPeriod,
      },
      transactions,
    };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        account: true,
        destinationAccount: true,
        category: true,
        importItem: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async create(userId: string, dto: CreateTransactionDto) {
    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    if (dto.type === TransactionType.TRANSFER) {
      if (!dto.destinationAccountId) {
        throw new BadRequestException('Conta de destino é obrigatória para transferências');
      }
      if (dto.accountId === dto.destinationAccountId) {
        throw new BadRequestException('A conta de destino não pode ser igual à de origem');
      }
      const destAccount = await this.prisma.account.findFirst({
        where: { id: dto.destinationAccountId, userId },
      });
      if (!destAccount) {
        throw new NotFoundException('Conta de destino não encontrada');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const amount = Number(dto.amount);

      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          categoryId: dto.categoryId || null,
          destinationAccountId: dto.destinationAccountId || null,
          type: dto.type,
          amount: dto.amount,
          description: dto.description,
          notes: dto.notes || null,
          date: new Date(dto.date),
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
          status: dto.status || 'COMPLETED',
          isReconciled: dto.isReconciled || false,
        },
        include: {
          account: true,
          destinationAccount: true,
          category: true,
        },
      });

      if (dto.type === TransactionType.INCOME) {
        await tx.account.update({
          where: { id: dto.accountId },
          data: { currentBalance: { increment: amount } },
        });
      } else if (dto.type === TransactionType.EXPENSE) {
        await tx.account.update({
          where: { id: dto.accountId },
          data: { currentBalance: { decrement: amount } },
        });
      } else if (dto.type === TransactionType.TRANSFER && dto.destinationAccountId) {
        await tx.account.update({
          where: { id: dto.accountId },
          data: { currentBalance: { decrement: amount } },
        });
        await tx.account.update({
          where: { id: dto.destinationAccountId },
          data: { currentBalance: { increment: amount } },
        });
      }

      return transaction;
    });
  }

  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(userId, id);

    return this.prisma.$transaction(async (tx) => {
      const oldAmount = Number(existing.amount);
      const newAmount = dto.amount !== undefined ? Number(dto.amount) : oldAmount;
      const oldType = existing.type;
      const newType = dto.type || oldType;
      const oldAccountId = existing.accountId;
      const newAccountId = dto.accountId || oldAccountId;
      const oldDestAccountId = existing.destinationAccountId;
      const newDestAccountId = dto.destinationAccountId !== undefined ? dto.destinationAccountId : oldDestAccountId;

      if (oldType === TransactionType.INCOME) {
        await tx.account.update({
          where: { id: oldAccountId },
          data: { currentBalance: { decrement: oldAmount } },
        });
      } else if (oldType === TransactionType.EXPENSE) {
        await tx.account.update({
          where: { id: oldAccountId },
          data: { currentBalance: { increment: oldAmount } },
        });
      } else if (oldType === TransactionType.TRANSFER && oldDestAccountId) {
        await tx.account.update({
          where: { id: oldAccountId },
          data: { currentBalance: { increment: oldAmount } },
        });
        await tx.account.update({
          where: { id: oldDestAccountId },
          data: { currentBalance: { decrement: oldAmount } },
        });
      }

      const updated = await tx.transaction.update({
        where: { id },
        data: {
          accountId: newAccountId,
          categoryId: dto.categoryId !== undefined ? dto.categoryId : existing.categoryId,
          destinationAccountId: newDestAccountId,
          type: newType,
          amount: newAmount,
          description: dto.description || existing.description,
          notes: dto.notes !== undefined ? dto.notes : existing.notes,
          date: dto.date ? new Date(dto.date) : existing.date,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : existing.paymentDate,
          status: dto.status || existing.status,
          isReconciled: dto.isReconciled !== undefined ? dto.isReconciled : existing.isReconciled,
        },
        include: {
          account: true,
          destinationAccount: true,
          category: true,
        },
      });

      if (newType === TransactionType.INCOME) {
        await tx.account.update({
          where: { id: newAccountId },
          data: { currentBalance: { increment: newAmount } },
        });
      } else if (newType === TransactionType.EXPENSE) {
        await tx.account.update({
          where: { id: newAccountId },
          data: { currentBalance: { decrement: newAmount } },
        });
      } else if (newType === TransactionType.TRANSFER && newDestAccountId) {
        await tx.account.update({
          where: { id: newAccountId },
          data: { currentBalance: { decrement: newAmount } },
        });
        await tx.account.update({
          where: { id: newDestAccountId },
          data: { currentBalance: { increment: newAmount } },
        });
      }

      return updated;
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.findOne(userId, id);

    return this.prisma.$transaction(async (tx) => {
      const amount = Number(existing.amount);
      if (existing.type === TransactionType.INCOME) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { currentBalance: { decrement: amount } },
        });
      } else if (existing.type === TransactionType.EXPENSE) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { currentBalance: { increment: amount } },
        });
      } else if (existing.type === TransactionType.TRANSFER && existing.destinationAccountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { currentBalance: { increment: amount } },
        });
        await tx.account.update({
          where: { id: existing.destinationAccountId },
          data: { currentBalance: { decrement: amount } },
        });
      }

      return tx.transaction.delete({
        where: { id },
      });
    });
  }

  /**
   * Zera e limpa todos os lançamentos, cartões, faturas e lotes de importação do usuário
   */
  async clearAll(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.creditCardTransaction.deleteMany({
        where: { creditCard: { userId } },
      });

      await tx.creditCardInvoice.deleteMany({
        where: { creditCard: { userId } },
      });

      await tx.creditCard.deleteMany({
        where: { userId },
      });

      await tx.vaultTransaction.deleteMany({
        where: { vault: { userId } },
      });

      await tx.transaction.deleteMany({
        where: { userId },
      });

      await tx.importItem.deleteMany({
        where: { batch: { userId } },
      });

      await tx.importBatch.deleteMany({
        where: { userId },
      });

      // Reseta saldos de todas as contas do usuário para 0 (ou valor inicial)
      const accounts = await tx.account.findMany({ where: { userId } });
      for (const acc of accounts) {
        await tx.account.update({
          where: { id: acc.id },
          data: { currentBalance: 0, initialBalance: 0 },
        });
      }

      return {
        message: 'Todos os lançamentos, cartões e faturas foram apagados e os saldos foram zerados com sucesso.',
      };
    });
  }
}
