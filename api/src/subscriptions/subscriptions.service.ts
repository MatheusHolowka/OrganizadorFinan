import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/create-subscription.dto';

const KNOWN_SUBSCRIPTION_PATTERNS = [
  { pattern: /netflix/i, name: 'Netflix', category: 'STREAMING', icon: 'film', color: '#E50914' },
  { pattern: /spotify/i, name: 'Spotify', category: 'STREAMING', icon: 'music', color: '#1DB954' },
  { pattern: /amazon\s*prime|prime\s*video/i, name: 'Amazon Prime', category: 'STREAMING', icon: 'shopping-bag', color: '#00A8E1' },
  { pattern: /disney/i, name: 'Disney+', category: 'STREAMING', icon: 'tv', color: '#113CCF' },
  { pattern: /max|hbo/i, name: 'Max (HBO)', category: 'STREAMING', icon: 'tv', color: '#9900FF' },
  { pattern: /youtube\s*premium|google\s*youtube/i, name: 'YouTube Premium', category: 'STREAMING', icon: 'video', color: '#FF0000' },
  { pattern: /apple(\.com|\s*one|\s*music|\s*services|icloud)/i, name: 'Apple Services / iCloud', category: 'SOFTWARE', icon: 'cloud', color: '#A2AAAD' },
  { pattern: /chatgpt|openai/i, name: 'ChatGPT Plus (OpenAI)', category: 'SOFTWARE', icon: 'cpu', color: '#10A37F' },
  { pattern: /github/i, name: 'GitHub Copilot / Pro', category: 'SOFTWARE', icon: 'code', color: '#24292E' },
  { pattern: /smart\s*fit|gympass|totalpass|bluefit/i, name: 'Academia / Fitness', category: 'HEALTH', icon: 'activity', color: '#FFB800' },
  { pattern: /uber\s*(one|pass)/i, name: 'Uber One', category: 'UTILITIES', icon: 'navigation', color: '#000000' },
  { pattern: /claro|vivo|tim|oi\s*fibra/i, name: 'Telefonia & Internet', category: 'UTILITIES', icon: 'wifi', color: '#EA1D25' },
  { pattern: /duolingo/i, name: 'Duolingo Super', category: 'EDUCATION', icon: 'book', color: '#58CC02' },
];

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { amount: 'desc' },
    });

    // If user has zero subscriptions registered, auto-scan transactions first
    if (subscriptions.length === 0) {
      await this.scanAndSyncFromTransactions(userId);
      return this.findAll(userId);
    }

    const activeSubs = subscriptions.filter((s) => s.status !== 'CANCELLED');
    const ghostSubs = subscriptions.filter((s) => s.status === 'FLAGGED_GHOST');

    const totalMonthly = activeSubs.reduce((acc, s) => {
      const val = Number(s.amount);
      if (s.frequency === 'YEARLY') return acc + val / 12;
      if (s.frequency === 'WEEKLY') return acc + val * 4.33;
      return acc + val;
    }, 0);

    const totalYearly = totalMonthly * 12;

    return {
      subscriptions,
      metrics: {
        totalMonthly: Number(totalMonthly.toFixed(2)),
        totalYearly: Number(totalYearly.toFixed(2)),
        activeCount: activeSubs.length,
        ghostCount: ghostSubs.length,
        totalCount: subscriptions.length,
      },
    };
  }

  async scanAndSyncFromTransactions(userId: string) {
    // Look for transactions and credit card transactions in the last 90 days
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

    const [accountTx, cardTx] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: threeMonthsAgo },
          type: 'EXPENSE',
        },
        select: { description: true, amount: true, date: true },
      }),
      this.prisma.creditCardTransaction.findMany({
        where: {
          creditCard: { userId },
          purchaseDate: { gte: threeMonthsAgo },
        },
        select: { description: true, totalAmount: true, purchaseDate: true },
      }),
    ]);

    const allExpenses = [
      ...accountTx.map((t) => ({ description: t.description, amount: Number(t.amount), date: t.date })),
      ...cardTx.map((t) => ({ description: t.description, amount: Number(t.totalAmount), date: t.purchaseDate })),
    ];

    const detectedMap = new Map<string, { name: string; merchant: string; category: string; icon: string; color: string; amount: number; lastDate: Date; occurrences: number }>();

    for (const exp of allExpenses) {
      for (const known of KNOWN_SUBSCRIPTION_PATTERNS) {
        if (known.pattern.test(exp.description)) {
          const key = known.name;
          const current = detectedMap.get(key);
          if (!current) {
            detectedMap.set(key, {
              name: known.name,
              merchant: exp.description,
              category: known.category,
              icon: known.icon,
              color: known.color,
              amount: exp.amount,
              lastDate: exp.date,
              occurrences: 1,
            });
          } else {
            current.occurrences++;
            if (exp.date > current.lastDate) {
              current.lastDate = exp.date;
              current.amount = exp.amount; // update to most recent bill
            }
          }
          break;
        }
      }
    }

    // Upsert detected subscriptions
    for (const detected of detectedMap.values()) {
      const existing = await this.prisma.subscription.findFirst({
        where: { userId, name: detected.name },
      });

      const nextBilling = new Date(detected.lastDate);
      nextBilling.setMonth(nextBilling.getMonth() + 1);

      if (!existing) {
        await this.prisma.subscription.create({
          data: {
            userId,
            name: detected.name,
            merchantName: detected.merchant,
            amount: detected.amount,
            category: detected.category,
            icon: detected.icon,
            color: detected.color,
            frequency: 'MONTHLY',
            status: 'ACTIVE',
            lastBilledAt: detected.lastDate,
            nextBillingAt: nextBilling,
            autoDetected: true,
          },
        });
      }
    }

    return this.prisma.subscription.findMany({ where: { userId } });
  }

  async create(userId: string, data: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data: {
        userId,
        name: data.name,
        merchantName: data.merchantName || data.name,
        amount: data.amount,
        frequency: data.frequency || 'MONTHLY',
        category: data.category || 'STREAMING',
        status: data.status || 'ACTIVE',
        icon: data.icon || 'tv',
        color: data.color || '#E50914',
        nextBillingAt: data.nextBillingAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: data.notes,
        autoDetected: false,
      },
    });
  }

  async update(userId: string, id: string, data: UpdateSubscriptionDto) {
    const existing = await this.prisma.subscription.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Assinatura não encontrada');

    return this.prisma.subscription.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.amount && { amount: data.amount }),
        ...(data.category && { category: data.category }),
        ...(data.frequency && { frequency: data.frequency }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  async toggleStatus(userId: string, id: string) {
    const existing = await this.prisma.subscription.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Assinatura não encontrada');

    const nextStatus = existing.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE';
    return this.prisma.subscription.update({
      where: { id },
      data: { status: nextStatus },
    });
  }

  async delete(userId: string, id: string) {
    const existing = await this.prisma.subscription.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Assinatura não encontrada');

    return this.prisma.subscription.delete({ where: { id } });
  }

  simulateSavings(monthlyCutAmount: number, annualRate: number = 0.115) {
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

    const computeCompound = (months: number) => {
      let total = 0;
      for (let i = 1; i <= months; i++) {
        total = (total + monthlyCutAmount) * (1 + monthlyRate);
      }
      return Number(total.toFixed(2));
    };

    return {
      monthlySaved: monthlyCutAmount,
      annualSavedDirect: monthlyCutAmount * 12,
      futureValue1Year: computeCompound(12),
      futureValue3Years: computeCompound(36),
      futureValue5Years: computeCompound(60),
      futureValue10Years: computeCompound(120),
    };
  }
}
