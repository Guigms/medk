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

    // 2. Contagens de Produtos
    const [totalProducts, availableProducts, prescriptionProducts, totalClicks] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { available: true } }),
      prisma.product.count({ where: { requiresPrescription: true } }),
      prisma.productClick.count({ where: { clickedAt: { gte: startDate, lte: endDate } } })
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

    // 4. Gestão de Estoque e Alertas
    const criticalCount = await prisma.stockAlert.count({ where: { isRead: false } });
    
    const lowStockItems = await prisma.product.findMany({
      where: { stock: { lte: prisma.product.fields.minStock } }, 
      select: { id: true, name: true, stock: true, minStock: true, category: { select: { name: true } } },
      orderBy: { stock: 'asc' },
      take: 5
    });

    // 5. Produtos Mais Clicados e Receita
    const topClicksRaw = await prisma.productClick.groupBy({
      by: ['productId'],
      where: { clickedAt: { gte: startDate, lte: endDate } },
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

    const orderItemsForRevenue = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate, lte: endDate },
          status: { in: ['COMPLETED', 'DELIVERING', 'CONFIRMED'] },
        }
      },
      include: { product: true }
    });

    const revenueMap = new Map();
    orderItemsForRevenue.forEach(item => {
      const prodId = item.productId;
      const itemRevenue = Number(item.price) * item.quantity;
      if (!revenueMap.has(prodId)) {
        revenueMap.set(prodId, { id: prodId, name: item.product?.name || 'Produto Removido', revenue: 0 });
      }
      revenueMap.get(prodId).revenue += itemRevenue;
    });

    const topProductsByRevenue = Array.from(revenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 6. Pedidos Recentes com Paginação
    const [recentOrders, totalRecentOrders] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        orderBy: { orderNumber: 'desc' }, // 🌟 CORRIGIDO PARA ORDENAR PELO NÚMERO DO PEDIDO
        take: limit,
        skip: skip,
        select: { id: true, orderNumber: true, customerName: true, totalAmount: true, status: true, createdAt: true }
      }),
      prisma.order.count({
        where: { createdAt: { gte: startDate, lte: endDate } }
      })
    ]);

    // 7. 🌟 DISTRIBUIÇÕES: Categoria, Canal e PAGAMENTO
    const ordersWithDetails = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['COMPLETED', 'DELIVERING', 'CONFIRMED'] },
      },
      include: {
        orderItems: {
          include: { product: { include: { category: true } } }
        }
      }
    });

    const categoryMap = new Map();
    const sourceMap = new Map();
    const paymentMap = new Map();

    // Tradutor de métodos de pagamento (caso use ENUMS em inglês no banco)
    const paymentNames: any = {
      PIX: 'PIX',
      CREDIT_CARD: 'Cartão de Crédito',
      DEBIT_CARD: 'Cartão de Débito',
      CASH: 'Dinheiro',
      MONEY: 'Dinheiro'
    };

    ordersWithDetails.forEach(order => {
      const orderRevenue = Number(order.totalAmount);
      
      // 1. Agrupar por Canal
      const sourceKey = order.source === 'ONLINE' ? 'Site (WhatsApp)' : 'Balcão (Loja)';
      sourceMap.set(sourceKey, (sourceMap.get(sourceKey) || 0) + orderRevenue);

      // 2. Agrupar por Pagamento (Lendo a coluna paymentMethod)
      const rawMethod = (order as any).paymentMethod || 'Outros'; 
      const paymentKey = paymentNames[rawMethod] || rawMethod;
      paymentMap.set(paymentKey, (paymentMap.get(paymentKey) || 0) + orderRevenue);

      // 3. Agrupar por Categoria
      order.orderItems.forEach(item => {
        const catName = item.product?.category?.name || 'Sem Categoria';
        const itemTotal = Number(item.price) * item.quantity;
        categoryMap.set(catName, (categoryMap.get(catName) || 0) + itemTotal);
      });
    });

    const salesByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
    const salesBySource = Array.from(sourceMap.entries()).map(([name, value]) => ({ name, value }));
    
    // Array com os pagamentos ordenados do maior pro menor
    const salesByPayment = Array.from(paymentMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json({
      period: parseInt(periodParam || '30'),
      totalProducts,
      availableProducts,
      prescriptionProducts,
      totalClicks,
      summary: { totalOrders, totalRevenue, averageTicket },
      salesChart,
      inventory: {
        criticalCount, 
        items: lowStockItems.map(p => ({ ...p, categoryName: p.category?.name || 'Sem Categoria' }))
      },
      topProducts: topProductsByRevenue,       
      topProductsByClicks: topProductsByClicks, 
      salesByCategory,
      salesBySource,
      salesByPayment,
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