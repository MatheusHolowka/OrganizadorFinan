import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PluggyClient } from 'pluggy-sdk';

@Injectable()
export class PluggyClientService {
  private readonly logger = new Logger(PluggyClientService.name);
  private client: PluggyClient;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('PLUGGY_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PLUGGY_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      this.logger.warn('PLUGGY_CLIENT_ID or PLUGGY_CLIENT_SECRET is missing from environment variables.');
    }

    this.client = new PluggyClient({
      clientId: clientId || '',
      clientSecret: clientSecret || '',
    });
  }

  async createConnectToken(clientUserId?: string, itemId?: string): Promise<string> {
    const options: any = {};
    if (clientUserId) {
      options.clientUserId = clientUserId;
    }
    const response = await this.client.createConnectToken(itemId, options);
    return response.accessToken;
  }

  async fetchItem(itemId: string) {
    return this.client.fetchItem(itemId);
  }

  async fetchAccounts(itemId: string) {
    const res = await this.client.fetchAccounts(itemId);
    return res.results;
  }

  async fetchAllTransactions(accountId: string, dateFrom?: string) {
    return this.client.fetchAllTransactions(accountId, {
      dateFrom,
    });
  }

  async fetchCreditCardBills(accountId: string) {
    const res = await this.client.fetchCreditCardBills(accountId);
    return res.results;
  }

  async fetchInvestments(itemId: string) {
    try {
      const res = await this.client.fetchInvestments(itemId);
      return res.results;
    } catch (e: any) {
      this.logger.warn(`Investimentos não disponíveis para item ${itemId}: ${e.message}`);
      return [];
    }
  }

  async fetchLoans(itemId: string) {
    try {
      const res = await this.client.fetchLoans(itemId);
      return res.results;
    } catch (e: any) {
      this.logger.warn(`Empréstimos não disponíveis para item ${itemId}: ${e.message}`);
      return [];
    }
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.client.deleteItem(itemId);
  }
}
