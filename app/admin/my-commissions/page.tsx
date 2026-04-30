'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { Target, DollarSign, Receipt, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const META_MENSAL = 10000;

export default function MinhasComissoesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/commissions?userId=${user.id}`)
        .then(res => res.json())
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#253289] font-bold">Calculando seus resultados...</div>;

  const percentualMeta = Math.min(((data?.totalSold || 0) / META_MENSAL) * 100, 100);
  const bateuMeta = percentualMeta >= 100;

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#253289] flex items-center gap-2">
            <DollarSign size={32} /> Meu Desempenho
          </h1>
          <p className="text-gray-500 mt-1">Acompanhe suas vendas e comissões do mês atual.</p>
        </div>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 text-blue-50 opacity-50"><Target size={100}/></div>
             <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Vendido</p>
             <h2 className="text-3xl font-black text-[#253289] mb-2">{formatPrice(data?.totalSold || 0)}</h2>
             <p className="text-sm font-bold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-lg">
               {data?.salesCount || 0} vendas realizadas
             </p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-3xl shadow-lg shadow-emerald-200 text-white relative overflow-hidden">
             <div className="absolute -right-4 -top-4 text-white opacity-20"><DollarSign size={100}/></div>
             <p className="text-xs font-black text-emerald-100 uppercase tracking-widest mb-1">Comissão a Receber</p>
             <h2 className="text-3xl font-black mb-2">{formatPrice(data?.pendingCommission || 0)}</h2>
             <p className="text-sm font-bold bg-white/20 inline-block px-3 py-1 rounded-lg">
               Taxa atual: {data?.commissionRate}%
             </p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 text-gray-50 opacity-50"><CheckCircle2 size={100}/></div>
             <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Já Pago no Mês</p>
             <h2 className="text-3xl font-black text-gray-800">{formatPrice(data?.paidCommission || 0)}</h2>
             <p className="text-sm text-gray-400 mt-2">Valores já liquidados pela gerência.</p>
          </div>
        </div>

        {/* BARRA DE META */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
             <Target className="text-blue-500"/> Progresso da Meta Mensal
          </h3>
          <div className="flex justify-between text-sm font-bold mb-2">
            <span className="text-gray-500">Alcançado: {percentualMeta.toFixed(1)}%</span>
            <span className="text-gray-900">Meta: {formatPrice(META_MENSAL)}</span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 rounded-full ${bateuMeta ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[#253289]'}`}
              style={{ width: `${percentualMeta}%` }}
            ></div>
          </div>
          {bateuMeta && <p className="text-emerald-600 font-bold text-sm mt-3 text-center animate-pulse">🎉 Parabéns! Você atingiu a meta deste mês!</p>}
        </div>

        {/* LISTA DE VENDAS RECENTES */}
        <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
           <Receipt className="text-gray-400"/> Detalhamento das Vendas
        </h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {data?.recentRecords?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhuma venda comissionada registrada este mês ainda.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[11px] font-black tracking-widest text-gray-500 uppercase">
                <tr>
                  <th className="p-4">Pedido</th>
                  <th className="p-4">Data</th>
                  <th className="p-4 text-right">Valor da Venda</th>
                  <th className="p-4 text-right">Sua Comissão</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.recentRecords?.map((record: any) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">#{record.order.orderNumber}</td>
                    <td className="p-4 text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={12}/> {new Date(record.order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right font-medium text-gray-600">{formatPrice(Number(record.order.totalAmount))}</td>
                    <td className="p-4 text-right font-black text-emerald-600">+{formatPrice(Number(record.amount))}</td>
                    <td className="p-4 text-center">
                      {record.status === 'PENDING' ? (
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-md font-bold uppercase">A Receber</span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold uppercase">Pago</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}