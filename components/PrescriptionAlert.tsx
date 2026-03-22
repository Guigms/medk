'use client';

import { Product } from '@/lib/types';

interface PrescriptionAlertProps {
  product: Product;
}

export default function PrescriptionAlert({ product }: PrescriptionAlertProps) {
  if (!product.requiresPrescription) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
      <div className="flex items-start gap-2">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800 mb-1">
            Receita Médica Obrigatória
          </p>
          <p className="text-xs text-yellow-700">
            Este medicamento exige apresentação da receita física no momento da entrega. 
            Você poderá anexar uma foto da receita ao finalizar o pedido.
          </p>
        </div>
      </div>
    </div>
  );
}