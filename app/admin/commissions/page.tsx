'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { Trophy, Target, DollarSign, CheckCircle2, AlertCircle, Lock, CalendarCheck, ArrowLeft } from 'lucide-react';

export default function ComissoesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  // 🛡️ TRAVA SAAS: Só entra quem for ADMIN da farmácia com módulo pago, OU o próprio Super Admin.
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || isSuperAdmin;
  const temAcesso = isSuperAdmin || user?.moduleCommissions === true;

  const fetchCommissions = async () => {
    try {
      const res = await fetch('/api/admin/commissions');
      if (res.ok) setSellers(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (isAdmin && temAcesso) fetchCommissions(); 
  }, [isAdmin, temAcesso]);

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

  // 🛡️ Tela de Bloqueio se o cliente não contratou o módulo ou se um Atendente tentar burlar a URL
  if (user && (!isAdmin || !temAcesso)) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 transition-colors duration-300">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl max-w-md text-center border border-red-100 dark:border-red-950/40">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Recurso Bloqueado</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm font-medium">
              Este módulo de gestão não está ativo na sua licença atual ou você não possui permissão de acesso.
            </p>
            <button 
              onClick={() => router.back()}
              className="w-full bg-[#253289] dark:bg-blue-600 text-white px-6 py-3 rounded-xl font-black hover:bg-[#1a2461] dark:hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-900/10"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-bold text-[#253289] dark:text-blue-400">
        Carregando painel de comissões...
      </div>
    );
  }

  const top3 = sellers.slice(0, 3);
  const podiumColors = [
    'bg-yellow-400 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/40', 
    'bg-gray-300 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300 border-gray-200 dark:border-gray-800', 
    'bg-orange-300 text-orange-900 dark:bg-amber-700/20 dark:text-amber-400 border-orange-200 dark:border-amber-900/40'
  ];

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 bg-background text-foreground min-h-screen transition-colors duration-300">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 hover:border-[#253289] dark:hover:border-blue-500 rounded-xl shadow-sm transition-all group cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2 leading-none tracking-tight">
                <DollarSign size={32} className="text-[#253289] dark:text-blue-400" /> Comissões e Metas
              </h1>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1 font-medium text-sm">
                <CalendarCheck size={16}/> Resultados do mês atual
              </p>
            </div>
          </div>
        </div>

        {sellers.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl border border-gray-200 dark:border-gray-800 text-center shadow-sm transition-colors">
            <Trophy size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nenhuma venda comissionada ainda</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">As comissões aparecerão aqui quando os pedidos forem concluídos pela equipe.</p>
          </div>
        ) : (
          <>
            {/* PÓDIO - TOP 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {top3.map((seller, index) => (
                <div key={seller.sellerId} className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden flex flex-col items-center text-center group hover:shadow-md transition-all">
                  <div className={`absolute top-0 left-0 w-full h-2 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-orange-300'}`}></div>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black shadow-inner mb-4 border-2 ${podiumColors[index]}`}>
                    {index + 1}º
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{seller.sellerName}</h3>
                  <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 uppercase tracking-wider">{Number(seller.commissionRate)}% de Taxa</p>
                  <div className="mt-4 w-full p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border dark:border-gray-800 transition-colors">
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-black mb-0.5">Total Vendido</p>
                    <p className="text-xl font-black text-[#253289] dark:text-blue-400">{formatPrice(seller.totalSold)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* LISTA DETALHADA COM DESEMPENHO INDIVIDUAL */}
            <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Target size={22} className="text-blue-500 dark:text-blue-400"/> Desempenho da Equipe</h2>
            <div className="space-y-4">
              {sellers.map(seller => {
                const metaDoVendedor = Number(seller.monthlyGoal) || 0;
                const percentualMeta = metaDoVendedor > 0 ? Math.min((seller.totalSold / metaDoVendedor) * 100, 100) : 0;
                const bateuMeta = percentualMeta >= 100 && metaDoVendedor > 0;

                return (
                  <div key={seller.sellerId} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                      
                      {/* Lado Esquerdo: Info e Barra de Meta */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-black text-lg text-gray-900 dark:text-gray-100 tracking-tight">{seller.sellerName}</h3>
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs font-black border dark:border-gray-700">{seller.salesCount} Vendas</span>
                        </div>
                        
                        {/* Barra de Progresso Individual */}
                        <div className="w-full">
                          <div className="flex justify-between text-xs font-black mb-1.5">
                            <span className="text-gray-400 dark:text-gray-500">Progresso da Meta</span>
                            <span className={bateuMeta ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}>
                              {metaDoVendedor > 0 ? `${percentualMeta.toFixed(1)}% de ${formatPrice(metaDoVendedor)}` : 'Sem meta definida'}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 dark:bg-gray-950 rounded-full overflow-hidden border dark:border-gray-800">
                            <div 
                              className={`h-full transition-all duration-1000 rounded-full ${bateuMeta ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-[#253289] dark:bg-blue-600'}`}
                              style={{ width: `${percentualMeta}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Lado Direito: Valores Financeiros e Ação de Pagamento */}
                      <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors">
                        <div>
                          <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-black mb-1 flex items-center gap-1"><AlertCircle size={12}/> Pendente</p>
                          <p className="text-xl font-black text-orange-500 dark:text-orange-400">{formatPrice(seller.pendingCommission)}</p>
                        </div>
                        <div className="h-10 w-px bg-gray-200 dark:bg-gray-800"></div>
                        <div>
                          <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-black mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> Já Pago</p>
                          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(seller.paidCommission)}</p>
                        </div>
                        
                        <button
                          onClick={() => handlePay(seller.sellerId, seller.sellerName)}
                          disabled={seller.pendingCommission <= 0 || isPaying}
                          className={`ml-4 px-6 py-3 rounded-xl font-black text-sm shadow-sm transition-all ${
                            seller.pendingCommission > 0 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 dark:shadow-none hover:scale-105 cursor-pointer' 
                              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
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