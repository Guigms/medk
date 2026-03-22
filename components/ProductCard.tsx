'use client';

import { Product } from '@/lib/types';
import { formatPrice, formatWhatsAppLink, calculateDiscountPrice } from '@/lib/utils';
import { useCart } from '@/lib/cart';
import { useFavorites } from '@/lib/favorites';
import PrescriptionAlert from './PrescriptionAlert';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  
  const finalPrice = product.discount 
    ? calculateDiscountPrice(product.price, product.discount)
    : product.price;

  const handleFavoriteClick = () => {
    if (favorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow" data-testid={`product-card-${product.id}`}>
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            -{product.discount}%
          </div>
        )}
        {product.featured && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded text-sm font-bold">
            ⭐ Destaque
          </div>
        )}
        {!product.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
              Indisponível
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2" data-testid={`product-name-${product.id}`}>
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="mb-4">
          {product.discount ? (
            <div>
              <div className="text-gray-400 line-through text-sm">
                {formatPrice(product.price)}
              </div>
              <div className="text-green-600 font-bold text-xl" data-testid={`product-price-${product.id}`}>
                {formatPrice(finalPrice)}
              </div>
            </div>
          ) : (
            <div className="text-green-600 font-bold text-xl" data-testid={`product-price-${product.id}`}>
              {formatPrice(product.price)}
            </div>
          )}
        </div>

        {/* WhatsApp Button */}
        {product.available && (
          <div className="space-y-2">
            <button
              onClick={() => addToCart(product)}
              className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              data-testid={`add-to-cart-${product.id}`}
            >
              🛒 Adicionar ao Carrinho
            </button>
            <a
              href={formatWhatsAppLink(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 text-white text-center py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
              data-testid={`product-whatsapp-${product.id}`}
            >
              💬 Pedir Direto
            </a>
          </div>
        )}
      </div>
    </div>
  );
}