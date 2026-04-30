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
      source = 'ONLINE',
      userId 
    } = body;

    // 1. Verificação de Receita
    const hasPrescription = items.some((item: any) => 
      item.product?.requiresPrescription === true || item.requiresPrescription === true
    );

    // 2. Cálculo do Subtotal (Segurança no Backend)
    const calculatedSubtotal = items.reduce((acc: number, item: any) => {
      const itemPrice = Number(item.product?.price || item.price || 0);
      return acc + (itemPrice * (item.quantity || 1));
    }, 0);

    const safeDeliveryFee = Number(deliveryFee) || 0;
    const calculatedTotal = calculatedSubtotal + safeDeliveryFee;
    const orderNumber = Math.floor(100000 + Math.random() * 900000);

    let seller = null;
    if (userId) {
      seller = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { commissionRate: true } // Trazemos apenas o que importa para ficar leve
      });
    }


    const result = await prisma.$transaction(async (tx) => {
      
      const newOrder = await tx.order.create({
        data: {
          orderNumber: orderNumber,
          customerName: customer?.name || 'Venda de Balcão',
          customerPhone: customer?.phone || 'N/A',
          deliveryOption: deliveryOption,
          deliveryAddress: deliveryAddress || null,
          subtotal: calculatedSubtotal, 
          deliveryFee: safeDeliveryFee,
          totalAmount: calculatedTotal,
          paymentMethod: paymentMethod,
          hasPrescription: hasPrescription,
          observation: observation || null,
          changeFor: changeFor ? String(changeFor) : null,
          source: source,
          status: source === 'COUNTER' ? 'COMPLETED' : 'PENDING',
          sellerId: userId || null, 

          orderItems: {
            create: items.map((item: any) => ({
              productId: item.product?.id || item.id,
              quantity: item.quantity || 1,
              price: Number(item.product?.price || item.price || 0),
            }))
          }
        }
      });

      if (source === 'COUNTER' && userId && seller && Number(seller.commissionRate) > 0) {
        const commissionAmount = calculatedTotal * (Number(seller.commissionRate) / 100);

        await tx.commissionRecord.create({
          data: {
            orderId: newOrder.id,
            sellerId: userId,
            amount: commissionAmount,
            percentage: seller.commissionRate,
            status: 'PENDING' // Fica pendente para você pagar no final do mês
          }
        });
      }

      // 4. BAIXA DE ESTOQUE E VERIFICAÇÃO DE ALERTA
      for (const item of items) {
        const productId = item.product?.id || item.id;
        const qtyToSubtract = item.quantity || 1;

        const updatedProduct = await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: qtyToSubtract } }
        });

        if (updatedProduct.stock <= updatedProduct.minStock) {
          await tx.stockAlert.create({
            data: {
              productId: updatedProduct.id,
              message: `Atenção: O produto "${updatedProduct.name}" atingiu o nível crítico. Saldo atual: ${updatedProduct.stock} unidades.`
            }
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, order: result }, { status: 201 });

  } catch (error: any) {
    console.error("Erro no Checkout:", error);
    return NextResponse.json({ error: 'Erro ao processar a venda.' }, { status: 500 });
  }
}