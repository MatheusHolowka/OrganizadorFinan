import { Controller, Post, Get, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  async chat(@Request() req: any, @Body() body: { message: string }) {
    return this.assistantService.processQuery(req.user.id, body.message || '');
  }

  @Get('suggestions')
  @UseGuards(JwtAuthGuard)
  async getSuggestions() {
    return {
      suggestions: [
        { label: '🛡️ Teto Diário Seguro', prompt: 'Quanto posso gastar hoje sem furar a meta?' },
        { label: '💳 Faturas dos Cartões', prompt: 'Qual o total das faturas do mês que vem?' },
        { label: '📡 Radar de Assinaturas', prompt: 'Quais assinaturas ativas eu tenho?' },
        { label: '🧭 Simulador FIRE', prompt: 'Qual meu runway e meta de liberdade financeira?' },
        { label: '📊 Resumo do Mês', prompt: 'Qual o resumo de despesas e receitas deste mês?' },
      ],
    };
  }

  @Post('whatsapp-connect')
  @UseGuards(JwtAuthGuard)
  async connectWhatsApp(@Request() req: any, @Body() body: { phone: string }) {
    return this.assistantService.connectWhatsAppNumber(req.user.id, body.phone);
  }

  // Webhook for WhatsApp integrations (Evolution API / Meta Webhook)
  @Post('whatsapp-webhook')
  @HttpCode(HttpStatus.OK)
  async whatsappWebhookPost(@Body() body: any) {
    return this.assistantService.handleWhatsAppWebhook(body);
  }

  @Get('whatsapp-webhook')
  @HttpCode(HttpStatus.OK)
  async whatsappWebhookGet() {
    return { status: 'FINAN WhatsApp Webhook is active' };
  }
}
