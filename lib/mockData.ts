import { Product, Category, Service, Banner, Testimonial } from './types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Medicamentos',
    slug: 'medicamentos',
    icon: '💊',
    description: 'Medicamentos com e sem prescrição'
  },
  {
    id: '2',
    name: 'Higiene',
    slug: 'higiene',
    icon: '🧼',
    description: 'Produtos de higiene pessoal'
  },
  {
    id: '3',
    name: 'Suplementos',
    slug: 'suplementos',
    icon: '💪',
    description: 'Vitaminas e suplementos alimentares'
  },
  {
    id: '4',
    name: 'Cuidados Pessoais',
    slug: 'cuidados-pessoais',
    icon: '🧴',
    description: 'Cosméticos e cuidados com a pele'
  }
];

export const products: Product[] = [
  // Medicamentos
  {
    id: '1',
    name: 'Dipirona 500mg',
    category: 'medicamentos',
    price: 8.90,
    description: 'Analgésico e antitérmico - Caixa com 20 comprimidos',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    available: true,
    featured: true,
    requiresPrescription: false,
    expiryDate: '2026-12-31',
    clicks: 45
  },
  {
    id: '2',
    name: 'Paracetamol 750mg',
    category: 'medicamentos',
    price: 12.50,
    description: 'Analgésico e antitérmico - Caixa com 20 comprimidos',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
    available: true,
    requiresPrescription: false,
    expiryDate: '2026-08-15',
    clicks: 38
  },
  {
    id: '3',
    name: 'Ibuprofeno 600mg',
    category: 'medicamentos',
    price: 15.90,
    description: 'Anti-inflamatório - Caixa com 20 comprimidos',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400',
    available: true,
    requiresPrescription: true,
    expiryDate: '2026-10-20',
    clicks: 52
  },
  {
    id: '4',
    name: 'Omeprazol 20mg',
    category: 'medicamentos',
    price: 18.90,
    description: 'Protetor gástrico - Caixa com 28 cápsulas',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    available: true,
    featured: true,
    requiresPrescription: true,
    expiryDate: '2026-11-30',
    clicks: 67
  },
  {
    id: '5',
    name: 'Losartana 50mg',
    category: 'medicamentos',
    price: 22.90,
    description: 'Anti-hipertensivo - Caixa com 30 comprimidos',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400',
    available: true,
    requiresPrescription: true,
    expiryDate: '2026-09-10',
    clicks: 89
  },
  // Higiene
  {
    id: '6',
    name: 'Sabonete Líquido Protex',
    category: 'higiene',
    price: 12.90,
    description: 'Sabonete antibacteriano 250ml',
    image: 'https://images.unsplash.com/photo-1585155770950-3f6c81802b5e?w=400',
    available: true
  },
  {
    id: '7',
    name: 'Shampoo Anticaspa',
    category: 'higiene',
    price: 24.90,
    description: 'Shampoo Clear 400ml',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400',
    available: true,
    featured: true,
    discount: 15
  },
  {
    id: '8',
    name: 'Pasta de Dente Colgate Total 12',
    category: 'higiene',
    price: 8.50,
    description: 'Proteção completa 90g',
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400',
    available: true
  },
  {
    id: '9',
    name: 'Desodorante Rexona',
    category: 'higiene',
    price: 11.90,
    description: 'Aerosol 150ml',
    image: 'https://images.unsplash.com/photo-1625944228397-8b4b94691e2b?w=400',
    available: true
  },
  {
    id: '10',
    name: 'Fraldas Pampers',
    category: 'higiene',
    price: 45.90,
    description: 'Pacote com 60 unidades - Tamanho M',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
    available: true,
    featured: true,
    discount: 20
  },
  // Suplementos
  {
    id: '11',
    name: 'Vitamina C 1000mg',
    category: 'suplementos',
    price: 28.90,
    description: 'Fortalece a imunidade - 60 cápsulas',
    image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400',
    available: true,
    featured: true
  },
  {
    id: '12',
    name: 'Vitamina D3 2000UI',
    category: 'suplementos',
    price: 32.90,
    description: 'Saúde dos ossos - 60 cápsulas',
    image: 'https://images.unsplash.com/photo-1526217003268-f904ab24fbff?w=400',
    available: true
  },
  {
    id: '13',
    name: 'Ômega 3',
    category: 'suplementos',
    price: 45.90,
    description: 'Saúde cardiovascular - 120 cápsulas',
    image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400',
    available: true
  },
  {
    id: '14',
    name: 'Whey Protein',
    category: 'suplementos',
    price: 89.90,
    description: 'Proteína isolada - 900g sabor baunilha',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400',
    available: true,
    discount: 10
  },
  {
    id: '15',
    name: 'Multivitamínico',
    category: 'suplementos',
    price: 38.90,
    description: 'Complexo vitamínico completo - 60 cápsulas',
    image: 'https://images.unsplash.com/photo-1556911073-a517e752729c?w=400',
    available: true
  },
  // Cuidados Pessoais
  {
    id: '16',
    name: 'Protetor Solar FPS 50',
    category: 'cuidados-pessoais',
    price: 42.90,
    description: 'La Roche-Posay 200ml',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    available: true,
    featured: true
  },
  {
    id: '17',
    name: 'Hidratante Facial Neutrogena',
    category: 'cuidados-pessoais',
    price: 34.90,
    description: 'Oil free 50ml',
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400',
    available: true
  },
  {
    id: '18',
    name: 'Sérum Vitamina C',
    category: 'cuidados-pessoais',
    price: 56.90,
    description: 'Clareador e antioxidante 30ml',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    available: true
  },
  {
    id: '19',
    name: 'Máscara Facial',
    category: 'cuidados-pessoais',
    price: 18.90,
    description: 'Hidratante intensiva - Caixa com 5 unidades',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
    available: true
  },
  {
    id: '20',
    name: 'Creme Anti-idade',
    category: 'cuidados-pessoais',
    price: 68.90,
    description: 'L\'Oréal Revitalift 50ml',
    image: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=400',
    available: true
  }
];

