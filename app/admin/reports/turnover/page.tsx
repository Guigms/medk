'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 🌟 Importado para navegação
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { Search, RefreshCw, Zap, Clock, PackageX, ArrowLeft } from 'lucide-react';

export default function GiroEstoquePage() {
  const router = useRouter(); // 🌟 Inicializado
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/reports/turnover')
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
        Calculando velocidade de estoque...
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
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Giro de Estoque</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Baseado nas saídas reais dos últimos 30 dias.</p>
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

        {/* TABELA DE VELOCIDADE DE ESTOQUE */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 border-b-2 border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">Produto</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Em Estoque</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Vendidos (30d)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Previsão (Dias)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Classificação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{item.category}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-gray-900 dark:text-white">
                      {item.stock} <span className="text-xs font-normal text-gray-400 dark:text-gray-500">un</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#253289] dark:text-blue-400">
                      {item.soldQuantity} <span className="text-xs font-normal text-gray-400 dark:text-gray-500">un</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.classification === 'Sem saída' ? (
                        <span className="text-gray-400 dark:text-gray-500 font-medium">-</span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className={`font-black ${item.turnoverDays <= 15 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                            {item.turnoverDays} dias
                          </span>
                          {item.turnoverDays <= 15 && item.stock > 0 && (
                            <span className="text-[9px] uppercase font-black text-red-500 dark:text-red-400 tracking-tight mt-0.5 animate-pulse">Risco de Ruptura</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg font-black text-xs border-2 flex items-center justify-center gap-1 w-max mx-auto transition-colors ${
                        item.classification === 'Alto giro' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 
                        item.classification === 'Médio giro' ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-400' : 
                        item.classification === 'Baixo giro' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400' :
                        'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                      }`}>
                        {item.classification === 'Alto giro' && <Zap size={12}/>}
                        {item.classification === 'Médio giro' && <RefreshCw size={12}/>}
                        {item.classification === 'Baixo giro' && <Clock size={12}/>}
                        {item.classification === 'Sem saída' && <PackageX size={12}/>}
                        {item.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length === 0 && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium italic">
              Nenhum produto encontrado nesta análise.
            </div>
          )}
        </div>

        {/* LEGENDA ESTRATÉGICA ADAPTADA */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-3 transition-colors">
            <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-sm"><Zap size={20}/></div>
            <p className="text-xs text-emerald-800 dark:text-emerald-400 font-black uppercase tracking-wider">Alto Giro: Estoque acaba em ≤ 15 dias</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-center gap-3 transition-colors">
            <div className="p-2 bg-blue-500 text-white rounded-lg shadow-sm"><RefreshCw size={20}/></div>
            <p className="text-xs text-blue-800 dark:text-blue-400 font-black uppercase tracking-wider">Médio Giro: Estoque dura 16 a 45 dias</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center gap-3 transition-colors">
            <div className="p-2 bg-amber-500 text-white rounded-lg shadow-sm"><Clock size={20}/></div>
            <p className="text-xs text-amber-800 dark:text-amber-400 font-black uppercase tracking-wider">Baixo Giro: Estoque dura + de 45 dias</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl flex items-center gap-3 transition-colors">
            <div className="p-2 bg-gray-400 text-white rounded-lg shadow-sm"><PackageX size={20}/></div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-black uppercase tracking-wider">Sem Saída: Nenhuma venda em 30 dias</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}