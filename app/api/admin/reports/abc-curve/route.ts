import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Usamos 90 dias para ter um volume de dados estatisticamente relevante
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        orderItems: {
          where: {
            order: {
              createdAt: { gte: ninetyDaysAgo },
              status: { in: ['COMPLETED', 'DELIVERING', 'CONFIRMED'] }
            }
          },
          select: { quantity: true, price: true }
        }
      }
    });

    let totalRevenueAll = 0;

    // 1. Calcula o faturamento individual de cada produto
    const productsWithRevenue = products.map(p => {
      const revenue = p.orderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
      const soldQuantity = p.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      
      totalRevenueAll += revenue;

      return {
        id: p.id,
        name: p.name,
        category: p.category?.name || 'Sem Categoria',
        stock: p.stock,
        revenue,
        soldQuantity
      };
    }).filter(p => p.revenue > 0); // Removemos produtos que não venderam nada

    // 2. Ordena do maior faturamento para o menor
    productsWithRevenue.sort((a, b) => b.revenue - a.revenue);

    // 3. Calcula o acumulado e classifica (A = até 80%, B = 80 a 95%, C = 95 a 100%)
    let cumulativeRevenue = 0;
    
    const reportData = productsWithRevenue.map(p => {
      cumulativeRevenue += p.revenue;
      
      const itemPercent = totalRevenueAll > 0 ? (p.revenue / totalRevenueAll) * 100 : 0;
      const cumulativePercent = totalRevenueAll > 0 ? (cumulativeRevenue / totalRevenueAll) * 100 : 0;

      let classification = 'C';
      if (cumulativePercent <= 80) {
        classification = 'A';
      } else if (cumulativePercent <= 95) {
        classification = 'B';
      }

      return {
        ...p,
        itemPercent,
        cumulativePercent,
        classification
      };
    });

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Erro no relatório de curva ABC:', error);
    return NextResponse.json({ error: 'Falha ao gerar relatório' }, { status: 500 });
  }
}