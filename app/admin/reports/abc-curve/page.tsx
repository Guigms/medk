'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { Search, Target, TrendingUp, AlertCircle, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// 🌟 PALETA ADAPTADA: Tons vibrantes e equilibrados para alto contraste em modo claro e escuro
const CHART_COLORS = [
  '#3b82f6', // Azul Dinâmico
  '#10b981', // Verde Esmeralda
  '#f59e0b', // Âmbar / Ouro
  '#f43f5e', // Rosa Coral
  '#8b5cf6', // Roxo Violeta
  '#06b6d4', // Ciano Sky
  '#ec4899', // Pink Profundo
  '#14b8a6', // Teal
  '#f97316', // Laranja Vivo
  '#64748b', // Slate / Chumbo
];
const COLOR_OTHERS_LIGHT = '#D1D5DB'; // Cinza claro para o modo claro
const COLOR_OTHERS_DARK = '#4b5563';  // Cinza chumbo para o modo escuro

export default function CurvaAbcPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetch('/api/admin/reports/abc-curve')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });

    // Monitora se a classe dark está ativa na tag html para atualizar o gráfico
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

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

  // Custom Tooltip adaptado com visual Dark Mode nativo
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 dark:bg-black text-white p-3 rounded-xl shadow-xl text-sm border border-gray-700 dark:border-gray-800 max-w-[250px]">
          <p className="font-bold mb-1 line-clamp-2">{payload[0].name}</p>
          <p className="text-[#10BCEC] dark:text-blue-400 font-black">{formatPrice(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-bold text-[#253289] dark:text-blue-400">
        Processando histórico de faturamento...
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8 transition-colors duration-300">
        
        {/* CABEÇALHO PADRONIZADO COM BOTÃO DE VOLTAR */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 hover:border-[#253289] dark:hover:border-blue-500 rounded-xl shadow-sm transition-all group cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Curva ABC</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Classificação de faturamento dos últimos 90 dias.</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar produto..."
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-[#253289] dark:focus:border-blue-500 text-gray-900 dark:text-white outline-none w-full transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* DASHBOARD VISUAL (Gráfico + Cartões) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Gráfico de Rosca */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-3xl border-2 border-gray-200 dark:border-gray-800 shadow-sm flex flex-col transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Top Faturamento</h2>
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
                          fill={entry.name === 'Outros Produtos' ? (isDarkMode ? COLOR_OTHERS_DARK : COLOR_OTHERS_LIGHT) : CHART_COLORS[index % CHART_COLORS.length]} 
                          stroke="none" 
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 font-medium text-sm italic">
                  Sem dados para o gráfico.
                </div>
              )}
            </div>
          </div>

          {/* Legenda Estratégica Adaptada */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-3xl flex flex-col justify-center shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-3 text-emerald-800 dark:text-emerald-400 font-black uppercase text-xs tracking-wider">
                <Target size={20} /> Classe A (80%)
              </div>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                Seus "carros-chefes". Representam a maior parte do lucro. <strong className="font-black">Atenção:</strong> O estoque não pode zerar.
              </p>
            </div>
            
            <div className="p-5 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-100 dark:border-blue-900/30 rounded-3xl flex flex-col justify-center shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-3 text-blue-800 dark:text-blue-400 font-black uppercase text-xs tracking-wider">
                <TrendingUp size={20} /> Classe B (15%)
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                Impacto mediano no caixa. Mantenha um estoque regulador para evitar que caiam para a Classe C.
              </p>
            </div>

            <div className="p-5 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-3xl flex flex-col justify-center shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-400 font-black uppercase text-xs tracking-wider">
                <AlertCircle size={20} /> Classe C (5%)
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                Trazem pouquíssimo dinheiro. Compre apenas sob demanda e evite empatar capital aqui.
              </p>
            </div>
          </div>
        </div>

        {/* TABELA DE PRODUTOS DA CURVA */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 border-b-2 border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Produto</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Faturamento</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Participação (%)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">% Acumulada</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Classe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Estoque: {item.stock} un | Vendidos: {item.soldQuantity} un</p>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-[#253289] dark:text-blue-400">
                      {formatPrice(item.revenue)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-600 dark:text-gray-300">
                      {item.itemPercent.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-400 dark:text-gray-500">
                      {item.cumulativePercent.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-4 py-1.5 rounded-lg font-black text-xs border-2 inline-flex items-center justify-center gap-1 min-w-[100px] transition-colors ${
                        item.classification === 'A' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 
                        item.classification === 'B' ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-400' : 
                        'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
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
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium italic">
              Nenhum dado de venda encontrado para a Curva ABC.
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}