'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart'; // Verifique se o caminho do seu hook está correto
import { formatPrice } from '@/lib/utils';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { useRouter } from 'next/navigation';
import { X, ShoppingBag, Trash2 } from 'lucide-react'; // Ícones comuns

export default function CartModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { items, totalAmount, clearCart, removeItem } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'Cartão na Entrega',
    changeFor: ''
  });

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!customer.name || !customer.address) {
      alert("Por favor, preencha seu nome e endereço para a entrega.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer, total: totalAmount })
      });

      const { order } = await response.json();

      localStorage.setItem('last_order_number', order.orderNumber.toString());

      if (response.ok) {
        const whatsappUrl = generateWhatsAppLink(order, items);
        window.open(whatsappUrl, '_blank');
        clearCart();
        onClose();
        router.push('/checkout/sucesso');
      }
    } catch (error) {
      alert("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm">
      {/* Overlay para fechar ao clicar fora */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="p-4 border-b flex justify-between items-center bg-[#253289] text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <h2 className="font-bold">Meu Carrinho</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* LISTA DE ITENS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
              <ShoppingBag size={48} strokeWidth={1} />
              <p>Seu carrinho está vazio</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 border-b pb-4 items-center">
                <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.product.name}</h4>
                  <p className="text-xs text-blue-600 font-semibold">{item.quantity}x {formatPrice(item.product.price)}</p>
                </div>
                <button onClick={() => removeItem(item.product.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* FORMULÁRIO (Aparece se tiver itens) */}
        {items.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-b space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Informações de Entrega</h3>
            <input 
              type="text" placeholder="Nome Completo" 
              className="w-full p-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none"
              onChange={(e) => setCustomer({...customer, name: e.target.value})}
            />
            <input 
              type="text" placeholder="Endereço e Ponto de Referência" 
              className="w-full p-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#253289] outline-none"
              onChange={(e) => setCustomer({...customer, address: e.target.value})}
            />
            <select 
              className="w-full p-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none"
              onChange={(e) => setCustomer({...customer, paymentMethod: e.target.value})}
            >
              <option value="Cartão na Entrega">Pagamento: Cartão na Entrega</option>
              <option value="Pix na Entrega">Pagamento: Pix na Entrega</option>
              <option value="Dinheiro">Pagamento: Dinheiro (Levar troco)</option>
            </select>
          </div>
        )}

        {/* FOOTER */}
        <div className="p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium">Total do Pedido:</span>
            <span className="text-2xl font-black text-[#253289]">{formatPrice(totalAmount)}</span>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={loading || items.length === 0}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-95"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <>Enviar Pedido via WhatsApp 🟢</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}