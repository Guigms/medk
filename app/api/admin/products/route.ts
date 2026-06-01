import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 🌟 FUNÇÃO GET: Carrega todos os produtos para a tela do Admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const categorySlug = searchParams.get('category') || '';

    const whereClause: any = {};

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { barcode: { contains: query } }
      ];
    }

    if (categorySlug && categorySlug !== 'all') {
      whereClause.category = { slug: categorySlug };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: { 
        createdAt: 'desc'
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Erro no GET de admin/products:', error);
    return NextResponse.json({ error: 'Erro ao carregar inventário administrativo.' }, { status: 500 });
  }
}

// 🌟 FUNÇÃO DELETE
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userRole, productId } = body;

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso Negado: Apenas Administradores podem excluir produtos.' }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}