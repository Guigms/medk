'use client';

import { useCart } from '@/lib/cart';
import { formatPrice, formatWhatsAppLink, calculateDiscountPrice } from '@/lib/utils';
import { deliveryOptions } from '@/lib/delivery';
import Image from 'next/image';
import { useState } from 'react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryOptions[0]);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);

  const hasPrescriptionItems = items.some(item => item.product.requiresPrescription);

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrescriptionFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (items.length === 0) return;

    // Formatar mensagem para WhatsApp
    let message = '🛒 *Pedido da Farmácia Medk*\n\n';
    
    items.forEach((item, index) => {
      const finalPrice = item.product.discount
        ? calculateDiscountPrice(item.product.price, item.product.discount)
        : item.product.price;
      
      message += `${index + 1}. *${item.product.name}*\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Preço unitário: ${formatPrice(finalPrice)}\n`;
      message += `   Subtotal: ${formatPrice(finalPrice * item.quantity)}\n`;
      
      if (item.product.requiresPrescription) {
        message += `   ⚠️ *Requer Receita Médica*\n`;
      }
      message += '\n';
    });

    const subtotal = getTotalPrice();
    const deliveryFee = selectedDelivery.price;
    const total = subtotal + deliveryFee;

    message += `\n💰 *Subtotal: ${formatPrice(subtotal)}*\n`;
    message += `🚚 *Entrega (${selectedDelivery.name}): ${formatPrice(deliveryFee)}*\n`;
    message += `💵 *Total: ${formatPrice(total)}*\n\n`;

    if (hasPrescriptionItems) {
      message += '📋 *Receita Médica*: ';
      message += prescriptionFile ? 'Anexada ✅\n' : 'Será apresentada na entrega\n';
      message += '\n';
    }

    message += `📍 *Entrega*: ${selectedDelivery.name}\n`;
    message += `⏰ *Previsão*: ${selectedDelivery.estimatedDays}\n\n`;
    message += 'Gostaria de finalizar este pedido!';

    // Abrir WhatsApp
    const whatsappUrl = formatWhatsAppLink(message);
    window.open(whatsappUrl, '_blank');

    // Limpar carrinho após enviar
    clearCart();
    setPrescriptionFile(null);
    setPrescriptionPreview(null);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-white z-50 shadow-2xl overflow-hidden flex flex-col" data-testid="cart-modal">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            🛒 Meu Carrinho
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-green-700 p-2 rounded-lg transition-colors"
            data-testid="close-cart-button"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-cart">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Carrinho Vazio</h3>
              <p className="text-gray-600 mb-4">Adicione produtos para fazer seu pedido</p>
              <button
                onClick={onClose}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const finalPrice = item.product.discount
                  ? calculateDiscountPrice(item.product.price, item.product.discount)
                  : item.product.price;

                return (
                  <div
                    key={item.product.id}
                    className="bg-gray-50 rounded-lg p-4 flex gap-4"
                    data-testid={`cart-item-${item.product.id}`}
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="80px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{item.product.name}</h3>
                      <p className="text-green-600 font-bold mb-2">
                        {formatPrice(finalPrice)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="bg-gray-300 text-gray-700 w-8 h-8 rounded hover:bg-gray-400 transition-colors font-bold"
                          data-testid={`decrease-${item.product.id}`}
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-bold text-gray-900" data-testid={`quantity-${item.product.id}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="bg-gray-300 text-gray-700 w-8 h-8 rounded hover:bg-gray-400 transition-colors font-bold"
                          data-testid={`increase-${item.product.id}`}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                          data-testid={`remove-${item.product.id}`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                      <p className="font-bold text-gray-900" data-testid={`subtotal-${item.product.id}`}>
                        {formatPrice(finalPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
            {/* Delivery Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🚚 Opção de Entrega
              </label>
              <div className="space-y-2">
                {deliveryOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedDelivery.id === option.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={option.id}
                      checked={selectedDelivery.id === option.id}
                      onChange={() => setSelectedDelivery(option)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.name}</div>
                      <div className="text-xs text-gray-600">{option.estimatedDays}</div>
                    </div>
                    <div className="font-bold text-gray-900">
                      {option.price === 0 ? 'Grátis' : formatPrice(option.price)}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Prescription Upload */}
            {hasPrescriptionItems && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📋 Receita Médica (Opcional)
                </label>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                  <p className="text-xs text-yellow-700">
                    ⚠️ Seu pedido contém medicamentos que exigem receita. 
                    Você pode anexar agora ou apresentar na entrega.
                  </p>
                </div>
                
                {prescriptionPreview ? (
                  <div className="relative">
                    <img 
                      src={prescriptionPreview} 
                      alt="Receita" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setPrescriptionFile(null);
                        setPrescriptionPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePrescriptionUpload}
                      className="hidden"
                    />
                    <div className="text-gray-600">
                      <span className="text-2xl">📷</span>
                      <p className="text-sm mt-2">Clique para anexar foto da receita</p>
                    </div>
                  </label>
                )}
              </div>
            )}

            {/* Total */}
            <div className="space-y-2 pt-2 border-t border-gray-300">
              <div className="flex items-center justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Entrega:</span>
                <span className="font-medium">
                  {selectedDelivery.price === 0 ? 'Grátis' : formatPrice(selectedDelivery.price)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                <span className="text-xl font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-green-600" data-testid="cart-total">
                  {formatPrice(getTotalPrice() + selectedDelivery.price)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-bold text-lg flex items-center justify-center gap-2"
                data-testid="checkout-button"
              >
                💬 Finalizar Pedido no WhatsApp
              </button>
              <button
                onClick={clearCart}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                data-testid="clear-cart-button"
              >
                Limpar Carrinho
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}