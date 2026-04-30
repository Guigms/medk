export const dynamic = 'force-dynamic'; // Desliga o cache!

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // 🌟 Define quando o sistema deve avisar que está acabando
    const ESTOQUE_CRITICO = 5;

    // Busca diretamente na fonte da verdade: a tabela de Produtos
    const produtosCriticos = await prisma.product.findMany({
      where: {
        stock: {
          lte: ESTOQUE_CRITICO // Menor ou igual a 5
        },
        available: true // Só alerta de produtos que estão ativos para venda
      },
      select: {
        id: true,
        name: true,
        stock: true,
        updatedAt: true
      },
      orderBy: {
        stock: 'asc' // Mostra os piores primeiro (ex: os zerados no topo)
      }
    });

    // Formata o resultado para o seu Dashboard entender perfeitamente
    const alertasDinamicos = produtosCriticos.map(produto => ({
      id: produto.id,
      message: `Estoque crítico: ${produto.name} (Restam ${produto.stock} un)`,
      createdAt: produto.updatedAt // Mostra a data da última vez que o estoque foi mexido
    }));

    return NextResponse.json(alertasDinamicos);

  } catch (error) {
    console.error("Erro ao gerar alertas dinâmicos:", error);
    return NextResponse.json({ error: 'Erro ao gerar alertas' }, { status: 500 });
  }
}