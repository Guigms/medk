import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Busca apenas as comissões deste usuário específico no mês atual
    const records = await prisma.commissionRecord.findMany({
      where: {
        sellerId: userId,
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        order: { select: { orderNumber: true, totalAmount: true, createdAt: true } },
        seller: { select: { commissionRate: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    let totalSold = 0;
    let pendingCommission = 0;
    let paidCommission = 0;
    let commissionRate = records.length > 0 ? Number(records[0].seller.commissionRate) : 0;

    records.forEach(record => {
      totalSold += Number(record.order.totalAmount);
      if (record.status === 'PENDING') {
        pendingCommission += Number(record.amount);
      } else {
        paidCommission += Number(record.amount);
      }
    });

    return NextResponse.json({
      totalSold,
      pendingCommission,
      paidCommission,
      commissionRate,
      salesCount: records.length,
      recentRecords: records // Enviamos os detalhes para ele ver quais pedidos geraram comissão
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar comissões individuais' }, { status: 500 });
  }
}