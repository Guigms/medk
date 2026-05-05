import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { XMLParser } from 'fast-xml-parser';

export async function POST(request: NextRequest) {
  try {
    const { xmlData } = await request.json();

    if (!xmlData) {
      return NextResponse.json({ error: 'No XML data provided' }, { status: 400 });
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const jsonObj = parser.parse(xmlData);

    const nfe = jsonObj.nfeProc?.NFe?.infNFe;
    if (!nfe || !nfe.det) {
      return NextResponse.json({ error: 'Invalid XML format or not an NF-e' }, { status: 400 });
    }

    // 1. Extract main NF-e data
    const accessKey = jsonObj.nfeProc?.protNFe?.infProt?.chNFe || `${nfe.ide?.nNF}-${nfe.emit?.CNPJ}`;
    const invoiceNumber = nfe.ide?.nNF;
    const series = nfe.ide?.serie;
    const issuerName = nfe.emit?.xNome;
    const issueDate = nfe.ide?.dhEmi;
    const totalValue = nfe.total?.ICMSTot?.vNF;

    // 2. Block Duplicate Invoice
    if (accessKey) {
      const existingRecord = await prisma.nfeRecord.findUnique({
        where: { accessKey: String(accessKey) }
      });

      if (existingRecord) {
        return NextResponse.json({ 
          status: 'DUPLICATE',
          message: `A Nota Fiscal Nº ${invoiceNumber} já foi importada no dia ${existingRecord.importedAt.toLocaleDateString('pt-BR')}.`,
          supplier: issuerName || 'Fornecedor'
        });
      }
    }

    const invoiceItems = Array.isArray(nfe.det) ? nfe.det : [nfe.det];

    const results = {
      success: [] as any[],
      notFound: [] as any[],
    };

    const validatedProducts: { productId: string; finalQuantity: number; finalUnitCost: number; }[] = [];

    // 3. Pre-validate all items (All or Nothing)
    for (const item of invoiceItems) {
      const prod = item.prod;
      const itemName = prod.xProd;
      const ean = prod.cEAN !== 'SEM GTIN' ? String(prod.cEAN) : null;
      const quantity = Math.floor(Number(prod.qCom));
      const unitCost = Number(prod.vUnCom); 

      if (!ean) {
        results.notFound.push({ 
          name: itemName, 
          ean: 'SEM CÓDIGO', 
          quantity: quantity, 
          reason: 'Sem código de barras na nota' 
        });
        continue;
      }

      const existingProduct = await prisma.product.findFirst({
        where: { OR: [{ purchaseBarcode: ean }, { barcode: ean }] }
      });

      if (existingProduct) {
        const isClosedBox = existingProduct.purchaseBarcode === ean;
        const conversionFactor = isClosedBox ? (existingProduct.conversionFactor || 1) : 1;
        const finalQuantity = quantity * conversionFactor;
        const finalUnitCost = unitCost / conversionFactor;

        results.success.push({
          name: existingProduct.name,
          ean: ean,
          quantity: quantity,
          finalQuantity: finalQuantity,
          isClosedBox
        });

        validatedProducts.push({
          productId: existingProduct.id,
          finalQuantity,
          finalUnitCost
        });
      } else {
        results.notFound.push({ 
          name: itemName, 
          ean: ean, 
          quantity: quantity 
        });
      }
    }

    if (results.notFound.length > 0) {
      return NextResponse.json({ 
        status: 'BLOCKED',
        message: 'A nota contém produtos não cadastrados.', 
        results 
      });
    }

    // 4. Execute Transaction
    await prisma.$transaction(async (tx) => {
      const nfeRecord = await tx.nfeRecord.create({
        data: {
          accessKey: String(accessKey),
          number: String(invoiceNumber || 'S/N'),
          series: series ? String(series) : null,
          issuerName: issuerName ? String(issuerName) : 'Fornecedor Desconhecido',
          issueDate: issueDate ? new Date(issueDate) : new Date(),
          totalValue: Number(totalValue || 0)
        }
      });

      for (const validated of validatedProducts) {
        await tx.product.update({
          where: { id: validated.productId },
          data: { stock: { increment: validated.finalQuantity } }
        });

        await tx.batch.create({
          data: {
            productId: validated.productId,
            nfeId: nfeRecord.id, 
            batchNumber: nfeRecord.number,
            quantity: validated.finalQuantity,
            cost: validated.finalUnitCost,
            purchaseDate: nfeRecord.issueDate,
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)), 
          }
        });
      }
    });

    return NextResponse.json({ 
      status: 'SUCCESS',
      message: 'Estoque atualizado e NF-e registrada com sucesso!', 
      results 
    });

  } catch (error) {
    console.error("Error processing XML:", error);
    return NextResponse.json({ error: 'Failed to read XML file' }, { status: 500 });
  }
}