import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    // Validação de segurança básica
    if (!productId) {
      return NextResponse.json(
        { error: 'O ID do produto é obrigatório.' },
        { status: 400 }
      );
    }

    // 🌟 Cria o registo do clique na tabela ProductClick
    await prisma.productClick.create({
      data: {
        productId: productId,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
    
  } catch (error) {
    console.error("Erro ao registar clique no produto:", error);
    return NextResponse.json(
      { error: 'Erro interno ao registar o clique.' }, 
      { status: 500 }
    );
  }
}