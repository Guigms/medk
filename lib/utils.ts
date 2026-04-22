// Utilitários

export const WHATSAPP_NUMBER = '558521396783';
export const WHATSAPP_NUMBER_FORMATTED = '+55 85 2139-6783';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

export function calculateDiscountPrice(price: number, discount: number): number {
  return price - (price * discount / 100);
}

// 🌟 Atualizada para receber o preço final
export function formatWhatsAppLink(productName?: string, finalPrice?: number): string {
  const baseUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, '')}`;
  
  if (productName) {
    let text = `Olá! Tenho interesse no produto: *${productName}*`;
    
    // Se o preço foi passado, adicionamos à mensagem usando a sua função formatPrice
    if (finalPrice !== undefined) {
      text += ` no valor de ${formatPrice(finalPrice)}.`;
    }
    
    return `${baseUrl}?text=${encodeURIComponent(text)}`;
  }
  
  const defaultMessage = encodeURIComponent('Olá! Gostaria de mais informações.');
  return `${baseUrl}?text=${defaultMessage}`;
}