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
      deliveryFee = 0,
      observation,
      changeFor,
      source = 'ONLINE',
      userId 
    } = body;

    // 🌟 1. Captura Inteligente e Normalização do Pagamento
    const rawPayment = body.paymentMethod || body.payment || 'MONEY';
    let finalPaymentMethod = String(rawPayment).toUpperCase().trim();

    if (finalPaymentMethod.includes('CRÉDITO') || finalPaymentMethod.includes('CREDITO')) finalPaymentMethod = 'CREDIT_CARD';
    else if (finalPaymentMethod.includes('DÉBITO') || finalPaymentMethod.includes('DEBITO')) finalPaymentMethod = 'DEBIT_CARD';
    else if (finalPaymentMethod.includes('DINHEIRO') || finalPaymentMethod === 'CASH') finalPaymentMethod = 'MONEY';
    else if (finalPaymentMethod.includes('PIX')) finalPaymentMethod = 'PIX';

    // 🌟 2. CONSULTA SEGURA DE PREÇOS NO BANCO DE DADOS
    const productIds = items.map((item: any) => item.product?.id || item.id);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, requiresPrescription: true }
    });

    // 3. Verificação de Receita (Baseada no Banco de Dados)
    const hasPrescription = dbProducts.some(p => p.requiresPrescription === true);

    // 🌟 4. Cálculo do Subtotal 100% Seguro (Evita que o valor fique "alto" ou adulterado)
    const calculatedSubtotal = items.reduce((acc: number, item: any) => {
      const prodId = item.product?.id || item.id;
      const realProduct = dbProducts.find(p => p.id === prodId);
      const exactPrice = realProduct ? Number(realProduct.price) : 0;
      
      return acc + (exactPrice * (item.quantity || 1));
    }, 0);

    const safeDeliveryFee = Number(deliveryFee) || 0;
    const calculatedTotal = calculatedSubtotal + safeDeliveryFee;

    // 🌟 5. Verificação Segura de Vendedor (Impede erro 500 se o usuário deslogar)
    let seller = null;
    let validSellerId = null; 

    if (userId) {
      seller = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { id: true, commissionRate: true } 
      });
      if (seller) {
        validSellerId = seller.id;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      
      const newOrder = await tx.order.create({
  data: {
    customerName: customer?.name || 'Venda de Balcão',
    customerPhone: customer?.phone || 'N/A',
    deliveryOption: deliveryOption,
    deliveryAddress: deliveryAddress || null,
    subtotal: calculatedSubtotal, 
    deliveryFee: safeDeliveryFee,
    totalAmount: calculatedTotal,
    paymentMethod: finalPaymentMethod,
    hasPrescription: hasPrescription,
    observation: observation || null,
    changeFor: changeFor ? String(changeFor) : null,
    source: source,
    status: source === 'COUNTER' ? 'COMPLETED' : 'PENDING',
    sellerId: validSellerId,
    
    orderItems: {
      create: items.map((item: any) => {
        const prodId = item.product?.id || item.id;
        const realProduct = dbProducts.find(p => p.id === prodId);
        return {
          productId: prodId,
          quantity: item.quantity || 1,
          price: realProduct ? Number(realProduct.price) : 0,
        };
      })
    }
  }
});

      // 6. Calcula a comissão com o valor total correto
      if (source === 'COUNTER' && validSellerId && seller && Number(seller.commissionRate) > 0) {
        const commissionAmount = calculatedTotal * (Number(seller.commissionRate) / 100);

        await tx.commissionRecord.create({
          data: {
            orderId: newOrder.id,
            sellerId: validSellerId,
            amount: commissionAmount,
            percentage: seller.commissionRate,
            status: 'PENDING' 
          }
        });
      }

      // 7. BAIXA DE ESTOQUE
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