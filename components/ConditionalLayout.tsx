'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import CartWrapper from '@/components/CartWrapper';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {/* Se não for rota de admin, renderiza a estrutura completa do e-commerce */}
      {!isAdmin && <Header />}
      
      <main className={isAdmin ? "" : "min-h-screen"}>
        {children}
      </main>
      
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppButton />}
      {!isAdmin && <CartWrapper />}
    </>
  );
}