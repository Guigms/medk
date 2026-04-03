import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Listar todos os produtos (com filtros de busca e categoria)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Sincronizando os nomes dos parâmetros com os componentes (SearchBar usa 'q')
    const category = searchParams.get('category') || searchParams.get('categoria');
    const searchTerm = searchParams.get('q') || searchParams.get('search'); 
    const featured = searchParams.get('featured');

    const where: any = {
      available: true // Por padrão, só mostra o que está disponível no site
    };

    // Se houver busca por categoria
    if (category) {
      where.category = { slug: category };
    }

    // Lógica de busca textual corrigida
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { brand: { contains: searchTerm } },
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

    // Converte Decimal para Number para evitar erros no Frontend
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
        brand: body.brand,
        description: body.description,
        price: body.price,
        image: body.image,
        available: body.available ?? true,
        featured: body.featured ?? false,
        discount: body.discount,
        requiresPrescription: body.requiresPrescription ?? false,
        stock: body.stock ?? 0,
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