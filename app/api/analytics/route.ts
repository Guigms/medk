// app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const periodParam = searchParams.get('period');
    const startParam = searchParams.get('startDate');
    const endParam = searchParams.get('endDate');
    // NOVO: Pegando a página para os pedidos
    const page = parseInt(searchParams.get('page') || '1'); 
    const limit = 10;
    const skip = (page - 1) * limit;

    let startDate: Date;
    let endDate: Date = new Date();

    if (startParam && endParam) {
      startDate = new Date(startParam);
      endDate = new Date(endParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      const days = parseInt(periodParam || '30');
      const safeDays = isNaN(days) ? 30 : days;

      startDate = new Date();
      startDate.setDate(startDate.getDate() - safeDays);
      startDate.setHours(0, 0, 0, 0);
    }

    if (isNaN(startDate.getTime())) {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    // 1. Resumo Geral
    const summaryData = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['COMPLETED', 'DELIVERING', 'CONFIRMED'] },
      },
      _sum: { totalAmount: true },
      _count: { id: true }
    });

    const totalOrders = summaryData._count.id;
    const totalRevenue = Number(summaryData._sum.totalAmount || 0);
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. NOVO: Evolução Diária (Para o Gráfico de Linha)
    // O Prisma não tem um "GROUP BY DATE()" nativo perfeito para MySQL, 
    // então buscamos os pedidos e agrupamos no JavaScript.
    const ordersForChart = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['COMPLETED', 'DELIVERING', 'CONFIRMED'] },
      },
      select: { createdAt: true, totalAmount: true }
    });

    const dailySalesMap = new Map();
    ordersForChart.forEach(order => {
      // Formata a data para "DD/MM"
      const dateStr = order.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const amount = Number(order.totalAmount);
      dailySalesMap.set(dateStr, (dailySalesMap.get(dateStr) || 0) + amount);
    });

    // Converte o Map para um array ordenado
    const salesChart = Array.from(dailySalesMap.entries()).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => {
       const [dayA, monthA] = a.date.split('/');
       const [dayB, monthB] = b.date.split('/');
       return new Date(`2026-${monthA}-${dayA}`).getTime() - new Date(`2026-${monthB}-${dayB}`).getTime();
    });

    // 3. Estoque Crítico
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 5 } },
      select: { id: true, name: true, stock: true, category: { select: { name: true } } },
      orderBy: { stock: 'asc' },
      take: 10
    });

    // 4. Produtos mais vendidos (Top 5)
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { createdAt: { gte: startDate }, status: 'COMPLETED' } },
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

    // 5. ATUALIZADO: Pedidos com Paginação
    const [recentOrders, totalRecentOrders] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
        select: { id: true, orderNumber: true, customerName: true, totalAmount: true, status: true, createdAt: true }
      }),
      prisma.order.count({
        where: { createdAt: { gte: startDate, lte: endDate } }
      })
    ]);

    const recentOrdersFormatted = recentOrders.map(order => ({
      ...order,
      totalAmount: Number(order.totalAmount)
    }));

    return NextResponse.json({
      period: parseInt(periodParam || '30'),
      summary: { totalOrders, totalRevenue, averageTicket },
      salesChart, // Enviando os dados do gráfico
      inventory: {
        criticalCount: lowStockProducts.length,
        items: lowStockProducts.map(p => ({ ...p, categoryName: p.category?.name || 'Sem Categoria' }))
      },
      topProducts,
      recentOrders: {
        items: recentOrdersFormatted,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalRecentOrders / limit),
          totalItems: totalRecentOrders
        }
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Erro interno ao processar dados de analytics' }, { status: 500 });
  }
}