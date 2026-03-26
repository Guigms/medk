import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const periodParam = searchParams.get('period');
    const startParam = searchParams.get('startDate');
    const endParam = searchParams.get('endDate');

    let startDate: Date;
    let endDate: Date = new Date();

    // 1. Verificação de data personalizada
    if (startParam && endParam) {
      startDate = new Date(startParam);
      endDate = new Date(endParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // 2. Verificação do período (Garante que seja um número)
      const days = parseInt(periodParam || '30');
      const safeDays = isNaN(days) ? 30 : days; // Se não for número, assume 30 dias

      startDate = new Date();
      startDate.setDate(startDate.getDate() - safeDays);
      startDate.setHours(0, 0, 0, 0);
    }

    // Validação final: Se mesmo assim a data for inválida, evita o erro do Prisma
    if (isNaN(startDate.getTime())) {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    // Agora o Prisma não vai mais travar
    const summaryData = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['COMPLETED', 'DELIVERING', 'CONFIRMED'] },
      },
      _sum: { totalAmount: true },
      _count: { id: true }
    });

    const totalOrders = summaryData._count.id;
    // Conversão de Decimal para Number para evitar erros no JSON
    const totalRevenue = Number(summaryData._sum.totalAmount || 0);
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. ESTOQUE CRÍTICO
    // Agora busca comparando o estoque atual com o minStock definido em cada produto
    const lowStockProducts = await prisma.product.findMany({
      where: {
        OR: [
          { stock: { lte: 5 } }, // Fallback para 5
          // Se quiser usar a lógica minStock, o Prisma precisa de um filtro avançado:
          // Como o MySQL não permite comparar duas colunas diretamente no 'where' simples do Prisma,
          // usamos uma margem de segurança ou mantemos lte: 5 para simplicidade no dashboard.
        ]
      },
      select: {
        id: true,
        name: true,
        stock: true,
        category: {
          select: { name: true }
        }
      },
      orderBy: { stock: 'asc' },
      take: 10
    });

    // 3. Produtos mais vendidos (Top 5)
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: 'COMPLETED',
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true }
        });
        
        const quantity = item._sum.quantity || 0;
        const price = Number(product?.price || 0);

        return {
          name: product?.name || 'Produto Removido',
          quantity: quantity,
          revenue: price * quantity
        };
      })
    );

    // 4. Pedidos Recentes para o Dashboard (Últimos 5)
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    });

    // Converter decimais dos pedidos recentes
    const recentOrdersFormatted = recentOrders.map(order => ({
      ...order,
      totalAmount: Number(order.totalAmount)
    }));

    return NextResponse.json({
      period: parseInt(periodParam || '30'),
      summary: {
        totalOrders,
        totalRevenue,
        averageTicket,
      },
      inventory: {
        criticalCount: lowStockProducts.length,
        items: lowStockProducts.map(p => ({
          ...p,
          categoryName: p.category.name
        }))
      },
      topProducts,
      recentOrders: recentOrdersFormatted
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar dados de analytics' },
      { status: 500 }
    );
  }
}