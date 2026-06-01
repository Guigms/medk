import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Mantém como string pura para evitar que o Excel corte os zeros à esquerda dos EANs
    const rows = XLSX.utils.sheet_to_json<any>(worksheet, { raw: false });

    if (rows.length === 0) {
      return NextResponse.json({ error: 'A planilha está vazia.' }, { status: 400 });
    }

    let importedCount = 0;
    let errors: string[] = [];

    for (const [index, row] of rows.entries()) {
      const lineNum = index + 2; 

      // Mapeamento exato com o seu novo padrão
      const name = row['nome'];
      const categorySlug = row['categoria'];
      const brand = row['marca'];
      const priceRaw = row['preço venda'];
      const stockRaw = row['estoque inicial'];
      const description = row['descriçao'] || row['descrição'] || '';
      const image = row['link para imagem'];
      const barcode = row['ean 13'];
      const purchaseBarcode = row['dun14'];

      // Validação de campos obrigatórios mínimos para não quebrar o banco
      if (!name || !priceRaw || !categorySlug) {
        errors.push(`Linha ${lineNum}: Ignorada. Os campos 'nome', 'preço venda' e 'categoria' são obrigatórios.`);
        continue;
      }

      // Busca a categoria correspondente pelo Slug (ex: 'antimicrobianos', 'higiene')
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug.toString().toLowerCase().trim() }
      });

      if (!category) {
        errors.push(`Linha ${lineNum}: A categoria '${categorySlug}' não foi encontrada no sistema. Cadastre a categoria antes.`);
        continue;
      }

      const price = parseFloat(priceRaw.toString().replace(',', '.'));
      const stock = stockRaw ? parseInt(stockRaw.toString(), 10) : 0;

      // Cria ou Atualiza baseado no EAN 13 (se o produto já existir, ele atualiza as informações)
      await prisma.product.upsert({
        where: {
          barcode: barcode ? barcode.toString().trim() : `TEMP-${Date.now()}-${index}`,
        },
        update: {
          name: name.toString().trim(),
          brand: brand ? brand.toString().trim() : null,
          description: description.toString(),
          price: price,
          stock: { increment: stock }, // Soma o estoque se o produto já existir
          purchaseBarcode: purchaseBarcode ? purchaseBarcode.toString().trim() : null,
          image: image ? image.toString().trim() : 'https://via.placeholder.com/150',
        },
        create: {
          name: name.toString().trim(),
          brand: brand ? brand.toString().trim() : null,
          description: description.toString(),
          price: price,
          stock: stock,
          barcode: barcode ? barcode.toString().trim() : null,
          purchaseBarcode: purchaseBarcode ? purchaseBarcode.toString().trim() : null,
          image: image ? image.toString().trim() : 'https://via.placeholder.com/150',
          categoryId: category.id,
          available: true,
        }
      });

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      importedCount,
      errors
    });

  } catch (error: any) {
    console.error('Erro na importação:', error);
    return NextResponse.json({ error: 'Erro interno ao processar a planilha.' }, { status: 500 });
  }
}