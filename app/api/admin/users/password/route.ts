import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(request: Request) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter no mínimo 6 caracteres' }, { status: 400 });
    }

    // 🌟 Criptografa a nova senha gerada pelo Administrador
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 🌟 Atualiza diretamente no banco de dados MySQL
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ success: true, message: 'Senha atualizada com sucesso' });

  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return NextResponse.json({ error: 'Erro interno ao alterar senha' }, { status: 500 });
  }
}