import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Exemplo para a rota DELETE (aplica a mesma lógica para PATCH e POST)
export async function DELETE(request: NextRequest) {
  try {
    // 1. Você precisa identificar o usuário que está fazendo a requisição.
    // Se você não usa JWT, passe o userRole no corpo da requisição ou no header
    const body = await request.json();
    const { userRole, productId } = body;

    // 🌟 BLOQUEIO REAL
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso Negado: Apenas Administradores podem excluir produtos.' }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}