import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 1. Definir o período (Últimos 12 meses)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11); // Pega 12 meses contando com o atual
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Array com os nomes dos últimos 12 meses (para ter os meses vazios também)
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    // 2. Buscar todos os pedidos finalizados no período
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['COMPLETED', 'DELIVERING', 'CONFIRMED'] }
      },
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, name: true, category: { select: { name: true } } } }
          }
        }
      }
    });

    // 3. Agrupar Vendas por Produto e por Mês
    const productMap = new Map();

    orders.forEach(order => {
      const monthKey = `${monthNames[order.createdAt.getMonth()]}/${order.createdAt.getFullYear()}`;
      
      order.orderItems.forEach(item => {
        if (!item.product) return;
        const pId = item.product.id;

        if (!productMap.has(pId)) {
          productMap.set(pId, {
            id: pId,
            name: item.product.name,
            category: item.product.category?.name || 'Sem Categoria',
            totalSold: 0,
            monthlyData: {} // Ex: { "Jan/2026": 15, "Fev/2026": 2 }
          });
        }

        const pData = productMap.get(pId);
        pData.totalSold += item.quantity;
        pData.monthlyData[monthKey] = (pData.monthlyData[monthKey] || 0) + item.quantity;
      });
    });

    // 4. Calcular o Pico de Sazonalidade
    const reportData = Array.from(productMap.values()).map(p => {
      let peakMonth = '-';
      let peakQuantity = 0;
      let activeMonths = 0;

      // Descobre qual foi o mês com maior venda
      for (const [month, qty] of Object.entries(p.monthlyData)) {
        if (Number(qty) > 0) activeMonths++;
        if (Number(qty) > peakQuantity) {
          peakQuantity = Number(qty);
          peakMonth = month;
        }
      }

      const averageMonthly = activeMonths > 0 ? (p.totalSold / 12) : 0;
      
      // Fator de Sazonalidade: Quão maior foi o pico em relação à média? 
      // (Ex: Se a média é 10 e no pico vendeu 50, o fator é muito alto)
      const seasonalityFactor = averageMonthly > 0 ? (peakQuantity / averageMonthly) : 1;

      return {
        ...p,
        averageMonthly,
        peakMonth,
        peakQuantity,
        seasonalityFactor
      };
    });

    // 5. Ordenar pelos produtos mais sazonais (os que têm o maior pico em relação à média) e com volume relevante
    const sortedData = reportData
      .filter(p => p.totalSold > 5) // Remove produtos que venderam quase nada no ano
      .sort((a, b) => b.seasonalityFactor - a.seasonalityFactor);

    return NextResponse.json(sortedData);

  } catch (error) {
    console.error('Erro na sazonalidade:', error);
    return NextResponse.json({ error: 'Falha ao processar sazonalidade' }, { status: 500 });
  }
}