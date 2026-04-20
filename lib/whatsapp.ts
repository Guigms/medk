// lib/whatsapp.ts

export const generateWhatsAppLink = (order: any, items: any[]) => {
  const phone = "5585992000696"; // O seu número
  
  // 1. VERIFICAÇÃO DE RECEITA (A Mágica acontece aqui)
  // Checa se algum item do carrinho tem a flag requiresPrescription como verdadeira
  const hasPrescriptionItems = items.some(item => 
    item.product?.requiresPrescription === true || item.requiresPrescription === true
  );

  let message = `*Novo Pedido: #${order.orderNumber}*\n`;
  message += `--------------------------\n`;
  message += `*Cliente:* ${order.customerName}\n`;
  message += `*Pagamento:* ${order.paymentMethod}\n`;
  
  if (order.changeFor) {
    message += `*Troco para:* R$ ${Number(order.changeFor).toFixed(2)}\n`;
  }
  
  message += `--------------------------\n`;
  message += `*Itens do Pedido:*\n`;
  
  items.forEach(item => {
    const productName = item.product?.name || item.name || 'Produto';
    const productPrice = item.product?.price || item.price || 0;
    
    // Adiciona um emoji de alerta ao lado do nome do produto na lista, se ele exigir receita
    const needsRx = item.product?.requiresPrescription || item.requiresPrescription;
    const rxIcon = needsRx ? ' 📄*(Receita)*' : '';

    message += `• ${item.quantity}x ${productName}${rxIcon} - R$ ${Number(productPrice).toFixed(2)}\n`;
  });
  
  message += `--------------------------\n`;
  message += `*Total do Pedido: R$ ${Number(order.totalAmount).toFixed(2)}*\n`;

  if (order.deliveryAddress) {
    message += `\n*Endereço de Entrega:*\n${order.deliveryAddress}\n`;
  }

  // 2. ADICIONA O ALERTA NO FINAL DA MENSAGEM
  if (hasPrescriptionItems) {
    message += `\n🚨 *ATENÇÃO: RECEITA OBRIGATÓRIA* 🚨\n`;
    message += `_Este pedido contém medicamentos controlados ou antibióticos. Por favor, envie a foto da receita médica aqui no chat para que o nosso farmacêutico possa validar e liberar a entrega._\n`;
  }
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};