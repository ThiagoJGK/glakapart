import type { Metadata } from 'next';
import Lugares from '@/pages/Lugares';
import { getContent } from '@/services/content';

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getContent('seo').catch(() => null);
    const title = seo?.['lugares.title'] || 'Qué hacer en Urdinarrain | Lugares y Atractivos Turísticos — Glak Apart';
    const description = seo?.['lugares.description'] || 'Explorá los mejores lugares y atractivos turísticos cerca de Glak Apart en Urdinarrain, Entre Ríos.';
    const imageUrl = seo?.['lugares.image'] || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200';
    return {
        title,
        description,
        keywords: 'qué hacer Urdinarrain, lugares turísticos Entre Ríos, turismo Urdinarrain, Arenas Blancas balneario, vuelos planeador Urdinarrain, cicloturismo Entre Ríos, Fiesta del Caballo, Glak Apart lugares',
        alternates: { canonical: 'https://glakapart.com.ar/lugares' },
        openGraph: { title, description, images: [{ url: imageUrl, width: 1200, height: 630 }] },
        twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
    };
}

export default function LugaresPage() {
    return <Lugares />;
}
