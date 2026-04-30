import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 1. GET: Lista todos os utilizadores da equipa
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'ATTENDANT'] } 
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // 🌟 NOVO: Retorna a taxa de comissão para a tela
        commissionRate: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao procurar utilizadores' }, { status: 500 });
  }
}

// 2. POST: Cria um novo utilizador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, commissionRate } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios' }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: 'Este e-mail já está registado' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 🌟 NOVO: Garante que a comissão seja um número válido (se vier vazio, fica 0)
    const rate = commissionRate ? Number(commissionRate) : 0;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'ATTENDANT',
        commissionRate: rate // 🌟 Salva no banco
      }
    });

    return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar utilizador' }, { status: 500 });
  }
}

// 3. DELETE: Remove um utilizador
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID necessário' }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover utilizador' }, { status: 500 });
  }
}