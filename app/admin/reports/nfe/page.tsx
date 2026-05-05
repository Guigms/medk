'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { FileText, Calendar, Building2, CheckCircle2, ChevronRight, ChevronDown, PackageCheck } from 'lucide-react';

export default function RelatorioNfePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  
  // 🌟 NOVO: Controla qual Nota Fiscal está expandida
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
    // Se clicar na mesma nota, fecha ela. Se clicar em outra, abre a nova.
    setExpandedId(prevId => (prevId === id ? null : id));
  };

  if (loading) return <div className="p-8 text-center font-bold text-[#253289]">A carregar histórico de notas...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <header className="mb-8">
          <Link href="/admin/reports" className="text-[#253289] hover:underline text-sm font-bold flex items-center gap-1 mb-2">
            ← Voltar para Relatórios
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Histórico de Importação (NF-e)</h1>
          <p className="text-gray-500 text-sm">Controle de entrada de faturas de fornecedores.</p>
        </header>

        <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest"><div className="flex items-center gap-2"><Building2 size={14}/> Fornecedor</div></th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center"><div className="flex items-center justify-center gap-2"><FileText size={14}/> Nº da Nota</div></th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center"><div className="flex items-center justify-center gap-2"><Calendar size={14}/> Emissão</div></th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Valor Total</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest text-center">Importação</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item) => (
                  <React.Fragment key={item.id}>
                    {/* LINHA PRINCIPAL DA NOTA */}
                    <tr 
                      onClick={() => toggleExpand(item.id)}
                      className={`cursor-pointer transition-colors group ${expandedId === item.id ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="px-6 py-4 font-bold text-gray-900">{item.issuerName}</td>
                      <td className="px-6 py-4 text-center font-mono text-gray-600 font-bold text-sm">{item.number}</td>
                      <td className="px-6 py-4 text-center text-gray-500 text-sm">{new Date(item.issueDate).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4 text-center font-black text-[#253289]">{formatPrice(Number(item.totalValue))}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> {new Date(item.importedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {expandedId === item.id ? (
                          <ChevronDown size={18} className="text-[#253289]" />
                        ) : (
                          <ChevronRight size={18} className="text-gray-300 group-hover:text-[#253289] transition-colors" />
                        )}
                      </td>
                    </tr>

                    {/* GAVETA EXPANDIDA (DETALHES DA NOTA) */}
                    {expandedId === item.id && (
                      <tr className="bg-white border-b-2 border-[#253289]/10 shadow-inner">
                        <td colSpan={6} className="p-0">
                          <div className="px-8 py-6 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2 text-[#253289]">
                                <PackageCheck size={20}/>
                                <h2 className="font-black">Produtos Recebidos nesta Nota</h2>
                              </div>
                              <span className="text-xs font-mono text-gray-400">Chave: {item.accessKey}</span>
                            </div>

                            <div className="border border-gray-100 rounded-2xl overflow-hidden">
                              <table className="w-full text-left text-sm">
                                <thead>
                                  <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400">Produto</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 text-center">Quantidade</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 text-center">Custo Unt.</th>
                                    <th className="px-4 py-3 text-[10px] font-black uppercase text-gray-400 text-right">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {item.batches && item.batches.length > 0 ? (
                                    item.batches.map((batch: any) => (
                                      <tr key={batch.id} className="hover:bg-gray-50/30">
                                        <td className="px-4 py-3">
                                          <p className="font-bold text-gray-900">{batch.product?.name || 'Produto Removido'}</p>
                                          <p className="text-[10px] text-gray-500 uppercase">{batch.product?.category?.name || 'S/ Categoria'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-gray-700">{batch.quantity} un</td>
                                        <td className="px-4 py-3 text-center font-medium text-gray-600">{formatPrice(Number(batch.cost))}</td>
                                        <td className="px-4 py-3 text-right font-black text-[#253289]">
                                          {formatPrice(Number(batch.cost) * batch.quantity)}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={4} className="px-4 py-8 text-center text-gray-400 font-medium">
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
            <div className="p-12 text-center text-gray-500 font-medium">Nenhuma NF-e importada até o momento.</div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}