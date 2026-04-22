'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatPrice } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  CheckCircle, 
  FileText, 
  MousePointer2, 
  AlertTriangle, 
  Bell, 
  Check,
  TrendingUp,
  History
} from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Estados para dados reais do banco
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Busca dados do servidor
  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertsRes, statsRes] = await Promise.all([
        fetch('/api/admin/alerts'),
        fetch('/api/analytics') // Rota que calcula os totais de produtos e cliques
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

  // Função para limpar o alerta (marcar como lido)
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
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center font-bold text-[#253289]">Carregando sistema...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#253289] flex items-center gap-2">
                  <LayoutDashboard size={28} />
                  Painel Administrativo
                </h1>
                <p className="text-gray-500 text-sm">Olá, {user?.name}.</p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/" className="text-sm font-bold text-gray-500 hover:text-[#253289] transition-colors" target="_blank">🌐 Ver Site</Link>
                <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors font-bold border border-red-100">Sair</button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          
          {/* 🚨 SEÇÃO DE ALERTAS DE ESTOQUE (Dinâmica do Banco) */}
          {stockAlerts.length > 0 && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="text-red-600 animate-bounce" size={24} />
                  <h3 className="font-black text-red-800 text-lg">Estoque Crítico Detectado</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {stockAlerts.map(alert => (
                    <div key={alert.id} className="bg-white p-4 rounded-xl border border-red-100 flex justify-between items-center shadow-sm group">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{alert.message}</p>
                        <p className="text-[10px] text-gray-400 uppercase mt-1">Registrado em: {new Date(alert.createdAt).toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => markAsRead(alert.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Marcar como resolvido"
                      >
                        <Check size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total de Produtos" value={stats?.totalProducts || 0} icon={<Package className="text-blue-600" />} />
            <StatCard title="Ativos no Site" value={stats?.availableProducts || 0} icon={<CheckCircle className="text-green-600" />} color="text-green-600" />
            <StatCard title="Requerem Receita" value={stats?.prescriptionProducts || 0} icon={<FileText className="text-amber-600" />} color="text-amber-600" />
            <StatCard title="Total de Cliques" value={stats?.totalClicks || 0} icon={<MousePointer2 className="text-purple-600" />} color="text-purple-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-black mb-6 text-gray-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" /> Produtos em Alta
              </h2>
              <div className="space-y-4">
                {stats?.topProducts?.map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                    <div className="w-10 h-10 bg-[#253289] text-white rounded-xl flex items-center justify-center font-black">{index + 1}</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.category?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-[#253289]">{product.clicks}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Cliques</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-black mb-6 text-gray-900">Ações Rápidas</h2>
              <div className="flex flex-col gap-3">
                <QuickActionButton href="/admin/produtos" label="Gerenciar Estoque" color="bg-[#253289]" />
                <QuickActionButton href="/admin/pedidos" label="Ver Pedidos" color="bg-amber-500" />
                <QuickActionButton href="/admin/analytics" label="Relatórios Financeiros" color="bg-emerald-600" />
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-800 font-bold mb-1 italic">Dica do Sistema:</p>
                  <p className="text-[11px] text-blue-600">Mantenha os preços e estoque sempre atualizados para evitar cancelamentos no checkout.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Componentes Auxiliares
function StatCard({ title, value, icon, color = "text-gray-900" }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-[11px] font-black uppercase tracking-widest mb-1">{title}</p>
          <p className={`text-3xl font-black ${color}`}>{value}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
      </div>
    </div>
  );
}

function QuickActionButton({ href, label, color }: any) {
  return (
    <Link href={href} className={`${color} text-white p-4 rounded-xl hover:opacity-90 transition-all text-center font-bold text-sm shadow-lg shadow-gray-200`}>
      {label}
    </Link>
  );
}