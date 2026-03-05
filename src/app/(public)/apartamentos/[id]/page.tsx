import type { Metadata } from 'next';
import ApartmentDetail from '@/pages/ApartmentDetail';
import Script from 'next/script';

// Dynamic metadata per apartment
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const names: Record<string, string> = {
        nacarado: 'Nacarado',
        arrebol: 'Arrebol',
        arje: 'Arje',
    };
    const name = names[id] || id;
    return {
        title: `${name} | Glak Apart — Alquiler Vacacional en Urdinarrain`,
        description: `Reservá el apartamento ${name} en Glak Apart. Alojamiento turístico premium en Urdinarrain, Entre Ríos con pileta, parrilla y conexión con la naturaleza.`,
        keywords: `apartamento ${name}, alquiler vacacional Urdinarrain, alojamiento Entre Ríos, cabañas Urdinarrain, turismo rural`,
        openGraph: {
            title: `${name} | Glak Apart`,
            description: `Apartamento ${name} en Glak Apart, Urdinarrain.`,
        },
    };
}

export default async function ApartmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const names: Record<string, string> = {
        nacarado: 'Nacarado',
        arrebol: 'Arrebol',
        arje: 'Arje',
    };
    const name = names[id] || id;

    // Generate dynamic JSON-LD for this specific apartment
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Accommodation",
        "name": `Apartamento ${name} - Glak Apart`,
        "description": `Alojamiento turístico premium ${name} en Urdinarrain, Entre Ríos. Ideal para descanso y turismo rural.`,
        "url": `https://glakapart.com.ar/apartamentos/${id}`,
        "numberOfRooms": 1,
        "petsAllowed": "True",
        "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": "True" },
            { "@type": "LocationFeatureSpecification", "name": "Swimming Pool", "value": "True" },
            { "@type": "LocationFeatureSpecification", "name": "Air Conditioning", "value": "True" }
        ]
    };

    return (
        <>
            <Script id={`schema-${id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <ApartmentDetail />
        </>
    );
}
