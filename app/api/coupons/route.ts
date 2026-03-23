import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Listar cupons
export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cupons' },
      { status: 500 }
    );
  }
}

// POST - Criar cupom
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        description: body.description,
        discountType: body.discountType,
        discountValue: body.discountValue,
        minPurchase: body.minPurchase,
        maxDiscount: body.maxDiscount,
        usageLimit: body.usageLimit,
        categoryId: body.categoryId,
        validFrom: new Date(body.validFrom),
        validUntil: new Date(body.validUntil),
        active: body.active ?? true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { error: 'Erro ao criar cupom' },
      { status: 500 }
    );
  }
}