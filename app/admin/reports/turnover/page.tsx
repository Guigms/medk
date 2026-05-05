'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Search, RefreshCw, AlertTriangle, Zap, Clock, PackageX } from 'lucide-react';

export default function GiroEstoquePage() {
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

  if (loading) return <div className="p-8 text-center font-bold text-[#253289]">Calculando velocidade de estoque...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/admin/reports" className="text-[#253289] hover:underline text-sm font-bold flex items-center gap-1 mb-2">
              ← Voltar para Relatórios
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Giro de Estoque</h1>
            <p className="text-gray-500 text-sm">Baseado nas saídas reais dos últimos 30 dias.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar produto..."
              className="pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:border-[#253289] outline-none w-full md:w-80 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest">Produto</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Em Estoque</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Vendidos (30d)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Previsão (Dias)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Classificação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 uppercase font-medium">{item.category}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-gray-900">
                      {item.stock} <span className="text-xs font-normal text-gray-400">un</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#253289]">
                      {item.soldQuantity} <span className="text-xs font-normal text-gray-400">un</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.classification === 'Sem saída' ? (
                        <span className="text-gray-400 font-medium">-</span>
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className={`font-black ${item.turnoverDays <= 15 ? 'text-red-600' : 'text-gray-900'}`}>
                            {item.turnoverDays} dias
                          </span>
                          {item.turnoverDays <= 15 && item.stock > 0 && (
                            <span className="text-[9px] uppercase font-bold text-red-500">Risco de Ruptura</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg font-black text-xs border-2 flex items-center justify-center gap-1 w-max mx-auto ${
                        item.classification === 'Alto giro' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                        item.classification === 'Médio giro' ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                        item.classification === 'Baixo giro' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-gray-50 border-gray-200 text-gray-500'
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
            <div className="p-12 text-center text-gray-500 font-medium">
              Nenhum produto encontrado.
            </div>
          )}
        </div>

        {/* Legenda Estratégica */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-lg"><Zap size={20}/></div>
            <p className="text-xs text-emerald-800 font-bold">Alto Giro: Estoque acaba em ≤ 15 dias</p>
          </div>
          <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg"><RefreshCw size={20}/></div>
            <p className="text-xs text-blue-800 font-bold">Médio Giro: Estoque dura 16 a 45 dias</p>
          </div>
          <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-white rounded-lg"><Clock size={20}/></div>
            <p className="text-xs text-amber-800 font-bold">Baixo Giro: Estoque dura + de 45 dias</p>
          </div>
          <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-gray-400 text-white rounded-lg"><PackageX size={20}/></div>
            <p className="text-xs text-gray-600 font-bold">Sem Saída: Nenhuma venda em 30 dias</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}