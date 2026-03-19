'use client';

import { useState } from 'react';
import CartButton from './CartButton';
import CartModal from './CartModal';

export default function CartWrapper() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <CartButton onClick={() => setIsCartOpen(true)} />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
