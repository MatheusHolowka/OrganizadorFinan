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

    // 2. Fundos Isolados em Cofres/Metas
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
      include: {
        category: true,
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

    // 4. Distribuição por Categoria de Gastos
    const categoryMap = new Map<string, { name: string; color: string; amount: number }>();
    monthTransactions
      .filter((tx) => tx.type === TransactionType.EXPENSE)
      .forEach((tx) => {
        const catName = tx.category?.name || 'Outros / Diversos';
        const catColor = tx.category?.color || '#A1A1AA';
        const amt = Number(tx.amount);
        const existing = categoryMap.get(catName) || { name: catName, color: catColor, amount: 0 };
        existing.amount += amt;
        categoryMap.set(catName, existing);
      });

    const totalExpBase = monthlyExpense > 0 ? monthlyExpense : 1;
    const categoryExpenses = Array.from(categoryMap.values())
      .map((c) => ({
        name: c.name,
        color: c.color,
        amount: c.amount,
        percentage: Math.round((c.amount / totalExpBase) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);

    // 5. Inteligência e Limites de Cartões de Crédito
    const creditCards = await this.prisma.creditCard.findMany({
      where: { userId: userFilter, isArchived: false },
      include: {
        invoices: {
          where: {
            referenceMonth: month,
            referenceYear: year,
          },
        },
      },
    });

    let totalCardLimit = 0;
    let totalCardUsed = 0;
    let totalOpenInvoices = 0;

    const formattedCards = await Promise.all(
      creditCards.map(async (c) => {
        const openInvoices = await this.prisma.creditCardInvoice.findMany({
          where: {
            creditCardId: c.id,
            status: { in: [InvoiceStatus.OPEN, InvoiceStatus.CLOSED] },
            OR: [
              { referenceYear: year, referenceMonth: month },
              { referenceYear: year, referenceMonth: month + 1 },
              { referenceYear: { gt: year } },
            ],
          },
        });

        const cardUsed = openInvoices.reduce(
          (sum, inv) => sum + Math.max(0, Number(inv.totalAmount) - Number(inv.paidAmount)),
          0,
        );

        const limit = Number(c.limit);
        const availableLimit = Math.max(0, limit - cardUsed);
        const currentInv = c.invoices[0];
        const invoiceAmount = currentInv
          ? Math.max(0, Number(currentInv.totalAmount) - Number(currentInv.paidAmount))
          : 0;

        totalCardLimit += limit;
        totalCardUsed += cardUsed;
        totalOpenInvoices += invoiceAmount;

        return {
          id: c.id,
          name: c.name,
          brand: c.brand,
          limit,
          availableLimit,
          usedLimit: cardUsed,
          usedPercentage: limit > 0 ? Math.min(100, Math.round((cardUsed / limit) * 100)) : 0,
          currentInvoiceAmount: invoiceAmount,
          closingDay: c.closingDay,
          dueDay: c.dueDay,
          color: c.color,
        };
      }),
    );

    const totalCardAvailable = Math.max(0, totalCardLimit - totalCardUsed);

    // 6. Histórico e Projeção Semestral (Cashflow 6 Meses)
    const monthsNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const cashFlowHistory: { monthLabel: string; income: number; expense: number; invoice: number }[] = [];

    for (let offset = -3; offset <= 2; offset++) {
      let targetMonth = month + offset;
      let targetYear = year;

      while (targetMonth < 1) {
        targetMonth += 12;
        targetYear -= 1;
      }
      while (targetMonth > 12) {
        targetMonth -= 12;
        targetYear += 1;
      }

      const mStart = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
      const mEnd = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

      const txs = await this.prisma.transaction.findMany({
        where: {
          userId: userFilter,
          date: { gte: mStart, lte: mEnd },
        },
      });

      let inc = 0;
      let exp = 0;
      txs.forEach((t) => {
        if (t.type === TransactionType.INCOME) inc += Number(t.amount);
        if (t.type === TransactionType.EXPENSE) exp += Number(t.amount);
      });

      const invs = await this.prisma.creditCardInvoice.findMany({
        where: {
          creditCard: { userId: userFilter },
          referenceMonth: targetMonth,
          referenceYear: targetYear,
        },
      });

      const invTotal = invs.reduce((sum, i) => sum + Number(i.totalAmount), 0);

      cashFlowHistory.push({
        monthLabel: `${monthsNames[targetMonth - 1]}/${String(targetYear).substring(2)}`,
        income: inc,
        expense: exp,
        invoice: invTotal,
      });
    }

    // 7. Investimentos e Empréstimos (Open Finance / Carteira)
    const investments = await this.prisma.openFinanceInvestment.findMany({
      where: { openFinanceConnection: { userId: userFilter } },
    });
    const totalInvestments = investments.reduce((sum, inv) => sum + Number(inv.balance), 0);

    const loans = await this.prisma.openFinanceLoan.findMany({
      where: { openFinanceConnection: { userId: userFilter } },
    });
    const totalLoans = loans.reduce((sum, l) => sum + Number(l.outstandingBalance), 0);
    const netWorth = totalRawBalance + totalInvestments - totalOpenInvoices - totalLoans;

    // 8. Últimas Transações
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
        totalCardLimit,
        totalCardUsed,
        totalCardAvailable,
        totalInvestments,
        totalLoans,
        netWorth,
      },
      accounts,
      cards: formattedCards,
      categoryExpenses,
      cashFlowHistory,
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
