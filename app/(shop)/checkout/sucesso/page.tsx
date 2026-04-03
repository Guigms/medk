'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ShoppingBag, MessageSquare } from 'lucide-react';

export default function SuccessPage() {
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    // Tenta recuperar o último pedido feito do localStorage ou via URL
    const lastOrder = localStorage.getItem('last_order_number');
    if (lastOrder) setOrderNumber(lastOrder);
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-500">
        
        {/* Ícone de Sucesso Animado */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle2 size={64} className="text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">Pedido Recebido!</h1>
        <p className="text-gray-500 mb-6">
          Seu pedido {orderNumber ? <span className="font-bold text-[#253289]">#{orderNumber}</span> : ''} foi registrado em nosso sistema.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 text-left">
          <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            <MessageSquare size={16} /> Próximos Passos:
          </h3>
          <ul className="text-xs text-blue-700 space-y-2">
            <li>• Você foi redirecionado para o nosso WhatsApp.</li>
            <li>• O pagamento será feito conforme escolhido no carrinho.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link 
            href="/"
            className="w-full py-4 bg-[#253289] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#1a2461] transition-all"
          >
            <ShoppingBag size={20} />
            Continuar Comprando
          </Link>
          
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
            MedK Farmácia Online
          </p>
        </div>
      </div>
    </div>
  );
}