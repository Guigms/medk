'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { Search, ThermometerSun, CalendarDays, ArrowLeft } from 'lucide-react';

export default function SazonalidadePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/reports/seasonality')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.peakMonth.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-bold text-[#253289] dark:text-blue-400">
        Analisando histórico de 12 meses...
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
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Análise de Sazonalidade</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Descubra os picos de vendas dos produtos (Últimos 12 meses).</p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar produto ou mês (ex: Fev/2026)..."
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-[#253289] dark:focus:border-blue-500 text-gray-900 dark:text-white outline-none w-full transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* DASHBOARD VISUAL RÁPIDO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="p-5 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-100 dark:border-orange-900/30 rounded-3xl flex flex-col justify-center shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-3 text-orange-800 dark:text-orange-400 font-black uppercase text-xs tracking-wider">
                <ThermometerSun size={20} /> Fator de Sazonalidade
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-400 font-medium leading-relaxed">
                Quanto maior a <strong className="font-bold">Barra de Pico</strong>, mais sazonal é o produto. Produtos muito sazonais vendem quase todo o seu estoque em apenas 1 ou 2 meses específicos do ano.
              </p>
            </div>
            
            <div className="p-5 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-100 dark:border-blue-900/30 rounded-3xl flex flex-col justify-center shadow-sm transition-colors">
              <div className="flex items-center gap-2 mb-3 text-blue-800 dark:text-blue-400 font-black uppercase text-xs tracking-wider">
                <CalendarDays size={20} /> Previsão de Compras
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                Use a coluna <strong className="font-bold">Mês de Pico</strong> para antecipar os seus pedidos junto dos fornecedores, evitando ruptura quando a procura disparar.
              </p>
            </div>
        </div>

        {/* TABELA DE PRODUTOS SANEADA */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 border-b-2 border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Produto</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Total (12m)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Média / Mês</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-[#253289] dark:text-blue-400 tracking-widest text-center bg-blue-50/50 dark:bg-gray-950/40">Mês de Pico</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-[#253289] dark:text-blue-400 tracking-widest text-center bg-blue-50/50 dark:bg-gray-950/40">Qtd. no Pico</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Intensidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{item.category}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-600 dark:text-gray-300">
                      {item.totalSold} un
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-500 dark:text-gray-400">
                      {item.averageMonthly.toFixed(1)} un
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50/20 dark:bg-blue-950/10">
                      <span className="font-black text-[#253289] dark:text-blue-400 bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-gray-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                        {item.peakMonth}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-gray-800 dark:text-gray-200 bg-blue-50/20 dark:bg-blue-950/10">
                      {item.peakQuantity} un
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden flex shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${item.seasonalityFactor > 4 ? 'bg-orange-500' : item.seasonalityFactor > 2 ? 'bg-blue-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min((item.seasonalityFactor / 5) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 min-w-[40px]">
                          {item.seasonalityFactor > 4 ? 'Alta' : item.seasonalityFactor > 2 ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium italic">
              Nenhum dado de venda com histórico suficiente encontrado.
            </div>
          )}
        </div>

      </div>
    </ProtectedRoute>
  );
}