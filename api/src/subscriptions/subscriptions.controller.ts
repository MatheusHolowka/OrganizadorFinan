import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.subscriptionsService.findAll(req.user.id);
  }

  @Post('scan')
  async scan(@Request() req: any) {
    return this.subscriptionsService.scanAndSyncFromTransactions(req.user.id);
  }

  @Post()
  async create(@Request() req: any, @Body() body: CreateSubscriptionDto) {
    return this.subscriptionsService.create(req.user.id, body);
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() body: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(req.user.id, id, body);
  }

  @Patch(':id/toggle')
  async toggle(@Request() req: any, @Param('id') id: string) {
    return this.subscriptionsService.toggleStatus(req.user.id, id);
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.subscriptionsService.delete(req.user.id, id);
  }

  @Post('simulate')
  async simulateSavings(@Body() body: { monthlyCutAmount: number; annualRate?: number }) {
    return this.subscriptionsService.simulateSavings(body.monthlyCutAmount || 0, body.annualRate || 0.115);
  }
}
