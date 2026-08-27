import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FamilyModule } from './family/family.module';
import { AccountsModule } from './accounts/accounts.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { VaultsModule } from './vaults/vaults.module';
import { ImportModule } from './import/import.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OpenFinanceModule } from './open-finance/open-finance.module';
import { InvestmentsModule } from './investments/investments.module';
import { LoansModule } from './loans/loans.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 120, // max 120 reqs/min por IP global
      },
      {
        name: 'short',
        ttl: 1000,
        limit: 15, // max 15 reqs/s por IP anti-flood
      },
    ]),
    PrismaModule,
    MailModule,
    AuthModule,
    UsersModule,
    FamilyModule,
    AccountsModule,
    CategoriesModule,
    TransactionsModule,
    CreditCardsModule,
    VaultsModule,
    ImportModule,
    DashboardModule,
    OpenFinanceModule,
    InvestmentsModule,
    LoansModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

