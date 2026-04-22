'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { 
  Package, MapPin, User, Clock, CheckCircle, 
  XCircle, Truck, ShoppingBag, X, FileText 
} from 'lucide-react';

// Dicionário visual para os status
const statusMap: Record<string, { label: string, color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  PREPARING: { label: 'Preparando', color: 'bg-purple-100 text-purple-800' },
  DELIVERING: { label: 'Em Entrega', color: 'bg-orange-100 text-orange-800' },
  COMPLETED: { label: 'Concluído', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
};

export default function PedidosAdminPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados do Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Busca os pedidos da API que acabamos de criar
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Erro ao carregar pedidos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Atualiza o status e grava o histórico
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder || !user?.id) return;
    setIsUpdating(true);
    
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: selectedOrder.id, 
          status: newStatus, 
          userId: user.id // Importante: Enviamos quem está alterando!
        })
      });

      if (res.ok) {
        await fetchOrders(); // Atualiza a tabela no fundo
        
        // Atualiza a visão do modal na hora para não precisar fechar
        setSelectedOrder((prev: any) => ({
          ...prev,
          status: newStatus,
          statusHistory: [
            { status: newStatus, createdAt: new Date().toISOString(), user: { name: user.name } },
            ...(prev.statusHistory || [])
          ]
        }));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-[#253289]">
        Carregando pedidos da MedK...
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-black text-[#253289] mb-6 flex items-center gap-2">
          <Package /> Gerenciamento de Pedidos
        </h1>

        {/* Tabela de Pedidos Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Pedido #</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Data</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Total</th>
                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)} // 🌟 ABRE O MODAL AQUI
                  className="hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <td className="p-4 font-bold text-[#253289]">#{order.orderNumber}</td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{order.customerPhone}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 font-black text-green-600">{formatPrice(Number(order.totalAmount))}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusMap[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {statusMap[order.status]?.label || order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Nenhum pedido encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🌟 MODAL DE DETALHES DO PEDIDO (Janela Sobreposta) */}
        {selectedOrder && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
            onClick={() => setSelectedOrder(null)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()} // Impede que o clique dentro feche o modal
            >
              {/* Cabeçalho do Modal */}
              <div className="bg-[#253289] p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2">
                    Detalhes do Pedido #{selectedOrder.orderNumber}
                  </h2>
                  <p className="text-blue-200 text-sm mt-1">
                    Feito em: {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Corpo do Modal */}
              <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col md:flex-row gap-6">
                
                {/* LADO ESQUERDO: Dados do Cliente e Produtos */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-black text-gray-400 uppercase mb-2 flex items-center gap-1"><User size={14}/> Cliente</h3>
                      <p className="font-bold text-gray-900">{selectedOrder.customerName}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-black text-gray-400 uppercase mb-2 flex items-center gap-1"><MapPin size={14}/> Retirada/Entrega</h3>
                      <p className="font-bold text-gray-900">
                        {selectedOrder.deliveryOption === 'PICKUP' ? 'Balcão' : 'Entrega'}
                      </p>
                      {selectedOrder.deliveryAddress && <p className="text-sm text-gray-600 mt-1">{selectedOrder.deliveryAddress}</p>}
                    </div>
                  </div>

                  {/* Produtos da Cesta */}
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                      <ShoppingBag size={18} className="text-gray-500" />
                      <h3 className="font-bold text-gray-700">Produtos Comprados</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {selectedOrder.orderItems?.map((item: any) => (
                        <div key={item.id} className="p-4 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="font-black text-gray-400 bg-gray-100 px-2 py-1 rounded text-xs">{item.quantity}x</span>
                            <span className="font-medium text-gray-900">{item.product?.name || 'Produto Removido'}</span>
                          </div>
                          <span className="font-bold text-gray-600">{formatPrice(Number(item.price))}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-gray-500 uppercase text-sm">Total do Pedido</span>
                      <span className="font-black text-green-600 text-xl">{formatPrice(Number(selectedOrder.totalAmount))}</span>
                    </div>
                  </div>
                </div>

                {/* LADO DIREITO: Alteração de Status e Linha do Tempo */}
                <div className="w-full md:w-80 space-y-6">
                  
                  {/* Caixa de Ação: Trocar Status */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-black text-gray-900 mb-4">Atualizar Status</h3>
                    <div className="flex flex-col gap-2">
                      <select 
                        value={selectedOrder.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        disabled={isUpdating}
                        className={`w-full p-3 rounded-lg border-2 font-bold cursor-pointer transition-all outline-none focus:border-[#253289] ${statusMap[selectedOrder.status]?.color} border-transparent`}
                      >
                        {Object.keys(statusMap).map(statusKey => (
                          <option key={statusKey} value={statusKey} className="bg-white text-gray-900 font-medium">
                            {statusMap[statusKey].label}
                          </option>
                        ))}
                      </select>
                      {isUpdating && <p className="text-xs text-center text-blue-600 animate-pulse mt-1">Gravando no banco...</p>}
                    </div>
                  </div>

                  {/* Caixa: Linha do Tempo (Rastreabilidade) */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Clock size={18}/> Histórico da Venda</h3>
                    <div className="space-y-4">
                      {selectedOrder.statusHistory?.map((history: any, index: number) => (
                        <div key={history.id || index} className="flex gap-3 relative">
                          {index !== selectedOrder.statusHistory.length - 1 && (
                            <div className="absolute left-[5px] top-6 bottom-[-16px] w-[2px] bg-gray-100"></div>
                          )}
                          <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 shrink-0 z-10 outline outline-4 outline-white"></div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{statusMap[history.status]?.label || history.status}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(history.createdAt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                            </p>
                            {history.user && (
                              <p className="text-[10px] font-bold text-[#253289] mt-1 bg-blue-50 inline-block px-1.5 py-0.5 rounded">
                                Atualizado por: {history.user.name}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!selectedOrder.statusHistory || selectedOrder.statusHistory.length === 0) && (
                        <p className="text-xs text-gray-400 italic">Sem histórico de alterações.</p>
                      )}
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