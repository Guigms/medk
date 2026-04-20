import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';

// 1. O SEGREDO DO TEMPO REAL: Desliga o cache estático para a Home sempre atualizar
export const dynamic = 'force-dynamic';

// 🔥 Mapper profissional (resolve TODOS os problemas de tipagem)
function mapProduct(p: any) {
  return {
    ...p,
    price: Number(p.price),

    // Converte relação para string (id)
    category: p.category?.id,

    // Normaliza null → undefined
    discount: p.discount ?? undefined,
    brand: p.brand ?? undefined,

    // 🚨 CORREÇÃO PRINCIPAL
    expiryDate: p.expiryDate
      ? new Date(p.expiryDate).toISOString()
      : undefined,
  };
}

export default async function Home() {
  // Executa todas as buscas em paralelo para deixar a página mais rápida
  const [banners, categories, featuredProductsRaw, testimonials] = await Promise.all([
    prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    }),
    prisma.category.findMany(),
    prisma.product.findMany({
      where: { 
        featured: true,
        available: true 
      },
      include: { category: true },
      take: 8 // Aumentei para 8 para preencher melhor a tela (2 linhas)
    }),
    prisma.testimonial.findMany({
      where: { active: true },
      take: 4
    })
  ]);

  // 🔥 Aplicando mapper (SOLUÇÃO)
  const featuredProducts = featuredProductsRaw.map(mapProduct);

  // Banner padrão caso não haja nenhum no banco
  const activeBanner = banners[0] || {
    title: 'Sua saúde em boas mãos',
    subtitle: 'Atendimento de qualidade no Passaré',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200'
  };

  const services = [
    { id: 1, icon: '💊', title: 'Medicamentos', description: 'Amplo estoque de genéricos e similares' },
    { id: 2, icon: '💉', title: 'Aplicações', description: 'Profissionais qualificados para injetáveis' },
    { id: 3, icon: '🩺', title: 'Aferição', description: 'Pressão arterial e glicemia capilar' },
    { id: 4, icon: '🚚', title: 'Entrega Rápida', description: 'Receba no conforto da sua casa' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-[#253289] to-[#10BCEC]">
        <div className="absolute inset-0">
          <Image
            src={activeBanner.image}
            alt={activeBanner.title}
            fill
            className="object-cover opacity-30"
            priority
            sizes="100vw"
          />
        </div>

        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {activeBanner.title}
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            {activeBanner.subtitle}
          </p>

          <div className="w-full max-w-2xl">
            <SearchBar />
          </div>

          <div className="flex flex-wrap gap-4 mt-8 justify-center">
            <a
              href="https://wa.me/558521396783"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1ebe57] transition-colors"
            >
              💬 Fale Conosco
            </a>

            <Link
              href="/produtos"
              className="bg-[#E5202A] text-white px-8 py-3 rounded-lg font-bold border-2 border-white hover:bg-[#c41a24] transition-colors"
            >
              Ver Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-[#253289]">
            Nossas Categorias
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/produtos?categoria=${category.slug}`}
                className="bg-gradient-to-br from-[#10BCEC] to-[#253289] p-6 rounded-xl hover:shadow-lg transition-all hover:scale-105 text-center group"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-white">{category.name}</h3>
                <p className="text-sm text-gray-100 line-clamp-2">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              ⭐ Produtos em Destaque
            </h2>

            <Link
              href="/produtos"
              className="text-[#253289] hover:text-[#10BCEC] font-bold flex items-center gap-2 transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Nenhum produto em destaque no momento.
            </div>
          )}
        </div>
      </section>

      {/* Serviços */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-[#253289]">
            Nossos Serviços
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-[#f0f9ff] p-6 rounded-xl hover:shadow-md transition-shadow border border-blue-50">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="font-bold text-lg text-gray-900 mt-4 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 bg-gradient-to-br from-[#253289] to-[#10BCEC] text-white">
        <div className="container mx-auto px-4">
           <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">O que nossos clientes dizem</h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">⭐</span>
              <span className="text-3xl font-bold">5.0</span>
            </div>
            <p className="text-lg opacity-90 mt-2">Avaliação média no Google</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white text-gray-900 p-6 rounded-xl shadow-lg">
                 <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic line-clamp-4">"{t.comment}"</p>
                <strong className="text-[#253289]">{t.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}