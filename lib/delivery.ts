import { DeliveryOption } from './types';

export const deliveryOptions: DeliveryOption[] = [
  {
    id: 'passare',
    name: 'Passaré',
    price: 0,
    estimatedDays: 'Hoje'
  },
  {
    id: 'nearby',
    name: 'Bairros Próximos',
    price: 5.00,
    estimatedDays: 'Hoje'
  },
  {
    id: 'fortaleza',
    name: 'Fortaleza',
    price: 10.00,
    estimatedDays: '1-2 dias'
  },
  {
    id: 'pickup',
    name: 'Retirar na Loja',
    price: 0,
    estimatedDays: 'Hoje'
  }
];

// Horário de funcionamento
export const businessHours = {
  monday: { open: '08:00', close: '18:00' },
  tuesday: { open: '08:00', close: '18:00' },
  wednesday: { open: '08:00', close: '18:00' },
  thursday: { open: '08:00', close: '18:00' },
  friday: { open: '08:00', close: '18:00' },
  saturday: { open: '08:00', close: '14:00' },
  sunday: { open: null, close: null }
};

export function isBusinessOpen(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[dayOfWeek] as keyof typeof businessHours;
  const hours = businessHours[today];

  if (!hours.open || !hours.close) return false;

  const [openHour, openMin] = hours.open.split(':').map(Number);
  const [closeHour, closeMin] = hours.close.split(':').map(Number);

  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime <= closeTime;
}

export function getBusinessStatus(): { isOpen: boolean; message: string } {
  const isOpen = isBusinessOpen();
  
  if (isOpen) {
    return {
      isOpen: true,
      message: 'Aberto agora'
    };
  }

  const now = new Date();
  const dayOfWeek = now.getDay();
  
  if (dayOfWeek === 0) {
    return {
      isOpen: false,
      message: 'Fechado - Abre Segunda 08:00'
    };
  }

  return {
    isOpen: false,
    message: 'Fechado - Abre às 08:00'
  };
}