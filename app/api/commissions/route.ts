import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido' }, { status: 400 });
    }

    // ⚡ 1. Busca os dados FIXOS do vendedor (Meta e Taxa) independente de ele ter vendas
    const sellerData = await prisma.user.findUnique({
      where: { id: userId },
      select: { commissionRate: true, monthlyGoal: true }
    });

    if (!sellerData) {
      return NextResponse.json({ error: 'Vendedor não encontrado' }, { status: 404 });
    }

    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // 2. Busca apenas as comissões deste usuário específico no mês atual
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

    // ⚡ Nomes ajustados para bater EXATAMENTE com o que o Front-end espera
    let totalSales = 0; 
    let pendingCommissions = 0;
    let paidCommissions = 0;

    records.forEach(record => {
      totalSales += Number(record.order?.totalAmount || 0);
      if (record.status === 'PENDING') {
        pendingCommissions += Number(record.amount || 0);
      } else {
        paidCommissions += Number(record.amount || 0);
      }
    });

    // 3. Retorna o pacote completo e tipado
    return NextResponse.json({
      monthlyGoal: Number(sellerData.monthlyGoal || 0), // ⚡ A Meta Mensal agora vai para a tela
      commissionRate: Number(sellerData.commissionRate || 0),
      totalSales,
      pendingCommissions,
      paidCommissions,
      salesCount: records.length,
      history: records // ⚡ Mudamos de 'recentRecords' para 'history'
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar comissões individuais' }, { status: 500 });
  }
}