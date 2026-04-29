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
  description: 'Apart Hotel con piscina en Urdinarrain, Entre Ríos ⭐ 4.9/5 en Google. WiFi, aire, cocina completa. Reservá directo.',
  keywords: 'Glak Apart, apartamentos Urdinarrain, alojamiento Urdinarrain, cabañas Entre Ríos, turismo rural Entre Ríos, apart hotel Urdinarrain, alojamiento turístico Urdinarrain, cabañas con pileta Entre Ríos, escapada rural Argentina',
  metadataBase: new URL('https://glakapart.com.ar'),
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    url: 'https://glakapart.com.ar',
    title: 'Glak Apart | Apartamentos turísticos en Urdinarrain, Entre Ríos',
    description: 'Apart Hotel con piscina en Urdinarrain, Entre Ríos ⭐ 4.9/5 en Google. WiFi, aire, cocina completa. Reservá directo.',
    siteName: 'Glak Apart',
    images: [{
      url: '/icon.svg',
    }],
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary',
    title: 'Glak Apart | Apartamentos turísticos en Urdinarrain, Entre Ríos',
    description: 'Apart Hotel con piscina en Urdinarrain, Entre Ríos ⭐ 4.9/5 en Google. WiFi, aire, cocina completa. Reservá directo.',
    images: ['/icon.svg'],
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
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://feeds.behold.so" />
        <link rel="dns-prefetch" href="https://feeds.behold.so" />
      </head>
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
              "telephone": "+541169675050",
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
              "image": "https://glakapart.com.ar/icon.svg",
              "starRating": {
                "@type": "Rating",
                "ratingValue": "5"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "reviewCount": "8",
                "bestRating": "5",
                "worstRating": "3.5"
              },
              "priceRange": "$$"
            }
          `}
        </Script>
      </body>
    </html>
  );
}
