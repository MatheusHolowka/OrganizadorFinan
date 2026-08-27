import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { CreateCardTransactionDto } from './dto/create-card-transaction.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { InvoiceStatus, TransactionType } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class CreditCardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, includeArchived = true) {
    const cards = await this.prisma.creditCard.findMany({
      where: includeArchived ? { userId } : { userId, isArchived: false },
      include: {
        paymentAccount: true,
        invoices: {
          where: { status: { in: [InvoiceStatus.OPEN, InvoiceStatus.CLOSED] } },
          orderBy: [{ referenceYear: 'desc' }, { referenceMonth: 'desc' }],
          take: 1,
        },
      },
    });

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return Promise.all(
      cards.map(async (card) => {
        const currentInvoice = await this.getOrCreateInvoice(card.id, currentMonth, currentYear, card.closingDay, card.dueDay);

        const openInvoices = await this.prisma.creditCardInvoice.findMany({
          where: {
            creditCardId: card.id,
            status: { in: [InvoiceStatus.OPEN, InvoiceStatus.CLOSED] },
            OR: [
              { referenceYear: currentYear, referenceMonth: currentMonth },
              { referenceYear: currentYear, referenceMonth: currentMonth + 1 },
              { referenceYear: { gt: currentYear } },
            ],
          },
        });

        const totalUsed = openInvoices.reduce(
          (sum, inv) => sum + Math.max(0, Number(inv.totalAmount) - Number(inv.paidAmount)),
          0,
        );

        const limit = Number(card.limit);
        const availableLimit = Math.max(0, limit - totalUsed);

        const currentInvoiceUnpaid = Math.max(0, Number(currentInvoice.totalAmount) - Number(currentInvoice.paidAmount));

        return {
          ...card,
          limit,
          availableLimit,
          currentInvoiceAmount: currentInvoiceUnpaid,
          currentInvoice,
        };
      }),
    );
  }

  async toggleArchive(userId: string, id: string) {
    const card = await this.prisma.creditCard.findFirst({
      where: { id, userId },
    });
    if (!card) {
      throw new NotFoundException('Cartão de crédito não encontrado');
    }

    const updated = await this.prisma.creditCard.update({
      where: { id },
      data: { isArchived: !card.isArchived },
    });

    return {
      message: updated.isArchived ? 'Cartão marcado como Cancelado/Inativo!' : 'Cartão reativado com sucesso!',
      card: updated,
    };
  }

  async findOne(userId: string, id: string) {
    const card = await this.prisma.creditCard.findFirst({
      where: { id, userId },
      include: {
        paymentAccount: true,
      },
    });

    if (!card) {
      throw new NotFoundException('Cartão de crédito não encontrado');
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    // Garante que a fatura do mês atual exista
    await this.getOrCreateInvoice(card.id, currentMonth, currentYear, card.closingDay, card.dueDay);

    // Se o dia atual já passou ou alcançou o fechamento (corte), garante também a fatura do ciclo aberto seguinte
    if (currentDay >= card.closingDay) {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      await this.getOrCreateInvoice(card.id, nextMonth, nextYear, card.closingDay, card.dueDay);
    }

    const fullCard = await this.prisma.creditCard.findFirst({
      where: { id, userId },
      include: {
        paymentAccount: true,
        invoices: {
          orderBy: [{ referenceYear: 'desc' }, { referenceMonth: 'desc' }],
          include: {
            transactions: {
              include: { category: true },
              orderBy: { purchaseDate: 'desc' },
            },
          },
        },
      },
    });

    return fullCard;
  }

  async create(userId: string, dto: CreateCardDto) {
    return this.prisma.creditCard.create({
      data: {
        userId,
        name: dto.name,
        brand: dto.brand || 'MASTERCARD',
        limit: dto.limit,
        closingDay: dto.closingDay,
        dueDay: dto.dueDay,
        paymentAccountId: dto.paymentAccountId || null,
        color: dto.color || '#6366F1',
        lastDigits: dto.lastDigits || null,
      },
    });
  }

  async remove(userId: string, id: string) {
    const card = await this.prisma.creditCard.findFirst({
      where: { id, userId },
    });

    if (!card) {
      throw new NotFoundException('Cartão não encontrado');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.creditCardTransaction.deleteMany({
        where: { creditCardId: id },
      });
      await tx.creditCardInvoice.deleteMany({
        where: { creditCardId: id },
      });
      return tx.creditCard.delete({
        where: { id },
      });
    });
  }

  async createTransaction(userId: string, cardId: string, dto: CreateCardTransactionDto) {
    const card = await this.prisma.creditCard.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Cartão de crédito não encontrado');
    }

    const installmentsCount = dto.installments && dto.installments > 0 ? dto.installments : 1;
    const totalAmount = Number(dto.totalAmount);
    const purchaseDate = new Date(dto.purchaseDate);
    const purchaseDay = purchaseDate.getUTCDate();
    const purchaseMonth = purchaseDate.getUTCMonth() + 1;
    const purchaseYear = purchaseDate.getUTCFullYear();

    let startMonth = purchaseMonth;
    let startYear = purchaseYear;

    if (purchaseDay > card.closingDay) {
      startMonth += 1;
      if (startMonth > 12) {
        startMonth = 1;
        startYear += 1;
      }
    }

    const installmentGroupId = randomUUID();
    const rawInstallmentValue = Math.floor((totalAmount / installmentsCount) * 100) / 100;
    const remainder = Math.round((totalAmount - rawInstallmentValue * installmentsCount) * 100) / 100;

    const createdTransactions: any[] = [];

    for (let i = 1; i <= installmentsCount; i++) {
      let targetMonth = startMonth + (i - 1);
      let targetYear = startYear;

      while (targetMonth > 12) {
        targetMonth -= 12;
        targetYear += 1;
      }

      const invoice = await this.getOrCreateInvoice(
        card.id,
        targetMonth,
        targetYear,
        card.closingDay,
        card.dueDay,
      );

      const installmentAmount = i === 1 ? rawInstallmentValue + remainder : rawInstallmentValue;

      const tx = await this.prisma.creditCardTransaction.create({
        data: {
          creditCardId: card.id,
          invoiceId: invoice.id,
          categoryId: dto.categoryId || null,
          description: installmentsCount > 1 ? `${dto.description} (${i}/${installmentsCount})` : dto.description,
          totalAmount,
          installmentAmount,
          installmentNumber: i,
          totalInstallments: installmentsCount,
          installmentGroupId,
          purchaseDate,
        },
        include: {
          category: true,
          invoice: true,
        },
      });

      await this.prisma.creditCardInvoice.update({
        where: { id: invoice.id },
        data: {
          totalAmount: { increment: installmentAmount },
        },
      });

      createdTransactions.push(tx);
    }

    return {
      message: `Compra parcelada em ${installmentsCount}x criada com sucesso`,
      installmentGroupId,
      transactions: createdTransactions,
    };
  }

  async payInvoice(userId: string, invoiceId: string, dto: PayInvoiceDto) {
    const invoice = await this.prisma.creditCardInvoice.findUnique({
      where: { id: invoiceId },
      include: { creditCard: true },
    });

    if (!invoice || invoice.creditCard.userId !== userId) {
      throw new NotFoundException('Fatura não encontrada');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Esta fatura já foi paga');
    }

    const payAmount = dto.amount || (Number(invoice.totalAmount) - Number(invoice.paidAmount));
    if (payAmount <= 0) {
      throw new BadRequestException('O valor de pagamento deve ser positivo');
    }

    return this.prisma.$transaction(async (tx) => {
      const paymentTx = await tx.transaction.create({
        data: {
          userId,
          accountId: dto.accountId,
          type: TransactionType.EXPENSE,
          amount: payAmount,
          description: `Pagamento Fatura ${invoice.creditCard.name} (${invoice.referenceMonth}/${invoice.referenceYear})`,
          date: new Date(),
          status: 'COMPLETED',
          isReconciled: true,
        },
      });

      await tx.account.update({
        where: { id: dto.accountId },
        data: { currentBalance: { decrement: payAmount } },
      });

      const newPaidAmount = Number(invoice.paidAmount) + payAmount;
      const isFullyPaid = newPaidAmount >= Number(invoice.totalAmount);

      const updatedInvoice = await tx.creditCardInvoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: isFullyPaid ? InvoiceStatus.PAID : invoice.status,
          paymentDate: new Date(),
          paymentTransactionId: paymentTx.id,
        },
      });

      return {
        message: 'Fatura paga com sucesso',
        invoice: updatedInvoice,
        paymentTransaction: paymentTx,
      };
    });
  }

  async deleteTransaction(userId: string, transactionId: string) {
    const tx = await this.prisma.creditCardTransaction.findUnique({
      where: { id: transactionId },
      include: { creditCard: true, invoice: true },
    });

    if (!tx || tx.creditCard.userId !== userId) {
      throw new NotFoundException('Transação de cartão não encontrada');
    }

    return this.prisma.$transaction(async (prismaTx) => {
      await prismaTx.creditCardTransaction.delete({
        where: { id: transactionId },
      });

      await prismaTx.creditCardInvoice.update({
        where: { id: tx.invoiceId },
        data: {
          totalAmount: { decrement: Number(tx.installmentAmount) },
        },
      });

      return { message: 'Transação removida da fatura com sucesso' };
    });
  }

  private async getOrCreateInvoice(
    creditCardId: string,
    referenceMonth: number,
    referenceYear: number,
    closingDay: number,
    dueDay: number,
  ) {
    let invoice = await this.prisma.creditCardInvoice.findUnique({
      where: {
        creditCardId_referenceMonth_referenceYear: {
          creditCardId,
          referenceMonth,
          referenceYear,
        },
      },
    });

    if (!invoice) {
      const closingDate = new Date(Date.UTC(referenceYear, referenceMonth - 1, Math.min(closingDay, 28)));
      const dueDate = new Date(Date.UTC(referenceYear, referenceMonth - 1, Math.min(dueDay, 28)));

      invoice = await this.prisma.creditCardInvoice.create({
        data: {
          creditCardId,
          referenceMonth,
          referenceYear,
          closingDate,
          dueDate,
          totalAmount: 0,
          paidAmount: 0,
          status: InvoiceStatus.OPEN,
        },
      });
    }

    return invoice;
  }
}
