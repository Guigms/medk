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
  
  // Estados para o filtro
  const [period, setPeriod] = useState('30');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });

  const fetchData = async () => {
    setLoading(true);
    let url = `/api/analytics?period=${period}`;
    if (customDates.start && customDates.end) {
      url = `/api/analytics?startDate=${customDates.start}&endDate=${customDates.end}`;
    }
    const res = await fetch(url);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  if (loading) return <div className="p-8 text-center">Carregando inteligência de dados...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        {/* Header com Botão de Voltar */}
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

          {/* Seletor de Período (Opcional, mas útil aqui) */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-4">
              <select 
                value={period} 
                onChange={(e) => { setPeriod(e.target.value); setCustomDates({start:'', end:''}); }}
                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#253289]"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="custom">Período personalizado</option>
              </select>

              {period === 'custom' && (
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    className="border rounded-lg px-2 py-1 text-sm"
                    onChange={(e) => setCustomDates({...customDates, start: e.target.value})}
                  />
                  <span className="text-gray-400">até</span>
                  <input 
                    type="date" 
                    className="border rounded-lg px-2 py-1 text-sm"
                    onChange={(e) => setCustomDates({...customDates, end: e.target.value})}
                  />
                  <button 
                    onClick={fetchData}
                    className="bg-[#253289] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#1a2461]"
                  >
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
            <p className="text-sm font-medium text-gray-500">Pedidos Concluídos</p>
            <h3 className="text-2xl font-bold text-gray-900">{data.summary.totalOrders}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-medium text-gray-500">Ticket Médio</p>
            <h3 className="text-2xl font-bold text-green-600">{formatPrice(data.summary.averageTicket)}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 2. GRÁFICO DE FATURAMENTO (LineChart) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6">Evolução de Vendas</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.salesChart || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis tickFormatter={(value) => `R$${value}`} />
                  <Tooltip formatter={(value: any) => formatPrice(value)} />
                  <Line type="monotone" dataKey="revenue" stroke="#253289" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. PRODUTOS MAIS VENDIDOS (BarChart) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-6">Top 5 Produtos (Receita)</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                  <Tooltip formatter={(value: any) => formatPrice(value)} />
                  <Bar dataKey="revenue" fill="#10BCEC" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 4. ESTOQUE CRÍTICO (Alerta Visual) */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-red-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-red-700">Estoque Crítico</h2>
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                {data.inventory.criticalCount} itens
              </span>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {data.inventory.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.categoryName}</p>
                  </div>
                  <span className="text-sm font-black text-red-600">{item.stock} un</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. PEDIDOS RECENTES */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Últimos Pedidos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-sm uppercase">
                    <th className="pb-4 font-medium">Cliente</th>
                    <th className="pb-4 font-medium text-center">Data</th>
                    <th className="pb-4 font-medium text-center">Status</th>
                    <th className="pb-4 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-t border-gray-50">
                      <td className="py-4 font-medium">{order.customerName}</td>
                      <td className="py-4 text-center text-gray-500" suppressHydrationWarning>
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          order.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-[#253289]">
                        {formatPrice(order.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}