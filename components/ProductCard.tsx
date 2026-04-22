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
  
  // 🌟 CORREÇÃO DEFINITIVA: Forçando a conversão para número para evitar erros do Prisma (Decimal)
  const basePrice = Number(product.price) || 0;
  const discountValue = Number(product.discount) || 0;
  
  const finalPrice = discountValue > 0 
    ? calculateDiscountPrice(basePrice, discountValue)
    : basePrice;

  // Registra o clique no banco de dados para o Analytics
  const recordClick = async () => {
    try {
      await fetch('/api/products/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
    } catch (error) {
      console.error("Erro ao registrar clique:", error);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    recordClick();
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow relative group" 
      data-testid={`product-card-${product.id}`}
      onClick={recordClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 cursor-pointer">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md hover:scale-110 transition-transform z-10"
        >
          <span className="text-xl">{favorite ? '❤️' : '🤍'}</span>
        </button>

        {discountValue > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
            -{discountValue}%
          </div>
        )}
        
        {product.featured && (
          <div className="absolute bottom-2 left-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm">
            ⭐ Destaque
          </div>
        )}

        {!product.available && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
              Indisponível
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 
          className="font-bold text-gray-900 mb-1 line-clamp-1 hover:text-[#253289] transition-colors cursor-pointer" 
          onClick={recordClick}
        >
          {product.name}
        </h3>
        
        <p className="text-gray-500 text-xs mb-3 line-clamp-2 h-8">
          {product.description}
        </p>

        {/* Prescription Alert */}
        <div className="mb-3 min-h-[20px]">
          <PrescriptionAlert product={product} />
        </div>

        {/* Price Section */}
        <div className="mb-4">
          {discountValue > 0 ? (
            <div className="flex items-baseline gap-2">
              <span className="text-green-600 font-black text-xl">
                {formatPrice(finalPrice)}
              </span>
              <span className="text-gray-400 line-through text-xs font-medium">
                {formatPrice(basePrice)}
              </span>
            </div>
          ) : (
            <div className="text-green-600 font-black text-xl">
              {formatPrice(basePrice)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {product.available ? (
          <div className="space-y-2">
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#253289] text-white text-sm py-2.5 rounded-xl hover:bg-[#1a2461] transition-all font-bold shadow-md shadow-blue-100 flex items-center justify-center gap-2"
            >
              <span>🛒</span> Adicionar
            </button>
            
            {/* 🌟 ENVIANDO O PREÇO FINAL JÁ TRATADO COMO NÚMERO */}
            <a
              href={formatWhatsAppLink(product.name, finalPrice)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={recordClick} 
              className="w-full bg-[#25D366] text-white text-sm py-2.5 rounded-xl hover:bg-[#1ebe57] transition-all font-bold shadow-md shadow-green-100 flex items-center justify-center gap-2"
            >
              <span>💬</span> Pedir agora
            </a>
          </div>
        ) : (
          <button
            disabled
            className="w-full bg-gray-100 text-gray-400 text-sm py-2.5 rounded-xl font-bold cursor-not-allowed"
          >
            Produto Esgotado
          </button>
        )}
      </div>
    </div>
  );
}