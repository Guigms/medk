'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { Search, AlertCircle, TrendingDown, TrendingUp, Filter } from 'lucide-react';

export default function MargemLucroPage() {
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

  if (loading) return <div className="p-8 text-center font-bold text-[#253289]">Calculando margens...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/admin/reports" className="text-[#253289] hover:underline text-sm font-bold flex items-center gap-1 mb-2">
              ← Voltar para Relatórios
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Relatório de Margem de Lucro</h1>
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
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Custo (NF-e)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Venda</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Margem (R$)</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Margem (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 uppercase font-medium">{item.category}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-600">
                      {item.cost > 0 ? formatPrice(item.cost) : <span className="text-amber-500 flex items-center justify-center gap-1"><AlertCircle size={14}/> Sem lote</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900">
                      {formatPrice(item.price)}
                    </td>
                    <td className={`px-6 py-4 text-center font-bold ${item.marginReal > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatPrice(item.marginReal)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg font-black text-xs border-2 ${
                        item.marginPercent > 30 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                        item.marginPercent > 15 ? 'bg-blue-50 border-blue-200 text-blue-700' : 
                        'bg-red-50 border-red-200 text-red-700'
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
            <div className="p-12 text-center text-gray-500 font-medium">
              Nenhum produto encontrado para esta análise.
            </div>
          )}
        </div>

        {/* Legenda Estratégica */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-lg"><TrendingUp size={20}/></div>
            <p className="text-xs text-emerald-800 font-bold">Saudável: Acima de 30%</p>
          </div>
          <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-blue-500 text-white rounded-lg"><Filter size={20}/></div>
            <p className="text-xs text-blue-800 font-bold">Atenção: Entre 15% e 30%</p>
          </div>
          <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-red-500 text-white rounded-lg"><TrendingDown size={20}/></div>
            <p className="text-xs text-red-800 font-bold">Crítico: Abaixo de 15%</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}