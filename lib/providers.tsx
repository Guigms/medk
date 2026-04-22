// app/providers.tsx (ou components/Providers.tsx)
'use client';

import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { FavoritesProvider } from '@/lib/favorites';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}