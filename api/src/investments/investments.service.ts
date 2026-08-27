import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna todos os investimentos do usuário e estatísticas consolidadas
   */
  async getInvestmentsSummary(userId: string) {
    const investments = await this.prisma.openFinanceInvestment.findMany({
      where: {
        openFinanceConnection: {
          userId,
        },
      },
      include: {
        openFinanceConnection: {
          select: {
            connectorName: true,
            connectorColor: true,
            connectorImageUrl: true,
          },
        },
      },
      orderBy: [{ balance: 'desc' }, { name: 'asc' }],
    });

    let totalInvested = 0;
    let fixedIncomeTotal = 0;
    let mutualFundsTotal = 0;
    let equitiesTotal = 0;
    let otherTotal = 0;

    const rateWeightedSum: number[] = [];
    let rateWeightedWeight = 0;

    investments.forEach((inv) => {
      const balance = Number(inv.balance);
      totalInvested += balance;

      const type = (inv.type || '').toUpperCase();
      if (type.includes('FIXED_INCOME') || type.includes('TREASURY') || type.includes('CDB')) {
        fixedIncomeTotal += balance;
      } else if (type.includes('MUTUAL_FUND') || type.includes('INVESTMENT_FUND') || type.includes('FUND')) {
        mutualFundsTotal += balance;
      } else if (type.includes('EQUITY') || type.includes('ETF') || type.includes('STOCK')) {
        equitiesTotal += balance;
      } else {
        otherTotal += balance;
      }

      if (inv.rate && balance > 0) {
        rateWeightedSum.push(Number(inv.rate) * balance);
        rateWeightedWeight += balance;
      }
    });

    const averageRate = rateWeightedWeight > 0
      ? Math.round((rateWeightedSum.reduce((a, b) => a + b, 0) / rateWeightedWeight) * 10) / 10
      : null;

    const allocation = [
      {
        category: 'Renda Fixa & Títulos',
        amount: fixedIncomeTotal,
        percentage: totalInvested > 0 ? Math.round((fixedIncomeTotal / totalInvested) * 100) : 0,
        color: '#10B981',
      },
      {
        category: 'Fundos de Investimento',
        amount: mutualFundsTotal,
        percentage: totalInvested > 0 ? Math.round((mutualFundsTotal / totalInvested) * 100) : 0,
        color: '#8B5CF6',
      },
      {
        category: 'Ações & ETFs',
        amount: equitiesTotal,
        percentage: totalInvested > 0 ? Math.round((equitiesTotal / totalInvested) * 100) : 0,
        color: '#3B82F6',
      },
      {
        category: 'Outros Ativos',
        amount: otherTotal,
        percentage: totalInvested > 0 ? Math.round((otherTotal / totalInvested) * 100) : 0,
        color: '#6B7280',
      },
    ].filter((a) => a.amount > 0 || totalInvested === 0);

    return {
      summary: {
        totalInvested,
        totalAssets: investments.length,
        averageRate,
        allocation,
      },
      items: investments,
    };
  }
}
