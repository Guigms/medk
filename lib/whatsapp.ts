// lib/whatsapp.ts
export const generateWhatsAppLink = (order: any, items: any[]) => {
  const phone = "5585999999999"; // Seu número
  
  let message = `*Novo Pedido: #${order.orderNumber}*\n`;
  message += `--------------------------\n`;
  message += `*Cliente:* ${order.customerName}\n`;
  message += `*Pagamento:* ${order.paymentMethod}\n`;
  if (order.changeFor) message += `*Troco para:* ${order.changeFor}\n`;
  message += `--------------------------\n`;
  
  items.forEach(item => {
    message += `• ${item.quantity}x ${item.name} - R$ ${item.price}\n`;
  });
  
  message += `--------------------------\n`;
  message += `*Total: R$ ${order.totalAmount}*`;
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};