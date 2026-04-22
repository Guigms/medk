import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const periodParam = searchParams.get('period');
    const startParam = searchParams.get('startDate');
    const endParam = searchParams.get('endDate');
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

    // 1. Resumo Geral de Vendas (Financeiro)
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

    // 2. Contagens de Produtos (Para os Cards do Dashboard)
    const [totalProducts, availableProducts, prescriptionProducts, totalClicks] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { available: true } }),
      prisma.product.count({ where: { requiresPrescription: true } }),
      prisma.productClick.count() // 🌟 Agora conta cliques reais do banco
    ]);

    // 3. Dados do Gráfico de Vendas
    const ordersForChart = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['COMPLETED', 'DELIVERING', 'CONFIRMED'] },
      },
      select: { createdAt: true, totalAmount: true }
    });

    const dailySalesMap = new Map();
    ordersForChart.forEach(order => {
      const dateStr = order.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const amount = Number(order.totalAmount);
      dailySalesMap.set(dateStr, (dailySalesMap.get(dateStr) || 0) + amount);
    });

    const salesChart = Array.from(dailySalesMap.entries()).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => {
       const [dayA, monthA] = a.date.split('/');
       const [dayB, monthB] = b.date.split('/');
       return new Date(`2026-${monthA}-${dayA}`).getTime() - new Date(`2026-${monthB}-${dayB}`).getTime();
    });

    // 4. Gestão de Estoque e Alertas (Usando a nova tabela StockAlert)
    const criticalCount = await prisma.stockAlert.count({ where: { isRead: false } });
    
    const lowStockItems = await prisma.product.findMany({
      where: { stock: { lte: prisma.product.fields.minStock } }, // Comparação dinâmica
      select: { id: true, name: true, stock: true, minStock: true, category: { select: { name: true } } },
      orderBy: { stock: 'asc' },
      take: 5
    });

    // 5. 🌟 NOVO: Produtos Mais Clicados (Para o Dashboard)
    const topClicksRaw = await prisma.productClick.groupBy({
      by: ['productId'],
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5
    });

    const topProductsByClicks = await Promise.all(
      topClicksRaw.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: { select: { name: true } } }
        });
        return {
          id: product?.id,
          name: product?.name || 'Produto Removido',
          clicks: item._count.productId,
          category: { name: product?.category?.name || 'Sem Categoria' }
        };
      })
    );

    // 6. Pedidos Recentes com Paginação
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

    return NextResponse.json({
      period: parseInt(periodParam || '30'),
      // Resumo para os Cards Principais
      totalProducts,
      availableProducts,
      prescriptionProducts,
      totalClicks,
      summary: { totalOrders, totalRevenue, averageTicket },
      salesChart,
      inventory: {
        criticalCount, // 🌟 Alertas reais não lidos
        items: lowStockItems.map(p => ({ ...p, categoryName: p.category?.name || 'Sem Categoria' }))
      },
      topProducts: topProductsByClicks, // 🌟 Agora enviando cliques para o Dashboard
      recentOrders: {
        items: recentOrders.map(o => ({ ...o, totalAmount: Number(o.totalAmount) })),
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