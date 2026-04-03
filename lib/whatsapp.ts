// lib/whatsapp.ts

export const generateWhatsAppLink = (order: any, items: any[]) => {
  const phone = "5585992000696"; 
  
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
    
    message += `• ${item.quantity}x ${productName} - R$ ${Number(productPrice).toFixed(2)}\n`;
  });
  
  message += `--------------------------\n`;
  message += `*Total do Pedido: R$ ${Number(order.totalAmount).toFixed(2)}*\n`;

  if (order.deliveryAddress) {
    message += `\n*Endereço de Entrega:*\n${order.deliveryAddress}`;
  }
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};