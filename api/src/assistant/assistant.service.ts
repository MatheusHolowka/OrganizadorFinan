import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(private prisma: PrismaService) {}

  async processQuery(userId: string, query: string): Promise<ChatMessage> {
    const q = query.toLowerCase().trim();
    const timestamp = new Date().toISOString();

    // 1. INTENT: TETO DIÁRIO / SALDO SEGURO / QUARENTENA DE COFRES
    if (q.includes('teto') || q.includes('posso gastar') || q.includes('saldo seguro') || q.includes('quarentena') || q.includes('disponivel')) {
      return this.handleSafeLiquidityIntent(userId, timestamp);
    }

    // 2. INTENT: FATURAS / CARTÃO / CASCATA / PARCELAS
    if (q.includes('fatura') || q.includes('cartao') || q.includes('cartão') || q.includes('parcela') || q.includes('cascata')) {
      return this.handleCreditCardInvoicesIntent(userId, timestamp);
    }

    // 3. INTENT: ASSINATURAS / STREAMING / RECORRÊNCIAS
    if (q.includes('assinatura') || q.includes('recorrente') || q.includes('netflix') || q.includes('cortar') || q.includes('plano')) {
      return this.handleSubscriptionsIntent(userId, timestamp);
    }

    // 4. INTENT: RUNWAY / INDEPENDÊNCIA / LIBERDADE / FIRE
    if (q.includes('runway') || q.includes('aposentar') || q.includes('independencia') || q.includes('independência') || q.includes('fire') || q.includes('patrimonio') || q.includes('patrimônio')) {
      return this.handleFireRunwayIntent(userId, timestamp);
    }

    // 5. INTENT: RESUMO GERAL DO MÊS / GASTOS
    if (q.includes('resumo') || q.includes('gastos') || q.includes('quanto gastei') || q.includes('alimentacao') || q.includes('alimentação') || q.includes('extrato')) {
      return this.handleSpendingSummaryIntent(userId, timestamp, q);
    }

    // 6. INTENT: COFRES / METAS / TROCADINHO
    if (q.includes('cofre') || q.includes('meta') || q.includes('trocadinho') || q.includes('roundup') || q.includes('poupar')) {
      return this.handleVaultsIntent(userId, timestamp);
    }

    // DEFAULT FALLBACK: DIAGNÓSTICO FINANCEIRO INTELIGENTE
    return this.handleGenericFinancialDiagnostic(userId, timestamp, query);
  }

  // ------------------------------------------------------
  // INTENT HANDLERS
  // ------------------------------------------------------

  private async handleSafeLiquidityIntent(userId: string, timestamp: string): Promise<ChatMessage> {
    const [accounts, vaults] = await Promise.all([
      this.prisma.account.findMany({ where: { userId, isArchived: false } }),
      this.prisma.vault.findMany({ where: { userId, isolatedFromDailyBalance: true } }),
    ]);

    const grossBalance = accounts.reduce((sum, a) => sum + Number(a.currentBalance), 0);
    const isolatedVaults = vaults.reduce((sum, v) => sum + Number(v.currentAmount), 0);
    const safeLiquidity = Math.max(0, grossBalance - isolatedVaults);

    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(1, lastDayOfMonth - today.getDate() + 1);
    const dailyBudget = safeLiquidity / daysRemaining;

    const content = `🛡️ **Diagnóstico de Liquidez & Quarentena FINAN**

• **Saldo Bruto em Contas:** R$ ${grossBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• **Cofres Blindados (Metas Isoladas):** R$ ${isolatedVaults.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• **Saldo Livre Real (Sem Autoengano):** R$ ${safeLiquidity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

💡 **Seu Teto Diário Seguro:** R$ ${dailyBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/dia (para os próximos ${daysRemaining} dias).

*Você pode gastar até esse valor hoje mantendo seus cofres e metas 100% protegidos.*`;

    return {
      role: 'assistant',
      content,
      timestamp,
      metadata: { grossBalance, isolatedVaults, safeLiquidity, dailyBudget, daysRemaining },
    };
  }

  private async handleCreditCardInvoicesIntent(userId: string, timestamp: string): Promise<ChatMessage> {
    const cards = await this.prisma.creditCard.findMany({
      where: { userId, isArchived: false },
      include: {
        invoices: {
          where: { status: { in: ['OPEN', 'OVERDUE'] } },
          orderBy: { dueDate: 'asc' },
          take: 3,
        },
      },
    });

    if (cards.length === 0) {
      return {
        role: 'assistant',
        content: `💳 Você ainda não cadastrou cartões de crédito ou conectou via Open Finance. Cadastre seus cartões para visualizar a projeção em cascata!`,
        timestamp,
      };
    }

    let totalOpen = 0;
    const cardSummaries = cards.map((c) => {
      const openInvoice = c.invoices[0];
      const invTotal = openInvoice ? Number(openInvoice.totalAmount) : 0;
      totalOpen += invTotal;
      return `• **${c.name}**: R$ ${invTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Vencimento dia ${c.dueDay})`;
    });

    const content = `💳 **Projeção de Faturas de Cartão de Crédito**

${cardSummaries.join('\n')}

📊 **Total Comprometido neste mês:** R$ ${totalOpen.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

⚡ *Dica FINAN:* Use a projeção em cascata na aba Cartões para visualizar o parcelamento dos próximos 6 a 24 meses.`;

    return {
      role: 'assistant',
      content,
      timestamp,
      metadata: { totalOpen, cardsCount: cards.length },
    };
  }

  private async handleSubscriptionsIntent(userId: string, timestamp: string): Promise<ChatMessage> {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId, status: 'ACTIVE' },
    });

    const totalMonthly = subscriptions.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalYearly = totalMonthly * 12;

    const list = subscriptions.slice(0, 5).map((s) => `• **${s.name}**: R$ ${Number(s.amount).toFixed(2)}/mês`);

    const content = `📡 **Radar de Assinaturas & Recorrências**

Você possui **${subscriptions.length} assinaturas ativas** monitoradas:
${list.join('\n')}${subscriptions.length > 5 ? `\n• ... e mais ${subscriptions.length - 5} serviços` : ''}

💰 **Gasto Recorrente Mensal:** R$ ${totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
📅 **Impacto Anual:** R$ ${totalYearly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano

💡 *Se você cortar R$ 100/mês em assinaturas desnecessárias e aplicar no Tesouro Selic, terá mais de **R$ 8.200** acumulados em 5 anos.*`;

    return {
      role: 'assistant',
      content,
      timestamp,
      metadata: { totalMonthly, totalYearly, count: subscriptions.length },
    };
  }

  private async handleFireRunwayIntent(userId: string, timestamp: string): Promise<ChatMessage> {
    const [accounts, investments, loans] = await Promise.all([
      this.prisma.account.findMany({ where: { userId, isArchived: false } }),
      this.prisma.openFinanceInvestment.findMany({
        where: { openFinanceConnection: { userId } },
      }),
      this.prisma.openFinanceLoan.findMany({
        where: { openFinanceConnection: { userId } },
      }),
    ]);

    const cashTotal = accounts.reduce((sum, a) => sum + Number(a.currentBalance), 0);
    const investTotal = investments.reduce((sum, i) => sum + Number(i.balance), 0);
    const debtTotal = loans.reduce((sum, l) => sum + Number(l.outstandingBalance), 0);

    const netWorth = cashTotal + investTotal - debtTotal;

    // Estimate monthly cost of living (~ R$ 5.000 or based on active history)
    const estimatedMonthlyBurn = 5000;
    const runwayMonths = (cashTotal + investTotal) / estimatedMonthlyBurn;
    const fireTarget = estimatedMonthlyBurn * 12 * 25; // 300x mensal (Regra dos 4%)
    const fireProgress = Math.min(100, Math.round((netWorth / fireTarget) * 100));

    const content = `🧭 **Simulador de Independência Financeira (FIRE & Runway)**

• **Patrimônio Líquido:** R$ ${netWorth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
  *(Disponível: R$ ${cashTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Investido: R$ ${investTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Dívidas: R$ ${debtTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})*

⏳ **Runway Atual (Autonomia sem trabalhar):** ~${runwayMonths.toFixed(1)} meses
🎯 **Meta de Liberdade Plena (Regra 4%):** R$ ${fireTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
📈 **Progresso FIRE:** ${fireProgress}% concluído

🚀 *Com aportes consistentes e quarentena de liquidez, seu patrimônio cresce sem vazamento financeiro.*`;

    return {
      role: 'assistant',
      content,
      timestamp,
      metadata: { netWorth, runwayMonths, fireTarget, fireProgress },
    };
  }

  private async handleSpendingSummaryIntent(userId: string, timestamp: string, query: string): Promise<ChatMessage> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const transactions = await this.prisma.transaction.findMany({
      where: { userId, date: { gte: startOfMonth } },
      include: { category: true },
    });

    const income = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = income - expense;

    const content = `📊 **Resumo Financeiro do Mês Atual**

• **Entradas:** R$ ${income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• **Saídas:** R$ ${expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• **Balanço Operacional:** R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${balance >= 0 ? '🟢 (Positivo)' : '🔴 (Atenção)'}

💡 *Para detalhamento por categoria ou conciliação bancária, confira a aba Transações.*`;

    return {
      role: 'assistant',
      content,
      timestamp,
      metadata: { income, expense, balance },
    };
  }

  private async handleVaultsIntent(userId: string, timestamp: string): Promise<ChatMessage> {
    const vaults = await this.prisma.vault.findMany({
      where: { userId },
      orderBy: { currentAmount: 'desc' },
    });

    if (vaults.length === 0) {
      return {
        role: 'assistant',
        content: `🐷 Você ainda não tem cofres ativos. Crie um cofre para sua Reserva de Emergência ou Metas para blindar seu dinheiro!`,
        timestamp,
      };
    }

    const roundUpVault = vaults.find((v) => v.roundUpEnabled);
    const vaultList = vaults.map((v) => {
      const pct = Math.round((Number(v.currentAmount) / Number(v.targetAmount)) * 100);
      return `• **${v.title}**: R$ ${Number(v.currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ ${Number(v.targetAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${pct}%) ${v.roundUpEnabled ? '⚡ (Trocadinho Ativo)' : ''}`;
    });

    const content = `🐷 **Seus Cofres Blindados**

${vaultList.join('\n')}

${roundUpVault ? `⚡ **Modo Trocadinho:** O cofre *${roundUpVault.title}* está recebendo arredondamentos automáticos das suas compras!` : `💡 *Dica:* Ative o modo **Trocadinho Automático** em um cofre para guardar o troco de cada compra sem perceber.`}`;

    return {
      role: 'assistant',
      content,
      timestamp,
    };
  }

  private async handleGenericFinancialDiagnostic(userId: string, timestamp: string, query: string): Promise<ChatMessage> {
    const content = `Olá! Sou o **Assistente de Engenharia Financeira do FINAN**. 🤖

Você pode me perguntar a qualquer momento:
1. *"Quanto posso gastar hoje sem furar a meta?"* (Teto diário seguro)
2. *"Qual o total das minhas faturas do mês que vem?"* (Projeção de cartões)
3. *"Quais assinaturas e serviços recorrentes eu tenho?"* (Radar de assinaturas)
4. *"Qual meu runway e progresso de independência financeira?"* (Simulador FIRE)
5. *"Qual o resumo das minhas despesas do mês?"*

Como posso te ajudar hoje?`;

    return {
      role: 'assistant',
      content,
      timestamp,
    };
  }

  // ------------------------------------------------------
  // WHATSAPP INTEGRATION & WEBHOOK
  // ------------------------------------------------------

  async handleWhatsAppWebhook(payload: any) {
    this.logger.log(`Received WhatsApp Webhook payload: ${JSON.stringify(payload)}`);

    // Extract sender phone and message text
    // Handles Evolution API, Baileys, and Meta Cloud API formats
    let senderPhone = '';
    let messageText = '';

    if (payload.data && payload.data.key) {
      senderPhone = payload.data.key.remoteJid?.split('@')[0] || '';
      messageText = payload.data.message?.conversation || payload.data.message?.extendedTextMessage?.text || '';
    } else if (payload.entry && payload.entry[0]?.changes && payload.entry[0]?.changes[0]?.value?.messages) {
      const msg = payload.entry[0].changes[0].value.messages[0];
      senderPhone = msg.from;
      messageText = msg.text?.body || '';
    }

    if (!senderPhone || !messageText) {
      return { status: 'ignored', reason: 'No message found' };
    }

    // Clean phone number
    const cleanPhone = senderPhone.replace(/\D/g, '');

    // Look for user by whatsappPhone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { whatsappPhone: cleanPhone },
          { whatsappPhone: { contains: cleanPhone.slice(-8) } },
        ],
      },
    });

    if (!user) {
      return {
        status: 'unauthorized',
        reply: `🔒 Olá! Para conversar com o FINAN pelo WhatsApp, conecte seu número no painel do FINAN em Configurações > WhatsApp Bot.`,
      };
    }

    const response = await this.processQuery(user.id, messageText);
    return {
      status: 'success',
      reply: response.content,
      recipient: cleanPhone,
    };
  }

  async connectWhatsAppNumber(userId: string, phone: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        whatsappPhone: cleanPhone,
        whatsappConnected: true,
        whatsappToken: token,
      },
    });

    return {
      success: true,
      whatsappPhone: user.whatsappPhone,
      whatsappConnected: user.whatsappConnected,
      pairingCode: token,
      botNumber: '+55 11 99999-FINAN',
    };
  }
}
