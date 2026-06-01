import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Busca o usuário
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

    // 2. Busca as configurações e módulos liberados da farmácia
    const storeConfig = await prisma.storeConfig.findFirst();

    // 3. Monta o Payload completo com TODOS os módulos
    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, 
      
      // ⚡ AGORA SIM: Todas as flags SaaS estão aqui
      moduleCommissions: storeConfig?.moduleCommissions || false,
      moduleNfeReport: storeConfig?.moduleNfeReport || false,
      moduleMargin: storeConfig?.moduleMargin || false,
      moduleTurnover: storeConfig?.moduleTurnover || false,
      moduleAbcCurve: storeConfig?.moduleAbcCurve || false,
      moduleXmlImport: storeConfig?.moduleXmlImport || false,
      moduleSeasonality: storeConfig?.moduleSeasonality || false,
    };

    console.log("API Logando usuario:", userPayload);

    return NextResponse.json(userPayload);
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ error: 'Erro interno ao autenticar' }, { status: 500 });
  }
}