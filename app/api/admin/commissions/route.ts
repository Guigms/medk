import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Busca as comissões do mês atual e agrupa por vendedor
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().getMonth().toString();
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    // Define o primeiro e o último dia do mês selecionado
    const startDate = new Date(Number(year), Number(month), 1);
    const endDate = new Date(Number(year), Number(month) + 1, 0, 23, 59, 59, 999);

    const records = await prisma.commissionRecord.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        seller: { select: { id: true, name: true, commissionRate: true } },
        order: { select: { totalAmount: true } }
      }
    });

    // Agrupa os dados por vendedor usando um Map
    const sellersMap = new Map();

    records.forEach(record => {
      const sId = record.sellerId;
      if (!sellersMap.has(sId)) {
        sellersMap.set(sId, {
          sellerId: sId,
          sellerName: record.seller.name,
          commissionRate: record.seller.commissionRate,
          totalSold: 0,
          pendingCommission: 0,
          paidCommission: 0,
          salesCount: 0
        });
      }

      const stats = sellersMap.get(sId);
      const orderTotal = Number(record.order.totalAmount);
      const commAmount = Number(record.amount);

      stats.totalSold += orderTotal;
      stats.salesCount += 1;

      if (record.status === 'PENDING') {
        stats.pendingCommission += commAmount;
      } else {
        stats.paidCommission += commAmount;
      }
    });

    // Transforma em Array e ordena do que mais vendeu para o que menos vendeu
    const result = Array.from(sellersMap.values()).sort((a, b) => b.totalSold - a.totalSold);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar comissões' }, { status: 500 });
  }
}

// PATCH: Liquida (Paga) as comissões pendentes de um vendedor
export async function PATCH(request: NextRequest) {
  try {
    const { sellerId } = await request.json();

    if (!sellerId) return NextResponse.json({ error: 'ID do vendedor obrigatório' }, { status: 400 });

    await prisma.commissionRecord.updateMany({
      where: { sellerId, status: 'PENDING' },
      data: { status: 'PAID' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao liquidar comissões' }, { status: 500 });
  }
}