// lib/whatsapp.ts
// 🌟 IMPORTAÇÕES ATUALIZADAS PUXANDO DA SUA UTILS
import { 
  formatPrice, 
  calculateDiscountPrice, 
  traduzirMetodoPagamento, 
  WHATSAPP_NUMBER 
} from '@/lib/utils'; 

export const generateWhatsAppLink = (order: any, items: any[]) => {
  // 1. VERIFICAÇÃO DE RECEITA
  const hasPrescriptionItems = items.some(item => 
    item.product?.requiresPrescription === true || item.requiresPrescription === true
  );

  // 🌟 2. USANDO A SUA NOVA FUNÇÃO DA UTILS
  const translatedPayment = traduzirMetodoPagamento(order.paymentMethod);

  let message = `*Novo Pedido: #${order.orderNumber}*\n`;
  message += `--------------------------\n`;
  message += `*Cliente:* ${order.customerName}\n`;
  message += `*Pagamento:* ${translatedPayment}\n`;
  
  if (order.changeFor) {
    message += `*Troco para:* ${formatPrice(Number(order.changeFor))}\n`;
  }
  
  message += `--------------------------\n`;
  message += `*Itens do Pedido:*\n`;
  
  items.forEach(item => {
    const productName = item.product?.name || item.name || 'Produto';
    
    const basePrice = Number(item.product?.price || item.price || 0);
    const discountValue = Number(item.product?.discount || item.discount || 0);
    
    const finalPrice = discountValue > 0 
      ? calculateDiscountPrice(basePrice, discountValue) 
      : basePrice;
    
    const needsRx = item.product?.requiresPrescription || item.requiresPrescription;
    const rxIcon = needsRx ? ' 📄*(Receita)*' : '';

    message += `• ${item.quantity}x ${productName}${rxIcon} - ${formatPrice(finalPrice)}\n`;
  });
  
  message += `--------------------------\n`;
  message += `*Total do Pedido: ${formatPrice(Number(order.totalAmount))}*\n`;

  if (order.deliveryAddress) {
    message += `\n*Endereço de Entrega:*\n${order.deliveryAddress}\n`;
  }

  // ALERTA NO FINAL DA MENSAGEM
  if (hasPrescriptionItems) {
    message += `\n🚨 *ATENÇÃO: RECEITA OBRIGATÓRIA* 🚨\n`;
    message += `_Este pedido contém medicamentos controlados ou antibióticos. Por favor, envie a foto da receita médica aqui no chat para que o nosso farmacêutico possa validar e liberar a entrega._\n`;
  }
  
  // 🌟 3. USANDO O NÚMERO CENTRALIZADO DA SUA UTILS E LIMPANDO ESPAÇOS
  const cleanPhone = WHATSAPP_NUMBER.replace(/\s/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};