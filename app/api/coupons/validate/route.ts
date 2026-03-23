import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Validar cupom
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, cartTotal, categoryId } = body;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: { category: true },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Cupom não encontrado' },
        { status: 404 }
      );
    }

    // Validações
    const now = new Date();
    if (!coupon.active) {
      return NextResponse.json(
        { error: 'Cupom inativo' },
        { status: 400 }
      );
    }

    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json(
        { error: 'Cupom fora do período de validade' },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'Cupom esgotado' },
        { status: 400 }
      );
    }

    if (coupon.minPurchase && cartTotal < Number(coupon.minPurchase)) {
      return NextResponse.json(
        { error: `Valor mínimo de compra: R$ ${coupon.minPurchase}` },
        { status: 400 }
      );
    }

    if (coupon.categoryId && coupon.categoryId !== categoryId) {
      return NextResponse.json(
        { error: `Cupom válido apenas para: ${coupon.category?.name}` },
        { status: 400 }
      );
    }

    // Calcular desconto
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (cartTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { error: 'Erro ao validar cupom' },
      { status: 500 }
    );
  }
}