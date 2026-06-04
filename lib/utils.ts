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

export function traduzirMetodoPagamento(metodo?: string): string {
  if (!metodo) return 'Não informado';
  
  const traducoes: Record<string, string> = {
    'CREDIT_CARD': 'Cartão de Crédito',
    'DEBIT_CARD': 'Cartão de Débito',
    'CASH': 'Dinheiro',
    'PIX': 'PIX',
    'BANK_SLIP': 'Boleto',
    'STORE_CREDIT': 'Crédito na Loja'
  };

  // Retorna a tradução ou, se for uma palavra nova não mapeada, retorna como veio
  return traducoes[metodo.toUpperCase()] || metodo;
}

export function traduzirStatusPedido(status?: string): string {
  if (!status) return 'Desconhecido';
  
  const traducoes: Record<string, string> = {
    'PENDING': 'Pendente',
    'PROCESSING': 'Processando',
    'COMPLETED': 'Concluído',
    'DELIVERED': 'Entregue',
    'CANCELLED': 'Cancelado',
    'REFUNDED': 'Reembolsado'
  };

  return traducoes[status.toUpperCase()] || status;
}