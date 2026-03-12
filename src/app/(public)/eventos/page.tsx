import type { Metadata } from 'next';
import EventsPage from '@/pages/EventsPage';
import { getContent } from '@/services/content';

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getContent('seo').catch(() => null);
    const title = seo?.['eventos.title'] || 'Eventos | Glak Apart — Próximos Eventos en la Región';
    const description = seo?.['eventos.description'] || 'Conocé los próximos eventos y festividades cerca de Glak Apart en Urdinarrain, Entre Ríos.';
    const imageUrl = seo?.['eventos.image'] || '';
    return {
        title,
        description,
        keywords: 'eventos Urdinarrain, festividades Entre Ríos, Fiesta del Caballo Urdinarrain, Fiesta de la Cerveza, actividades turísticas Urdinarrain, agenda cultural Entre Ríos, Glak Apart eventos',
        alternates: { canonical: 'https://glakapart.com.ar/eventos' },
        openGraph: { title, description, ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630 }] }) },
        twitter: { card: 'summary_large_image', title, description, ...(imageUrl && { images: [imageUrl] }) },
    };
}

export default function EventosPage() {
    return <EventsPage />;
}
