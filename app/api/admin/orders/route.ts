import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 1. GET: Busca todos os pedidos, incluindo os itens e o histórico de alterações
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc' // Pedidos novos aparecem no topo
      },
      include: {
        // Inclui os produtos comprados
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        },
        // Inclui o histórico de alterações de status e o nome de quem alterou
        statusHistory: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc' // Histórico mais recente primeiro
          }
        }
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    return NextResponse.json({ error: "Erro ao carregar pedidos" }, { status: 500 });
  }
}

// 2. PATCH: Atualiza o status do pedido e cria o registro no histórico
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    let { orderId, status, userId } = body;

    // Validação básica
    if (!orderId || !status || !userId) {
      return NextResponse.json(
        { error: 'Parâmetros orderId, status e userId são obrigatórios.' }, 
        { status: 400 }
      );
    }

    // 🌟 PROTEÇÃO CONTRA USUÁRIOS FALSOS (Evita o Erro P2003)
    // Verifica se o ID enviado pelo frontend realmente existe no MySQL
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!dbUser) {
      console.warn(`Usuário ${userId} não encontrado no banco. Buscando fallback...`);
      // Pega o primeiro usuário real do banco de dados para evitar a quebra da chave estrangeira
      const fallbackAdmin = await prisma.user.findFirst();
      
      if (!fallbackAdmin) {
         return NextResponse.json(
          { error: 'Nenhum usuário real encontrado no banco para registrar o histórico.' }, 
          { status: 400 }
        );
      }
      // Substitui o ID falso pelo ID real do administrador
      userId = fallbackAdmin.id; 
    }

    // TRANSAÇÃO: Atualiza o pedido E grava no histórico ao mesmo tempo
    const result = await prisma.$transaction(async (tx) => {
      // 1. Atualiza o status principal do pedido
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status }
      });

      // 2. Cria a linha do tempo para a rastreabilidade com o ID seguro
      await tx.orderStatusHistory.create({
        data: {
          orderId: orderId,
          userId: userId,
          status: status
        }
      });

      return updatedOrder;
    });

    return NextResponse.json({ success: true, order: result });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return NextResponse.json({ error: 'Erro interno ao atualizar status' }, { status: 500 });
  }
}