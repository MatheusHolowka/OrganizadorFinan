import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { CreateCardTransactionDto } from './dto/create-card-transaction.dto';
import { PayInvoiceDto } from './dto/pay-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('credit-cards')
@UseGuards(JwtAuthGuard)
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.creditCardsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.creditCardsService.findOne(userId, id);
  }

  @Post()
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateCardDto) {
    return this.creditCardsService.create(userId, dto);
  }

  @Post(':id/transactions')
  async createTransaction(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateCardTransactionDto,
  ) {
    return this.creditCardsService.createTransaction(userId, id, dto);
  }

  @Post('invoices/:invoiceId/pay')
  async payInvoice(
    @CurrentUser('id') userId: string,
    @Param('invoiceId') invoiceId: string,
    @Body() dto: PayInvoiceDto,
  ) {
    return this.creditCardsService.payInvoice(userId, invoiceId, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.creditCardsService.remove(userId, id);
  }
}
