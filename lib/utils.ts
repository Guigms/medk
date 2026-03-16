// Utilitários

export const WHATSAPP_NUMBER = '5585213967 83';
export const WHATSAPP_NUMBER_FORMATTED = '+55 85 2139-6783';

export function formatWhatsAppLink(productName?: string): string {
  const baseUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/\s/g, '')}`;
  
  if (productName) {
    const message = encodeURIComponent(`Olá! Tenho interesse no produto: ${productName}`);
    return `${baseUrl}?text=${message}`;
  }
  
  const defaultMessage = encodeURIComponent('Olá! Gostaria de mais informações.');
  return `${baseUrl}?text=${defaultMessage}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

export function calculateDiscountPrice(price: number, discount: number): number {
  return price - (price * discount / 100);
}