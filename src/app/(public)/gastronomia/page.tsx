import type { Metadata } from 'next';
import Gastronomia from '@/pages/Gastronomia';

export const metadata: Metadata = {
    title: 'Gastronomía en Urdinarrain | Glak Apart — Sabores de Entre Ríos',
    description: 'Descubrí la mejor gastronomía regional de Urdinarrain y Entre Ríos. Restaurantes, asadores, parrilladas y platos típicos recomendados cerca de Glak Apart.',
    keywords: 'gastronomía Urdinarrain, donde comer Urdinarrain, restaurantes Entre Ríos, asados rurales, parrilladas Urdinarrain, comida regional',
    openGraph: {
        title: 'Gastronomía en Urdinarrain | Glak Apart',
        description: 'Sabores de nuestra tierra entrerriana. La mejor gastronomía regional a minutos de Glak Apart.',
        images: [{ url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200' }]
    },
};

export default function GastronomiaPage() {
    return <Gastronomia />;
}
