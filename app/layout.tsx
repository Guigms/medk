import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';
import { ThemeProvider } from '@/components/ThemeProvider';
import ConditionalLayout from '@/components/ConditionalLayout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// 🌟 PRESERVADO: Seus metadados originais de SEO voltam a funcionar perfeitamente aqui!
export const metadata: Metadata = {
  title: 'Farmácia Medk - Sua saúde em boas mãos no Passaré',
  description: 'Farmácia completa no Passaré, Fortaleza. Medicamentos, higiene, suplementos e cuidados pessoais com ótimos preços e atendimento de qualidade. Avaliação 5.0 no Google.',
  keywords: 'farmácia, Passaré, Fortaleza, medicamentos, higiene, suplementos, entrega, farmácia 24h',
  openGraph: {
    title: 'Farmácia Medk - Passaré',
    description: 'Sua saúde em boas mãos. Atendimento de qualidade há mais de 10 anos.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              'name': 'Farmácia Medk',
              'image': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200',
              'description': 'Farmácia completa no Passaré com medicamentos, higiene e suplementos',
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': 'R. N, 4081B',
                'addressLocality': 'Fortaleza',
                'addressRegion': 'CE',
                'addressCountry': 'BR',
                'postalCode': '60743-000'
              },
              'telephone': '+5585213967 83',
              'priceRange': '$$',
              'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': '5.0',
                'reviewCount': '50'
              }
            })
          }}
        />
      </head>
      {/* 🌟 Injetado classes padrões e transição suave para o modo noturno v4 */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 transition-colors duration-300`}>
        <Providers>
          {/* 🌟 Envolve a aplicação com o gerenciador do modo escuro */}
          <ThemeProvider>
            {/* 🌟 Passamos o controle de exibição para o wrapper cliente de forma limpa */}
            <ConditionalLayout>{children}</ConditionalLayout>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}