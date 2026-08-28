import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { VaultsService } from './vaults.service';
import { CreateVaultDto } from './dto/create-vault.dto';
import { UpdateVaultDto } from './dto/update-vault.dto';
import { CreateVaultMovementDto } from './dto/create-vault-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('vaults')
@UseGuards(JwtAuthGuard)
export class VaultsController {
  constructor(private readonly vaultsService: VaultsService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.vaultsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.vaultsService.findOne(userId, id);
  }

  @Post()
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateVaultDto) {
    return this.vaultsService.create(userId, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateVaultDto,
  ) {
    return this.vaultsService.update(userId, id, dto);
  }

  @Post(':id/movements')
  async createMovement(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateVaultMovementDto,
  ) {
    return this.vaultsService.createMovement(userId, id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.vaultsService.remove(userId, id);
  }

  @Get('roundups/stats')
  async getRoundUpStats(@CurrentUser('id') userId: string) {
    return this.vaultsService.getRoundUpStats(userId);
  }

  @Patch(':id/roundup')
  async toggleRoundUp(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { enabled: boolean; step?: number },
  ) {
    return this.vaultsService.toggleRoundUp(userId, id, body.enabled, body.step || 5);
  }
}

