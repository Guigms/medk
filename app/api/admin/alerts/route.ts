import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 1. GET - Busca todos os alertas de estoque não lidos
export async function GET() {
  try {
    const alerts = await prisma.stockAlert.findMany({
      where: { isRead: false },
      include: { 
        product: { 
          select: { 
            name: true, 
            image: true,
            stock: true,
            minStock: true 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Erro ao buscar alertas:", error);
    return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: 500 });
  }
}

// 2. PATCH - Marcar um ou TODOS os alertas como lidos
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, all } = body;

    // Funcionalidade: Marcar todos como lidos de uma vez
    if (all === true) {
      await prisma.stockAlert.updateMany({
        where: { isRead: false },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true, message: 'Todos os alertas foram marcados como lidos' });
    }

    // Funcionalidade: Marcar apenas um alerta específico
    if (!id) {
      return NextResponse.json({ error: 'ID do alerta é obrigatório' }, { status: 400 });
    }

    await prisma.stockAlert.update({
      where: { id },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar alerta:", error);
    return NextResponse.json({ error: 'Erro ao atualizar alerta' }, { status: 500 });
  }
}

// 3. DELETE - Excluir alertas lidos ou específicos
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clearRead = searchParams.get('clearRead');

    // Funcionalidade: Limpar permanentemente todos os alertas que já foram lidos
    if (clearRead === 'true') {
      const deleted = await prisma.stockAlert.deleteMany({
        where: { isRead: true }
      });
      return NextResponse.json({ success: true, count: deleted.count });
    }

    // Funcionalidade: Excluir um alerta específico por ID
    if (id) {
      await prisma.stockAlert.delete({
        where: { id }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Parâmetro de exclusão inválido' }, { status: 400 });
  } catch (error) {
    console.error("Erro ao excluir alerta:", error);
    return NextResponse.json({ error: 'Erro ao excluir alerta' }, { status: 500 });
  }
}