export const services: Service[] = [
  {
    id: '1',
    title: 'Aferição de Pressão',
    description: 'Serviço gratuito de medição de pressão arterial',
    icon: '🩺'
  },
  {
    id: '2',
    title: 'Aplicação de Injetáveis',
    description: 'Aplicação segura por profissionais qualificados',
    icon: '💉'
  },
  {
    id: '3',
    title: 'Entrega em Domicílio',
    description: 'Entregamos seus medicamentos na sua casa',
    icon: '🏠'
  },
  {
    id: '4',
    title: 'Farmacêutico Disponível',
    description: 'Tire suas dúvidas com nosso farmacêutico',
    icon: '👨‍⚕️'
  }
];

export const banners: Banner[] = [
  {
    id: '1',
    title: 'Sua saúde em boas mãos',
    subtitle: 'Atendimento de qualidade no Passaré há mais de 10 anos',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
    active: true
  },
  {
    id: '2',
    title: 'Promoção de Fraldas',
    subtitle: 'Até 20% OFF em fraldas selecionadas',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200',
    link: '/produtos?categoria=higiene',
    active: true
  },
  {
    id: '3',
    title: 'Suplementos em Oferta',
    subtitle: 'Cuide da sua saúde com preços especiais',
    image: 'https://images.unsplash.com/photo-1556911073-a517e752729c?w=1200',
    link: '/produtos?categoria=suplementos',
    active: true
  }
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Maria Silva',
    rating: 5,
    comment: 'Ótimo atendimento e sempre encontro o que preciso. A equipe é muito atenciosa!',
    date: '2024-01-15'
  },
  {
    id: '2',
    name: 'João Santos',
    rating: 5,
    comment: 'Farmácia bem organizada e limpa. Os preços são justos e o atendimento é excelente.',
    date: '2024-01-10'
  },
  {
    id: '3',
    name: 'Ana Paula',
    rating: 5,
    comment: 'Melhor farmácia do Passaré! Sempre tem o medicamento que preciso e entregam rápido.',
    date: '2024-01-05'
  },
  {
    id: '4',
    name: 'Carlos Eduardo',
    rating: 5,
    comment: 'Atendimento impecável. A farmacêutica é muito atenciosa e sempre me orienta bem.',
    date: '2023-12-28'
  }
];