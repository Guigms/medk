import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      customer,
      items = [],
      deliveryOption = 'PICKUP',
      deliveryAddress,
      paymentMethod = 'CASH',
      deliveryFee = 0,
      observation,
      changeFor,
      source = 'ONLINE' // Padrão é online, mas o PDV enviará 'COUNTER'
    } = body;

    // 1. Verificação de Receita
    const hasPrescription = items.some((item: any) => 
      item.product?.requiresPrescription === true || item.requiresPrescription === true
    );

    // 2. CÁLCULO SEGURO NO BACK-END (Resolve o erro do subtotal faltando)
    // Multiplicamos o preço de cada item pela quantidade para achar o subtotal exato
    const calculatedSubtotal = items.reduce((acc: number, item: any) => {
      const itemPrice = Number(item.product?.price || item.price || 0);
      return acc + (itemPrice * (item.quantity || 1));
    }, 0);

    const safeDeliveryFee = Number(deliveryFee) || 0;
    const calculatedTotal = calculatedSubtotal + safeDeliveryFee;

    // 3. Gerar Número do Pedido
    const orderNumber = Math.floor(100000 + Math.random() * 900000);

    // 4. EXECUÇÃO DA TRANSAÇÃO (Tudo ou Nada)
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Criar o Pedido Principal
      const newOrder = await tx.order.create({
        data: {
          orderNumber: orderNumber,
          customerName: customer?.name || 'Venda de Balcão',
          customerPhone: customer?.phone || 'N/A',
          deliveryOption: deliveryOption,
          deliveryAddress: deliveryAddress || null,
          subtotal: calculatedSubtotal, // 👈 Agora ele sempre existirá e será preciso!
          deliveryFee: safeDeliveryFee,
          totalAmount: calculatedTotal,
          paymentMethod: paymentMethod,
          hasPrescription: hasPrescription,
          observation: observation || null,
          changeFor: changeFor ? String(changeFor) : null,
          source: source,
          status: source === 'COUNTER' ? 'COMPLETED' : 'PENDING',
          
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.product?.id || item.id,
              quantity: item.quantity || 1,
              price: Number(item.product?.price || item.price || 0),
            }))
          }
        },
        include: {
          orderItems: true
        }
      });

      // B. BAIXA AUTOMÁTICA DE ESTOQUE
      for (const item of items) {
        const productId = item.product?.id || item.id;
        const qtyToSubtract = item.quantity || 1;

        await tx.product.update({
          where: { id: productId },
          data: {
            stock: {
              decrement: qtyToSubtract
            }
          }
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, order: result }, { status: 201 });

  } catch (error: any) {
    console.error("Erro no Checkout/PDV:", error);

    return NextResponse.json(
      { error: 'Erro ao processar a venda e atualizar o estoque.' },
      { status: 500 }
    );
  }
}