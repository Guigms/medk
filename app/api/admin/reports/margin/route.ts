import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        batches: {
          orderBy: { purchaseDate: 'desc' },
          take: 1,
          select: { cost: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const reportData = products.map(product => {
      const price = Number(product.price);
      // Pega o custo do lote mais recente ou 0 se não houver
      const cost = product.batches.length > 0 ? Number(product.batches[0].cost) : 0;
      
      const marginReal = price - cost;
      const marginPercent = price > 0 ? (marginReal / price) * 100 : 0;

      return {
        id: product.id,
        name: product.name,
        category: product.category.name,
        stock: product.stock,
        cost: cost,
        price: price,
        marginReal: marginReal,
        marginPercent: marginPercent,
      };
    });

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Erro no relatório de margem:', error);
    return NextResponse.json({ error: 'Falha ao gerar relatório' }, { status: 500 });
  }
}