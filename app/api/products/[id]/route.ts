import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 1. PATCH - Atualiza apenas botões rápidos (Disponível/Destaque)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { available, featured } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(available !== undefined && { available }),
        ...(featured !== undefined && { featured }),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Erro no PATCH:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}

// 2. PUT - Salva as alterações feitas no Modal de "Editar"
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        // Dados Básicos
        name: body.name,
        brand: body.brand || null,
        description: body.description || null,
        categoryId: body.categoryId || null,
        
        // Preço e Estoque
        price: Number(body.price),
        discount: body.discount ? Number(body.discount) : 0,
        stock: body.stock ? Number(body.stock) : 0,
        
        // Imagem
        image: body.image || null,
        
        // Regras de Negócio e Switches
        available: Boolean(body.available),
        featured: Boolean(body.featured),
        requiresPrescription: Boolean(body.requiresPrescription),
        
        // Códigos e Fator de Conversão
        barcode: body.barcode || null,
        purchaseBarcode: body.purchaseBarcode || null,
        conversionFactor: body.conversionFactor ? Number(body.conversionFactor) : 1,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Erro no PUT:', error);
    return NextResponse.json({ error: 'Erro ao editar produto' }, { status: 500 });
  }
}

// 3. DELETE - Exclui o produto do banco de dados
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no DELETE:', error);
    return NextResponse.json(
      { error: 'Não foi possível deletar. O produto pode estar vinculado a um pedido.' }, 
      { status: 500 }
    );
  }
}