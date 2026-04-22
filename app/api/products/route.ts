import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Listar todos os produtos (com filtros de busca e categoria)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category') || searchParams.get('categoria');
    const searchTerm = searchParams.get('q') || searchParams.get('search'); 
    const featured = searchParams.get('featured');
    
    // 🌟 NOVO: Captura se a requisição quer ver tudo (visão do admin)
    const adminView = searchParams.get('adminView') === 'true';

    const where: any = {};

    // Se NÃO for visão de admin, aplicamos a trava de segurança de produtos ativos
    if (!adminView) {
      where.available = true;
    }

    // Se houver busca por categoria
    if (category) {
      where.category = { slug: category };
    }

    // Lógica de busca textual (Nome, Marca ou Código de Barras)
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { brand: { contains: searchTerm } },
        { barcode: { equals: searchTerm } },
      ];
    }

    // Filtro de destaques
    if (featured === 'true') {
      where.featured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Converte Decimal para Number para o Frontend
    const serializedProducts = products.map(p => ({
      ...p,
      price: Number(p.price)
    }));

    return NextResponse.json(serializedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const product = await prisma.product.create({
      data: {
        name: body.name,
        brand: body.brand || null,
        barcode: body.barcode || null,
        description: body.description,
        price: Number(body.price),
        image: body.image,
        available: body.available ?? true,
        featured: body.featured ?? false,
        discount: body.discount ? parseInt(body.discount) : null,
        requiresPrescription: body.requiresPrescription ?? false,
        stock: body.stock ? Number(body.stock) : 0,
        categoryId: body.categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    );
  }
}