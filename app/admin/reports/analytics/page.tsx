'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { formatPrice } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Globe, Store, PieChart as PieIcon, CreditCard, ArrowLeft } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#10b8a6', '#8b5cf6'];

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  const [period, setPeriod] = useState('30');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, [period, currentPage]);

  useEffect(() => {
    // Escuta dinâmica de mudanças no Modo Noturno para redesenhar os gráficos do Recharts
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const handlePeriodChange = (e: any) => {
    setPeriod(e.target.value);
    setCustomDates({start:'', end:''});
    setCurrentPage(1); 
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-bold text-[#253289] dark:text-blue-400">
        Carregando inteligência de dados...
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground p-4 md:p-8 transition-colors duration-300">
        
        {/* CABEÇALHO PADRONIZADO COM BOTÃO DE VOLTAR */}
        <header className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 hover:border-[#253289] dark:hover:border-blue-500 rounded-xl shadow-sm transition-all group cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                Inteligência Geral
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">Relatórios detalhados de vendas, categorias, canais e pagamentos.</p>
            </div>
          </div>

          {/* Filtros por período */}
          <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-3 transition-colors">
              <select 
                value={period} 
                onChange={handlePeriodChange}
                className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm font-bold text-[#253289] dark:text-blue-400 outline-none cursor-pointer"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="custom">Período personalizado</option>
              </select>

              {period === 'custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                  <input type="date" className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2 py-1 text-sm outline-none" onChange={(e) => setCustomDates({...customDates, start: e.target.value})} />
                  <span className="text-gray-400 dark:text-gray-500 font-bold">→</span>
                  <input type="date" className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2 py-1 text-sm outline-none" onChange={(e) => setCustomDates({...customDates, end: e.target.value})} />
                  <button onClick={() => { setCurrentPage(1); fetchData(); }} className="bg-[#253289] dark:bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-[#1a2461] dark:hover:bg-blue-700 transition-all cursor-pointer">
                    Filtrar
                  </button>
                </div>
              )}
          </div>
        </header>

        {/* 1. CARDS DE RESUMO OPERACIONAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Faturamento Total</p>
            <h3 className="text-3xl font-black text-[#253289] dark:text-blue-400">{formatPrice(data?.summary?.totalRevenue || 0)}</h3>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Pedidos Válidos</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data?.summary?.totalOrders || 0}</h3>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Ticket Médio</p>
            <h3 className="text-3xl font-black text-green-600 dark:text-green-400">{formatPrice(data?.summary?.averageTicket || 0)}</h3>
          </div>
        </div>

        {/* 2. GRÁFICOS LINEARES E DE BARRAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <h2 className="text-lg font-black mb-6 text-gray-800 dark:text-white">Evolução de Vendas (Diária)</h2>
            <div className="h-80 w-full">
              {data?.salesChart?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.salesChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1f2937' : '#E5E7EB'} />
                    <XAxis dataKey="date" stroke={isDarkMode ? '#9ca3af' : '#6B7280'} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={isDarkMode ? '#9ca3af' : '#6B7280'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip formatter={(value: any) => [formatPrice(Number(value)), 'Receita']} contentStyle={{ backgroundColor: isDarkMode ? '#111827' : '#fff', borderRadius: '12px', border: isDarkMode ? '1px solid #374151' : 'none', color: isDarkMode ? '#fff' : '#000' }} />
                    <Line type="monotone" dataKey="revenue" stroke={isDarkMode ? '#3b82f6' : '#253289'} strokeWidth={4} activeDot={{ r: 6 }} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 italic text-sm">Dados insuficientes para o período.</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <h2 className="text-lg font-black mb-6 text-gray-800 dark:text-white">Top 5 Produtos (Receita)</h2>
            <div className="h-80 w-full">
               {data?.topProducts?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topProducts} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? '#1f2937' : '#E5E7EB'} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={110} fontSize={11} stroke={isDarkMode ? '#9ca3af' : '#6B7280'} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value: any) => [formatPrice(Number(value)), 'Receita']} cursor={{fill: isDarkMode ? '#1f2937' : '#F3F4F6'}} contentStyle={{ backgroundColor: isDarkMode ? '#111827' : '#fff', borderRadius: '12px', border: isDarkMode ? '1px solid #374151' : 'none', color: isDarkMode ? '#fff' : '#000' }} />
                    <Bar dataKey="revenue" fill={isDarkMode ? '#60a5fa' : '#10BCEC'} radius={[0, 8, 8, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
               ) : (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 italic text-sm">Nenhum produto vendido no período.</div>
               )}
            </div>
          </div>
        </div>

        {/* 3. SEÇÃO: GRÁFICOS DE DISTRIBUIÇÃO COM LEGENDAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Categoria */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <PieIcon className="text-[#253289] dark:text-blue-400" size={20} />
              <h2 className="text-lg font-black text-gray-800 dark:text-white">Categorias</h2>
            </div>
            <div className="h-48 w-full flex-1">
              {data?.salesByCategory?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.salesByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {data.salesByCategory.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatPrice(value)} contentStyle={{ backgroundColor: isDarkMode ? '#111827' : '#fff', borderRadius: '12px', border: isDarkMode ? '1px solid #374151' : 'none', color: isDarkMode ? '#fff' : '#000' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 italic text-sm">Sem dados.</div>
              )}
            </div>
            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-2">
              {data?.salesByCategory?.slice(0, 4).map((cat: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="font-medium text-gray-600 dark:text-gray-400 truncate">{cat.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white ml-2">{formatPrice(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Canais */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="text-[#10BCEC] dark:text-cyan-400" size={20} />
              <h2 className="text-lg font-black text-gray-800 dark:text-white">Canais de Venda</h2>
            </div>
            <div className="h-48 w-full">
              {data?.salesBySource?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.salesBySource} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value">
                      {data.salesBySource.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? (isDarkMode ? '#3b82f6' : '#253289') : (isDarkMode ? '#22d3ee' : '#10BCEC')} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatPrice(value)} contentStyle={{ backgroundColor: isDarkMode ? '#111827' : '#fff', borderRadius: '12px', border: isDarkMode ? '1px solid #374151' : 'none', color: isDarkMode ? '#fff' : '#000' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 italic text-sm">Sem dados.</div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {data?.salesBySource?.map((source: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-950 rounded-xl border dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    {source.name.includes('Site') ? <Globe className="text-blue-500 dark:text-blue-400" size={16} /> : <Store className="text-emerald-500 dark:text-emerald-400" size={16} />}
                    <span className="font-medium text-gray-600 dark:text-gray-400">{source.name}</span>
                  </div>
                  <span className="font-black text-[#253289] dark:text-blue-400">{formatPrice(source.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pagamentos */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col transition-colors">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="text-[#F59E0B] dark:text-amber-400" size={20} />
              <h2 className="text-lg font-black text-gray-800 dark:text-white">Pagamentos</h2>
            </div>
            <div className="h-48 w-full">
              {data?.salesByPayment?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.salesByPayment} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {data.salesByPayment.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(COLORS.length - 1) - (index % COLORS.length)]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatPrice(value)} contentStyle={{ backgroundColor: isDarkMode ? '#111827' : '#fff', borderRadius: '12px', border: isDarkMode ? '1px solid #374151' : 'none', color: isDarkMode ? '#fff' : '#000' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 italic text-sm">Sem dados.</div>
              )}
            </div>
            <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-2">
              {data?.salesByPayment?.map((payment: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(COLORS.length - 1) - (i % COLORS.length)] }}></div>
                    <span className="font-medium text-gray-600 dark:text-gray-400">{payment.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{formatPrice(payment.value)}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 4. ESTOQUE CRÍTICO E LISTA DE PEDIDOS RECENTES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alerta de Estoque Crítico */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-red-100 dark:border-red-950/40 transition-colors">
            <h2 className="text-lg font-black text-red-700 dark:text-red-400 mb-4 tracking-tight">Estoque Crítico</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {data?.inventory?.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b border-red-50 dark:border-gray-800 pb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black">{item.categoryName}</p>
                  </div>
                  <span className="text-sm font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-1 rounded-lg border dark:border-red-900/30">{item.stock} un</span>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico estruturado de vendas de balcão/site */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col transition-colors">
            <h2 className="text-lg font-black text-gray-800 dark:text-white mb-6">Histórico de Pedidos</h2>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-200 dark:border-gray-800">
                    <th className="pb-3">Pedido/Cliente</th>
                    <th className="pb-3 text-center">Data</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-transparent dark:divide-gray-800/20">
                  {data?.recentOrders?.items?.map((order: any) => (
                    <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-4">
                        <div className="font-black text-[#253289] dark:text-blue-400">#{String(order.orderNumber).padStart(4, '0')}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">{order.customerName}</div>
                      </td>
                      <td className="py-4 text-center text-gray-500 dark:text-gray-400 text-xs font-medium">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-black text-gray-900 dark:text-white">
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