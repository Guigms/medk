'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { Search, AlertCircle, TrendingDown, TrendingUp, Filter, ArrowLeft } from 'lucide-react';

export default function MargemLucroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/reports/margin')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const filteredData = data.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-bold text-[#253289] dark:text-blue-400">
        Calculando margens...
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
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Margem de Lucro</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Análise de rentabilidade por produto</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Buscar produto..."
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-[#253289] dark:focus:border-blue-500 text-gray-900 dark:text-white outline-none w-full md:w-80 transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {/* TABELA DE RENTABILIDADE */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 border-b-2 border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Produto</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Custo (NF-e)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Venda</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Margem (R$)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Margem (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{item.category}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-600 dark:text-gray-300">
                      {item.cost > 0 ? formatPrice(item.cost) : <span className="text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1"><AlertCircle size={14}/> Sem lote</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                      {formatPrice(item.price)}
                    </td>
                    <td className={`px-6 py-4 text-center font-bold ${item.marginReal > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatPrice(item.marginReal)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg font-black text-xs border-2 flex items-center justify-center w-max mx-auto ${
                        item.marginPercent > 30 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 
                        item.marginPercent > 15 ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-400' : 
                        'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400'
                      }`}>
                        {item.marginPercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium italic">
              Nenhum produto encontrado para esta análise.
            </div>
          )}
        </div>

        {/* LEGENDA ESTRATÉGICA ADAPTADA */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3 transition-colors">
            <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-sm"><TrendingUp size={20}/></div>
            <p className="text-xs text-emerald-800 dark:text-emerald-400 font-black uppercase tracking-wider">Saudável: Acima de 30%</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-center gap-3 transition-colors">
            <div className="p-2 bg-blue-500 text-white rounded-lg shadow-sm"><Filter size={20}/></div>
            <p className="text-xs text-blue-800 dark:text-blue-400 font-black uppercase tracking-wider">Atenção: Entre 15% e 30%</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 transition-colors">
            <div className="p-2 bg-red-500 text-white rounded-lg shadow-sm"><TrendingDown size={20}/></div>
            <p className="text-xs text-red-800 dark:text-red-400 font-black uppercase tracking-wider">Crítico: Abaixo de 15%</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}