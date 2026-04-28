import type { Metadata } from 'next';
import Gastronomia from '@/pages/Gastronomia';
import { getContent } from '@/services/content';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getContent('seo').catch(() => null);
    const title = seo?.['gastronomia.title'] || 'Gastronomía en Urdinarrain | Glak Apart — Sabores de Entre Ríos';
    const description = seo?.['gastronomia.description'] || 'Descubrí la mejor gastronomía regional de Urdinarrain y Entre Ríos. Restaurantes, asadores, parrilladas y platos típicos recomendados cerca de Glak Apart.';
    const imageUrl = seo?.['gastronomia.image'];
    return {
        title,
        description,
        keywords: 'gastronomía Urdinarrain, restaurantes Entre Ríos, comida regional entrerriana, panadería Ceferino, dulce de leche La Pequeña, Finca Los Bayos vinos, cocina alemanes del Volga, Glak Apart gastronomía',
        alternates: { canonical: 'https://glakapart.com.ar/gastronomia' },
        openGraph: { title, description, images: [{ url: imageUrl, width: 1200, height: 630 }] },
        twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
    };
}

export default function GastronomiaPage() {
    return <Gastronomia />;
}
