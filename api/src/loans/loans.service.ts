import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna todos os empréstimos & financiamentos do usuário e estatísticas consolidadas
   */
  async getLoansSummary(userId: string) {
    const loans = await this.prisma.openFinanceLoan.findMany({
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
      orderBy: [{ outstandingBalance: 'desc' }, { contractAmount: 'desc' }],
    });

    let totalContracted = 0;
    let totalOutstandingBalance = 0;
    let totalInstallmentsCount = 0;
    let paidInstallmentsCount = 0;

    const cetWeightedSum: number[] = [];
    let cetWeightedWeight = 0;

    loans.forEach((loan) => {
      const contracted = Number(loan.contractAmount);
      const balance = Number(loan.outstandingBalance);

      totalContracted += contracted;
      totalOutstandingBalance += balance;

      if (loan.totalInstallments) {
        totalInstallmentsCount += loan.totalInstallments;
        paidInstallmentsCount += loan.paidInstallments || 0;
      }

      if (loan.cet && balance > 0) {
        cetWeightedSum.push(Number(loan.cet) * balance);
        cetWeightedWeight += balance;
      }
    });

    const averageCet = cetWeightedWeight > 0
      ? Math.round((cetWeightedSum.reduce((a, b) => a + b, 0) / cetWeightedWeight) * 100) / 100
      : null;

    const overallProgress = totalContracted > 0
      ? Math.min(100, Math.max(0, Math.round(((totalContracted - totalOutstandingBalance) / totalContracted) * 100)))
      : 0;

    return {
      summary: {
        totalContracted,
        totalOutstandingBalance,
        totalContracts: loans.length,
        averageCet,
        totalInstallmentsCount,
        paidInstallmentsCount,
        overallProgress,
      },
      items: loans,
    };
  }
}
