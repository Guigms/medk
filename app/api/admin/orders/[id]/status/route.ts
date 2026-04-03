import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Padrão Next.js 15+
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // 1. Buscar o pedido atual e seus itens
    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // 2. REGRA DE ESTOQUE: Baixar quando for para PREPARING
    if (status === 'PREPARING' && order.status === 'CONFIRMED') {
      // Usa $transaction para garantir que todos os produtos baixem com segurança
      await prisma.$transaction(
        order.orderItems.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          })
        )
      );
    }

    // 3. REGRA DO ANALYTICS: Alimentar o relatório quando o pedido for COMPLETED (Finalizado)
    if (status === 'COMPLETED' && order.status !== 'COMPLETED') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Zera a hora para agrupar por dia

      const totalItemsInOrder = order.orderItems.reduce((acc, item) => acc + item.quantity, 0);

      // Tenta achar o relatório de hoje
      const existingReport = await prisma.salesReport.findUnique({
        where: { date: today }
      });

      if (existingReport) {
        // Se já vendeu hoje, soma com os dados existentes
        const newTotalOrders = existingReport.totalOrders + 1;
        const newTotalRevenue = Number(existingReport.totalRevenue) + Number(order.totalAmount);
        
        await prisma.salesReport.update({
          where: { date: today },
          data: {
            totalOrders: { increment: 1 },
            totalRevenue: newTotalRevenue,
            totalProducts: { increment: totalItemsInOrder },
            averageTicket: newTotalRevenue / newTotalOrders // Recalcula o ticket médio
          }
        });
      } else {
        // Se for a primeira venda do dia, cria o relatório
        await prisma.salesReport.create({
          data: {
            date: today,
            totalOrders: 1,
            totalRevenue: order.totalAmount,
            totalProducts: totalItemsInOrder,
            averageTicket: order.totalAmount
          }
        });
      }
    }

    // 4. Finalmente, atualiza o status do pedido
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json({ error: 'Erro interno ao processar status' }, { status: 500 });
  }
}