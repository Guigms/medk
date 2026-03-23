import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Listar lotes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const expiring = searchParams.get('expiring'); // dias

    const where: any = {};

    if (productId) {
      where.productId = productId;
    }

    if (expiring) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(expiring));
      where.expiryDate = { lte: expiryDate };
    }

    const batches = await prisma.batch.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    return NextResponse.json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar lotes' },
      { status: 500 }
    );
  }
}

// POST - Criar lote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const batch = await prisma.batch.create({
      data: {
        productId: body.productId,
        batchNumber: body.batchNumber,
        quantity: body.quantity,
        expiryDate: new Date(body.expiryDate),
        purchaseDate: new Date(body.purchaseDate),
        cost: body.cost,
        notes: body.notes,
      },
      include: {
        product: true,
      },
    });

    // Atualizar estoque do produto
    await prisma.product.update({
      where: { id: body.productId },
      data: {
        stock: { increment: body.quantity },
      },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { error: 'Erro ao criar lote' },
      { status: 500 }
    );
  }
}