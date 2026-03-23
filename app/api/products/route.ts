import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Listar todos os produtos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    const where: any = {};

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { contains: search } },
      ];
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        batches: {
          orderBy: { expiryDate: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
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