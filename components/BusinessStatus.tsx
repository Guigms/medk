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
        ? 'bg-[#10BCEC] bg-opacity-20 text-white' 
        : 'bg-[#E5202A] bg-opacity-20 text-white'
    }`}>
      <span className={`w-2 h-2 rounded-full ${
        status.isOpen ? 'bg-[#10BCEC]' : 'bg-[#E5202A]'
      } animate-pulse`}></span>
      {status.message}
    </div>
  );
}