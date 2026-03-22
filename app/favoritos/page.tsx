'use client';

import { useFavorites } from '@/lib/favorites';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function FavoritosPage() {
  const { favorites } = useFavorites();

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            ❤️ Meus Medicamentos de Uso Contínuo
          </h1>
          <p className="text-gray-600 mb-4">
            Seus produtos favoritos salvos para recompra rápida
          </p>
        </div>

        {/* Content */}
        {favorites.length > 0 ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-medium text-blue-900 mb-1">Dica:</p>
                  <p className="text-sm text-blue-800">
                    Adicione ao carrinho todos os seus medicamentos de uso contínuo de uma só vez e finalize o pedido no WhatsApp!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Nenhum favorito ainda</h3>
            <p className="text-gray-600 mb-6">
              Adicione produtos aos favoritos clicando no coração nos cards de produtos
            </p>
            <Link
              href="/produtos"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Ver Produtos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}