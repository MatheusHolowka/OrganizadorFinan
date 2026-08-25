import { ParsedTransactionItem } from './ofx-parser.helper';
import { createHash } from 'crypto';

export function parseCsv(content: string): ParsedTransactionItem[] {
  const items: ParsedTransactionItem[] = [];
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length === 0) return items;

  // Detecta delimitador (; ou , ou \t)
  const firstLine = lines[0];
  const countSemicolon = (firstLine.match(/;/g) || []).length;
  const countComma = (firstLine.match(/,/g) || []).length;
  const countTab = (firstLine.match(/\t/g) || []).length;

  let delimiter = ';';
  if (countComma > countSemicolon && countComma > countTab) {
    delimiter = ',';
  } else if (countTab > countSemicolon && countTab > countComma) {
    delimiter = '\t';
  }

  // Identifica cabeçalhos
  const rawHeaders = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
  
  let dateIndex = rawHeaders.findIndex((h) => h.includes('data') || h.includes('date'));
  let descIndex = rawHeaders.findIndex(
    (h) => h.includes('descricao') || h.includes('descrição') || h.includes('description') || h.includes('historico') || h.includes('histórico') || h.includes('memo') || h.includes('estabelecimento')
  );
  let amountIndex = rawHeaders.findIndex((h) => h.includes('valor') || h.includes('amount') || h.includes('quantia'));
  let typeIndex = rawHeaders.findIndex((h) => h.includes('tipo') || h.includes('type'));
  
  // 🔍 Prioriza IDENTIFICADOR único (UUID, EndToEndId, código de transação único do banco)
  let idIndex = rawHeaders.findIndex((h) => h === 'identificador' || h.includes('identificador'));
  if (idIndex === -1) {
    idIndex = rawHeaders.findIndex((h) => h.includes('fitid') || h === 'id' || h.includes('documento') || h.includes('numero') || h.includes('número'));
  }
  // Se ainda não achou, checa se tem codtransacao
  if (idIndex === -1) {
    idIndex = rawHeaders.findIndex((h) => h.includes('codtransacao'));
  }

  // Fallbacks de índices se não tiver cabeçalho padrão
  if (dateIndex === -1) dateIndex = 0;
  if (descIndex === -1) descIndex = 1;
  if (amountIndex === -1) amountIndex = 5 < rawHeaders.length ? 5 : 2;

  const startRow = dateIndex !== -1 && (lines[0].toLowerCase().includes('data') || lines[0].toLowerCase().includes('date')) ? 1 : 0;

  for (let i = startRow; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const cols = parseCsvLine(rawLine, delimiter);
    if (cols.length < 2) continue;

    const rawDate = cols[dateIndex]?.trim();
    const rawAmount = cols[amountIndex]?.trim();
    const rawDesc = cols[descIndex]?.trim() || `Transação ${i + 1}`;
    const rawType = typeIndex !== -1 ? cols[typeIndex]?.trim().toUpperCase() : '';
    let rawId = idIndex !== -1 ? cols[idIndex]?.trim() : '';

    // Se o rawId for muito curto/genérico (ex: código numérico 138, 664) e houver outra coluna na linha que seja um UUID ou Identificador real, usa o identificador real
    if (rawId && rawId.length < 10) {
      for (const col of cols) {
        const c = col.trim();
        if (c.length > 10 && (c.includes('-') || c.startsWith('E') || c.startsWith('TRA-') || c.startsWith('PIX') || c.startsWith('D'))) {
          rawId = c;
          break;
        }
      }
    }

    if (!rawDate || !rawAmount) continue;

    const date = parseDate(rawDate);
    let amount = parseAmount(rawAmount);

    if (rawType.includes('DEBIT') || rawType.includes('DÉBIT')) {
      amount = -Math.abs(amount);
    } else if (rawType.includes('CREDIT') || rawType.includes('CRÉDIT')) {
      amount = Math.abs(amount);
    }

    if (date && !isNaN(amount)) {
      // Gera ID único definitivo combinando o Identificador do banco ou hash único da transação
      let externalId = rawId;
      if (!externalId || externalId.length < 5) {
        externalId = createHash('sha256')
          .update(`${date.toISOString()}_${amount}_${rawDesc}_${i}`)
          .digest('hex')
          .substring(0, 32);
      }

      items.push({
        externalId,
        date,
        amount,
        description: rawDesc,
        rawType: amount >= 0 ? 'CREDIT' : 'DEBIT',
      });
    }
  }

  return items;
}

function parseCsvLine(text: string, delimiter: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(cur.trim().replace(/^"|"$/g, ''));
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim().replace(/^"|"$/g, ''));
  return result;
}

function parseDate(dateStr: string): Date | null {
  const clean = dateStr.replace(/["']/g, '').trim();

  // DD/MM/YYYY ou DD-MM-YYYY
  const brMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1;
    let year = parseInt(brMatch[3], 10);
    if (year < 100) year += 2000;
    return new Date(Date.UTC(year, month, day));
  }

  // YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    return new Date(Date.UTC(year, month, day));
  }

  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

function parseAmount(amtStr: string): number {
  let isNegative = amtStr.includes('-');
  let clean = amtStr.replace(/["'R$\s+\-]/g, '').trim();

  // Caso formato brasileiro: 1.234,56
  if (clean.includes(',') && (!clean.includes('.') || clean.indexOf('.') < clean.indexOf(','))) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes(',') && clean.includes('.')) {
    // Caso formato internacional 1,234.56
    clean = clean.replace(/,/g, '');
  }

  const val = parseFloat(clean);
  return isNegative ? -Math.abs(val) : val;
}
