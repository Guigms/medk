'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { products, categories } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const availableProducts = products.filter(p => p.available).length;
  const unavailableProducts = products.filter(p => !p.available).length;
  const featuredProducts = products.filter(p => p.featured).length;
  const totalProducts = products.length;
  const prescriptionProducts = products.filter(p => p.requiresPrescription).length;

  // Analytics
  const totalClicks = products.reduce((sum, p) => sum + (p.clicks || 0), 0);
  const topProducts = [...products]
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 5);

  // Produtos próximos do vencimento (90 dias)
  const today = new Date();
  const expiringProducts = products.filter(p => {
    if (!p.expiryDate) return false;
    const expiryDate = new Date(p.expiryDate);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-3xl">💊</span>
                  Painel Administrativo
                </h1>
                <p className="text-gray-600">Bem-vindo, {user?.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900"
                  target="_blank"
                >
                  🌐 Ver Site
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  data-testid="logout-button"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total de Produtos</p>
                  <p className="text-3xl font-bold text-gray-900" data-testid="stat-total-products">{totalProducts}</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Disponíveis</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="stat-available-products">{availableProducts}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Requerem Receita</p>
                  <p className="text-3xl font-bold text-yellow-600">{prescriptionProducts}</p>
                </div>
                <div className="text-4xl">📋</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total de Cliques</p>
                  <p className="text-3xl font-bold text-blue-600">{totalClicks}</p>
                </div>
                <div className="text-4xl">👆</div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {expiringProducts.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-3xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="font-bold text-yellow-800 mb-2">Produtos Próximos do Vencimento</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    {expiringProducts.length} produto(s) com validade em menos de 90 dias
                  </p>
                  <div className="space-y-2">
                    {expiringProducts.map(p => (
                      <div key={p.id} className="bg-white p-3 rounded border border-yellow-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{p.name}</span>
                          <span className="text-sm text-yellow-700">Vence: {p.expiryDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
                🔥 Produtos Mais Clicados
              </h2>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-600">{categories.find(c => c.slug === product.category)?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{product.clicks || 0}</div>
                      <div className="text-xs text-gray-500">cliques</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Ações Rápidas</h2>
              <div className="grid grid-cols-1 gap-4">
                <Link
                  href="/admin/produtos"
                  className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
                  data-testid="manage-products-button"
                >
                  📦 Gerenciar Produtos
                </Link>
                <Link
                  href="/admin/analytics"
                  className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                >
                  📊 Ver Analytics Completo
                </Link>
                <Link
                  href="/admin/pedidos"
                  className="bg-yellow-600 text-white p-4 rounded-lg hover:bg-yellow-700 transition-colors text-center font-medium"
                >
                  📋 Gerenciar Pedidos
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Produtos Recentes</h2>
              <Link
                href="/admin/produtos"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Ver todos →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Produto</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Categoria</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Preço</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Cliques</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{product.name}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {categories.find(c => c.slug === product.category)?.name}
                      </td>
                      <td className="py-3 px-4 text-gray-900 font-medium">
                        {formatPrice(product.price)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {product.clicks || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.available
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.available ? 'Disponível' : 'Indisponível'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}