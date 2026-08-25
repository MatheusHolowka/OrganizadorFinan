import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('family')
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get('my-group')
  async getMyFamily(@CurrentUser('id') userId: string) {
    return this.familyService.getMyFamily(userId);
  }

  @Post('create')
  async createFamily(@CurrentUser('id') userId: string, @Body() dto: CreateFamilyDto) {
    return this.familyService.createFamily(userId, dto);
  }

  @Post('invite')
  async inviteMember(@CurrentUser('id') userId: string, @Body() dto: InviteMemberDto) {
    return this.familyService.inviteMember(userId, dto);
  }

  @Post('accept/:memberId')
  async acceptInvite(@CurrentUser('id') userId: string, @Param('memberId') memberId: string) {
    return this.familyService.acceptInvite(userId, memberId);
  }

  @Delete('members/:memberId')
  async removeOrLeaveMember(@CurrentUser('id') userId: string, @Param('memberId') memberId: string) {
    return this.familyService.removeOrLeaveMember(userId, memberId);
  }
}
