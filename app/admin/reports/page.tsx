'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, BarChart3, TrendingUp, Percent, ArrowDownUp, FileSpreadsheet, Calendar } from 'lucide-react';

export default function CentralRelatoriosPage() {
  const router = useRouter();
  const { user } = useAuth();

  // 🛡️ Validação da Chave Mestre (SuperAdmin ignora os bloqueios da loja)
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || isSuperAdmin;

  // ⚡ Regras de visibilidade atualizadas com o novo padrão e nomes corretos
  const showMargem = isSuperAdmin || user?.moduleMargin === true;
  const showGiro = isSuperAdmin || user?.moduleTurnover === true;
  const showCurvaABC = isSuperAdmin || user?.moduleAbcCurve === true;
  
  // 🎯 CORREÇÃO: Agora escuta a flag moduleNfeReport correta!
  const showNF = isSuperAdmin || user?.moduleNfeReport === true; 
  
  const showSazonal = isSuperAdmin || user?.moduleSeasonality === true;

  // Expulsa usuários que não sejam administradores
  if (!user || !isAdmin) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 transition-colors duration-300">
        
        {/* CABEÇALHO */}
        <header className="mb-8 flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Central de Relatórios</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Selecione uma análise detalhada do sistema</p>
          </div>
        </header>

        {/* GRADE DE RELATÓRIOS CONDICIONAIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 📊 1. INTELIGÊNCIA GERAL (Sempre visível para o Admin) */}
          <CardRelatorio 
            href="/admin/reports/analytics"
            title="Inteligência Geral"
            description="Visão macro do faturamento, ticket médio e fluxo operacional da loja."
            icon={<BarChart3 className="text-blue-600" />}
          />

          {/* 💰 2. MARGEM DE LUCRO (Condicional) */}
          {showMargem && (
            <CardRelatorio 
              href="/admin/reports/margin"
              title="Margem de Lucro"
              description="Análise detalhada do custo de aquisição versus preço de venda por item."
              icon={<Percent className="text-emerald-600" />}
            />
          )}

          {/* 🔄 3. GIRO DE ESTOQUE (Condicional) */}
          {showGiro && (
            <CardRelatorio 
              href="/admin/reports/turnover"
              title="Giro de Estoque"
              description="Previsão de duração do estoque e alertas de ruptura iminente."
              icon={<ArrowDownUp className="text-purple-600" />}
            />
          )}

          {/* 📈 4. CURVA ABC (Condicional) */}
          {showCurvaABC && (
            <CardRelatorio 
              href="/admin/reports/abc-curve"
              title="Curva ABC de Vendas"
              description="Identificação dos produtos que representam a maior fatia do faturamento."
              icon={<TrendingUp className="text-amber-600" />}
            />
          )}

          {/* 📝 5. ENTRADA DE NF (Condicional) */}
          {showNF && (
            <CardRelatorio 
              href="/admin/reports/nfe"
              title="Auditoria de Notas Fiscais"
              description="Histórico de custos de fornecedores através do upload de arquivos XML."
              icon={<FileSpreadsheet className="text-indigo-600" />}
            />
          )}

          {/* 📅 6. SAZONALIDADE (Condicional) */}
          {showSazonal && (
            <CardRelatorio 
              href="/admin/reports/seasonality"
              title="Sazonalidade e Horários"
              description="Mapas de calor indicando os picos de demanda em períodos específicos."
              icon={<Calendar className="text-pink-600" />}
            />
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}

// Componente auxiliar de Card para manter o código limpo
function CardRelatorio({ href, title, description, icon }: any) {
  return (
    <Link href={href} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between min-h-[160px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:scale-105 transition-transform">
            {icon}
          </div>
        </div>
        <h3 className="font-black text-gray-900 dark:text-white text-lg tracking-tight group-hover:text-[#253289] dark:group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 font-medium leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}