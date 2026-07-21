import React from 'react';
import LinksView from '@/components/links/LinksView';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Enlaces y Contacto Directo | Glak Apart Urdinarrain',
    description: 'Canal directo de contacto de Glak Apart en Urdinarrain. Consultá disponibilidad de apartamentos, comunicate por WhatsApp o explorá nuestro complejo.',
    openGraph: {
        title: 'Enlaces y Contacto Directo | Glak Apart Urdinarrain',
        description: 'Canal directo de contacto de Glak Apart en Urdinarrain. Consultá disponibilidad de apartamentos, comunicate por WhatsApp o explorá nuestro complejo.',
    }
};

export default function LinksPage() {
    return <LinksView />;
}
