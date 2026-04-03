import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';

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
  // 1. Buscar Banners ativos do banco
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { order: 'asc' }
  });

  // 2. Buscar Categorias do banco
  const categories = await prisma.category.findMany();

  // 3. Buscar Produtos em Destaque do banco
  const featuredProductsRaw = await prisma.product.findMany({
    where: { 
      featured: true,
      available: true 
    },
    include: { category: true },
    take: 4
  });

  // 🔥 Aplicando mapper (SOLUÇÃO)
  const featuredProducts = featuredProductsRaw.map(mapProduct);

  // 4. Buscar Depoimentos ativos
  const testimonials = await prisma.testimonial.findMany({
    where: { active: true },
    take: 4
  });

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
              className="bg-[#25D366] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1ebe57]"
            >
              💬 Fale Conosco
            </a>

            <Link
              href="/produtos"
              className="bg-[#E5202A] text-white px-8 py-3 rounded-lg font-bold border-2 border-white"
            >
              Ver Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Nossas Categorias
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/produtos?categoria=${category.slug}`}
                className="bg-gradient-to-br from-[#10BCEC] to-[#253289] p-6 rounded-xl text-center"
              >
                <div className="text-5xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-white">{category.name}</h3>
                <p className="text-sm text-gray-100">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between mb-12">
            <h2 className="text-3xl font-bold">
              ⭐ Produtos em Destaque
            </h2>

            <Link href="/produtos">
              Ver todos
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">
            Nossos Serviços
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-green-50 p-6 rounded-xl">
                <div className="text-5xl">{service.icon}</div>
                <h3 className="font-bold mt-4">{service.title}</h3>
                <p className="text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white text-black p-6 rounded-xl">
                <p>"{t.comment}"</p>
                <strong>{t.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}