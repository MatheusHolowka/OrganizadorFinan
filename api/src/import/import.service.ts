import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseOfx } from './helpers/ofx-parser.helper';
import { parseCsv } from './helpers/csv-parser.helper';
import { analyzeTransaction } from './helpers/smart-categorizer.helper';
import { ConfirmImportDto } from './dto/confirm-import.dto';
import { ImportFormat, ImportStatus, TransactionType } from '@prisma/client';
import { createHash } from 'crypto';

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  async parseFile(userId: string, accountId: string, file: { originalname: string; buffer: Buffer }) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Arquivo não enviado ou vazio');
    }

    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const userCategories = await this.prisma.category.findMany({
      where: { userId },
    });

    const filename = file.originalname;
    const extension = filename.split('.').pop()?.toLowerCase();

    let format: ImportFormat;
    if (extension === 'ofx') {
      format = ImportFormat.OFX;
    } else if (extension === 'csv') {
      format = ImportFormat.CSV;
    } else {
      throw new BadRequestException('Formato de arquivo não suportado. Envie um arquivo .OFX ou .CSV');
    }

    const fileContent = file.buffer.toString('utf-8');
    const fileChecksum = createHash('sha256').update(file.buffer).digest('hex');

    // Verifica se este lote exato de arquivo já foi importado com status concluído
    const existingBatch = await this.prisma.importBatch.findFirst({
      where: { userId, fileChecksum, status: ImportStatus.COMPLETED },
    });

    const parsedItems = format === ImportFormat.OFX ? parseOfx(fileContent) : parseCsv(fileContent);

    if (parsedItems.length === 0) {
      throw new BadRequestException('Nenhuma transação válida foi encontrada no arquivo');
    }

    // 🔍 Busca identificadores de transações já EFETIVAMENTE importadas no banco para esta conta
    const existingConfirmedItems = await this.prisma.importItem.findMany({
      where: {
        batch: { userId, accountId, status: ImportStatus.COMPLETED },
        matchedTransactionId: { not: null },
        externalId: { not: null },
      },
      select: { externalId: true },
    });

    const existingExternalIds = new Set(
      existingConfirmedItems.map((i) => i.externalId).filter((id): id is string => !!id && id.length > 5)
    );

    // Cria registro de lote para esta tentativa de importação
    const batch = await this.prisma.importBatch.create({
      data: {
        userId,
        accountId,
        filename,
        format,
        fileChecksum,
        status: ImportStatus.PROCESSING,
        totalItems: parsedItems.length,
      },
    });

    // Cria items com detecção anti-duplicidade precisa baseada em externalId real
    const createdItems: any[] = [];
    
    for (const item of parsedItems) {
      const absAmount = Math.abs(item.amount);
      const targetType = item.amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;

      // É duplicado APENAS se o lote idêntico já foi importado OU se o Identificador único real já foi importado e conciliado no banco
      const isDuplicate = !!existingBatch || (item.externalId ? existingExternalIds.has(item.externalId) : false);

      // Executa o motor inteligente de análise de descrição e categoria
      const analysis = analyzeTransaction(item.description, item.rawType, item.amount, user?.name);

      const matchedCategory = this.findBestCategoryMatch(analysis.suggestedCategoryName, item.amount >= 0, userCategories);

      createdItems.push({
        batchId: batch.id,
        externalId: item.externalId,
        date: item.date,
        amount: absAmount,
        description: analysis.cleanDescription,
        memo: item.description,
        rawType: item.amount >= 0 ? 'CREDIT' : 'DEBIT',
        isDuplicate,
        originalDescription: item.description,
        categoryId: matchedCategory ? matchedCategory.id : null,
        suggestedCategoryName: matchedCategory ? matchedCategory.name : analysis.suggestedCategoryName,
        originalAmount: item.amount,
        type: targetType,
      });
    }

    // Grava itens no banco
    const savedItems: any[] = [];
    for (const item of createdItems) {
      const saved = await this.prisma.importItem.create({
        data: {
          batchId: item.batchId,
          externalId: item.externalId,
          date: item.date,
          amount: item.amount,
          description: item.description,
          memo: item.memo,
          rawType: item.rawType,
          isDuplicate: item.isDuplicate,
        },
      });

      savedItems.push({
        ...saved,
        originalDescription: item.originalDescription,
        categoryId: item.categoryId,
        suggestedCategoryName: item.suggestedCategoryName,
        originalAmount: item.originalAmount,
        type: item.type,
      });
    }

    const totalDuplicates = savedItems.filter((i) => i.isDuplicate).length;

    return {
      batchId: batch.id,
      filename,
      format,
      isDuplicateBatch: !!existingBatch || (totalDuplicates === savedItems.length && savedItems.length > 0),
      totalItems: savedItems.length,
      totalDuplicates,
      items: savedItems,
    };
  }

  async confirmImport(userId: string, dto: ConfirmImportDto) {
    const batch = await this.prisma.importBatch.findFirst({
      where: { id: dto.batchId, userId },
    });

    if (!batch) {
      throw new NotFoundException('Lote de importação não encontrado');
    }

    const account = await this.prisma.account.findFirst({
      where: { id: dto.accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    let importedCount = 0;
    let skippedCount = 0;
    let netBalanceChange = 0;

    await this.prisma.$transaction(
      async (tx) => {
        for (const item of dto.items) {
          if (!item.shouldImport) {
            skippedCount++;
            continue;
          }

          const type = item.amount >= 0 ? TransactionType.INCOME : TransactionType.EXPENSE;
          const absAmount = Math.abs(item.amount);

          const existing = await tx.transaction.findFirst({
            where: {
              userId,
              accountId: dto.accountId,
              importItemId: item.importItemId,
            },
          });

          if (existing) {
            skippedCount++;
            continue;
          }

          if (type === TransactionType.INCOME) {
            netBalanceChange += absAmount;
          } else {
            netBalanceChange -= absAmount;
          }

          const transaction = await tx.transaction.create({
            data: {
              userId,
              accountId: dto.accountId,
              categoryId: item.categoryId || null,
              type,
              amount: absAmount,
              description: item.description,
              date: new Date(item.date),
              status: 'COMPLETED',
              isReconciled: true,
              importItemId: item.importItemId,
            },
          });

          await tx.importItem.update({
            where: { id: item.importItemId },
            data: {
              matchedTransactionId: transaction.id,
              isDuplicate: false,
            },
          });

          importedCount++;
        }

        if (netBalanceChange !== 0) {
          await tx.account.update({
            where: { id: dto.accountId },
            data: { currentBalance: { increment: netBalanceChange } },
          });
        }

        await tx.importBatch.update({
          where: { id: batch.id },
          data: {
            status: ImportStatus.COMPLETED,
            importedItems: importedCount,
            skippedItems: skippedCount,
          },
        });
      },
      { timeout: 120000, maxWait: 15000 }
    );

    return {
      message: `${importedCount} transações importadas e conciliadas com sucesso (${skippedCount} ignoradas ou duplicadas)`,
      importedCount,
      skippedCount,
    };
  }

  private findBestCategoryMatch(suggestedName: string, isIncome: boolean, userCategories: any[]): any | null {
    if (!userCategories || userCategories.length === 0) return null;

    const targetType = isIncome ? 'INCOME' : 'EXPENSE';
    const sameTypeCategories = userCategories.filter((c) => c.type === targetType);

    const cleanSug = suggestedName.toLowerCase();
    
    for (const cat of sameTypeCategories) {
      const catName = cat.name.toLowerCase();
      if (catName === cleanSug || catName.includes(cleanSug) || cleanSug.includes(catName)) {
        return cat;
      }
      const terms = cleanSug.split('&').map((t) => t.trim());
      for (const term of terms) {
        if (term.length > 3 && catName.includes(term)) {
          return cat;
        }
      }
    }

    for (const cat of userCategories) {
      const catName = cat.name.toLowerCase();
      if (catName.includes(cleanSug) || cleanSug.includes(catName)) {
        return cat;
      }
    }

    return sameTypeCategories.length > 0 ? sameTypeCategories[0] : userCategories[0];
  }
}
