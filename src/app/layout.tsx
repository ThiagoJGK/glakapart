import type { Metadata } from 'next';
import { Jost, Montserrat, Qwitcher_Grypen } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';
import ChatWidget from '@/components/layout/ChatWidget';

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-montserrat',
});

const qwitcher = Qwitcher_Grypen({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-qwitcher',
});

export const metadata: Metadata = {
  title: 'Glak Apart | Apartamentos turísticos en Urdinarrain, Entre Ríos',
  description: 'Glak Apart: Apartamentos turísticos en Urdinarrain, Entre Ríos. Alojamiento rural con pileta, naturaleza, gastronomía regional y la mejor experiencia de descanso en el campo entrerriano.',
  keywords: 'Glak Apart, apartamentos Urdinarrain, alojamiento Urdinarrain, cabañas Entre Ríos, turismo rural Entre Ríos, apart hotel Urdinarrain, alojamiento turístico Urdinarrain, cabañas con pileta Entre Ríos, escapada rural Argentina',
  metadataBase: new URL('https://glakapart.com.ar'),
  openGraph: {
    type: 'website',
    url: 'https://glakapart.com.ar',
    title: 'Glak Apart | Apartamentos turísticos en Urdinarrain, Entre Ríos',
    description: 'Apartamentos turísticos en Urdinarrain, Entre Ríos. Alojamiento rural con pileta, naturaleza, gastronomía regional y descanso en el campo entrerriano.',
    siteName: 'Glak Apart',
    images: [{
      url: 'https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?auto=format&fit=crop&q=80&w=2000',
    }],
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glak Apart | Apartamentos turísticos en Urdinarrain, Entre Ríos',
    description: 'Apartamentos turísticos en Urdinarrain, Entre Ríos. Alojamiento rural con pileta, naturaleza, gastronomía regional y descanso en el campo entrerriano.',
    images: ['https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?auto=format&fit=crop&q=80&w=2000'],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${jost.variable} ${montserrat.variable} ${qwitcher.variable}`}>
        <Providers>
          {children}
          <ChatWidget />
        </Providers>
        <Script id="schema-lodging" type="application/ld+json" strategy="lazyOnload">
          {`
            {
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              "name": "Glak Apart",
              "description": "Apartamentos turísticos en Urdinarrain, Entre Ríos. Alojamiento rural con pileta y naturaleza.",
              "url": "https://glakapart.com.ar",
              "telephone": "+5493446XXXXXXXX", // TO BE UPDATED BY OWNER
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Urdinarrain",
                "addressLocality": "Urdinarrain",
                "addressRegion": "Entre Ríos",
                "postalCode": "2826",
                "addressCountry": "AR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -32.6833,
                "longitude": -58.8833
              },
              "image": "https://glakapart.com.ar/logo.svg",
              "starRating": {
                "@type": "Rating",
                "ratingValue": "5"
              },
              "priceRange": "$$"
            }
          `}
        </Script>
      </body>
    </html>
  );
}
