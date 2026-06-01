'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import DarkModeToggle from '@/components/DarkModeToggle'; 
import { formatPrice } from '@/lib/utils';
import { 
  LayoutDashboard, Package, CheckCircle, FileText, 
  MousePointer2, Bell, Check, TrendingUp, Users, 
  ShoppingCart, DollarSign, ExternalLink, LogOut,
  BarChart3, ShieldCheck
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ⚡ 1. IDENTIFICAÇÃO DE HIERARQUIAS (Chave Mestra)
  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN';
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || isSuperAdmin; // SuperAdmin herda tudo do Admin

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertsRes, statsRes] = await Promise.all([
        fetch('/api/admin/alerts', { cache: 'no-store' }),
        fetch('/api/analytics', { cache: 'no-store' }) 
      ]);

      if (alertsRes.ok) setStockAlerts(await alertsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markAsRead = async (alertId: string) => {
    try {
      const res = await fetch('/api/admin/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId })
      });
      if (res.ok) {
        setStockAlerts(prev => prev.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error("Erro ao marcar como lido:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center font-bold text-[#253289] dark:text-blue-400">Carregando sistema...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        
        {/* HEADER COM MODO NOTURNO */}
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 transition-colors">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#253289] rounded-xl text-white shadow-lg shadow-blue-900/20">
                  <LayoutDashboard size={28} />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-tight flex items-center gap-2">
                    Painel Administrativo
                    {/* 🛡️ BADGE EXCLUSIVO GMSOLUTION */}
                    {isSuperAdmin && (
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest flex items-center gap-1 shadow-sm border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck size={12} /> Master
                      </span>
                    )}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-0.5">
                    Olá, <span className="font-bold text-[#253289] dark:text-blue-400">{user?.name}</span> • 
                    {isSuperAdmin ? ' GMSolution' : (user?.role === 'ADMIN' ? ' Administrador' : ' Atendente')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <Link href="/" className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 transition-colors" target="_blank">
                  <ExternalLink size={18} /> Ver Site
                </Link>
                
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden md:block"></div>
                
                <DarkModeToggle />

                <button 
                  onClick={handleLogout} 
                  className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-2.5 md:px-4 md:py-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-bold border border-red-100 dark:border-red-900/50 flex items-center gap-2"
                >
                  <LogOut size={20} />
                  <span className="hidden md:inline">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          
          {/* ALERTAS DE ESTOQUE */}
          {stockAlerts.length > 0 && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-6 rounded-r-2xl shadow-sm border-y border-r dark:border-red-900/30">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="text-red-600 dark:text-red-400 animate-bounce" size={24} />
                  <h3 className="font-black text-red-800 dark:text-red-300 text-lg">Estoque Crítico Detectado</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stockAlerts.map(alert => (
                    <div key={alert.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-red-100 dark:border-red-900/50 flex justify-between items-center shadow-sm group">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{alert.message}</p>
                        <p className="text-[10px] text-gray-400 uppercase mt-1">Registrado em: {new Date(alert.createdAt).toLocaleString()}</p>
                      </div>
                      <button onClick={() => markAsRead(alert.id)} className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-all">
                        <Check size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total de Produtos" value={stats?.totalProducts || 0} icon={<Package className="text-blue-600" />} />
            <StatCard title="Ativos no Site" value={stats?.availableProducts || 0} icon={<CheckCircle className="text-emerald-600" />} color="text-emerald-600" />
            <StatCard title="Requerem Receita" value={stats?.prescriptionProducts || 0} icon={<FileText className="text-amber-600" />} color="text-amber-600" />
            <StatCard title="Total de Cliques" value={stats?.totalClicks || 0} icon={<MousePointer2 className="text-purple-600" />} color="text-purple-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* PRODUTOS EM ALTA */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 transition-colors">
              <h2 className="text-lg font-black mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" /> Produtos em Alta
              </h2>
              <div className="space-y-4">
                {stats?.topProductsByClicks?.map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group">
                    <div className="w-10 h-10 bg-[#253289] dark:bg-blue-600 text-white rounded-xl flex items-center justify-center font-black shadow-md">{index + 1}</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-[#253289] dark:group-hover:text-blue-400 transition-colors">{product.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{product.category?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-[#253289] dark:text-blue-400 text-lg">{product.clicks}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Cliques</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AÇÕES RÁPIDAS */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 transition-colors">
              <h2 className="text-lg font-black mb-6 text-gray-900 dark:text-white">Ações Rápidas</h2>
              <div className="flex flex-col gap-3">
                <QuickActionButton href="/admin/pedidos" label="Ver Pedidos" color="bg-amber-500 shadow-amber-900/10" icon={<Package size={18}/>} />
                <QuickActionButton href="/admin/produtos" label="Gerenciar Estoque" color="bg-[#253289] shadow-blue-950/20" icon={<LayoutDashboard size={18}/>} />
                <QuickActionButton href="/sell" label="Registrar Vendas" color="bg-green-700 shadow-green-950/10" icon={<ShoppingCart size={18}/>} />
                
                {/* 🌟 Aqui usamos isAdmin para garantir que ambos (Admin e SuperAdmin) vejam as opções corretas */}
                <QuickActionButton 
                  href={isAdmin ? '/admin/commissions' : '/admin/my-commissions'} 
                  label={isAdmin ? 'Gerenciar Comissões' : 'Minhas Comissões'} 
                  color="bg-indigo-600 shadow-indigo-900/10" 
                  icon={<DollarSign size={18}/>} 
                />
                
                {isAdmin && (
                  <QuickActionButton 
                    href="/admin/reports" 
                    label="Central de Relatórios" 
                    color="bg-emerald-600 shadow-emerald-900/10" 
                    icon={<BarChart3 size={18}/>} 
                  />
                )}

                {isAdmin && (
                  <QuickActionButton 
                    href="/admin/users" 
                    label="Gerenciar Equipe" 
                    color="bg-purple-600 shadow-purple-900/10" 
                    icon={<Users size={18}/>} 
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ title, value, icon, color = "text-gray-900" }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 dark:text-gray-500 text-[11px] font-black uppercase tracking-widest mb-1">{title}</p>
          <p className={`text-3xl font-black ${color} dark:text-white`}>{value}</p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ href, label, color, icon }: any) {
  return (
    <Link href={href} className={`${color} text-white p-4 rounded-xl hover:opacity-90 transition-all font-black text-sm shadow-lg flex items-center gap-3 active:scale-[0.98]`}>
      {icon} {label}
    </Link>
  );
}