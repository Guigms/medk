import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let config = await prisma.storeConfig.findFirst();
    
    if (!config) {
      config = await prisma.storeConfig.create({
        data: {
          moduleXmlImport: true, // Força true na criação inicial
          moduleCommissions: false,
          moduleNfeReport: false,
          moduleMargin: false,
          moduleAbcCurve: false,
          moduleTurnover: false,
          moduleSeasonality: false
        }
      });
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userRole, configId, 
      moduleCommissions, moduleNfeReport, moduleMargin, 
      moduleAbcCurve, moduleTurnover, moduleSeasonality 
    } = body;

    if (userRole?.toUpperCase() !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Operação restrita ao suporte master.' }, { status: 403 });
    }

    const updatedConfig = await prisma.storeConfig.update({
      where: { id: configId },
      data: {
        moduleCommissions: moduleCommissions ?? false,
        moduleNfeReport: moduleNfeReport ?? false,
        moduleMargin: moduleMargin ?? false,
        moduleAbcCurve: moduleAbcCurve ?? false,
        moduleTurnover: moduleTurnover ?? false,
        moduleSeasonality: moduleSeasonality ?? false,
      }
    });

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar licenças' }, { status: 500 });
  }
}