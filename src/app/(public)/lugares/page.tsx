import type { Metadata } from 'next';
import Lugares from '@/pages/Lugares';

export const metadata: Metadata = {
    title: 'Qué hacer en Urdinarrain | Lugares y Atractivos Turísticos — Glak Apart',
    description: 'Explorá los mejores lugares y atractivos turísticos cerca de Glak Apart en Urdinarrain, Entre Ríos. Termas de Gualeguaychú, ríos, museos y naturaleza.',
    keywords: 'turismo Urdinarrain, lugares turísticos Entre Ríos, termas Gualeguaychú, qué hacer en Urdinarrain, atractivos Entre Ríos, turismo rural',
    openGraph: {
        title: 'Qué hacer en Urdinarrain | Lugares Turísticos',
        description: 'Los mejores lugares y atractivos turísticos cerca de Glak Apart en Entre Ríos.',
        images: [{ url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200' }]
    },
};

export default function LugaresPage() {
    return <Lugares />;
}
