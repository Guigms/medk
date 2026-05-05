'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  TrendingUp, PieChart, RefreshCw, BarChart3, 
  ChevronRight, AlertTriangle, Target, Info, 
  FileText
} from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <header className="mb-8">
          <Link href="/admin/dashboard" className="text-[#253289] hover:underline text-sm font-bold flex items-center gap-1 mb-2">
            ← Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Central de Relatórios</h1>
          <p className="text-gray-500">Dados fundamentais para o crescimento da Medk.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. MARGEM DE LUCRO */}
          <ReportCard 
            title="Margem de Lucro"
            description="Visualize o lucro real por produto comparando custos e vendas."
            icon={<PieChart className="text-red-600" />}
            href="/admin/reports/margin"
            fields={['Custo', 'Preço Venda', 'Margem %', 'Margem R$']}
          />

          {/* 2. GIRO DE ESTOQUE */}
          <ReportCard 
            title="Giro de Estoque"
            description="Entenda o ritmo de saída dos produtos e classifique sua demanda."
            icon={<RefreshCw className="text-blue-600" />}
            href="/admin/reports/turnover"
            fields={['Qtd. Estoque', 'Qtd. Vendida', 'Dias de Giro', 'Classificação']}
          />

          {/* 3. CURVA ABC */}
          <ReportCard 
            title="Curva ABC"
            description="Descubra quais 20% de seus produtos geram 80% do seu faturamento."
            icon={<Target className="text-amber-600" />}
            href="/admin/reports/abc-curve"
            fields={['Classe A (80%)', 'Classe B (15%)', 'Classe C (5%)']}
          />

          {/* 4. ANALYTICS GERAL */}
          <ReportCard 
            title="Inteligência Geral"
            description="Visão completa de faturamento, ticket médio e evolução diária."
            icon={<BarChart3 className="text-emerald-600" />}
            href="/admin/reports/analytics"
            fields={['Ticket Médio', 'Evolução Vendas', 'Top Produtos']}
          />
          <ReportCard 
            title="Entrada de NF-e"
            description="Histórico completo de notas fiscais importadas via XML (Prevenção de duplicidade)."
            icon={<FileText className="text-indigo-600" />}
            href="/admin/reports/nfe"
            fields={['Fornecedor', 'Nº da Nota', 'Valor Total', 'Data da Importação']}
          />

        </div>
      </div>
    </ProtectedRoute>
  );
}

// Repare nas classes adicionadas aqui na primeira linha (border-2 border-gray-200 hover:border-[#253289])
function ReportCard({ title, description, icon, href, fields }: any) {
  return (
    <Link href={href} className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-sm hover:border-[#253289] hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-[#253289] group-hover:text-white transition-all border border-transparent">
          {icon}
        </div>
      </div>
      
      <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 flex-1 leading-relaxed">{description}</p>
      
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Indicadores principais:</p>
        <div className="flex flex-wrap gap-2">
          {fields.map((f: string, i: number) => (
            <span key={i} className="text-[11px] font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
              {f}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-1 text-sm font-black text-[#253289] opacity-0 group-hover:opacity-100 transition-opacity">
        Acessar relatório <ChevronRight size={16} />
      </div>
    </Link>
  );
}