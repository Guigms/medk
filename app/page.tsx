import SearchBar from '@/components/SearchBar';
import ProductCard from '@/components/ProductCard';
import { products, categories, services, testimonials, banners } from '@/lib/mockData';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const featuredProducts = products.filter(p => p.featured && p.available);
  const activeBanner = banners.find(b => b.active) || banners[0];

  return (
    <div>
      {/* Hero Section with Banner */}
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="hero-title">
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
              href="https://wa.me/5585213967 83"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition-colors"
              data-testid="hero-whatsapp-button"
            >
              💬 Fale Conosco
            </a>
            <Link
              href="/produtos"
              className="bg-green-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors border-2 border-white"
              data-testid="hero-products-button"
            >
              Ver Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Nossas Categorias
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/produtos?categoria=${category.slug}`}
                className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl hover:shadow-lg transition-all hover:scale-105 text-center group"
                data-testid={`category-${category.slug}`}
              >
                <div className="text-5xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-green-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              ⭐ Produtos em Destaque
            </h2>
            <Link
              href="/produtos"
              className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
            >
              Ver todos
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Nossos Serviços
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-green-50 p-6 rounded-xl hover:shadow-lg transition-shadow text-center"
                data-testid={`service-${service.id}`}
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-green-500 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-6xl">⭐</span>
              <div>
                <div className="text-5xl font-bold">5.0</div>
                <div className="text-xl">Avaliação no Google</div>
              </div>
            </div>
            <p className="text-xl">Veja o que nossos clientes dizem sobre nós</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white text-gray-900 p-6 rounded-xl shadow-lg"
                data-testid={`testimonial-${testimonial.id}`}
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                <div className="font-bold text-green-600">{testimonial.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para cuidar da sua saúde?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Entre em contato conosco pelo WhatsApp e faça seu pedido agora mesmo!
          </p>
          <a
            href="https://wa.me/5585213967 83"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 text-white px-12 py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors"
            data-testid="cta-whatsapp-button"
          >
            💬 Falar no WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}