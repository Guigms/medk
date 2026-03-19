import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { CartProvider } from '@/lib/cart';
import CartWrapper from '@/components/CartWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
    <html lang="pt-BR">
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
              'geo': {
                '@type': 'GeoCoordinates',
                'latitude': '-3.8123',
                'longitude': '-38.5267'
              },
              'telephone': '+5585213967 83',
              'priceRange': '$$',
              'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': '5.0',
                'reviewCount': '50'
              },
              'openingHoursSpecification': [
                {
                  '@type': 'OpeningHoursSpecification',
                  'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                  'opens': '08:00',
                  'closes': '18:00'
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <CartProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CartWrapper />
        </CartProvider>
      </body>
    </html>
  );
}