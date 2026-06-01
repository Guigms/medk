'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { FileText, Calendar, Building2, CheckCircle2, ChevronRight, ChevronDown, PackageCheck, ArrowLeft } from 'lucide-react';

export default function RelatorioNfePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  
  // Controla qual Nota Fiscal está expandida
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/reports/nfe')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prevId => (prevId === id ? null : id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-bold text-[#253289] dark:text-blue-400">
        A carregar histórico de notas...
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8 transition-colors duration-300">
        
        {/* CABEÇALHO PADRONIZADO COM BOTÃO DE VOLTAR */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 hover:border-[#253289] dark:hover:border-blue-500 rounded-xl shadow-sm transition-all group w-fit cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Histórico de Importação (NF-e)</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Controle de entrada de faturas de fornecedores.</p>
          </div>
        </header>

        {/* LISTAGEM DE NOTAS IMPORTADAS */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 border-b-2 border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest">
                    <div className="flex items-center gap-2"><Building2 size={14}/> Fornecedor</div>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">
                    <div className="flex items-center justify-center gap-2"><FileText size={14}/> Nº da Nota</div>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">
                    <div className="flex items-center justify-center gap-2"><Calendar size={14}/> Emissão</div>
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Valor Total</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest text-center">Importação</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 dark:text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.map((item) => (
                  <React.Fragment key={item.id}>
                    {/* LINHA DA NOTA FISCAL */}
                    <tr 
                      onClick={() => toggleExpand(item.id)}
                      className={`cursor-pointer transition-colors group ${expandedId === item.id ? 'bg-blue-50/40 dark:bg-gray-950' : 'hover:bg-gray-50/50 dark:hover:bg-gray-850/30'}`}
                    >
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">{item.issuerName}</td>
                      <td className="px-6 py-4 text-center font-mono text-gray-600 dark:text-gray-300 font-bold text-sm">{item.number}</td>
                      <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 text-sm">{new Date(item.issueDate).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-center font-black text-[#253289] dark:text-blue-400">{formatPrice(Number(item.totalValue))}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1.5 rounded-lg text-xs font-black inline-flex items-center gap-1 shadow-sm">
                          <CheckCircle2 size={12} /> {new Date(item.importedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {expandedId === item.id ? (
                          <ChevronDown size={18} className="text-[#253289] dark:text-blue-400" />
                        ) : (
                          <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-[#253289] dark:group-hover:text-blue-400 transition-colors" />
                        )}
                      </td>
                    </tr>

                    {/* ACORDEÃO / GAVETA EXPANSÍVEL DE PRODUTOS */}
                    {expandedId === item.id && (
                      <tr className="bg-white dark:bg-gray-900 border-b-2 border-[#253289]/10 dark:border-gray-800 shadow-inner">
                        <td colSpan={6} className="p-0">
                          <div className="px-8 py-6 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                              <div className="flex items-center gap-2 text-[#253289] dark:text-blue-400">
                                <PackageCheck size={20}/>
                                <h2 className="font-black text-sm uppercase tracking-wide">Produtos Recebidos nesta Nota</h2>
                              </div>
                              <span className="text-xs font-mono text-gray-400 dark:text-gray-500">Chave: {item.accessKey}</span>
                            </div>

                            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
                              <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                  <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500">Produto</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 text-center">Quantidade</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 text-center">Custo Unt.</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                  {item.batches && item.batches.length > 0 ? (
                                    item.batches.map((batch: any) => (
                                      <tr key={batch.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-850/20 transition-colors">
                                        <td className="px-4 py-3">
                                          <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight">{batch.product?.name || 'Produto Removido'}</p>
                                          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase mt-0.5 font-medium">{batch.product?.category?.name || 'S/ Categoria'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">{batch.quantity} un</td>
                                        <td className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">{formatPrice(Number(batch.cost))}</td>
                                        <td className="px-4 py-3 text-right font-black text-[#253289] dark:text-blue-400">
                                          {formatPrice(Number(batch.cost) * batch.quantity)}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 font-medium italic">
                                        Nenhum produto atrelado a esta nota fiscal.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          {data.length === 0 && (
            <div className="p-12 text-center text-gray-400 dark:text-gray-500 font-medium italic">Nenhuma NF-e importada até o momento.</div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}