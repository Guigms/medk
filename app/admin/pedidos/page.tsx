'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { Package, Clock, ShoppingBag, X, ArrowLeft } from 'lucide-react';

// Status mapeados para manter excelente contraste nos dois modos
const statusMap: Record<string, { label: string, color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/40' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40' },
  PREPARING: { label: 'Preparando', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40' },
  DELIVERING: { label: 'Em Entrega', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40' },
  COMPLETED: { label: 'Concluído', color: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/40' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/40' }
};

export default function PedidosAdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder || !user?.id) return;
    setIsUpdating(true);
    
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrder.id, status: newStatus, userId: user.id })
      });

      const data = await res.json();

      if (res.ok) {
        await fetchOrders();
        setSelectedOrder((prev: any) => ({
          ...prev,
          status: newStatus,
          statusHistory: [
            { status: newStatus, createdAt: new Date().toISOString(), user: { name: user.name } },
            ...(prev.statusHistory || [])
          ]
        }));
      } else {
        alert(data.error);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-bold text-[#253289] dark:text-blue-400">
        Carregando pedidos...
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 bg-background text-foreground min-h-screen transition-colors duration-300">
        
        {/* CABEÇALHO DA PÁGINA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 hover:border-[#253289] dark:hover:border-blue-500 rounded-xl shadow-sm transition-all group cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 leading-none">
                <Package size={28} className="text-[#253289] dark:text-blue-400" /> Gerenciamento de Pedidos
              </h1>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Controle de Vendas e Logística</p>
            </div>
          </div>
        </div>

        {/* TABELA DE PEDIDOS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px] border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedido #</th>
                  <th className="p-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                  <th className="p-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="p-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="p-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)} 
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-4 font-black text-[#253289] dark:text-blue-400">#{order.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{order.customerName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{order.customerPhone}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 font-black text-green-600 dark:text-green-400">{formatPrice(Number(order.totalAmount))}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black shadow-sm ${statusMap[order.status]?.color}`}>
                        {statusMap[order.status]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500 italic">Nenhum pedido registrado no momento.</div>
          )}
        </div>

        {/* MODAL DETALHADO */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-transparent dark:border-gray-800" onClick={e => e.stopPropagation()}>
              
              {/* HEADER MODAL */}
              <div className="bg-[#253289] dark:bg-gray-950 p-6 text-white flex justify-between items-center border-b dark:border-gray-800">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Detalhes do Pedido #{selectedOrder.orderNumber}</h2>
                  <p className="text-blue-200 dark:text-gray-400 text-sm font-medium">{new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2.5 bg-white/10 hover:bg-white/20 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors rounded-xl text-white"><X size={20} /></button>
              </div>

              {/* CORPO MODAL */}
              <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-950/50 flex flex-col md:flex-row gap-6 transition-colors">
                
                {/* Coluna Esquerda */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Cliente</h3>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{selectedOrder.customerName}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Retirada / Entrega</h3>
                      <p className="font-bold text-gray-900 dark:text-gray-100">{selectedOrder.deliveryOption === 'PICKUP' ? '🛒 Retirada no Balcão' : '🛵 Entrega Domiciliar'}</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="bg-gray-50 dark:bg-gray-950 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                      <ShoppingBag size={18} className="text-gray-400 dark:text-gray-500" />
                      <h3 className="font-black text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">Produtos do Pedido</h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {selectedOrder.orderItems?.map((item: any) => (
                        <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="font-black bg-blue-50 dark:bg-blue-950/40 text-[#253289] dark:text-blue-400 px-2.5 py-1 rounded-lg text-xs">{item.quantity}x</span>
                            <span className="font-bold text-gray-900 dark:text-gray-200">{item.product?.name || 'Produto Removido'}</span>
                          </div>
                          <span className="font-black text-gray-700 dark:text-gray-300">{formatPrice(Number(item.price))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Coluna Direita */}
                <div className="w-full md:w-80 space-y-6">
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-4">Atualizar Status</h3>
                    <div className="flex flex-col gap-2">
                      
                      <select 
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        disabled={isUpdating || selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'CANCELLED'}
                        className={`w-full p-3 rounded-xl border-2 font-black transition-all outline-none text-sm
                          ${(selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'CANCELLED') 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-70' 
                            : `cursor-pointer focus:border-[#253289] dark:focus:border-blue-500 ${statusMap[selectedOrder.status]?.color} border-transparent`
                          }`}
                      >
                        {Object.keys(statusMap).map(statusKey => (
                          <option key={statusKey} value={statusKey} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold">
                            {statusMap[statusKey].label}
                          </option>
                        ))}
                      </select>
                      
                      {(selectedOrder.status === 'COMPLETED' || selectedOrder.status === 'CANCELLED') && (
                        <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl text-center">
                          <p className="text-[11px] font-black text-red-600 dark:text-red-400">
                            🔒 Registro finalizado. Alterações bloqueadas.
                          </p>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* HISTÓRICO DA VENDA */}
                  <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Clock size={16}/> Linha do Tempo</h3>
                    <div className="space-y-4">
                      {selectedOrder.statusHistory?.map((history: any, index: number) => (
                        <div key={history.id || index} className="flex gap-3 relative">
                          {index !== selectedOrder.statusHistory.length - 1 && <div className="absolute left-[5px] top-6 bottom-[-16px] w-[2px] bg-gray-100 dark:bg-gray-800"></div>}
                          <div className="w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 mt-1.5 shrink-0 z-10 outline outline-4骨 outline-white dark:outline-gray-900"></div>
                          <div>
                            <p className="text-xs font-black text-gray-900 dark:text-gray-100">{statusMap[history.status]?.label || history.status}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{new Date(history.createdAt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</p>
                            {history.user && <p className="text-[10px] font-black text-[#253289] dark:text-blue-400 mt-1 bg-blue-50 dark:bg-blue-950/40 inline-block px-1.5 py-0.5 rounded-md">Atendente: {history.user.name}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}