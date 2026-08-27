import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OpenFinanceController } from './open-finance.controller';
import { OpenFinanceService } from './open-finance.service';
import { PluggyClientService } from './pluggy-client.service';

@Module({
  imports: [PrismaModule],
  controllers: [OpenFinanceController],
  providers: [PluggyClientService, OpenFinanceService],
  exports: [OpenFinanceService, PluggyClientService],
})
export class OpenFinanceModule {}
