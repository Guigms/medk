'use client';

import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const res = await fetch('/api/admin/orders'); // Você precisará criar uma GET simples para listar
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    fetchOrders(); // Recarrega a lista
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-black text-[#253289] mb-6">Gestão de Pedidos</h1>
      
      <div className="grid gap-4">
        {orders.map((order: any) => (
          <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-lg">#{order.orderNumber}</span>
                <Badge>{order.status}</Badge>
              </div>
              <p className="text-sm text-gray-500">{order.customerName} • {order.paymentMethod}</p>
              <p className="text-xs text-gray-400">{order.deliveryAddress}</p>
            </div>

            <div className="font-bold text-xl text-[#253289] mr-8">
              {formatPrice(Number(order.totalAmount))}
            </div>

            <div className="flex gap-2">
              {order.status === 'PENDING' && (
                <button onClick={() => updateStatus(order.id, 'CONFIRMED')} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">Confirmar</button>
              )}
              {order.status === 'CONFIRMED' && (
                <button onClick={() => updateStatus(order.id, 'PREPARING')} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold text-sm">Preparar (Baixar Estoque)</button>
              )}
              {order.status === 'PREPARING' && (
                <button onClick={() => updateStatus(order.id, 'DELIVERING')} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold text-sm">Saiu para Entrega</button>
              )}
              {order.status === 'DELIVERING' && (
                <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm">Finalizar Venda</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}