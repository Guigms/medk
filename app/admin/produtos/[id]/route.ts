import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Extrai os campos que podem ser atualizados via PATCH (Disponibilidade e Destaque)
    const { available, featured } = body;

    // Atualiza apenas os campos que foram enviados na requisição
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(available !== undefined && { available }),
        ...(featured !== undefined && { featured }),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Erro ao atualizar status do produto:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}