import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PluggyClientService } from './pluggy-client.service';
import {
  AccountType,
  CardBrand,
  InvoiceStatus,
  TransactionType,
  VaultCategory,
  VaultStatus,
} from '@prisma/client';
import { analyzeTransaction } from '../import/helpers/smart-categorizer.helper';

@Injectable()
export class OpenFinanceService {
  private readonly logger = new Logger(OpenFinanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pluggyClient: PluggyClientService,
  ) {}

  /**
   * Gera o token temporário (Connect Token) para abrir o widget Pluggy Connect
   */
  async getConnectToken(userId: string, itemId?: string): Promise<{ accessToken: string }> {
    try {
      const accessToken = await this.pluggyClient.createConnectToken(userId, itemId);
      return { accessToken };
    } catch (error: any) {
      this.logger.error(`Erro ao gerar connect token para user ${userId}:`, error);
      throw new BadRequestException(
        error.message || 'Falha ao conectar com o serviço de Open Finance (Pluggy)',
      );
    }
  }

  /**
   * Lista todas as conexões bancárias ativas do usuário
   */
  async listConnections(userId: string) {
    const connections = await this.prisma.openFinanceConnection.findMany({
      where: { userId },
      include: {
        accounts: {
          where: { isArchived: false },
        },
        creditCards: {
          where: { isArchived: false },
          include: {
            invoices: {
              orderBy: [{ referenceYear: 'desc' }, { referenceMonth: 'desc' }],
              take: 3,
            },
          },
        },
        investments: {
          orderBy: { balance: 'desc' },
        },
        loans: {
          orderBy: { contractAmount: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return connections;
  }

  /**
   * Sincroniza um item (banco conectado) manualmente ou via webhook
   */
  async syncItem(userId: string, itemId: string) {
    try {
      this.logger.log(`Iniciando sincronização do item ${itemId} para usuário ${userId}`);
      const item = await this.pluggyClient.fetchItem(itemId);

      if (!item) {
        throw new NotFoundException('Conexão bancária não encontrada no provedor');
      }

      const connector = item.connector;

      // 1. Cria ou atualiza a conexão na base
      const connection = await this.prisma.openFinanceConnection.upsert({
        where: { itemId },
        create: {
          userId,
          itemId,
          connectorId: connector.id,
          connectorName: connector.name,
          connectorColor: connector.primaryColor || '#10B981',
          connectorImageUrl: connector.imageUrl || null,
          status: item.status || 'UPDATED',
          executionStatus: item.executionStatus || null,
          consentExpiresAt: item.consentExpiresAt ? new Date(item.consentExpiresAt) : null,
          lastUpdatedAt: new Date(),
        },
        update: {
          status: item.status || 'UPDATED',
          executionStatus: item.executionStatus || null,
          consentExpiresAt: item.consentExpiresAt ? new Date(item.consentExpiresAt) : null,
          lastUpdatedAt: new Date(),
          errorCode: item.error ? item.error.code : null,
        },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      const userCategories = await this.prisma.category.findMany({
        where: { userId },
      });

      let totalSyncedTransactions = 0;

      // 2. Busca contas bancárias do Item na Pluggy
      const pluggyAccounts = await this.pluggyClient.fetchAccounts(itemId);

      for (const pAcc of pluggyAccounts) {
        // ==========================================
        // A. CONTA DE CARTÃO DE CRÉDITO & FATURAS
        // ==========================================
        if (pAcc.type === 'CREDIT') {
          const cardLimit = pAcc.creditData?.creditLimit || 0;
          const brand = this.mapCardBrand(pAcc.creditData?.brand);
          const closeDay = pAcc.creditData?.balanceCloseDate
            ? new Date(pAcc.creditData.balanceCloseDate).getUTCDate()
            : 1;
          const dueDay = pAcc.creditData?.balanceDueDate
            ? new Date(pAcc.creditData.balanceDueDate).getUTCDate()
            : 10;

          const pAccAny = pAcc as any;
          const isPluggyInactive = Boolean(
            (pAccAny.status && ['INACTIVE', 'BLOCKED', 'CLOSED', 'CANCELLED'].includes(String(pAccAny.status).toUpperCase())) ||
            (pAcc.creditData?.status && ['INACTIVE', 'BLOCKED', 'CLOSED', 'CANCELLED'].includes(String(pAcc.creditData.status).toUpperCase()))
          );

          const card = await this.prisma.creditCard.upsert({
            where: { pluggyCreditCardId: pAcc.id },
            create: {
              userId,
              openFinanceConnectionId: connection.id,
              pluggyCreditCardId: pAcc.id,
              name: pAcc.name || `${connector.name} Card`,
              brand,
              limit: cardLimit,
              closingDay: closeDay,
              dueDay: dueDay,
              color: connector.primaryColor || '#6366F1',
              lastDigits: pAcc.number ? pAcc.number.slice(-4) : null,
              isArchived: isPluggyInactive,
            },
            update: {
              name: pAcc.name || `${connector.name} Card`,
              limit: cardLimit,
              closingDay: closeDay,
              dueDay: dueDay,
              color: connector.primaryColor || '#6366F1',
              lastDigits: pAcc.number ? pAcc.number.slice(-4) : null,
              ...(isPluggyInactive ? { isArchived: true } : {}),
            },
          });

          // A.1 Sincroniza faturas (Bills) do Cartão
          const invoicesByMonthYear = new Map<string, any>();
          try {
            const bills = await this.pluggyClient.fetchCreditCardBills(pAcc.id);
            for (const bill of bills) {
              const dueDate = bill.dueDate ? new Date(bill.dueDate) : new Date();
              const closingDate = bill.billClosingDate
                ? new Date(bill.billClosingDate)
                : new Date(dueDate.getTime() - 7 * 86400000);
              const refMonth = dueDate.getUTCMonth() + 1;
              const refYear = dueDate.getUTCFullYear();
              const now = new Date();
              const currentMonth = now.getUTCMonth() + 1;
              const currentYear = now.getUTCFullYear();
              const isDueDatePassed = dueDate < now;
              const isPastCycle = refYear < currentYear || (refYear === currentYear && refMonth < currentMonth);

              const billAny = bill as any;
              const totalAmount = bill.totalAmount !== undefined && bill.totalAmount !== null ? Math.max(0, Number(bill.totalAmount)) : 0;
              const isPaid = billAny.status === 'PAID' || isPastCycle || isDueDatePassed;
              const isClosed = billAny.status === 'CLOSED';
              const status = isPaid ? InvoiceStatus.PAID : isClosed ? InvoiceStatus.CLOSED : InvoiceStatus.OPEN;
              const paidAmount = isPaid ? totalAmount : 0;

              const invoice = await this.prisma.creditCardInvoice.upsert({
                where: {
                  creditCardId_referenceMonth_referenceYear: {
                    creditCardId: card.id,
                    referenceMonth: refMonth,
                    referenceYear: refYear,
                  },
                },
                create: {
                  creditCardId: card.id,
                  referenceMonth: refMonth,
                  referenceYear: refYear,
                  closingDate,
                  dueDate,
                  totalAmount,
                  paidAmount,
                  status,
                },
                update: {
                  closingDate,
                  dueDate,
                  totalAmount,
                  paidAmount,
                  status,
                },
              });

              invoicesByMonthYear.set(`${refYear}-${refMonth}`, invoice);
              if (bill.id) {
                invoicesByMonthYear.set(bill.id, invoice);
              }
            }
          } catch (e: any) {
            this.logger.warn(`Erro ao buscar faturas para cartão ${pAcc.id}: ${e.message}`);
          }

          // A.2 Sincroniza transações (compras) do Cartão de Crédito
          try {
            await this.prisma.creditCardTransaction.deleteMany({
              where: {
                creditCardId: card.id,
                OR: [
                  { description: { contains: 'Pagamento' } },
                  { description: { contains: 'Payment' } },
                  { description: { contains: 'TRA-' } },
                  { description: { contains: 'PAGTO' } },
                ],
              },
            });

            const cardTransactions = await this.pluggyClient.fetchAllTransactions(pAcc.id);
            for (const pTx of cardTransactions) {
              if (!pTx.id) continue;

              const txDate = new Date(pTx.creditCardMetadata?.purchaseDate || pTx.date || new Date());
              const refMonth = txDate.getUTCMonth() + 1;
              const refYear = txDate.getUTCFullYear();

              let invoice =
                (pTx.creditCardMetadata?.billId && invoicesByMonthYear.get(pTx.creditCardMetadata.billId)) ||
                invoicesByMonthYear.get(`${refYear}-${refMonth}`);

              if (!invoice) {
                const invoiceClosingDate = new Date(Date.UTC(refYear, refMonth - 1, card.closingDay));
                const invoiceDueDate = new Date(Date.UTC(refYear, refMonth - 1, card.dueDay));

                invoice = await this.prisma.creditCardInvoice.upsert({
                  where: {
                    creditCardId_referenceMonth_referenceYear: {
                      creditCardId: card.id,
                      referenceMonth: refMonth,
                      referenceYear: refYear,
                    },
                  },
                  create: {
                    creditCardId: card.id,
                    referenceMonth: refMonth,
                    referenceYear: refYear,
                    closingDate: invoiceClosingDate,
                    dueDate: invoiceDueDate,
                    totalAmount: 0,
                    paidAmount: 0,
                    status: InvoiceStatus.OPEN,
                  },
                  update: {},
                });
                invoicesByMonthYear.set(`${refYear}-${refMonth}`, invoice);
              }

              const rawAmount = Number(pTx.amount);
              const descLower = (pTx.description || '').toLowerCase();
              const categoryLower = (pTx.category || '').toLowerCase();
              const isPaymentOrCredit =
                rawAmount < 0 ||
                pTx.type === 'CREDIT' ||
                categoryLower.includes('payment') ||
                categoryLower.includes('transfers') ||
                descLower.includes('pagamento') ||
                descLower.includes('payment') ||
                descLower.includes('tra-') ||
                descLower.includes('pagto');

              // Se for um pagamento de fatura ou crédito/estorno, abate na fatura em vez de criar compra
              if (isPaymentOrCredit) {
                const paymentAmount = Math.abs(rawAmount);
                if (invoice) {
                  const currentPaid = Number(invoice.paidAmount);
                  const invoiceTotal = Number(invoice.totalAmount);
                  const newPaid = Math.max(currentPaid, paymentAmount);
                  const isFullyPaid = invoiceTotal > 0 && newPaid >= invoiceTotal;

                  await this.prisma.creditCardInvoice.update({
                    where: { id: invoice.id },
                    data: {
                      paidAmount: newPaid,
                      status: isFullyPaid ? InvoiceStatus.PAID : invoice.status,
                    },
                  });
                }
                continue; // NÃO insere pagamento como se fosse uma nova compra
              }

              const cleanAnalysis = analyzeTransaction(
                pTx.description || 'Compra no Cartão',
                'DEBIT',
                Math.abs(pTx.amount),
                user?.name,
              );
              const matchedCategory = this.findBestCategoryMatch(
                cleanAnalysis.suggestedCategoryName,
                false,
                userCategories,
              );

              const amount = Math.abs(pTx.amount);
              const totalInstallments = pTx.creditCardMetadata?.totalInstallments || 1;
              const installmentNumber = pTx.creditCardMetadata?.installmentNumber || 1;
              const totalAmount = pTx.creditCardMetadata?.totalAmount || amount;

              const existingCardTx = await this.prisma.creditCardTransaction.findFirst({
                where: {
                  creditCardId: card.id,
                  invoiceId: invoice.id,
                  description: cleanAnalysis.cleanDescription,
                  installmentAmount: amount,
                  purchaseDate: txDate,
                },
              });

              if (!existingCardTx) {
                await this.prisma.creditCardTransaction.create({
                  data: {
                    creditCardId: card.id,
                    invoiceId: invoice.id,
                    categoryId: matchedCategory ? matchedCategory.id : null,
                    description: cleanAnalysis.cleanDescription,
                    totalAmount,
                    installmentAmount: amount,
                    installmentNumber,
                    totalInstallments,
                    purchaseDate: txDate,
                  },
                });
              }
            }

            // A.3 Recalcula total da fatura apenas se totalAmount for 0
            const cardInvoices = await this.prisma.creditCardInvoice.findMany({
              where: { creditCardId: card.id },
            });
            for (const inv of cardInvoices) {
              if (Number(inv.totalAmount) === 0) {
                const sumResult = await this.prisma.creditCardTransaction.aggregate({
                  where: { invoiceId: inv.id },
                  _sum: { installmentAmount: true },
                });
                if (sumResult._sum.installmentAmount) {
                  await this.prisma.creditCardInvoice.update({
                    where: { id: inv.id },
                    data: { totalAmount: sumResult._sum.installmentAmount },
                  });
                }
              }
            }
          } catch (e: any) {
            this.logger.warn(`Erro ao buscar compras do cartão ${pAcc.id}: ${e.message}`);
          }

          continue;
        }

        // ==========================================
        // B. CONTA BANCÁRIA (CORRENTE / POUPANÇA)
        // ==========================================
        const accountType = this.mapAccountType(pAcc.type, pAcc.subtype);
        const balance = pAcc.balance !== undefined && pAcc.balance !== null ? pAcc.balance : 0;

        let internalAccount = await this.prisma.account.findUnique({
          where: { pluggyAccountId: pAcc.id },
        });

        if (!internalAccount) {
          internalAccount = await this.prisma.account.create({
            data: {
              userId,
              openFinanceConnectionId: connection.id,
              pluggyAccountId: pAcc.id,
              name: pAcc.name || `${connector.name} ${pAcc.subtype || 'Conta'}`,
              type: accountType,
              initialBalance: balance,
              currentBalance: balance,
              color: connector.primaryColor || '#10B981',
              icon: 'building-library',
            },
          });
        } else {
          internalAccount = await this.prisma.account.update({
            where: { id: internalAccount.id },
            data: {
              currentBalance: balance,
              name: pAcc.name || internalAccount.name,
              openFinanceConnectionId: connection.id,
            },
          });
        }

        // B.1 Sincroniza transações bancárias da conta
        try {
          const pluggyTransactions = await this.pluggyClient.fetchAllTransactions(pAcc.id);

          for (const pTx of pluggyTransactions) {
            if (!pTx.id) continue;

            const existingTx = await this.prisma.transaction.findUnique({
              where: { pluggyTransactionId: pTx.id },
            });

            if (existingTx) continue;

            const amount = Math.abs(pTx.amount);
            const type = pTx.amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
            const rawDescription = pTx.description || 'Transação Open Finance';

            const analysis = analyzeTransaction(
              rawDescription,
              pTx.amount >= 0 ? 'CREDIT' : 'DEBIT',
              pTx.amount,
              user?.name,
            );

            const matchedCategory = this.findBestCategoryMatch(
              analysis.suggestedCategoryName,
              pTx.amount >= 0,
              userCategories,
            );

            await this.prisma.transaction.create({
              data: {
                userId,
                accountId: internalAccount.id,
                categoryId: matchedCategory ? matchedCategory.id : null,
                type,
                amount,
                description: analysis.cleanDescription,
                notes: `Importado via Open Finance (${connector.name}) - ${rawDescription}`,
                date: new Date(pTx.date),
                status: 'COMPLETED',
                isReconciled: true,
                pluggyTransactionId: pTx.id,
              },
            });

            totalSyncedTransactions++;
          }
        } catch (e: any) {
          this.logger.warn(`Erro ao buscar transações da conta ${pAcc.id}: ${e.message}`);
        }
      }

      // ==========================================
      // C. INVESTIMENTOS (ATIVOS FINANCEIROS)
      // ==========================================
      try {
        const investments = await this.pluggyClient.fetchInvestments(itemId);
        for (const inv of investments) {
          if (!inv.name) continue;
          const invBalance = Number(inv.balance ?? inv.amount ?? inv.value ?? 0);
          const invRate = inv.rate !== undefined && inv.rate !== null ? Number(inv.rate) : null;
          const fixedRate =
            inv.fixedAnnualRate !== undefined && inv.fixedAnnualRate !== null
              ? Number(inv.fixedAnnualRate)
              : null;
          const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;

          await this.prisma.openFinanceInvestment.upsert({
            where: { pluggyInvestmentId: inv.id },
            create: {
              openFinanceConnectionId: connection.id,
              pluggyInvestmentId: inv.id,
              name: inv.name,
              code: inv.code || null,
              isin: inv.isin || null,
              type: inv.type || null,
              subtype: inv.subtype || null,
              balance: invBalance,
              amount: invBalance,
              currencyCode: inv.currencyCode || 'BRL',
              rate: invRate,
              rateType: inv.rateType || null,
              fixedAnnualRate: fixedRate,
              dueDate,
              issuer: inv.issuer || null,
              status: inv.status || 'ACTIVE',
            },
            update: {
              name: inv.name,
              balance: invBalance,
              amount: invBalance,
              rate: invRate,
              rateType: inv.rateType || null,
              fixedAnnualRate: fixedRate,
              dueDate,
              status: inv.status || 'ACTIVE',
            },
          });
        }

        // Limpa cofres criados na versão anterior para manter os investimentos isolados
        await this.prisma.vault.deleteMany({
          where: {
            userId,
            description: { contains: 'Open Finance' },
          },
        });
      } catch (e: any) {
        this.logger.warn(`Erro ao sincronizar investimentos do item ${itemId}: ${e.message}`);
      }

      // ==========================================
      // D. EMPRÉSTIMOS & FINANCIAMENTOS (PASSIVOS)
      // ==========================================
      try {
        const loans = await this.pluggyClient.fetchLoans(itemId);
        for (const loan of loans) {
          const contractAmount = Number(loan.contractAmount ?? 0);
          const outstandingBalance = Number(
            loan.payments?.contractOutstandingBalance ?? contractAmount,
          );
          const totalInstallments =
            loan.installments?.totalNumberOfInstallments ?? null;
          const paidInstallments =
            loan.installments?.paidInstallments ?? null;
          const dueInstallments =
            loan.installments?.dueInstallments ?? null;
          const cet =
            loan.CET !== undefined && loan.CET !== null
              ? Number(loan.CET)
              : null;
          const interestRate =
            loan.interestRates && loan.interestRates.length > 0
              ? Number(
                  loan.interestRates[0].preFixedRate ||
                    loan.interestRates[0].postFixedRate ||
                    0,
                )
              : null;
          const dueDate = loan.dueDate ? new Date(loan.dueDate) : null;

          await this.prisma.openFinanceLoan.upsert({
            where: { pluggyLoanId: loan.id },
            create: {
              openFinanceConnectionId: connection.id,
              pluggyLoanId: loan.id,
              contractNumber: loan.contractNumber || null,
              productName: loan.productName || 'Empréstimo / Financiamento',
              type: loan.type || loan.kind || 'LOAN',
              contractAmount,
              outstandingBalance,
              currencyCode: loan.currencyCode || 'BRL',
              dueDate,
              totalInstallments,
              paidInstallments,
              dueInstallments,
              cet,
              interestRate,
            },
            update: {
              productName: loan.productName || 'Empréstimo / Financiamento',
              contractAmount,
              outstandingBalance,
              dueDate,
              totalInstallments,
              paidInstallments,
              dueInstallments,
              cet,
              interestRate,
            },
          });
        }
      } catch (e: any) {
        this.logger.warn(`Erro ao sincronizar empréstimos do item ${itemId}: ${e.message}`);
      }

      return {
        message: 'Conexão sincronizada com sucesso!',
        connectionId: connection.id,
        totalSyncedTransactions,
      };
    } catch (error: any) {
      this.logger.error(`Erro ao sincronizar item ${itemId}:`, error);
      throw new BadRequestException(error.message || 'Falha ao sincronizar dados do banco');
    }
  }

  /**
   * Desconecta um banco e remove o item no Pluggy
   */
  async deleteConnection(userId: string, connectionId: string) {
    const connection = await this.prisma.openFinanceConnection.findFirst({
      where: { id: connectionId, userId },
    });

    if (!connection) {
      throw new NotFoundException('Conexão bancária não encontrada');
    }

    // Tenta deletar no Pluggy
    try {
      await this.pluggyClient.deleteItem(connection.itemId);
    } catch (e: any) {
      this.logger.warn(`Item ${connection.itemId} já removido ou inacessível no Pluggy: ${e.message}`);
    }

    // Desvincula contas e cartões da conexão para não excluir o histórico do usuário
    await this.prisma.account.updateMany({
      where: { openFinanceConnectionId: connection.id },
      data: { openFinanceConnectionId: null },
    });

    await this.prisma.creditCard.updateMany({
      where: { openFinanceConnectionId: connection.id },
      data: { openFinanceConnectionId: null },
    });

    // Remove o registro de conexão
    await this.prisma.openFinanceConnection.delete({
      where: { id: connection.id },
    });

    return {
      message: 'Instituição desconectada com sucesso!',
    };
  }

  /**
   * Processamento de Webhooks enviados pela Pluggy
   */
  async handleWebhook(payload: any) {
    this.logger.log(`Webhook recebido da Pluggy: ${JSON.stringify(payload)}`);

    const { event, itemId, error } = payload;
    if (!itemId) return { status: 'ignored', reason: 'No itemId provided' };

    const connection = await this.prisma.openFinanceConnection.findUnique({
      where: { itemId },
    });

    if (event === 'item/deleted') {
      if (connection) {
        await this.prisma.openFinanceConnection.delete({ where: { id: connection.id } });
      }
      return { status: 'processed', event };
    }

    if (event === 'item/error') {
      if (connection) {
        await this.prisma.openFinanceConnection.update({
          where: { id: connection.id },
          data: {
            status: 'LOGIN_ERROR',
            errorCode: error?.code || 'GENERIC_ERROR',
          },
        });
      }
      return { status: 'processed', event };
    }

    if (event === 'item/created' || event === 'item/updated' || event === 'transactions/new') {
      if (connection) {
        // Dispara sincronização em segundo plano
        this.syncItem(connection.userId, itemId).catch((err) => {
          this.logger.error(`Erro ao sincronizar via webhook para item ${itemId}:`, err);
        });
      }
      return { status: 'sync_triggered', event };
    }

    return { status: 'ignored', event };
  }

  private mapAccountType(type?: string, subtype?: string): AccountType {
    if (subtype === 'SAVINGS_ACCOUNT' || type === 'SAVINGS') return AccountType.SAVINGS;
    if (type === 'INVESTMENT') return AccountType.INVESTMENT;
    return AccountType.CHECKING;
  }

  private mapCardBrand(brand?: string | null): CardBrand {
    if (!brand) return CardBrand.MASTERCARD;
    const b = brand.toUpperCase();
    if (b.includes('VISA')) return CardBrand.VISA;
    if (b.includes('MASTER')) return CardBrand.MASTERCARD;
    if (b.includes('ELO')) return CardBrand.ELO;
    if (b.includes('AMEX')) return CardBrand.AMEX;
    if (b.includes('HIPER')) return CardBrand.HIPERCARD;
    return CardBrand.OTHER;
  }

  private findBestCategoryMatch(suggestedName: string, isIncome: boolean, userCategories: any[]): any | null {
    if (!userCategories || userCategories.length === 0) return null;

    const targetType = isIncome ? 'INCOME' : 'EXPENSE';
    const sameTypeCategories = userCategories.filter((c) => c.type === targetType);
    if (sameTypeCategories.length === 0) return null;

    const cleanSug = (suggestedName || '').toLowerCase().trim();

    // 1. Match exato
    for (const cat of sameTypeCategories) {
      const catName = cat.name.toLowerCase();
      if (catName === cleanSug) return cat;
    }

    // 2. Match parcial ou por termos
    for (const cat of sameTypeCategories) {
      const catName = cat.name.toLowerCase();
      if (catName.includes(cleanSug) || cleanSug.includes(catName)) return cat;
      const terms = cleanSug.split('&').map((t) => t.trim());
      for (const term of terms) {
        if (term.length > 3 && catName.includes(term)) {
          return cat;
        }
      }
    }

    // 3. Fallback estritamente dentro do mesmo tipo (nunca mistura receita com despesa)
    if (isIncome) {
      return sameTypeCategories.find((c) => c.name.includes('Outras Rendas') || c.name.includes('Freelance') || c.name.includes('Salário')) || sameTypeCategories[0];
    } else {
      return sameTypeCategories.find((c) => c.name.includes('Outras Despesas') || c.name.includes('Moradia') || c.name.includes('Serviços')) || sameTypeCategories[0];
    }
  }
}
