import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    // 🌟 FORÇANDO O RETORNO EXPLÍCITO DO OBJETO
    // Garantimos que o role seja retornado exatamente como está no banco (ex: "ADMIN")
    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // Certifique-se de que isso está sendo passado
    };

    console.log("API Logando usuario:", userPayload); // Verifique o terminal do servidor

    return NextResponse.json(userPayload);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno ao autenticar' }, { status: 500 });
  }
}