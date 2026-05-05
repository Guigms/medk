import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const records = await prisma.nfeRecord.findMany({
      orderBy: { importedAt: 'desc' },
      // 🌟 ADICIONADO: Trazemos os itens da nota já embutidos na resposta
      include: {
        batches: {
          include: { 
            product: { 
              select: { name: true, category: { select: { name: true } } } 
            } 
          }
        }
      }
    });
    
    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching NFE:", error);
    return NextResponse.json({ error: 'Erro ao buscar notas fiscais' }, { status: 500 });
  }
}