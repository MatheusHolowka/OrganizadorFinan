export interface ParsedTransactionItem {
  externalId: string;
  date: Date;
  amount: number;
  description: string;
  memo?: string;
  rawType?: string;
}

export function parseOfx(content: string): ParsedTransactionItem[] {
  const items: ParsedTransactionItem[] = [];

  // Localiza todos os blocos <STMTTRN> ... </STMTTRN> (ou até o próximo <STMTTRN>)
  const stmttrnRegex = /<STMTTRN>([\s\S]*?)(?:<\/STMTTRN>|(?=<STMTTRN>)|(?=<\/BANKTRANLIST>))/gi;
  let match: RegExpExecArray | null;

  while ((match = stmttrnRegex.exec(content)) !== null) {
    const block = match[1];

    const trntypeMatch = block.match(/<TRNTYPE>([^<\r\n]+)/i);
    const dtpostedMatch = block.match(/<DTPOSTED>([^<\r\n]+)/i);
    const trnamtMatch = block.match(/<TRNAMT>([^<\r\n]+)/i);
    const fitidMatch = block.match(/<FITID>([^<\r\n]+)/i);
    const nameMatch = block.match(/<NAME>([^<\r\n]+)/i);
    const memoMatch = block.match(/<MEMO>([^<\r\n]+)/i);

    const rawType = trntypeMatch ? trntypeMatch[1].trim() : 'OTHER';
    const rawDate = dtpostedMatch ? dtpostedMatch[1].trim() : '';
    const rawAmt = trnamtMatch ? trnamtMatch[1].trim().replace(',', '.') : '0';
    const fitid = fitidMatch ? fitidMatch[1].trim() : `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const name = nameMatch ? nameMatch[1].trim() : (memoMatch ? memoMatch[1].trim() : 'Transação Importada');
    const memo = memoMatch ? memoMatch[1].trim() : undefined;

    // Parse data OFX: YYYYMMDD ou YYYYMMDDHHMMSS
    let date = new Date();
    if (rawDate.length >= 8) {
      const year = parseInt(rawDate.substring(0, 4), 10);
      const month = parseInt(rawDate.substring(4, 6), 10) - 1;
      const day = parseInt(rawDate.substring(6, 8), 10);
      date = new Date(Date.UTC(year, month, day));
    }

    const amount = parseFloat(rawAmt);

    if (!isNaN(amount)) {
      items.push({
        externalId: fitid,
        date,
        amount,
        description: name,
        memo,
        rawType,
      });
    }
  }

  return items;
}
