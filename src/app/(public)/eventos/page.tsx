import type { Metadata } from 'next';
import EventsPage from '@/pages/EventsPage';

export const metadata: Metadata = {
    title: 'Eventos | Glak Apart — Próximos Eventos en la Región',
    description: 'Conocé los próximos eventos y festividades cerca de Glak Apart en Urdinarrain, Entre Ríos. Fiestas regionales, ferias y más.',
    openGraph: {
        title: 'Eventos | Glak Apart',
        description: 'Próximos eventos y festividades en la región de Urdinarrain.',
    },
};

export default function EventosPage() {
    return <EventsPage />;
}
