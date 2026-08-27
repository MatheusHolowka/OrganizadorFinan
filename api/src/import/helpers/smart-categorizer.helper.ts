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
  let cleanDesc = (rawDescription || '').trim();

  // 1. Limpeza de prefixos bancários comuns, DOC, TED, PIX com CNPJ/CPF e cartões
  cleanDesc = cleanDesc
    .replace(/^PIX\s+ENVIADO\s*-\s*PAGAMENTO\s+PIX\|\d{11,14}\s*/i, '')
    .replace(/^PIX\s+RECEBIDO\s*-\s*RECEBIMENTO\s+PIX\|\d{11,14}\s*/i, '')
    .replace(/^PAGAMENTO\s+PIX\|\d{11,14}\s*/i, '')
    .replace(/^RECEBIMENTO\s+PIX\|\d{11,14}\s*/i, '')
    .replace(/^CARTAO\s+DEBITO\|\s*/i, '')
    .replace(/^CARTÃO\s+DÉBITO\|\s*/i, '')
    .replace(/^CARTAO\s+CREDITO\|\s*/i, '')
    .replace(/^CARTÃO\s+CRÉDITO\|\s*/i, '')
    .replace(/^CARTAO\s+DEBITO\s*-\s*/i, '')
    .replace(/^CARTÃO\s+DÉBITO\s*-\s*/i, '')
    .replace(/^CARTAO\s+CREDITO\s*-\s*/i, '')
    .replace(/^CARTÃO\s+CRÉDITO\s*-\s*/i, '')
    .replace(/^PAGAMENTO\s+PIX\s*-\s*/i, '')
    .replace(/^RECEBIMENTO\s+PIX\s*-\s*/i, '')
    .replace(/^DEVOLUCAO\s+PIX\s*-\s*/i, '')
    .replace(/^DEVOLUÇÃO\s+PIX\s*-\s*/i, '')
    .replace(/^TRANSFERÊNCIA\s+CONTA\s+SALÁRIO\s*-\s*/i, '')
    .replace(/^TRANSFERENCIA\s+CONTA\s+SALARIO\s*-\s*/i, '')
    .replace(/^TRANSFERÊNCIA\s+-\s*/i, '')
    .replace(/^TRANSFERENCIA\s+-\s*/i, '')
    .replace(/^TED\s*-\s*/i, '')
    .replace(/^DOC\s*-\s*/i, '')
    .replace(/^PIX\s*-\s*/i, '')
    .replace(/^PARC=\d{2,3}/i, '')
    .replace(/^PAGAMENTO\s+DE\s+FATURA\s+CARTAO\s+CREDITO\s+VIA\s+DEBITO\s*-\s*/i, '')
    .trim();

  // 2. Remove gateways prefixados comuns: "bpg*", "mp*", "pg*", "dl*", "dm*", "ebn*", "pag*"
  cleanDesc = cleanDesc.replace(/^(bpg|mp|pg|dl|dm|ebn|pag|spg)\s*\*\s*/i, '').trim();

  // 3. Remove sufixos jurídicos e corporativos
  cleanDesc = cleanDesc
    .replace(/\s*-\s*BR$/i, '')
    .replace(/\s+LTDA\s+ME$/i, '')
    .replace(/\s+LTDA$/i, '')
    .replace(/\s+S\.?A\.?$/i, '')
    .replace(/\s+EIRELI$/i, '')
    .replace(/\s+AGENCIA\s+DE\s+RESTAURANTES\s+ONLINE$/i, '')
    .replace(/\s+INTERMEDIACAO\s+DE\s+NEGOCIOS$/i, '')
    .replace(/\s+INTERMEDIACAO\s+DE\s+N\.*$/i, '')
    .trim();

  // 4. Remove CNPJ / CPF solto no início
  cleanDesc = cleanDesc.replace(/^\d{11,14}\s+/, '').trim();

  const originalUpper = (rawDescription + ' ' + cleanDesc).toUpperCase();
  const isIncome = rawType === 'CREDIT' || rawType === 'INCOME';

  let suggestedCategory = isIncome ? 'Freelance & Outras Rendas' : 'Outras Despesas';
  let confidence = 0.5;
  let isSelf = false;

  // Checa se é transferência para si mesmo (mesma titularidade)
  if (userName) {
    const userClean = userName.toUpperCase().trim();
    const userParts = userClean.split(' ').filter((p) => p.length > 2);
    if (
      originalUpper.includes(userClean) ||
      (userParts.length >= 2 && userParts.every((part) => originalUpper.includes(part)))
    ) {
      isSelf = true;
    }
  }

  // =========================================================================
  // REGRAS DE AUTO-CATEGORIZAÇÃO INTELIGENTE (ESTRITAMENTE SEPARADAS POR TIPO)
  // =========================================================================

  if (isIncome) {
    // ----------------- REGRAS PARA ENTRADAS (INCOME) -----------------
    if (
      originalUpper.includes('SALARIO') ||
      originalUpper.includes('SALÁRIO') ||
      originalUpper.includes('CONTA SALARIO') ||
      originalUpper.includes('CONTA SALÁRIO') ||
      originalUpper.includes('FOLHA') ||
      originalUpper.includes('VENCIMENTOS') ||
      originalUpper.includes('PRO-LABORE') ||
      originalUpper.includes('REMUNERACAO') ||
      originalUpper.includes('REMUNERAÇÃO')
    ) {
      suggestedCategory = 'Salário & Renda Fixa';
      cleanDesc = 'Salário Mensal';
      confidence = 1.0;
    } else if (
      originalUpper.includes('RENDIMENTO') ||
      originalUpper.includes('DIVIDENDO') ||
      originalUpper.includes('CAIXA ECONOMICA') ||
      originalUpper.includes('RESGATE') ||
      originalUpper.includes('APLICACAO') ||
      originalUpper.includes('APLICAÇÃO') ||
      originalUpper.includes('TESOURO') ||
      originalUpper.includes('CDB')
    ) {
      suggestedCategory = 'Investimentos & Rendimentos';
      confidence = 0.95;
    } else {
      suggestedCategory = 'Freelance & Outras Rendas';
      if (originalUpper.includes('PIX')) {
        cleanDesc = isSelf
          ? `Pix Recebido (Próprio)`
          : `Pix Recebido - ${toTitleCase(cleanDesc)}`;
      } else {
        cleanDesc = toTitleCase(cleanDesc);
      }
      confidence = 0.8;
    }
  } else {
    // ----------------- REGRAS PARA SAÍDAS / DESPESAS (EXPENSE) -----------------

    // 1. SERVIÇOS DIGITAIS, DOMÍNIOS, HOSPEDAGEM, SAAS & SOFTWARE (NIC.BR, SAFE2PAY, ETC.)
    if (
      originalUpper.includes('NIC.BR') ||
      originalUpper.includes('NIC. BR') ||
      originalUpper.includes('NIC BR') ||
      originalUpper.includes('REGISTRO.BR') ||
      originalUpper.includes('SAFE2PAY') ||
      originalUpper.includes('MERCADOPAGO') ||
      originalUpper.includes('PAGSEGURO') ||
      originalUpper.includes('IUGU') ||
      originalUpper.includes('ASAAS') ||
      originalUpper.includes('STRIPE') ||
      originalUpper.includes('AWS') ||
      originalUpper.includes('CLOUDFLARE') ||
      originalUpper.includes('HOSTGATOR') ||
      originalUpper.includes('HOSTINGER') ||
      originalUpper.includes('LOCAWEB') ||
      originalUpper.includes('OPENAI') ||
      originalUpper.includes('CHATGPT') ||
      originalUpper.includes('GITHUB') ||
      originalUpper.includes('MICROSOFT') ||
      originalUpper.includes('GOOGLE YOUTUBE') ||
      originalUpper.includes('YOUTUBEPREMIUM') ||
      originalUpper.includes('APPLE.COM') ||
      originalUpper.includes('SPOTIFY') ||
      originalUpper.includes('NETFLIX') ||
      originalUpper.includes('PRIME VIDEO') ||
      originalUpper.includes('DISNEY') ||
      originalUpper.includes('MAX') ||
      originalUpper.includes('HBO') ||
      originalUpper.includes('REAL DEBRID')
    ) {
      suggestedCategory = 'Serviços & Assinaturas';
      confidence = 0.98;

      if (originalUpper.includes('NIC.BR') || originalUpper.includes('NIC. BR') || originalUpper.includes('NIC BR') || originalUpper.includes('REGISTRO.BR')) {
        cleanDesc = 'Nic.br (Registro de Domínio)';
      } else if (originalUpper.includes('SAFE2PAY')) {
        cleanDesc = 'Safe2pay Pagamentos';
      } else if (originalUpper.includes('OPENAI') || originalUpper.includes('CHATGPT')) {
        cleanDesc = 'OpenAI (ChatGPT Plus)';
      } else if (originalUpper.includes('SPOTIFY')) {
        cleanDesc = 'Spotify Premium';
      } else if (originalUpper.includes('YOUTUBE')) {
        cleanDesc = 'YouTube Premium';
      } else if (originalUpper.includes('APPLE.COM')) {
        cleanDesc = 'Apple Services';
      } else if (originalUpper.includes('REAL DEBRID')) {
        cleanDesc = 'Real Debrid';
      }
    }
    // 2. TRANSPORTE, ESTÉTICA AUTOMOTIVA, COMBUSTÍVEL & ESTACIONAMENTO (LAVEGO, INDIGO, POSTOS)
    else if (
      originalUpper.includes('LAVEGO') ||
      originalUpper.includes('LAVA JATO') ||
      originalUpper.includes('LAVACAO') ||
      originalUpper.includes('LAVAÇÃO') ||
      originalUpper.includes('ESTETICA AUTOMOTIVA') ||
      originalUpper.includes('ESTÉTICA AUTOMOTIVA') ||
      originalUpper.includes('INDIGO') ||
      originalUpper.includes('ESTACIONAMENTO') ||
      originalUpper.includes('POSTO') ||
      originalUpper.includes('VACA') ||
      originalUpper.includes('SHELL') ||
      originalUpper.includes('IPIRANGA') ||
      originalUpper.includes('PETROBRAS') ||
      originalUpper.includes('UBER') ||
      originalUpper.includes('99APP') ||
      originalUpper.includes('99 TECNOLOGIA') ||
      originalUpper.includes('PEDAGIO') ||
      originalUpper.includes('SEM PARAR') ||
      originalUpper.includes('VELOE') ||
      originalUpper.includes('AUTO PECAS') ||
      originalUpper.includes('MECANICA') ||
      originalUpper.includes('PNEUS')
    ) {
      suggestedCategory = 'Transporte & Combustível';
      confidence = 0.98;

      if (originalUpper.includes('LAVEGO')) {
        cleanDesc = 'Lavego Estética Automotiva';
      } else if (originalUpper.includes('INDIGO')) {
        cleanDesc = 'Estacionamento Indigo';
      } else if (originalUpper.includes('POSTO VACA')) {
        cleanDesc = 'Posto Vaca';
      } else if (originalUpper.includes('UBER')) {
        cleanDesc = 'Uber Viagens';
      }
    }
    // 3. ALIMENTAÇÃO, SUPERMERCADOS, RESTAURANTES, BEBIDAS & FAST FOOD
    else if (
      originalUpper.includes('IFOOD') ||
      originalUpper.includes("BOB'S") ||
      originalUpper.includes('BOBS') ||
      originalUpper.includes('ESPENS') ||
      originalUpper.includes('CONTAINER BEBIDAS') ||
      originalUpper.includes('ESPETO') ||
      originalUpper.includes('BIG WILLY') ||
      originalUpper.includes('CALDEIRA') ||
      originalUpper.includes('BABI SUPERMERCADOS') ||
      originalUpper.includes('BABI') ||
      originalUpper.includes('THE BEST ACAI') ||
      originalUpper.includes('ACAFRAO') ||
      originalUpper.includes('AÇAFRÃO') ||
      originalUpper.includes('ACAÍ') ||
      originalUpper.includes('ACAI') ||
      originalUpper.includes('DTALIA') ||
      originalUpper.includes("D'TALIA") ||
      originalUpper.includes('PIZZARIA') ||
      originalUpper.includes('BURGER') ||
      originalUpper.includes('HAMBURGUERIA') ||
      originalUpper.includes('SUPERMERCADO') ||
      originalUpper.includes('MACHADO') ||
      originalUpper.includes('CARREFOUR') ||
      originalUpper.includes('ASSAI') ||
      originalUpper.includes('ATACADAO') ||
      originalUpper.includes('SORVETE') ||
      originalUpper.includes('QUIOSQUE') ||
      originalUpper.includes('RESTAURANTE') ||
      originalUpper.includes('LANCHONETE') ||
      originalUpper.includes('EMPORIO') ||
      originalUpper.includes('EMPÓRIO') ||
      originalUpper.includes('PADARIA') ||
      originalUpper.includes('BEBIDAS') ||
      originalUpper.includes('MCDONALD') ||
      originalUpper.includes('SUBWAY') ||
      originalUpper.includes('CACAU SHOW') ||
      originalUpper.includes('CANTINA')
    ) {
      suggestedCategory = 'Alimentação & Restaurantes';
      confidence = 0.98;

      if (originalUpper.includes('IFOOD')) {
        cleanDesc = originalUpper.includes('DEVOLUCAO') || originalUpper.includes('DEVOLUÇÃO')
          ? 'iFood (Estorno)'
          : 'iFood Delivery';
      } else if (originalUpper.includes("BOB'S") || originalUpper.includes('BOBS')) {
        cleanDesc = "Bob's Fast Food";
      } else if (originalUpper.includes('CONTAINER BEBIDAS')) {
        cleanDesc = 'Container Bebidas';
      } else if (originalUpper.includes('ESPENS')) {
        cleanDesc = 'Espens e Cia';
      } else if (originalUpper.includes('BIG WILLY')) {
        cleanDesc = 'Hamburgueria Big Willy';
      } else if (originalUpper.includes('CALDEIRA')) {
        cleanDesc = 'Caldeira Burgers';
      } else if (originalUpper.includes('DTALIA') || originalUpper.includes("D'TALIA")) {
        cleanDesc = "D'Talia Pizzaria";
      } else if (originalUpper.includes('THE BEST ACAI')) {
        cleanDesc = 'The Best Açaí';
      } else if (originalUpper.includes('ACAFRAO') || originalUpper.includes('AÇAFRÃO')) {
        cleanDesc = 'Restaurante Açafrão';
      } else if (originalUpper.includes('BABI')) {
        cleanDesc = 'Babi Supermercados';
      } else if (originalUpper.includes('MACHADO')) {
        cleanDesc = 'Supermercados Machado';
      }
    }
    // 4. SAÚDE, FARMÁCIAS & CUIDADOS
    else if (
      originalUpper.includes('DROGASIL') ||
      originalUpper.includes('FARMACIA') ||
      originalUpper.includes('FARMÁCIA') ||
      originalUpper.includes('FARMELHOR') ||
      originalUpper.includes('DROGA RAIA') ||
      originalUpper.includes('PAGUE MENOS') ||
      originalUpper.includes('SAO JOAO') ||
      originalUpper.includes('HOSPITAL') ||
      originalUpper.includes('CLINICA') ||
      originalUpper.includes('CONSULTORIO') ||
      originalUpper.includes('LABORATORIO') ||
      originalUpper.includes('ODONTO') ||
      originalUpper.includes('DENTISTA')
    ) {
      suggestedCategory = 'Saúde & Cuidados';
      confidence = 0.98;

      if (originalUpper.includes('DROGASIL')) cleanDesc = 'Farmácia Drogasil';
      else if (originalUpper.includes('FARMELHOR')) cleanDesc = 'Farmácia Farmelhor';
    }
    // 5. COMPRAS & VESTUÁRIO (VAREJO ESPECÍFICO)
    else if (
      originalUpper.includes('MAGALU') ||
      originalUpper.includes('MAGAZINE LUIZA') ||
      originalUpper.includes('RENNER') ||
      originalUpper.includes('RIACHUELO') ||
      originalUpper.includes('C&A') ||
      originalUpper.includes('ZARA') ||
      originalUpper.includes('MERCADO LIVRE') ||
      originalUpper.includes('SHOPEE') ||
      originalUpper.includes('AMAZON') ||
      originalUpper.includes('SHEIN') ||
      originalUpper.includes('ALIEXPRESS') ||
      originalUpper.includes('MARINA CALCADOS') ||
      originalUpper.includes('CALÇADOS') ||
      originalUpper.includes('CALCADOS') ||
      originalUpper.includes('CENTAURO') ||
      originalUpper.includes('NETSHOES') ||
      originalUpper.includes('SILVESTRE GONCALVES')
    ) {
      suggestedCategory = 'Compras & Vestuário';
      confidence = 0.95;

      if (originalUpper.includes('MAGALU') || originalUpper.includes('MAGAZINE LUIZA')) {
        cleanDesc = 'Magazine Luiza';
      } else if (originalUpper.includes('RENNER')) {
        cleanDesc = 'Lojas Renner';
      } else if (originalUpper.includes('MARINA CALCADOS')) {
        cleanDesc = 'Marina Calçados';
      } else if (originalUpper.includes('SILVESTRE GONCALVES')) {
        cleanDesc = 'Silvestre Gonçalves';
      }
    }
    // 6. LAZER, BARES, JOGOS & ENTRETENIMENTO
    else if (
      originalUpper.includes('STEAM') ||
      originalUpper.includes('WHISKERIA') ||
      originalUpper.includes('BUTECO') ||
      originalUpper.includes('BAR') ||
      originalUpper.includes('PUB') ||
      originalUpper.includes('CLUBE') ||
      originalUpper.includes('CINEMA') ||
      originalUpper.includes('PLAYSTATION') ||
      originalUpper.includes('XBOX') ||
      originalUpper.includes('NINTENDO') ||
      originalUpper.includes('GGMAX') ||
      originalUpper.includes('RESENHA CHOPP') ||
      originalUpper.includes('DEBILOIDE')
    ) {
      suggestedCategory = 'Lazer & Entretenimento';
      confidence = 0.95;

      if (originalUpper.includes('STEAM')) cleanDesc = 'Steam Jogos';
      else if (originalUpper.includes('RESENHA CHOPP')) cleanDesc = 'Resenha Chopp Bar';
      else if (originalUpper.includes('GB WHISKERIA')) cleanDesc = 'GB Whiskeria';
      else if (originalUpper.includes('DEBILOIDE')) cleanDesc = 'Debiloide Ltda';
    }
    // 7. MORADIA, CONTAS DE CONSUMO, ENERGIA, ÁGUA & IPTU
    else if (
      originalUpper.includes('ENERGISA') ||
      originalUpper.includes('COPEL') ||
      originalUpper.includes('CPFL') ||
      originalUpper.includes('ENEL') ||
      originalUpper.includes('SANEPAR') ||
      originalUpper.includes('SABESP') ||
      originalUpper.includes('AGUAS') ||
      originalUpper.includes('ÁGUA') ||
      originalUpper.includes('LUZ') ||
      originalUpper.includes('ENERGIA') ||
      originalUpper.includes('CONDOMINIO') ||
      originalUpper.includes('CONDOMÍNIO') ||
      originalUpper.includes('ALUGUEL') ||
      originalUpper.includes('IMOBILIARIA') ||
      originalUpper.includes('IPTU')
    ) {
      suggestedCategory = 'Moradia & Contas';
      confidence = 0.98;
    }
    // 8. TARIFAS BANCÁRIAS E ENCARGOS
    else if (
      originalUpper.includes('CESTA DE RELACIONAMENTO') ||
      originalUpper.includes('TARIFA') ||
      originalUpper.includes('TAXA') ||
      originalUpper.includes('ANUIDADE') ||
      originalUpper.includes('IOF')
    ) {
      suggestedCategory = 'Tarifas & Encargos';
      cleanDesc = 'Tarifa Bancária - Cesta de Relacionamento';
      confidence = 0.98;
    }
    // 9. PIX PRÓPRIO (SAÍDA / TRANSFERÊNCIA ENTRE CONTAS)
    else if (isSelf) {
      cleanDesc = `Pix Enviado (Próprio)`;
      suggestedCategory = 'Outras Despesas';
      confidence = 0.9;
    }
    // 10. PIX SAÍDA PARA TERCEIRO OU PAGAMENTO GENÉRICO
    else if (originalUpper.includes('PIX')) {
      cleanDesc = `Pix Enviado - ${toTitleCase(cleanDesc)}`;
      suggestedCategory = 'Outras Despesas';
      confidence = 0.8;
    } else {
      cleanDesc = toTitleCase(cleanDesc);
      suggestedCategory = 'Outras Despesas';
      confidence = 0.5;
    }
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
