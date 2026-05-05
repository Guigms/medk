import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Analisamos os últimos 30 dias para ter uma média confiável de saída
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        orderItems: {
          where: {
            order: {
              createdAt: { gte: thirtyDaysAgo },
              status: { in: ['COMPLETED', 'DELIVERING', 'CONFIRMED'] }
            }
          },
          select: { quantity: true }
        }
      }
    });

    const reportData = products.map(product => {
      // Calcula o total vendido nos últimos 30 dias
      const soldQuantity = product.orderItems.reduce((acc, item) => acc + item.quantity, 0);
      
      // Velocidade diária de vendas
      const dailyVelocity = soldQuantity / 30;
      
      let turnoverDays = 0;
      let classification = 'Sem saída';

      if (dailyVelocity > 0) {
        // Quantos dias o estoque atual vai durar baseado na velocidade de venda
        turnoverDays = Math.round(product.stock / dailyVelocity);
        
        if (turnoverDays <= 15) {
          classification = 'Alto giro';
        } else if (turnoverDays <= 45) {
          classification = 'Médio giro';
        } else {
          classification = 'Baixo giro';
        }
      }

      return {
        id: product.id,
        name: product.name,
        category: product.category?.name || 'Sem Categoria',
        stock: product.stock,
        soldQuantity: soldQuantity,
        turnoverDays: turnoverDays,
        classification: classification,
        dailyVelocity: dailyVelocity
      };
    });

    // Ordenamos para mostrar os que mais vendem primeiro
    reportData.sort((a, b) => b.soldQuantity - a.soldQuantity);

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Erro no relatório de giro de estoque:', error);
    return NextResponse.json({ error: 'Falha ao gerar relatório' }, { status: 500 });
  }
}