import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ProdutosPageProps {
  // Agora tipamos corretamente como uma Promise exigida pelo Next.js 15+
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  // 1. O PASSO MÁGICO: Aguardar os parâmetros da URL antes de ler
  const params = await searchParams;
  
  const query = params.q || '';
  const selectedCategory = params.categoria || 'all';

  // 2. Buscar categorias reais do banco
  const categories = await prisma.category.findMany();

  // 3. Montar o filtro dinâmico para o Prisma
  const where: any = { available: true };
  
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
      { brand: { contains: query } },
    ];
  }

  if (selectedCategory !== 'all') {
    where.category = { slug: selectedCategory };
  }

  // 4. Buscar os produtos filtrados
  const productsRaw = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  // 5. Converter Preço de Decimal para Number para o Frontend não quebrar
  const filteredProducts = productsRaw.map((p) => ({
    ...p,
    price: Number(p.price),
  }));

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 bg-white p-8 rounded-2xl shadow-sm">
          <h1 className="text-4xl font-black mb-4 text-[#253289]">Nossos Produtos</h1>
          <p className="text-gray-600 mb-8 text-lg">Encontre tudo o que você precisa para cuidar da sua saúde</p>
          
          <div className="max-w-3xl">
            <SearchBar />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
            <Link
              href={`/produtos${query ? `?q=${query}` : ''}`}
              className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === 'all'
                  ? 'bg-[#253289] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todos
            </Link>

            {categories.map((category) => {
              const href = `/produtos?categoria=${category.slug}${query ? `&q=${query}` : ''}`;
              
              return (
                <Link
                  key={category.id}
                  href={href}
                  className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-2 ${
                    selectedCategory === category.slug
                      ? 'bg-[#253289] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-500 font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            {query && ` para "${query}"`}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">Nenhum produto encontrado</h3>
            <p className="text-gray-600 mb-8">Não encontramos nada para a categoria ou termo buscado.</p>
            <Link
              href="/produtos"
              className="bg-[#253289] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#10BCEC] transition-colors"
            >
              Limpar filtros
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}