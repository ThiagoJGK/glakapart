import type { Metadata } from 'next';
import Home from '@/pages/Home';
import { getContent } from '@/services/content';

export const revalidate = 60; // Regenerate page dynamically in background every 60s for SEO updates

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getContent('seo').catch(() => null);
    const title = seo?.['home.title'] || 'Glak Apart | Apartamentos turísticos en Urdinarrain, Entre Ríos';
    const description = seo?.['home.description'] || 'Viví la experiencia Glak Apart entre paisaje y naturaleza. Alojamientos turísticos pensados para desconectar y disfrutar con los tuyos.';
    const imageUrl = seo?.['home.image'];
    return {
        title,
        description,
        alternates: { canonical: 'https://glakapart.com.ar/' },
        openGraph: { title, description, images: [{ url: imageUrl, width: 1200, height: 630 }], locale: 'es_AR', type: 'website', siteName: 'Glak Apart' },
        twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
    };
}

export default function HomePage() {
    return <Home />;
}
