'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">💊</span>
              Farmácia Medk
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Sua saúde em boas mãos no Passaré há mais de 10 anos. Atendimento de qualidade e produtos com os melhores preços.
            </p>
            <div className="flex items-center gap-2 text-yellow-400">
              <span className="text-2xl">⭐</span>
              <span className="font-bold text-lg">5.0</span>
              <span className="text-gray-400 text-sm">no Google</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/produtos" className="text-gray-400 hover:text-white transition-colors">
                  Produtos
                </Link>
              </li>
              <li>
                <Link href="/servicos" className="text-gray-400 hover:text-white transition-colors">
                  Serviços
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-gray-400 hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4">Categorias</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/produtos?categoria=medicamentos" className="text-gray-400 hover:text-white transition-colors">
                  Medicamentos
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=higiene" className="text-gray-400 hover:text-white transition-colors">
                  Higiene
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=suplementos" className="text-gray-400 hover:text-white transition-colors">
                  Suplementos
                </Link>
              </li>
              <li>
                <Link href="/produtos?categoria=cuidados-pessoais" className="text-gray-400 hover:text-white transition-colors">
                  Cuidados Pessoais
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>R. N, 4081B<br/>Passaré, Fortaleza - CE</span>
              </li>
              <li>
                <a href="tel:+5585213967 83" className="flex items-center gap-2 hover:text-white transition-colors">
                  <span>📞</span>
                  <span>(85) 2139-6783</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://wa.me/5585213967 83" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <span>💬</span>
                  <span>WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Farmácia Medk. Todos os direitos reservados.</p>
          <p className="mt-2">Desenvolvido com 💚 para cuidar da sua saúde</p>
        </div>
      </div>
    </footer>
  );
}