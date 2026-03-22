'use client';

import Link from 'next/link';
import { useState } from 'react';
import BusinessStatus from './BusinessStatus';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[#253289] text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="border-b border-[#10BCEC] py-2 text-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                📍 R. N, 4081B - Passaré, Fortaleza - CE
              </span>
              <BusinessStatus />
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span>⭐ 5.0 no Google</span>
              <a href="tel:+5585213967 83" className="hover:underline">
                📞 (85) 2139-6783
              </a>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/medk-logo.jpeg" 
                alt="Farmácia Medk" 
                width={60} 
                height={60}
                className="rounded-lg"
              />
              <div>
                <div className="text-xl md:text-2xl font-bold">Farmácia Medk</div>
                <div className="text-xs text-[#10BCEC]">Compromisso com a sua saúde</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="hover:text-[#10BCEC] transition-colors">
                Início
              </Link>
              <Link href="/produtos" className="hover:text-[#10BCEC] transition-colors">
                Produtos
              </Link>
              <Link href="/favoritos" className="hover:text-[#10BCEC] transition-colors flex items-center gap-1">
                ❤️ Favoritos
              </Link>
              <Link href="/servicos" className="hover:text-[#10BCEC] transition-colors">
                Serviços
              </Link>
              <Link href="/contato" className="hover:text-[#10BCEC] transition-colors">
                Contato
              </Link>
              <Link 
                href="/admin" 
                className="bg-[#E5202A] text-white px-4 py-2 rounded-lg hover:bg-[#c41a24] transition-colors font-medium"
              >
                Admin
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
              data-testid="mobile-menu-button"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-green-500" data-testid="mobile-menu">
            <div className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="hover:text-green-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                href="/produtos" 
                className="hover:text-green-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Produtos
              </Link>
              <Link 
                href="/favoritos" 
                className="hover:text-green-100 transition-colors flex items-center gap-1"
                onClick={() => setIsMenuOpen(false)}
              >
                ❤️ Favoritos
              </Link>
              <Link 
                href="/servicos" 
                className="hover:text-green-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Serviços
              </Link>
              <Link 
                href="/contato" 
                className="hover:text-green-100 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
              <Link 
                href="/admin" 
                className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium inline-block"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
              <a href="tel:+5585213967 83" className="text-sm">
                📞 (85) 2139-6783
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}