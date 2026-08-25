export interface CleanedTransaction {
  cleanDescription: string;
  suggestedCategoryName: string;
  isSelfTransfer: boolean;
  confidence: number;
}

export function analyzeTransaction(
  rawDescription: string,
  rawType?: string,
  amount: number = 0,
  userName?: string
): CleanedTransaction {
  const originalUpper = rawDescription.toUpperCase().trim();
  let cleanDesc = rawDescription.trim();

  // 1. Limpeza de prefixos bancários comuns
  const prefixes = [
    /^CARTAO\s+DEBITO\s*-\s*/i,
    /^CARTÃO\s+DÉBITO\s*-\s*/i,
    /^CARTAO\s+CREDITO\s*-\s*/i,
    /^CARTÃO\s+CRÉDITO\s*-\s*/i,
    /^PAGAMENTO\s+PIX\s*-\s*/i,
    /^RECEBIMENTO\s+PIX\s*-\s*/i,
    /^DEVOLUCAO\s+PIX\s*-\s*/i,
    /^DEVOLUÇÃO\s+PIX\s*-\s*/i,
    /^TRANSFERÊNCIA\s+CONTA\s+SALÁRIO\s*-\s*/i,
    /^TRANSFERENCIA\s+CONTA\s+SALARIO\s*-\s*/i,
    /^TRANSFERÊNCIA\s+-\s*/i,
    /^TRANSFERENCIA\s+-\s*/i,
    /^TED\s*-\s*/i,
    /^DOC\s*-\s*/i,
    /^PIX\s*-\s*/i,
    /^PAGAMENTO\s+DE\s+FATURA\s+CARTAO\s+CREDITO\s+VIA\s+DEBITO\s*-\s*/i,
  ];

  for (const prefix of prefixes) {
    cleanDesc = cleanDesc.replace(prefix, '').trim();
  }

  // 2. Remove sufixos como " - BR", " LTDA ME", " S.A.", etc.
  cleanDesc = cleanDesc
    .replace(/\s*-\s*BR$/i, '')
    .replace(/\s+LTDA\s+ME$/i, ' Ltda')
    .replace(/\s+LTDA$/i, ' Ltda')
    .replace(/\s+S\.?A\.?$/i, '')
    .replace(/\s+AGENCIA\s+DE\s+RESTAURANTES\s+ONLINE$/i, '')
    .trim();

  // 3. Remove CNPJ / CPF no início da descrição limpa
  cleanDesc = cleanDesc.replace(/^\d{11,14}\s+/, '').trim();

  const isIncome = amount > 0 || rawType === 'CREDIT';
  let suggestedCategory = isIncome ? 'Freelance & Outras Rendas' : 'Outras Despesas';
  let confidence = 0.5;
  let isSelf = false;

  // Checa se é transferência para si mesmo
  if (userName) {
    const userParts = userName
      .toUpperCase()
      .split(' ')
      .filter((p) => p.length > 2);
    if (
      cleanDesc.toUpperCase().includes(userName.toUpperCase()) ||
      (userParts.length > 0 && userParts.every((part) => cleanDesc.toUpperCase().includes(part)))
    ) {
      isSelf = true;
    }
  }

  // ==========================================
  // REGRAS DE AUTO-CATEGORIZAÇÃO (ANALISANDO O TEXTO ORIGINAL COMPLETO)
  // ==========================================

  // 1. SALÁRIO & RENDA FIXA (PRIORIDADE MÁXIMA PARA CRÉDITOS DE SALÁRIO)
  if (
    originalUpper.includes('SALARIO') ||
    originalUpper.includes('SALÁRIO') ||
    originalUpper.includes('CONTA SALARIO') ||
    originalUpper.includes('CONTA SALÁRIO') ||
    originalUpper.includes('TRANSFERÊNCIA CONTA SALÁRIO') ||
    originalUpper.includes('TRANSFERENCIA CONTA SALARIO') ||
    originalUpper.includes('FOLHA') ||
    originalUpper.includes('VENCIMENTOS') ||
    originalUpper.includes('PRO-LABORE') ||
    originalUpper.includes('REMUNERACAO') ||
    originalUpper.includes('REMUNERAÇÃO')
  ) {
    suggestedCategory = 'Salário & Renda Fixa';
    cleanDesc = 'Salário Mensal';
    confidence = 1.0;
  }
  // 2. ALIMENTAÇÃO, SUPERMERCADOS, RESTAURANTES & FAST FOOD
  else if (
    originalUpper.includes('IFOOD') ||
    originalUpper.includes("BOB'S") ||
    originalUpper.includes('BOBS') ||
    originalUpper.includes('ESPETO') ||
    originalUpper.includes('SUPERMERCADO') ||
    originalUpper.includes('MACHADO') ||
    originalUpper.includes('CARREFOUR') ||
    originalUpper.includes('ASSAI') ||
    originalUpper.includes('ATACADAO') ||
    originalUpper.includes('SORVETE') ||
    originalUpper.includes('QUIOSQUE') ||
    originalUpper.includes('RESTAURANTE') ||
    originalUpper.includes('LANCHONETE') ||
    originalUpper.includes('PIZZARIA') ||
    originalUpper.includes('EMPORIO') ||
    originalUpper.includes('EMPÓRIO') ||
    originalUpper.includes('PADARIA') ||
    originalUpper.includes('BEBIDAS') ||
    originalUpper.includes('BURGER') ||
    originalUpper.includes('MCDONALD') ||
    originalUpper.includes('SUBWAY') ||
    originalUpper.includes('CACAU SHOW') ||
    originalUpper.includes('ESPENS')
  ) {
    suggestedCategory = 'Alimentação & Restaurantes';
    confidence = 0.98;

    if (originalUpper.includes('IFOOD')) {
      cleanDesc = originalUpper.includes('DEVOLUCAO') || originalUpper.includes('DEVOLUÇÃO')
        ? 'iFood (Estorno / Devolução)'
        : 'iFood Delivery';
    } else if (originalUpper.includes("BOB'S") || originalUpper.includes('BOBS')) {
      cleanDesc = "Bob's Fast Food";
    } else if (originalUpper.includes('SUPERMERCADOS MACHADO') || originalUpper.includes('MACHADO')) {
      cleanDesc = 'Supermercados Machado';
    } else if (originalUpper.includes('QUIOSQUE DO SORVETE')) {
      cleanDesc = 'Quiosque do Sorvete';
    } else if (originalUpper.includes('CONTAINER BEBIDAS')) {
      cleanDesc = 'Container Bebidas';
    } else if (originalUpper.includes('ESPETO DO BARULHO')) {
      cleanDesc = 'Espeto do Barulho';
    } else if (originalUpper.includes('ESPENS')) {
      cleanDesc = 'Espens e Cia';
    } else if (originalUpper.includes('EMPORIO') || originalUpper.includes('EMPÓRIO')) {
      cleanDesc = 'Empório Praça das Fontes';
    }
  }
  // 3. SAÚDE & FARMÁCIAS
  else if (
    originalUpper.includes('DROGASIL') ||
    originalUpper.includes('FARMACIA') ||
    originalUpper.includes('FARMÁCIA') ||
    originalUpper.includes('FARMELHOR') ||
    originalUpper.includes('DROGA RAIA') ||
    originalUpper.includes('PAGUE MENOS') ||
    originalUpper.includes('SAO JOAO') ||
    originalUpper.includes('CONSULTORIO') ||
    originalUpper.includes('HOSPITAL') ||
    originalUpper.includes('LABORATORIO') ||
    originalUpper.includes('ODONTO')
  ) {
    suggestedCategory = 'Saúde & Cuidados';
    confidence = 0.98;

    if (originalUpper.includes('DROGASIL')) cleanDesc = 'Farmácia Drogasil';
    else if (originalUpper.includes('FARMELHOR')) cleanDesc = 'Farmácia Farmelhor';
  }
  // 4. LAZER, BARES, PUBS, CLUBES & ENTRETENIMENTO
  else if (
    originalUpper.includes('WHISKERIA') ||
    originalUpper.includes('BUTECO') ||
    originalUpper.includes('BAR') ||
    originalUpper.includes('PUB') ||
    originalUpper.includes('TENNIS CLUBE') ||
    originalUpper.includes('CLUBE') ||
    originalUpper.includes('CINEMA') ||
    originalUpper.includes('NETFLIX') ||
    originalUpper.includes('SPOTIFY') ||
    originalUpper.includes('STEAM') ||
    originalUpper.includes('DEBILOIDE')
  ) {
    suggestedCategory = 'Lazer & Entretenimento';
    confidence = 0.95;

    if (originalUpper.includes('BUTECO DO EMBAIXADOR')) cleanDesc = 'Buteco do Embaixador';
    else if (originalUpper.includes('GB WHISKERIA')) cleanDesc = 'GB Whiskeria';
    else if (originalUpper.includes('TENNIS CLUBE')) cleanDesc = 'Tennis Clube';
    else if (originalUpper.includes('DEBILOIDE')) cleanDesc = 'Debiloide Ltda';
  }
  // 5. COMPRAS & VESTUÁRIO
  else if (
    originalUpper.includes('MAGALU') ||
    originalUpper.includes('MAGALUPAY') ||
    originalUpper.includes('RENNER') ||
    originalUpper.includes('RIACHUELO') ||
    originalUpper.includes('C&A') ||
    originalUpper.includes('ZARA') ||
    originalUpper.includes('MERCADO LIVRE') ||
    originalUpper.includes('SHOPEE') ||
    originalUpper.includes('AMAZON') ||
    originalUpper.includes('SHEIN') ||
    originalUpper.includes('ALIEXPRESS') ||
    originalUpper.includes('SILVESTRE GONCALVES')
  ) {
    suggestedCategory = 'Compras & Vestuário';
    confidence = 0.95;

    if (originalUpper.includes('MAGALU')) cleanDesc = 'Magazine Luiza';
    else if (originalUpper.includes('RENNER')) cleanDesc = 'Lojas Renner';
    else if (originalUpper.includes('SILVESTRE GONCALVES')) cleanDesc = 'Silvestre Gonçalves';
  }
  // 6. TRANSPORTE, ESTACIONAMENTO & COMBUSTÍVEL
  else if (
    originalUpper.includes('POSTO') ||
    originalUpper.includes('SHELL') ||
    originalUpper.includes('IPIRANGA') ||
    originalUpper.includes('PETROBRAS') ||
    originalUpper.includes('UBER') ||
    originalUpper.includes('99APP') ||
    originalUpper.includes('INDIGO') ||
    originalUpper.includes('ESTACIONAMENTO') ||
    originalUpper.includes('PEDAGIO') ||
    originalUpper.includes('SEM PARAR')
  ) {
    suggestedCategory = 'Transporte & Combustível';
    confidence = 0.95;

    if (originalUpper.includes('INDIGO')) cleanDesc = 'Estacionamento Indigo';
  }
  // 7. TARIFAS BANCÁRIAS E MORADIA/CONTAS
  else if (
    originalUpper.includes('CESTA DE RELACIONAMENTO') ||
    originalUpper.includes('TARIFA') ||
    originalUpper.includes('TAXA') ||
    originalUpper.includes('ANUIDADE') ||
    originalUpper.includes('IOF')
  ) {
    suggestedCategory = 'Moradia & Contas';
    cleanDesc = 'Tarifa Bancária - Cesta de Relacionamento';
    confidence = 0.95;
  }
  // 8. PAGAMENTO DE FATURA DE CARTÃO
  else if (
    originalUpper.includes('PAGAMENTO DE FATURA') ||
    originalUpper.includes('FATURA CARTAO') ||
    originalUpper.includes('SICREDI CELEIRO')
  ) {
    suggestedCategory = 'Moradia & Contas';
    cleanDesc = 'Pagamento de Fatura Cartão Sicredi';
    confidence = 0.98;
  }
  // 9. TED CAIXA ECONÔMICA / INVESTIMENTOS
  else if (originalUpper.includes('CAIXA ECONOMICA') || originalUpper.includes('BANCO')) {
    if (isIncome) {
      suggestedCategory = 'Investimentos & Rendimentos';
      cleanDesc = 'TED Caixa Econômica Federal';
    } else {
      suggestedCategory = 'Moradia & Contas';
    }
    confidence = 0.9;
  }
  // 10. ROTARY CLUB / ENTIDADES
  else if (originalUpper.includes('ROTARY')) {
    suggestedCategory = isIncome ? 'Freelance & Outras Rendas' : 'Lazer & Entretenimento';
    cleanDesc = 'Rotary Club de Sorriso';
    confidence = 0.95;
  }
  // 11. TRANSFERÊNCIAS PIX (PRÓPRIO VS TERCEIROS)
  else if (originalUpper.includes('PIX')) {
    if (isSelf) {
      cleanDesc = `Pix Próprio (${toTitleCase(cleanDesc)})`;
      suggestedCategory = isIncome ? 'Freelance & Outras Rendas' : 'Moradia & Contas';
    } else {
      cleanDesc = isIncome ? `Pix Recebido - ${toTitleCase(cleanDesc)}` : `Pix Enviado - ${toTitleCase(cleanDesc)}`;
      suggestedCategory = isIncome ? 'Freelance & Outras Rendas' : 'Compras & Vestuário';
    }
    confidence = 0.85;
  } else {
    // Formatação genérica para Title Case
    cleanDesc = toTitleCase(cleanDesc);
  }

  return {
    cleanDescription: cleanDesc,
    suggestedCategoryName: suggestedCategory,
    isSelfTransfer: isSelf,
    confidence,
  };
}

function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'com', 'br'].includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
