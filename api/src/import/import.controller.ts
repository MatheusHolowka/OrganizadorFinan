import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportService } from './import.service';
import { ConfirmImportDto } from './dto/confirm-import.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('import')
@UseGuards(JwtAuthGuard)
export class ImportController {
  constructor(private readonly importService: ImportService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @CurrentUser('id') userId: string,
    @Body('accountId') accountId: string,
    @UploadedFile() file: { originalname: string; buffer: Buffer },
  ) {
    return this.importService.parseFile(userId, accountId, file);
  }

  @Post('confirm')
  async confirmImport(
    @CurrentUser('id') userId: string,
    @Body() dto: ConfirmImportDto,
  ) {
    return this.importService.confirmImport(userId, dto);
  }
}
