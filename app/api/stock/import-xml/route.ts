import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { XMLParser } from 'fast-xml-parser';

export async function POST(request: NextRequest) {
  try {
    const { xmlData } = await request.json();

    if (!xmlData) {
      return NextResponse.json({ error: 'Nenhum dado XML fornecido' }, { status: 400 });
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xmlData);

    const nfe = jsonObj.nfeProc?.NFe?.infNFe;
    if (!nfe || !nfe.det) {
      return NextResponse.json({ error: 'Formato de XML inválido ou não é uma NF-e' }, { status: 400 });
    }

    const itensNota = Array.isArray(nfe.det) ? nfe.det : [nfe.det];

    const resultados = {
      sucesso: [] as any[],
      naoEncontrado: [] as any[],
    };

    // Array que guardará as intenções de atualização (Só roda se tudo der certo)
    const updatesToApply = [];

    // PASSO 1: VALIDAÇÃO EM MEMÓRIA (Não salva nada no banco ainda)
    for (const item of itensNota) {
      const prod = item.prod;
      const nomeNota = prod.xProd;
      const eanNota = prod.cEAN !== 'SEM GTIN' ? String(prod.cEAN) : null;
      const quantidadeNota = Math.floor(Number(prod.qCom));

      if (!eanNota) {
        resultados.naoEncontrado.push({ nome: nomeNota, ean: 'SEM CÓDIGO', qtdNota: quantidadeNota, motivo: 'Sem código de barras na nota' });
        continue;
      }

      const produtoNoBanco = await prisma.product.findFirst({
        where: {
          OR: [
            { purchaseBarcode: eanNota },
            { barcode: eanNota }
          ]
        }
      });

      if (produtoNoBanco) {
        const isCaixaFechada = produtoNoBanco.purchaseBarcode === eanNota;
        const fator = isCaixaFechada ? (produtoNoBanco.conversionFactor || 1) : 1;
        const entradaReal = quantidadeNota * fator;

        resultados.sucesso.push({
          nome: produtoNoBanco.name,
          ean: eanNota,
          qtdNota: quantidadeNota,
          entradaReal: entradaReal,
          isCaixaFechada
        });

        // Guarda na fila de atualização
        updatesToApply.push({
          id: produtoNoBanco.id,
          increment: entradaReal
        });
      } else {
        resultados.naoEncontrado.push({
          nome: nomeNota,
          ean: eanNota,
          qtdNota: quantidadeNota
        });
      }
    }

    // PASSO 2: A REGRA DE NEGÓCIO DO "TUDO OU NADA"
    if (resultados.naoEncontrado.length > 0) {
      // Se tiver 1 item faltando, bloqueia a nota inteira.
      return NextResponse.json({ 
        status: 'BLOCKED',
        message: 'A nota contém produtos não cadastrados.', 
        resultados 
      });
    }

    // PASSO 3: EXECUÇÃO DA TRANSAÇÃO (Só chega aqui se a nota estiver 100% perfeita)
    // Usa uma transação para garantir que todos os produtos recebam estoque ao mesmo tempo
    await prisma.$transaction(
      updatesToApply.map((update) => 
        prisma.product.update({
          where: { id: update.id },
          data: { stock: { increment: update.increment } }
        })
      )
    );

    return NextResponse.json({ 
      status: 'SUCCESS',
      message: 'Estoque atualizado com sucesso!', 
      resultados 
    });

  } catch (error) {
    console.error("Erro ao processar XML:", error);
    return NextResponse.json({ error: 'Falha ao ler o arquivo XML' }, { status: 500 });
  }
}