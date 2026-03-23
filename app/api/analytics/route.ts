import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Estatísticas gerais
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // dias

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total de pedidos
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['COMPLETED', 'DELIVERING'] },
      },
    });

    // Receita total
    const revenue = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['COMPLETED', 'DELIVERING'] },
      },
      _sum: { totalAmount: true },
    });

    // Ticket médio
    const averageTicket = totalOrders > 0 
      ? Number(revenue._sum.totalAmount || 0) / totalOrders
      : 0;

    // Produtos mais vendidos
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { in: ['COMPLETED', 'DELIVERING'] },
        },
      },
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, image: true, price: true },
        });
        return {
          ...product,
          quantitySold: item._sum.quantity,
          orderCount: item._count,
          revenue: (product?.price || 0) * (item._sum.quantity || 0),
        };
      })
    );

    // Vendas por dia (gráfico)
    const salesByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startDate },
        status: { in: ['COMPLETED', 'DELIVERING'] },
      },
      _sum: { totalAmount: true },
      _count: true,
    });

    const salesChart = salesByDay.map((day) => ({
      date: day.createdAt.toISOString().split('T')[0],
      revenue: Number(day._sum.totalAmount || 0),
      orders: day._count,
    }));

    // Categorias mais vendidas
    const topCategories = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { in: ['COMPLETED', 'DELIVERING'] },
        },
      },
      _sum: { quantity: true, price: true },
    });

    return NextResponse.json({
      period: parseInt(period),
      summary: {
        totalOrders,
        totalRevenue: Number(revenue._sum.totalAmount || 0),
        averageTicket,
      },
      topProducts: topProductsWithDetails,
      salesChart,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar analytics' },
      { status: 500 }
    );
  }
}