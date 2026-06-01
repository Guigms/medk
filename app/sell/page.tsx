'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ShoppingCart, Search, Trash2, CreditCard, CheckCircle, Banknote, QrCode, ArrowLeft, LogOut } from 'lucide-react';

export default function SellPage() {
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth(); 
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  
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
      paymentMethod: paymentMethod, 
      subtotal: total,
      total: total,
      deliveryOption: 'PICKUP',
      source: 'COUNTER',
      changeFor: paymentMethod === 'MONEY' ? changeFor : null,
      userId: user?.id, 
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      if (res.ok) {
        setShowSuccess(true);
        setCart([]); 
        setChangeFor('');
        
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
      <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative transition-colors duration-300">
        
        {/* LADO ESQUERDO: Busca e Vitrine do PDV */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()} 
                className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#253289] dark:hover:text-blue-400 hover:border-[#253289] dark:hover:border-blue-500 rounded-xl shadow-sm transition-all group cursor-pointer"
                title="Voltar ao Dashboard"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              </button>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
                <ShoppingCart size={28} className="text-[#253289] dark:text-blue-400" /> MedK • Frente de Caixa
              </h1>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800">
                👤 {user?.name || 'Caixa'}
              </span>
              <button 
                onClick={() => logout()} 
                className="p-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/60 font-bold transition-all cursor-pointer flex items-center gap-1 text-sm px-3"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>

          {/* INPUT BARCODE / BUSCA INTEGRADA */}
          <div className="relative mb-6 flex-shrink-0">
            <Search className="absolute left-4 top-4 text-gray-400 dark:text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Bipe o código de barras ou digite o nome do produto..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-[#253289] dark:focus:border-blue-500 rounded-2xl shadow-sm outline-none text-lg font-mono tracking-wide text-gray-900 dark:text-white transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            {loading && <div className="absolute right-4 top-5 w-5 h-5 border-2 border-[#253289] dark:border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
          </div>

          {/* GRID RESULTADOS DA BUSCA */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 pb-4 pr-2">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-[#10BCEC] dark:hover:border-blue-500 text-left transition-all group flex flex-col h-full cursor-pointer"
              >
                <div className="w-full h-32 mb-3 bg-gray-50 dark:bg-gray-950 rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-inner">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-4xl opacity-30">💊</div>
                  )}
                </div>
                
                <div className="font-bold text-sm text-gray-800 dark:text-gray-100 group-hover:text-[#253289] dark:group-hover:text-blue-400 line-clamp-2 leading-tight mb-1">{product.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.brand || 'Genérico'}</div>
                
                <div className="flex justify-between items-end mt-auto pt-2 w-full border-t border-transparent dark:border-gray-800">
                  <span className="text-[#253289] dark:text-blue-400 font-black text-lg">{formatPrice(Number(product.price))}</span>
                  <span className={`text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-wider ${product.stock > 0 ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'}`}>
                    Est: {product.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* LADO DIREITO: Cupom Fiscal Eletrônico Atual */}
        <div className="w-[400px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col border-l border-gray-100 dark:border-gray-800 z-10 transition-colors duration-300">
          <div className="p-6 bg-[#253289] dark:bg-gray-950 text-white flex-shrink-0 border-b dark:border-gray-800">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <ShoppingCart /> Cupom Atual
            </h2>
          </div>

          {/* ITENS DO CUPOM */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 && !showSuccess && (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 text-center">
                <ShoppingCart size={48} className="mb-4 opacity-50" />
                <p className="font-medium text-gray-400 dark:text-gray-500 text-sm">Passe o leitor ou busque<br/>um produto para começar.</p>
              </div>
            )}
            
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center group py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div className="flex-1 pr-4">
                  <div className="font-bold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span className="font-black text-[#253289] dark:text-blue-400">{item.quantity}x</span> {formatPrice(Number(item.price))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-gray-900 dark:text-white">{formatPrice(Number(item.price) * item.quantity)}</span>
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* BASE: Totalizadores e Botões Rápidos de Pagamento */}
          <div className="p-6 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 flex-shrink-0 space-y-4 transition-colors">
            <div className="flex justify-between items-center text-2xl font-black text-gray-900 dark:text-white mb-2">
              <span className="tracking-tight">Total a Pagar</span>
              <span className="text-green-600 dark:text-green-400">{formatPrice(total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <button 
                  onClick={() => handleFinalize('MONEY')}
                  disabled={cart.length === 0}
                  className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-xl font-black hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-md shadow-green-900/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Banknote size={20} /> Dinheiro
                </button>
              </div>

              <button 
                onClick={() => handleFinalize('PIX')}
                disabled={cart.length === 0}
                className="bg-cyan-600 dark:bg-cyan-700 text-white py-4 rounded-xl font-black hover:bg-cyan-700 dark:hover:bg-cyan-600 transition-colors flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <QrCode size={20} />
                <span className="text-[10px] uppercase font-black tracking-wider">PIX</span>
              </button>

              <button 
                onClick={() => handleFinalize('DEBIT_CARD')}
                disabled={cart.length === 0}
                className="bg-orange-500 dark:bg-orange-600 text-white py-4 rounded-xl font-black hover:bg-orange-600 dark:hover:bg-orange-500 transition-colors flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <CreditCard size={20} />
                <span className="text-[10px] uppercase font-black tracking-wider">Débito</span>
              </button>

              <button 
                onClick={() => handleFinalize('CREDIT_CARD')}
                disabled={cart.length === 0}
                className="col-span-2 bg-[#253289] dark:bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-[#1a2461] dark:hover:bg-blue-700 transition-all shadow-md shadow-blue-900/10 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-3"
              >
                <CreditCard size={22} /> 
                <span className="uppercase text-xs tracking-widest font-black">Finalizar no Crédito</span>
              </button>
            </div>
          </div>
        </div>

        {/* OVERLAY TELA CHEIA DE SUCESSO */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#253289]/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 flex flex-col items-center justify-center shadow-2xl border border-transparent dark:border-gray-800">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-950/40 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle className="text-green-500 dark:text-green-400 w-16 h-16 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2 text-center tracking-tight">Venda Concluída!</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-center bg-gray-50 dark:bg-gray-950 px-4 py-2 rounded-xl text-sm border dark:border-gray-800">Estoque atualizado e registrado no Analytics</p>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}