'use client';

import { getBusinessStatus } from '@/lib/delivery';
import { useEffect, useState } from 'react';

export default function BusinessStatus() {
  const [status, setStatus] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    const updateStatus = () => {
      setStatus(getBusinessStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
      status.isOpen 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'
    }`}>
      <span className={`w-2 h-2 rounded-full ${
        status.isOpen ? 'bg-green-500' : 'bg-red-500'
      } animate-pulse`}></span>
      {status.message}
    </div>
  );
}