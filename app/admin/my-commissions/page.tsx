'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { DollarSign, Target, TrendingUp, Award, ArrowLeft, Receipt, Wrench, Settings } from 'lucide-react';

// 🛡️ Tipagem TypeScript
interface CommissionRecord {
  id: string;
  amount: number | string;
  status: 'PENDING' | 'PAID';
  createdAt: string;
  order?: {
    orderNumber: number | string;
    totalAmount: number | string;
  };
}

interface MetricsState {
  monthlyGoal: number;
  totalSales: number;
  pendingCommissions: number;
  paidCommissions: number;
  history: CommissionRecord[];
}

export default function MyCommissionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState<MetricsState>({
    monthlyGoal: 0,
    totalSales: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
    history: []
  });

  // 🛡️ TRAVA SAAS: Verifica se a farmácia tem o módulo ativado
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const temAcesso = isSuperAdmin || user?.moduleCommissions === true;

  useEffect(() => {
    const fetchMyMetrics = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/commissions?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Erro ao carregar comissões:", error);
      } finally {
        setLoading(false);
      }
    };

    if (temAcesso) {
      fetchMyMetrics();
    } else {
      setLoading(false); // Remove o loading se não tiver acesso, para mostrar a tela de construção
    }
  }, [user, temAcesso]);

  // 🛡️ TELA DE "EM CONSTRUÇÃO" PARA O ATENDENTE (Substitui o redirecionamento silencioso)
  if (user && !temAcesso) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 transition-colors duration-300">
          <div className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-md text-center border border-amber-100 dark:border-amber-900/30 relative overflow-hidden group">
            
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-400/10 dark:bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>

            <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
              <Settings size={100} strokeWidth={1} className="absolute text-amber-200 dark:text-amber-900/40 animate-spin" style={{ animationDuration: '4s' }} />
              <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/60 dark:to-amber-800/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 animate-bounce" style={{ animationDuration: '2.5s' }}>
                <Wrench size={28} strokeWidth={2.5} />
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Módulo em Construção</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm font-medium leading-relaxed">
              O seu painel de <span className="text-amber-600 dark:text-amber-500 font-bold">Metas e Resultados</span> está a ser preparado pela nossa equipe técnica e estará disponível em breve!
            </p>
            
            <button 
              onClick={() => router.back()}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3.5 rounded-xl font-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-all cursor-pointer shadow-lg shadow-gray-900/20 dark:shadow-white/10"
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
      <div className="min-h-screen flex items-center justify-center bg-background text-[#253289] dark:text-blue-400 font-bold transition-colors">
        Carregando suas métricas...
      </div>
    );
  }

  // Cálculos de Progresso
  const goal = Number(metrics.monthlyGoal) || 0;
  const sales = Number(metrics.totalSales) || 0;
  const progressPercentage = goal > 0 ? Math.min((sales / goal) * 100, 100) : 0;
  const isGoalReached = sales >= goal && goal > 0;

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 bg-background text-foreground min-h-screen transition-colors duration-300 pb-20">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 hover:border-[#253289] dark:hover:border-blue-500 rounded-xl shadow-sm transition-all group cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2 tracking-tight text-gray-900 dark:text-white">
                <TrendingUp size={32} className="text-[#253289] dark:text-blue-400" /> Minhas Comissões
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">Acompanhe sua performance e ganhos deste mês.</p>
            </div>
          </div>
        </div>

        {/* 🌟 PAINEL DE METAS E PROGRESSO */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 relative overflow-hidden transition-colors">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
              <div>
                <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Target size={16} /> Meta Mensal de Vendas
                </h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    {formatPrice(sales)}
                  </span>
                  <span className="text-lg text-gray-400 font-bold">
                    / {goal > 0 ? formatPrice(goal) : 'Não definida'}
                  </span>
                </div>
              </div>
              
              {isGoalReached && (
                <div className="bg-[#25D366]/10 text-[#25D366] px-4 py-2 rounded-xl font-black flex items-center gap-2 border border-[#25D366]/20 animate-in zoom-in">
                  <Award size={20} /> Meta Batida!
                </div>
              )}
            </div>

            {/* Barra de Progresso */}
            <div className="w-full">
              <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex border dark:border-gray-700">
                <div 
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${isGoalReached ? 'bg-[#25D366] shadow-[0_0_10px_rgba(37,211,102,0.5)]' : 'bg-[#253289] dark:bg-blue-500'}`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              {goal > 0 && (
                <p className="text-right text-xs font-bold text-gray-400 mt-2">{progressPercentage.toFixed(1)}% concluído</p>
              )}
            </div>
          </div>
        </div>

        {/* CARDS DE RESUMO FINANCEIRO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-4 transition-colors">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/50 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <DollarSign size={28} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">A Receber (Pendente)</p>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{formatPrice(metrics.pendingCommissions)}</p>
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4 transition-colors">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Receipt size={28} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Já Pago (Liquidado)</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{formatPrice(metrics.paidCommissions)}</p>
            </div>
          </div>
        </div>

        {/* HISTÓRICO DE VENDAS RECENTES */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-black text-lg text-gray-900 dark:text-white tracking-tight">Suas Vendas Recentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-950 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="p-4 pl-6">Nº Pedido</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Valor da Venda</th>
                  <th className="p-4">Sua Comissão</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {metrics.history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 font-medium italic">
                      Nenhuma venda registrada neste mês.
                    </td>
                  </tr>
                ) : (
                  metrics.history.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-4 pl-6 font-bold text-gray-900 dark:text-gray-100">
                        #{record.order?.orderNumber || '---'}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        {new Date(record.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 font-medium text-gray-600 dark:text-gray-300">
                        {formatPrice(Number(record.order?.totalAmount || 0))}
                      </td>
                      <td className="p-4 font-black text-[#253289] dark:text-blue-400">
                        +{formatPrice(Number(record.amount))}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          record.status === 'PAID' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40' 
                            : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
                        }`}>
                          {record.status === 'PAID' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}