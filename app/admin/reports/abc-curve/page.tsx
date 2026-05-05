'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { Search, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// 🌟 NOVA PALETA: Cores contrastantes e elegantes para facilitar a distinção visual
const CHART_COLORS = [
  '#253289', // Azul Escuro (Marca)
  '#059669', // Verde Esmeralda
  '#D97706', // Laranja Ouro
  '#E11D48', // Vermelho Coral
  '#6D28D9', // Roxo Profundo
  '#0284C7', // Azul Ciano
  '#BE185D', // Rosa Magenta
  '#0F766E', // Verde Petróleo (Teal)
  '#C2410C', // Laranja Queimado
  '#475569', // Azul Metálico (Slate)
];
const COLOR_OTHERS = '#D1D5DB'; // Cinza claro para "Outros Produtos"

export default function CurvaAbcPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/reports/abc-curve')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // Lógica inteligente: Pega o Top 10 Produtos, e agrupa o resto em "Outros"
  const MAX_ITEMS = 10;
  let chartData: any[] = [];

  if (filteredData.length > 0) {
    const topProducts = filteredData.slice(0, MAX_ITEMS);
    const otherRevenue = filteredData.slice(MAX_ITEMS).reduce((sum, item) => sum + item.revenue, 0);

    chartData = topProducts.map(item => ({
      name: item.name,
      value: item.revenue
    }));

    if (otherRevenue > 0) {
      chartData.push({
        name: 'Outros Produtos',
        value: otherRevenue
      });
    }
  }

  // Custom Tooltip para o Gráfico ficar elegante
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl text-sm border border-gray-700 max-w-[250px]">
          <p className="font-bold mb-1 line-clamp-2">{payload[0].name}</p>
          <p className="text-[#10BCEC] font-black">{formatPrice(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="p-8 text-center font-bold text-[#253289]">Processando histórico de faturamento...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Link href="/admin/reports" className="text-[#253289] hover:underline text-sm font-bold flex items-center gap-1 mb-2">
              ← Voltar para Relatórios
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Curva ABC</h1>
            <p className="text-gray-500 text-sm">Classificação de faturamento dos últimos 90 dias.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar produto..."
              className="pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-[#253289] outline-none w-full transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* DASHBOARD VISUAL (Gráfico + Cartões) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Gráfico de Produtos */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border-2 border-gray-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Top Faturamento</h2>
            </div>
            <div className="flex-1 min-h-[220px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === 'Outros Produtos' ? COLOR_OTHERS : CHART_COLORS[index % CHART_COLORS.length]} 
                          stroke="none" 
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 font-medium text-sm">
                  Sem dados para o gráfico.
                </div>
              )}
            </div>
          </div>

          {/* Legenda Estratégica */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-emerald-50 border-2 border-emerald-100 rounded-3xl flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3 text-emerald-800 font-black">
                <Target size={20} /> Classe A (80%)
              </div>
              <p className="text-sm text-emerald-700 font-medium leading-relaxed">
                Seus "carros-chefes". Representam a maior parte do lucro. <strong className="font-bold">Atenção:</strong> O estoque não pode zerar (Risco de Ruptura grave).
              </p>
            </div>
            
            <div className="p-5 bg-blue-50 border-2 border-blue-100 rounded-3xl flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3 text-blue-800 font-black">
                <TrendingUp size={20} /> Classe B (15%)
              </div>
              <p className="text-sm text-blue-700 font-medium leading-relaxed">
                Impacto mediano no caixa. Mantenha um estoque regulador e acompanhe para evitar que caiam para a Classe C.
              </p>
            </div>

            <div className="p-5 bg-gray-50 border-2 border-gray-200 rounded-3xl flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3 text-gray-700 font-black">
                <AlertCircle size={20} /> Classe C (5%)
              </div>
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                Trazem pouquíssimo dinheiro. Compre apenas sob demanda e evite empatar capital nestes produtos.
              </p>
            </div>
          </div>
        </div>

        {/* TABELA DE PRODUTOS */}
        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest">Produto</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Faturamento</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Participação (%)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">% Acumulada</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Classe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 font-medium">Estoque: {item.stock} un | Vendidos: {item.soldQuantity} un</p>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-[#253289]">
                      {formatPrice(item.revenue)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-600">
                      {item.itemPercent.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-400">
                      {item.cumulativePercent.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-4 py-1.5 rounded-lg font-black text-sm border-2 inline-flex items-center justify-center gap-1 min-w-[100px] ${
                        item.classification === 'A' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                        item.classification === 'B' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                        'bg-gray-50 border-gray-200 text-gray-500'
                      }`}>
                        Classe {item.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length === 0 && (
            <div className="p-12 text-center text-gray-500 font-medium">
              Nenhum dado de venda encontrado.
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}