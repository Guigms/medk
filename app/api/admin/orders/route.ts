import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { orderItems: true },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(orders);
}

export async function PATCH(req: Request) {
  const { orderId, status } = await req.json();
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });
  return NextResponse.json(updatedOrder);
}