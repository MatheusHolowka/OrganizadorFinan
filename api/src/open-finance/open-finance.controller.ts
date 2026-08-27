import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OpenFinanceService } from './open-finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('open-finance')
export class OpenFinanceController {
  constructor(private readonly openFinanceService: OpenFinanceService) {}

  /**
   * Gera o token Connect efêmero para inicializar o widget no Frontend
   */
  @Post('connect-token')
  @UseGuards(JwtAuthGuard)
  async getConnectToken(
    @CurrentUser('id') userId: string,
    @Body() body?: { itemId?: string },
  ) {
    return this.openFinanceService.getConnectToken(userId, body?.itemId);
  }

  /**
   * Lista todas as instituições/bancos conectados pelo usuário
   */
  @Get('connections')
  @UseGuards(JwtAuthGuard)
  async listConnections(@CurrentUser('id') userId: string) {
    return this.openFinanceService.listConnections(userId);
  }

  /**
   * Dispara a sincronização manual de um item (banco)
   */
  @Post('connections/sync/:itemId')
  @UseGuards(JwtAuthGuard)
  async syncItem(
    @CurrentUser('id') userId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.openFinanceService.syncItem(userId, itemId);
  }

  /**
   * Desconecta uma instituição bancária
   */
  @Delete('connections/:id')
  @UseGuards(JwtAuthGuard)
  async deleteConnection(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.openFinanceService.deleteConnection(userId, id);
  }

  /**
   * Endpoint de Webhook para receber eventos assíncronos da Pluggy
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() payload: any) {
    return this.openFinanceService.handleWebhook(payload);
  }
}
