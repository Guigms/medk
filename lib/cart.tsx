'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from './types';

export interface CartItem {
  product: Product;
  quantity: number;
}

// 1. A INTERFACE PRECISA TER TUDO QUE VOCÊ PASSA NO VALUE
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  addItem: (product: Product) => void;      // Alias para o CartModal
  removeItem: (productId: string) => void;   // Alias para o CartModal
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
  getTotalItems: () => number; // Adicionado aqui
  getTotalPrice: () => number; // Adicionado aqui
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try { setItems(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.product.id === product.id);
      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentItems, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setItems((currentItems) =>
      currentItems.map((item) => item.product.id === productId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => setItems([]);

  // Cálculos
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => {
    const price = item.product.discount
      ? item.product.price - (item.product.price * item.product.discount) / 100
      : item.product.price;
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        addItem: addToCart,
        removeItem: removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems,
        getTotalItems: () => totalItems, // Agora o TS aceita pois está na Interface
        getTotalPrice: () => totalAmount, // Agora o TS aceita pois está na Interface
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}