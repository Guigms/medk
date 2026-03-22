import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medk.com' },
    update: {},
    create: {
      email: 'admin@medk.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // Criar categorias
  const categoriesData = [
    {
      name: 'Medicamentos',
      slug: 'medicamentos',
      icon: '💊',
      description: 'Medicamentos com e sem prescrição',
    },
    {
      name: 'Higiene',
      slug: 'higiene',
      icon: '🧼',
      description: 'Produtos de higiene pessoal',
    },
    {
      name: 'Suplementos',
      slug: 'suplementos',
      icon: '💪',
      description: 'Vitaminas e suplementos alimentares',
    },
    {
      name: 'Cuidados Pessoais',
      slug: 'cuidados-pessoais',
      icon: '🧴',
      description: 'Cosméticos e cuidados com a pele',
    },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(category);
    console.log('✅ Categoria criada:', category.name);
  }

  // Criar produtos
  const productsData = [
    // Medicamentos
    {
      name: 'Dipirona 500mg',
      description: 'Analgésico e antitérmico - Caixa com 20 comprimidos',
      price: 8.90,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      available: true,
      featured: true,
      requiresPrescription: false,
      expiryDate: new Date('2026-12-31'),
      stock: 100,
      categoryId: categories.find(c => c.slug === 'medicamentos')!.id,
    },
    {
      name: 'Paracetamol 750mg',
      description: 'Analgésico e antitérmico - Caixa com 20 comprimidos',
      price: 12.50,
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
      available: true,
      requiresPrescription: false,
      expiryDate: new Date('2026-08-15'),
      stock: 80,
      categoryId: categories.find(c => c.slug === 'medicamentos')!.id,
    },
    {
      name: 'Ibuprofeno 600mg',
      description: 'Anti-inflamatório - Caixa com 20 comprimidos',
      price: 15.90,
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
      available: true,
      requiresPrescription: true,
      expiryDate: new Date('2026-10-20'),
      stock: 60,
      categoryId: categories.find(c => c.slug === 'medicamentos')!.id,
    },
    {
      name: 'Omeprazol 20mg',
      description: 'Protetor gástrico - Caixa com 28 cápsulas',
      price: 18.90,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
      available: true,
      featured: true,
      requiresPrescription: true,
      expiryDate: new Date('2026-11-30'),
      stock: 90,
      categoryId: categories.find(c => c.slug === 'medicamentos')!.id,
    },
    {
      name: 'Losartana 50mg',
      description: 'Anti-hipertensivo - Caixa com 30 comprimidos',
      price: 22.90,
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
      available: true,
      requiresPrescription: true,
      expiryDate: new Date('2026-09-10'),
      stock: 70,
      categoryId: categories.find(c => c.slug === 'medicamentos')!.id,
    },
    // Higiene
    {
      name: 'Sabonete Líquido Protex',
      description: 'Sabonete antibacteriano 250ml',
      price: 12.90,
      image: 'https://images.unsplash.com/photo-1585155770950-3f6c81802b5e?w=400',
      available: true,
      stock: 150,
      categoryId: categories.find(c => c.slug === 'higiene')!.id,
    },
    {
      name: 'Shampoo Anticaspa',
      description: 'Shampoo Clear 400ml',
      price: 24.90,
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400',
      available: true,
      featured: true,
      discount: 15,
      stock: 120,
      categoryId: categories.find(c => c.slug === 'higiene')!.id,
    },
    {
      name: 'Fraldas Pampers',
      description: 'Pacote com 60 unidades - Tamanho M',
      price: 45.90,
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
      available: true,
      featured: true,
      discount: 20,
      stock: 80,
      categoryId: categories.find(c => c.slug === 'higiene')!.id,
    },
    // Suplementos
    {
      name: 'Vitamina C 1000mg',
      description: 'Fortalece a imunidade - 60 cápsulas',
      price: 28.90,
      image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400',
      available: true,
      featured: true,
      stock: 100,
      categoryId: categories.find(c => c.slug === 'suplementos')!.id,
    },
    {
      name: 'Vitamina D3 2000UI',
      description: 'Saúde dos ossos - 60 cápsulas',
      price: 32.90,
      image: 'https://images.unsplash.com/photo-1526217003268-f904ab24fbff?w=400',
      available: true,
      stock: 85,
      categoryId: categories.find(c => c.slug === 'suplementos')!.id,
    },
    {
      name: 'Ômega 3',
      description: 'Saúde cardiovascular - 120 cápsulas',
      price: 45.90,
      image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
      available: true,
      stock: 60,
      categoryId: categories.find(c => c.slug === 'suplementos')!.id,
    },
    // Cuidados Pessoais
    {
      name: 'Protetor Solar FPS 50',
      description: 'La Roche-Posay 200ml',
      price: 42.90,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      available: true,
      featured: true,
      stock: 70,
      categoryId: categories.find(c => c.slug === 'cuidados-pessoais')!.id,
    },
    {
      name: 'Hidratante Facial Neutrogena',
      description: 'Oil free 50ml',
      price: 34.90,
      image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400',
      available: true,
      stock: 90,
      categoryId: categories.find(c => c.slug === 'cuidados-pessoais')!.id,
    },
  ];

  for (const prod of productsData) {
    const product = await prisma.product.create({
      data: prod,
    });
    console.log('✅ Produto criado:', product.name);
  }

  // Criar banners
  const bannersData = [
    {
      title: 'Sua saúde em boas mãos',
      subtitle: 'Atendimento de qualidade no Passaré há mais de 10 anos',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
      active: true,
      order: 1,
    },
    {
      title: 'Promoção de Fraldas',
      subtitle: 'Até 20% OFF em fraldas selecionadas',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200',
      link: '/produtos?categoria=higiene',
      active: true,
      order: 2,
    },
  ];

  for (const banner of bannersData) {
    await prisma.banner.create({
      data: banner,
    });
  }
  console.log('✅ Banners criados');

  // Criar depoimentos
  const testimonialsData = [
    {
      name: 'Maria Silva',
      rating: 5,
      comment: 'Ótimo atendimento e sempre encontro o que preciso. A equipe é muito atenciosa!',
      date: new Date('2024-01-15'),
      active: true,
    },
    {
      name: 'João Santos',
      rating: 5,
      comment: 'Farmácia bem organizada e limpa. Os preços são justos e o atendimento é excelente.',
      date: new Date('2024-01-10'),
      active: true,
    },
    {
      name: 'Ana Paula',
      rating: 5,
      comment: 'Melhor farmácia do Passaré! Sempre tem o medicamento que preciso e entregam rápido.',
      date: new Date('2024-01-05'),
      active: true,
    },
  ];

  for (const testimonial of testimonialsData) {
    await prisma.testimonial.create({
      data: testimonial,
    });
  }
  console.log('✅ Depoimentos criados');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
