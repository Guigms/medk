'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { formatPrice } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ShoppingCart, Search, Trash2, CreditCard, CheckCircle } from 'lucide-react';

export default function SellPage() {
  const [mounted, setMounted] = useState(false);
  const { logout } = useAuth();
  
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 🌟 NOVO ESTADO: Controla a animação de sucesso
  const [showSuccess, setShowSuccess] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    searchInputRef.current?.focus();
  }, []);

  const performSearch = async (query: string, isExactTrigger: boolean = false) => {
    if (query.length < 2) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data.length === 1 && data[0].barcode === query) {
        addToCart(data[0]);
        return; 
      }

      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (value.length < 2) {
       setProducts([]); 
       return;
    }

    setLoading(true); 
    debounceTimerRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      performSearch(search, true);
    }
  };

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    setSearch('');
    setProducts([]);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    setTimeout(() => {
       searchInputRef.current?.focus();
    }, 50);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
    searchInputRef.current?.focus();
  };

  const total = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

  const handleFinalize = async (paymentMethod: string) => {
    if (cart.length === 0) return;

    const saleData = {
      customer: { name: 'Venda de Balcão', phone: 'N/A' },
      items: cart,
      paymentMethod,
      subtotal: total,
      total: total,
      deliveryOption: 'PICKUP',
      source: 'COUNTER',
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      if (res.ok) {
        // 🌟 GATILHO DA ANIMAÇÃO DE SUCESSO
        setShowSuccess(true);
        setCart([]); // Limpa o carrinho imediatamente por trás
        
        // Remove a animação automaticamente após 2.5 segundos e foca no leitor
        setTimeout(() => {
          setShowSuccess(false);
          searchInputRef.current?.focus();
        }, 2500);

      } else {
        const errorData = await res.json();
        alert(`Erro: ${errorData.error}`);
      }
    } catch (err) {
      alert('Erro ao finalizar venda.');
    }
  };

  if (!mounted) return null;

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100 overflow-hidden font-sans relative">
        
        {/* LADO ESQUERDO: Busca e Seleção */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black text-[#253289] flex items-center gap-2">
              <ShoppingCart size={28} /> MedK • Frente de Caixa
            </h1>
            <button onClick={() => logout()} className="text-gray-500 hover:text-red-600 transition-colors font-bold px-4 py-2 rounded-lg hover:bg-red-50">Sair do Sistema</button>
          </div>

          <div className="relative mb-6 flex-shrink-0">
            <Search className="absolute left-4 top-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Bipe o código de barras ou digite o nome do produto..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-[#253289] rounded-2xl shadow-sm outline-none text-lg font-mono tracking-wide transition-all"
            />
            {loading && <div className="absolute right-4 top-5 w-5 h-5 border-2 border-[#253289] border-t-transparent rounded-full animate-spin"></div>}
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 pb-4 pr-2">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-[#10BCEC] text-left transition-all group flex flex-col h-full"
              >
                <div className="w-full h-32 mb-3 bg-gray-50 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100 flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150?text=Sem+Foto'; }}
                    />
                  ) : (
                    <div className="text-4xl opacity-30">💊</div>
                  )}
                </div>
                
                <div className="font-bold text-sm text-gray-800 group-hover:text-[#253289] line-clamp-2 leading-tight mb-1">{product.name}</div>
                <div className="text-xs text-gray-500 mb-2">{product.brand || 'Genérico'}</div>
                
                <div className="flex justify-between items-end mt-auto pt-2 w-full">
                  <span className="text-[#253289] font-black text-lg">{formatPrice(Number(product.price))}</span>
                  <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    Est: {product.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* LADO DIREITO: Carrinho e Finalização */}
        <div className="w-[400px] bg-white shadow-2xl flex flex-col border-l border-gray-100 z-10">
          <div className="p-6 bg-[#253289] text-white flex-shrink-0">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart /> Cupom Atual
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 && !showSuccess && (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 text-center">
                <ShoppingCart size={48} className="mb-4 opacity-50" />
                <p className="font-medium text-gray-400">Passe o leitor ou busque<br/>um produto para começar.</p>
              </div>
            )}
            
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center group py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 pr-4">
                  <div className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</div>
                  <div className="text-xs text-gray-500">
                    <span className="font-bold text-[#253289]">{item.quantity}x</span> {formatPrice(Number(item.price))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-gray-900">{formatPrice(Number(item.price) * item.quantity)}</span>
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50 border-t flex-shrink-0 space-y-4">
            <div className="flex justify-between items-center text-2xl font-black text-gray-900 mb-2">
              <span>Total a Pagar</span>
              <span className="text-[#25D366]">{formatPrice(total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleFinalize('CASH')}
                disabled={cart.length === 0}
                className="bg-green-100 text-green-700 py-3 rounded-xl font-bold hover:bg-green-200 transition-colors flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg">💵 Dinheiro</span>
              </button>
              <button 
                onClick={() => handleFinalize('PIX')}
                disabled={cart.length === 0}
                className="bg-blue-100 text-blue-700 py-3 rounded-xl font-bold hover:bg-blue-200 transition-colors flex flex-col items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-lg">💎 PIX</span>
              </button>
              <button 
                onClick={() => handleFinalize('CARD')}
                disabled={cart.length === 0}
                className="col-span-2 bg-[#253289] text-white py-4 rounded-xl font-bold hover:bg-[#1a2461] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard size={20} /> Finalizar no Cartão
              </button>
            </div>
          </div>
        </div>

        {/* 🌟 OVERLAY DE SUCESSO ANIMADO (Renderizado condicionalmente) */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#253289]/80 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white rounded-3xl p-10 flex flex-col items-center justify-center shadow-2xl transform scale-100 animate-bounce-short">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle className="text-green-500 w-16 h-16 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-gray-800 mb-2 text-center">Venda Concluída!</h2>
              <p className="text-gray-500 font-medium text-center bg-gray-50 px-4 py-2 rounded-lg">Estoque atualizado com sucesso</p>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}