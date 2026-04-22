// lib/whatsapp.ts
import { formatPrice, calculateDiscountPrice } from '@/lib/utils'; // 🌟 IMPORTAÇÕES ADICIONADAS

export const generateWhatsAppLink = (order: any, items: any[]) => {
  const phone = "5585992000696"; // O seu número
  
  // 1. VERIFICAÇÃO DE RECEITA
  const hasPrescriptionItems = items.some(item => 
    item.product?.requiresPrescription === true || item.requiresPrescription === true
  );

  let message = `*Novo Pedido: #${order.orderNumber}*\n`;
  message += `--------------------------\n`;
  message += `*Cliente:* ${order.customerName}\n`;
  message += `*Pagamento:* ${order.paymentMethod}\n`;
  
  if (order.changeFor) {
    message += `*Troco para:* ${formatPrice(Number(order.changeFor))}\n`;
  }
  
  message += `--------------------------\n`;
  message += `*Itens do Pedido:*\n`;
  
  items.forEach(item => {
    const productName = item.product?.name || item.name || 'Produto';
    
    // 🌟 2. PUXA OS VALORES E CALCULA O DESCONTO ANTES DE ENVIAR
    const basePrice = Number(item.product?.price || item.price || 0);
    const discountValue = Number(item.product?.discount || item.discount || 0);
    
    const finalPrice = discountValue > 0 
      ? calculateDiscountPrice(basePrice, discountValue) 
      : basePrice;
    
    const needsRx = item.product?.requiresPrescription || item.requiresPrescription;
    const rxIcon = needsRx ? ' 📄*(Receita)*' : '';

    // 🌟 3. ENVIA O 'finalPrice' COM A NOSSA FUNÇÃO DE FORMATAÇÃO (R$)
    message += `• ${item.quantity}x ${productName}${rxIcon} - ${formatPrice(finalPrice)}\n`;
  });
  
  message += `--------------------------\n`;
  message += `*Total do Pedido: ${formatPrice(Number(order.totalAmount))}*\n`;

  if (order.deliveryAddress) {
    message += `\n*Endereço de Entrega:*\n${order.deliveryAddress}\n`;
  }

  // 4. ADICIONA O ALERTA NO FINAL DA MENSAGEM
  if (hasPrescriptionItems) {
    message += `\n🚨 *ATENÇÃO: RECEITA OBRIGATÓRIA* 🚨\n`;
    message += `_Este pedido contém medicamentos controlados ou antibióticos. Por favor, envie a foto da receita médica aqui no chat para que o nosso farmacêutico possa validar e liberar a entrega._\n`;
  }
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};