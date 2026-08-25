import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus, TransactionType } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string, monthParam?: number, yearParam?: number, scope?: string) {
    const now = new Date();
    const month = monthParam || now.getMonth() + 1;
    const year = yearParam || now.getFullYear();

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    let userIds = [userId];
    if (scope === 'family') {
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

    const userFilter = userIds.length > 1 ? { in: userIds } : userId;

    // 1. Saldo Geral das Contas
    const accounts = await this.prisma.account.findMany({
      where: { userId: userFilter, isArchived: false },
    });

    const totalRawBalance = accounts.reduce((acc, a) => acc + Number(a.currentBalance), 0);

    // 2. Fundos Isolados em Cofres/Metas (Regra de Negócio: não compõe saldo diário)
    const vaults = await this.prisma.vault.findMany({
      where: { userId: userFilter },
    });

    let totalVaultsSaved = 0;
    let isolatedFunds = 0;

    const formattedVaults = vaults.map((v) => {
      const current = Number(v.currentAmount);
      const target = Number(v.targetAmount);
      const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

      totalVaultsSaved += current;
      if (v.isolatedFromDailyBalance) {
        isolatedFunds += current;
      }

      return {
        id: v.id,
        title: v.title,
        currentAmount: current,
        targetAmount: target,
        progress,
        deadline: v.deadline,
        category: v.category,
        color: v.color,
        icon: v.icon,
        isolatedFromDailyBalance: v.isolatedFromDailyBalance,
      };
    });

    // Saldo livre disponível para gastos diários
    const dailyAvailableBalance = Math.max(0, totalRawBalance - isolatedFunds);

    // 3. Receitas e Despesas do Mês
    const monthTransactions = await this.prisma.transaction.findMany({
      where: {
        userId: userFilter,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    monthTransactions.forEach((tx) => {
      if (tx.type === TransactionType.INCOME) {
        monthlyIncome += Number(tx.amount);
      } else if (tx.type === TransactionType.EXPENSE) {
        monthlyExpense += Number(tx.amount);
      }
    });

    // 4. Faturas de Cartão de Crédito do Mês
    const creditCardInvoices = await this.prisma.creditCardInvoice.findMany({
      where: {
        creditCard: { userId: userFilter },
        referenceMonth: month,
        referenceYear: year,
      },
      include: {
        creditCard: true,
      },
    });

    let totalOpenInvoices = 0;
    creditCardInvoices.forEach((inv) => {
      if (inv.status === InvoiceStatus.OPEN || inv.status === InvoiceStatus.CLOSED) {
        totalOpenInvoices += Number(inv.totalAmount) - Number(inv.paidAmount);
      }
    });

    // 5. Últimas Transações
    const recentTransactions = await this.prisma.transaction.findMany({
      where: { userId: userFilter },
      take: 6,
      orderBy: { date: 'desc' },
      include: {
        account: true,
        category: true,
      },
    });

    return {
      summary: {
        totalRawBalance,
        isolatedFunds,
        dailyAvailableBalance,
        monthlyIncome,
        monthlyExpense,
        monthlyNet: monthlyIncome - monthlyExpense,
        totalOpenInvoices,
        totalVaultsSaved,
      },
      accounts,
      vaults: formattedVaults,
      recentTransactions,
      period: {
        month,
        year,
      },
      scope: scope === 'family' ? 'family' : 'personal',
    };
  }
}
