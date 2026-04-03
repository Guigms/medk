// app/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { formatPrice } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const [period, setPeriod] = useState('30');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  // NOVO: Estado da página
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    let url = `/api/analytics?period=${period}&page=${currentPage}`;
    if (customDates.start && customDates.end) {
      url = `/api/analytics?startDate=${customDates.start}&endDate=${customDates.end}&page=${currentPage}`;
    }
    const res = await fetch(url);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  // Toda vez que o período ou a página mudar, refaz o fetch
  useEffect(() => {
    fetchData();
  }, [period, currentPage]);

  // Se trocar o período, volta para a página 1
  const handlePeriodChange = (e: any) => {
    setPeriod(e.target.value);
    setCustomDates({start:'', end:''});
    setCurrentPage(1); 
  };

  if (loading && !data) return <div className="p-8 text-center text-[#253289] font-medium">Carregando inteligência de dados...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link 
              href="/admin/dashboard" 
              className="text-[#253289] hover:text-[#1a2461] text-sm font-medium flex items-center gap-1 mb-2 transition-colors"
            >
              ← Voltar ao Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Inteligência de Dados
            </h1>
            <p className="text-gray-500">Relatórios detalhados de vendas e estoque.</p>
          </div>

          {/* Filtros */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
              <select 
                value={period} 
                onChange={handlePeriodChange}
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253289]"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="custom">Período personalizado</option>
              </select>

              {period === 'custom' && (
                <div className="flex items-center gap-2">
                  <input type="date" className="border rounded-lg px-2 py-1 text-sm" onChange={(e) => setCustomDates({...customDates, start: e.target.value})} />
                  <span className="text-gray-400">até</span>
                  <input type="date" className="border rounded-lg px-2 py-1 text-sm" onChange={(e) => setCustomDates({...customDates, end: e.target.value})} />
                  <button onClick={() => { setCurrentPage(1); fetchData(); }} className="bg-[#253289] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#1a2461]">
                    Filtrar
                  </button>
                </div>
              )}
          </div>
        </header>

        {/* 1. CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Faturamento Total</p>
            <h3 className="text-2xl font-bold text-[#253289]">{formatPrice(data.summary.totalRevenue)}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Pedidos Válidos</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.summary.totalOrders}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
            <h3 className="text-2xl font-bold text-green-600">{formatPrice(data.summary.averageTicket)}</h3>
          </div>
        </div>

        {/* 2. GRÁFICOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6 text-gray-800">Evolução de Vendas (Diária)</h2>
            <div className="h-80 w-full">
              {data.salesChart?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.salesChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip formatter={(value: any) => [formatPrice(Number(value)), 'Receita']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#253289" strokeWidth={3} activeDot={{ r: 6 }} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Dados insuficientes para o período.</div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6 text-gray-800">Top 5 Produtos (Receita)</h2>
            <div className="h-80 w-full">
               {data.topProducts?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topProducts} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={110} fontSize={11} stroke="#6B7280" tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value: any) => [formatPrice(Number(value)), 'Receita']} cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="revenue" fill="#10BCEC" radius={[0, 4, 4, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
               ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Nenhum produto vendido no período.</div>
               )}
            </div>
          </div>
        </div>

        {/* 3. ESTOQUE E LISTA DE PEDIDOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-red-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-red-700">Estoque Crítico (Abaixo de 5)</h2>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                {data.inventory.criticalCount} itens
              </span>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {data.inventory.items.length > 0 ? data.inventory.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.categoryName}</p>
                  </div>
                  <span className="text-sm font-black text-red-600 bg-red-50 px-2 py-1 rounded">{item.stock} un</span>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center mt-8">Nenhum produto com estoque crítico.</p>
              )}
            </div>
          </div>

          {/* TABELA DE PEDIDOS COM PAGINAÇÃO */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Histórico de Pedidos</h2>
              <span className="text-xs text-gray-500">Mostrando pág {data.recentOrders.pagination.currentPage} de {data.recentOrders.pagination.totalPages || 1}</span>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-xs uppercase border-b">
                    <th className="pb-3 font-medium">Pedido/Cliente</th>
                    <th className="pb-3 font-medium text-center">Data</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.recentOrders.items.length > 0 ? data.recentOrders.items.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-gray-900">#{order.orderNumber}</div>
                        <div className="text-gray-500 text-xs">{order.customerName}</div>
                      </td>
                      <td className="py-3 text-center text-gray-500 text-xs" suppressHydrationWarning>
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-[#253289]">
                        {formatPrice(order.totalAmount)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">Nenhum pedido encontrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* CONTROLES DE PAGINAÇÃO */}
            {data.recentOrders.pagination.totalPages > 1 && (
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <button 
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Anterior
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: data.recentOrders.pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold ${
                        currentPage === i + 1 ? 'bg-[#253289] text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={currentPage === data.recentOrders.pagination.totalPages || loading}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}