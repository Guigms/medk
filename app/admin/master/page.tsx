'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  ShieldCheck, ToggleLeft, ToggleRight, FileText, 
  Percent, ArrowLeft, Loader2, RefreshCw, BarChart3, LineChart, CalendarDays, CheckCircle
} from 'lucide-react';

type ModuleKeys = 'moduleCommissions' | 'moduleNfeReport' | 'moduleMargin' | 'moduleAbcCurve' | 'moduleTurnover' | 'moduleSeasonality';

export default function MasterControlPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  const [config, setConfig] = useState({
    id: '',
    moduleCommissions: false,
    moduleNfeReport: false,
    moduleMargin: false,
    moduleAbcCurve: false,
    moduleTurnover: false,
    moduleSeasonality: false
  });

  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/store-config');
      if (res.ok) setConfig(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !isSuperAdmin) {
      router.replace('/admin/dashboard');
    } else if (isSuperAdmin) {
      fetchConfig();
    }
  }, [user, isSuperAdmin, router]);

  const handleToggleModule = async (moduleKey: ModuleKeys, currentValue: boolean) => {
    if (isUpdating) return;
    setIsUpdating(moduleKey);
    
    const updatedValue = !currentValue;
    
    // ⚡ CORREÇÃO: Pacote completo mantendo as configurações atuais e atualizando apenas a clicada
    const payloadCompleto = {
      ...config,
      [moduleKey]: updatedValue
    };
    
    try {
      const res = await fetch('/api/admin/store-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRole: user?.role,
          configId: config.id,
          ...payloadCompleto // Envia todas as chaves juntas
        })
      });

      if (res.ok) {
        setConfig(payloadCompleto); // Atualiza a tela com o pacote completo
      } else {
        alert('Falha ao aplicar licença no servidor.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Conta quantas licenças adicionais estão ligadas
  const activeLicensesCount = Object.entries(config).filter(([key, value]) => key.startsWith('module') && value === true).length;

  if (!user || !isSuperAdmin) return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-950 text-blue-400 font-black tracking-widest uppercase">Acessando Central Master...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#090d22] text-white p-4 md:p-8 pb-20 selection:bg-blue-500 selection:text-white transition-colors duration-300">
        
        {/* TOPBAR FLUTUANTE */}
        <header className="max-w-5xl mx-auto flex items-center justify-between mb-12 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-4">
            <button onClick={() => router.replace('/admin/dashboard')} className="p-2 bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight flex items-center gap-2">Painel de Licenciamento</h1>
                <p className="text-[10px] font-black text-blue-400 tracking-widest uppercase mt-0.5">Controle de Módulos GMSolution</p>
              </div>
            </div>
          </div>
          <button onClick={fetchConfig} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer" title="Sincronizar Dados">
            <RefreshCw size={18} className={isUpdating ? 'animate-spin text-blue-400' : 'text-gray-400'} />
          </button>
        </header>

        <main className="max-w-5xl mx-auto space-y-10">
          
          {/* CARDS INFORMATIVOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
              <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Recursos Base</p>
              <p className="text-sm font-bold mt-2 text-gray-300 flex items-center gap-1.5"><CheckCircle size={16} className="text-emerald-500" /> Importador de XML Nativo</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
              <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Módulos Premium Ativos</p>
              <p className="text-3xl font-black mt-1 text-emerald-400">{activeLicensesCount < 10 ? `0${activeLicensesCount}` : activeLicensesCount} <span className="text-xs text-gray-500 font-medium">de 06</span></p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl sm:col-span-2 md:col-span-1">
              <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Ambiente do Cliente</p>
              <p className="text-3xl font-black mt-1 text-blue-400 tracking-tight">Produção</p>
            </div>
          </div>

          {/* SESSÃO 1: OPERACIONAL E COMISSÕES */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
            <h2 className="text-lg font-black tracking-tight mb-2 text-gray-400 uppercase tracking-wider">Gestão de Equipe e Operações</h2>
            <p className="text-sm text-gray-500 font-medium mb-10">Recursos comerciais e de acompanhamento de funcionários.</p>

            <div className="divide-y divide-white/5 space-y-6">
              
              <div className="flex items-center justify-between pt-6 first:pt-0 gap-6">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl border transition-colors ${config.moduleCommissions ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                    <Percent size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg flex items-center gap-2">Telas de Comissões e Metas Mensais</h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Libera o progresso de metas do vendedor e o relatório de pagamentos pendentes do admin.</p>
                  </div>
                </div>
                <ToggleSwitch active={config.moduleCommissions} loading={isUpdating === 'moduleCommissions'} onClick={() => handleToggleModule('moduleCommissions', config.moduleCommissions)} />
              </div>

            </div>
          </div>

          {/* SESSÃO 2: RELATÓRIOS E INTELIGÊNCIA */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
            <h2 className="text-lg font-black tracking-tight mb-2 text-amber-400/80 uppercase tracking-wider">Módulos de Inteligência (BI e Fiscal)</h2>
            <p className="text-sm text-gray-500 font-medium mb-10">Ative ou revogue relatórios estratégicos e painéis de auditoria.</p>

            <div className="divide-y divide-white/5 space-y-6">
              
              <div className="flex items-center justify-between pt-6 first:pt-0 gap-6">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl border transition-colors ${config.moduleNfeReport ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg flex items-center gap-2">Relatório de Notas Fiscais (NF-e)</h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Histórico estruturado de notas emitidas, canceladas e pendentes de envio.</p>
                  </div>
                </div>
                <ToggleSwitch active={config.moduleNfeReport} loading={isUpdating === 'moduleNfeReport'} onClick={() => handleToggleModule('moduleNfeReport', config.moduleNfeReport)} />
              </div>

              <div className="flex items-center justify-between pt-6 gap-6">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl border transition-colors ${config.moduleMargin ? 'bg-amber-600/10 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                    <LineChart size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg flex items-center gap-2">Relatório de Margem de Lucro Real</h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Análise detalhada de lucratividade líquida e precificação baseada em Markup.</p>
                  </div>
                </div>
                <ToggleSwitch active={config.moduleMargin} loading={isUpdating === 'moduleMargin'} onClick={() => handleToggleModule('moduleMargin', config.moduleMargin)} />
              </div>

              <div className="flex items-center justify-between pt-6 gap-6">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl border transition-colors ${config.moduleAbcCurve ? 'bg-purple-600/10 border-purple-500/30 text-purple-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg flex items-center gap-2">Relatório de Curva ABC de Produtos</h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Classificação inteligente dos medicamentos cruciais para o faturamento (A, B e C).</p>
                  </div>
                </div>
                <ToggleSwitch active={config.moduleAbcCurve} loading={isUpdating === 'moduleAbcCurve'} onClick={() => handleToggleModule('moduleAbcCurve', config.moduleAbcCurve)} />
              </div>

              <div className="flex items-center justify-between pt-6 gap-6">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl border transition-colors ${config.moduleTurnover ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                    <RefreshCw size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg flex items-center gap-2">Relatório de Giro de Estoque</h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Cálculo de CMV e previsão de tempo para esgotamento de mercadorias.</p>
                  </div>
                </div>
                <ToggleSwitch active={config.moduleTurnover} loading={isUpdating === 'moduleTurnover'} onClick={() => handleToggleModule('moduleTurnover', config.moduleTurnover)} />
              </div>

              <div className="flex items-center justify-between pt-6 gap-6">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl border transition-colors ${config.moduleSeasonality ? 'bg-cyan-600/10 border-cyan-500/30 text-cyan-400' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg flex items-center gap-2">Análise de Sazonalidade</h3>
                    <p className="text-sm text-gray-400 font-medium mt-1">Identificação de picos sazonais de venda de remédios ao longo do ano.</p>
                  </div>
                </div>
                <ToggleSwitch active={config.moduleSeasonality} loading={isUpdating === 'moduleSeasonality'} onClick={() => handleToggleModule('moduleSeasonality', config.moduleSeasonality)} />
              </div>

            </div>
          </div>
        </main>

      </div>
    </ProtectedRoute>
  );
}

// 🎛️ Componente Auxiliar (Botão On/Off)
function ToggleSwitch({ active, loading, onClick }: { active: boolean; loading: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
    >
      {loading ? (
        <Loader2 size={36} className="animate-spin text-blue-500" />
      ) : active ? (
        <ToggleRight size={44} className="text-emerald-500" strokeWidth={1.5} />
      ) : (
        <ToggleLeft size={44} className="text-gray-600" strokeWidth={1.5} />
      )}
    </button>
  );
}