'use client';
import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  status: string;
  items: { id: string; quantity: number; name: string }[];
}

export default function GestaoPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      body: JSON.stringify({ orderId, status: newStatus })
    });
    // Atualizar lista local
    setOrders(orders.map(o => o.id === orderId ? {...o, status: newStatus} : o));
  };

  return (
    <ProtectedRoute>
      <div className="p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Gestão de Pedidos Diários</h1>
        
        <div className="grid gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <p className="font-bold text-[#253289]">Pedido #{order.orderNumber}</p>
                <p className="text-sm text-gray-600">{order.customerName} - {order.address}</p>
                <div className="mt-2">
                  {order.items.map(item => (
                    <span key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded mr-2">
                      {item.quantity}x {item.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <select 
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  className="border rounded p-2 text-sm"
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="EM_SEPARACAO">Em Separação</option>
                  <option value="ENVIADO">Enviado</option>
                  <option value="ENTREGUE">Entregue</option>
                </select>
                <button 
                  onClick={() => window.print()} 
                  className="text-xs text-blue-600 hover:underline"
                >
                  Imprimir Lista de Separação
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}