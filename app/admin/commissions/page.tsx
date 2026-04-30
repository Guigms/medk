'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { Trophy, Target, DollarSign, CheckCircle2, AlertCircle, Lock, CalendarCheck } from 'lucide-react';

// Meta mensal de vendas da farmácia por atendente (Ex: R$ 10.000)
const META_MENSAL = 10000;

export default function ComissoesPage() {
  const { user } = useAuth();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  const fetchCommissions = async () => {
    try {
      const res = await fetch('/api/admin/commissions');
      if (res.ok) setSellers(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCommissions(); }, []);

  const handlePay = async (sellerId: string, sellerName: string) => {
    if (!confirm(`Tem certeza que deseja liquidar todas as comissões pendentes de ${sellerName}?`)) return;
    
    setIsPaying(true);
    try {
      const res = await fetch('/api/admin/commissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId })
      });

      if (res.ok) {
        alert('Comissões marcadas como pagas com sucesso!');
        fetchCommissions();
      } else {
        alert('Erro ao processar pagamento.');
      }
    } finally {
      setIsPaying(false);
    }
  };

  // Trava de Segurança
  if (user?.role !== 'ADMIN') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-red-100">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={40} /></div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Acesso Restrito</h2>
            <p className="text-gray-500 mb-6">Apenas administradores podem ver relatórios de comissão.</p>
            <button onClick={() => window.history.back()} className="bg-[#253289] text-white px-6 py-3 rounded-xl font-bold">Voltar</button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-[#253289]">Carregando comissões...</div>;

  const top3 = sellers.slice(0, 3);
  const podiumColors = ['bg-yellow-400 text-yellow-900', 'bg-gray-300 text-gray-800', 'bg-orange-300 text-orange-900'];

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#253289] flex items-center gap-2">
              <DollarSign size={32} /> Comissões e Metas
            </h1>
            <p className="text-gray-500 flex items-center gap-1 mt-1">
              <CalendarCheck size={16}/> Resultados do mês atual
            </p>
          </div>
        </div>

        {sellers.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
            <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Nenhuma venda comissionada ainda</h3>
            <p className="text-gray-500">As comissões aparecerão aqui quando os pedidos forem concluídos.</p>
          </div>
        ) : (
          <>
            {/* PÓDIO - TOP 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {top3.map((seller, index) => (
                <div key={seller.sellerId} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col items-center text-center group hover:shadow-md transition-shadow">
                  <div className={`absolute top-0 left-0 w-full h-2 ${podiumColors[index].split(' ')[0]}`}></div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shadow-inner mb-4 ${podiumColors[index]}`}>
                    {index + 1}º
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{seller.sellerName}</h3>
                  <p className="text-sm font-bold text-emerald-600 mb-1">{Number(seller.commissionRate)}% de Taxa</p>
                  <div className="mt-4 w-full p-3 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Total Vendido</p>
                    <p className="text-2xl font-black text-[#253289]">{formatPrice(seller.totalSold)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* LISTA DETALHADA COM BARRA DE PROGRESSO */}
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><Target size={24} className="text-blue-500"/> Desempenho da Equipe</h2>
            <div className="space-y-4">
              {sellers.map(seller => {
                const percentualMeta = Math.min((seller.totalSold / META_MENSAL) * 100, 100);
                const bateuMeta = percentualMeta >= 100;

                return (
                  <div key={seller.sellerId} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                      
                      {/* Info do Vendedor */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{seller.sellerName}</h3>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-bold">{seller.salesCount} Vendas</span>
                        </div>
                        
                        {/* Barra de Meta */}
                        <div className="w-full">
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-gray-500">Progresso da Meta</span>
                            <span className={bateuMeta ? 'text-emerald-600' : 'text-blue-600'}>{percentualMeta.toFixed(1)}% de {formatPrice(META_MENSAL)}</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 rounded-full ${bateuMeta ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[#253289]'}`}
                              style={{ width: `${percentualMeta}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Valores e Ações */}
                      <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1"><AlertCircle size={12}/> Pendente</p>
                          <p className="text-xl font-black text-orange-500">{formatPrice(seller.pendingCommission)}</p>
                        </div>
                        <div className="h-10 w-px bg-gray-200"></div>
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-black mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> Já Pago</p>
                          <p className="text-xl font-black text-emerald-600">{formatPrice(seller.paidCommission)}</p>
                        </div>
                        
                        <button
                          onClick={() => handlePay(seller.sellerId, seller.sellerName)}
                          disabled={seller.pendingCommission <= 0 || isPaying}
                          className={`ml-4 px-6 py-3 rounded-xl font-black shadow-sm transition-all ${
                            seller.pendingCommission > 0 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 hover:scale-105' 
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {seller.pendingCommission > 0 ? 'Liquidar' : 'Tudo Certo'}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}