import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customer, total } = body;

    // 1. Validar dados básicos
    if (!items || items.length === 0 || !customer.name || !customer.address) {
      return NextResponse.json(
        { error: 'Dados incompletos para o checkout' },
        { status: 400 }
      );
    }

    // 2. Gerar o número do pedido (orderNumber) de forma sequencial
    // Buscamos o maior número atual e somamos 1
    const lastOrder = await prisma.order.findFirst({
  orderBy: { orderNumber: 'desc' },
  select: { orderNumber: true }
});

// Forçamos o resultado a ser um número puro
const lastNumber = lastOrder?.orderNumber ? Number(lastOrder.orderNumber) : 999;
const nextOrderNumber = lastNumber + 1;

// 3. Criar o pedido...
// 3. Criar o pedido e os itens em uma única transação
    const result = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: nextOrderNumber,
          customerName: customer.name,
          customerPhone: customer.phone || '',
          deliveryAddress: customer.address,
          deliveryOption: 'WhatsApp', // Campo obrigatório no seu Schema
          subtotal: total,           // Campo obrigatório no seu Schema
          totalAmount: total,
          status: 'PENDING',
          paymentMethod: customer.paymentMethod,
          // No seu Schema você tem 'observation' e 'notes'. 
          // Vamos usar o 'observation' que você criou por último:
          observation: customer.changeFor ? `Troco para: ${customer.changeFor}` : '',
          
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.product.id,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      return newOrder;
    });

    return NextResponse.json({ success: true, order: result });

  } catch (error) {
    console.error('Erro no Checkout API:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar o pedido' },
      { status: 500 }
    );
  }
}