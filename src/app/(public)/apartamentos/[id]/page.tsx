import type { Metadata } from 'next';
import ApartmentDetail from '@/pages/ApartmentDetail';
import Script from 'next/script';
import { getContent } from '@/services/content';

// ─── Rich per-apartment SEO data ───
const APARTMENT_SEO: Record<string, {
    title: string;
    description: string;
    keywords: string;
    ogDescription: string;
    capacity: string;
    type: string;
}> = {
    nacarado: {
        title: 'Apartamento Nacarado | Alquiler Vacacional para Familias en Urdinarrain — Glak Apart',
        description: 'Reservá el apartamento Nacarado en Glak Apart, Urdinarrain (Entre Ríos). Dormitorio independiente, cocina equipada, WiFi, piscina y parrilla compartida. Ideal para familias de 3 a 4 personas.',
        keywords: 'apartamento Nacarado, alquiler familiar Urdinarrain, alojamiento Entre Ríos, apart vacacional pileta, Glak Apart Nacarado, cabañas Urdinarrain, escapada familiar Entre Ríos',
        ogDescription: 'Nacarado — el refugio familiar perfecto en Glak Apart. Dormitorio privado, cocina equipada, piscina y naturaleza entrerriana a pasos.',
        capacity: '3–4 personas',
        type: 'familiar',
    },
    arrebol: {
        title: 'Apartamento Arrebol | Alojamiento Amplio con Vista al Parque en Urdinarrain — Glak Apart',
        description: 'Alquilá el apartamento Arrebol en Glak Apart, Urdinarrain. Espacio amplio para 4–5 personas con living, vista al parque, Smart TV 50", estacionamiento y acceso a pileta. Turismo rural en Entre Ríos.',
        keywords: 'apartamento Arrebol, alquiler grupos Urdinarrain, alojamiento amplio Entre Ríos, apart vacacional vista parque, Glak Apart Arrebol, turismo rural Entre Ríos, alquiler 4 personas Urdinarrain',
        ogDescription: 'Arrebol — amplitud y conexión con la naturaleza. El apart ideal para grupos y familias grandes en Glak Apart, Urdinarrain.',
        capacity: '4–5 personas',
        type: 'familiar/grupal',
    },
    arje: {
        title: 'Apartamento Arjé | Escapada Romántica con Vista a la Piscina en Urdinarrain — Glak Apart',
        description: 'Reservá el apartamento Arjé en Glak Apart, Urdinarrain (Entre Ríos). Diseño boutique exclusivo para parejas, cama queen, vista a la piscina y ambiente romántico. La escapada perfecta en Entre Ríos.',
        keywords: 'apartamento Arjé, escapada romántica Urdinarrain, alojamiento parejas Entre Ríos, apart boutique vista pileta, Glak Apart Arje, luna de miel Entre Ríos, turismo romántico Urdinarrain',
        ogDescription: 'Arjé — el rincón más íntimo y exclusivo de Glak Apart. Diseño boutique, cama queen y vista a la piscina para una escapada romántica inolvidable.',
        capacity: '2 personas (parejas)',
        type: 'romántico',
    },
};

const FALLBACK = {
    title: (name: string) => `Apartamento ${name} | Glak Apart — Alojamiento Vacacional en Urdinarrain, Entre Ríos`,
    description: (name: string) => `Reservá el apartamento ${name} en Glak Apart, Urdinarrain (Entre Ríos). Alojamiento turístico premium con piscina, parrilla y naturaleza.`,
    keywords: (name: string) => `apartamento ${name}, alojamiento Urdinarrain, turismo rural Entre Ríos, Glak Apart`,
};

export const revalidate = 60;

// ─── Dynamic metadata per apartment ───
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const seo = APARTMENT_SEO[id];
    const rawName = id.charAt(0).toUpperCase() + id.slice(1);
    const name = id === 'arje' ? 'Arjé' : rawName;

    // Allow Firebase override for OG image per apartment
    const firebaseSeo = await getContent('seo').catch(() => null);
    const imageUrl = firebaseSeo?.[`${id}.image`] || '';

    const title = seo?.title || FALLBACK.title(name);
    const description = seo?.description || FALLBACK.description(name);
    const ogDescription = seo?.ogDescription || description;
    const keywords = seo?.keywords || FALLBACK.keywords(name);

    return {
        title,
        description,
        keywords,
        alternates: { canonical: `https://glakapart.com.ar/apartamentos/${id}` },
        openGraph: {
            title: `${name} | Glak Apart — Alojamiento en Urdinarrain`,
            description: ogDescription,
            ...(imageUrl && { images: [{ url: imageUrl, width: 1200, height: 630, alt: `Apartamento ${name} - Glak Apart` }] }),
            type: 'website',
            siteName: 'Glak Apart',
            locale: 'es_AR',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${name} | Glak Apart`,
            description: ogDescription,
            ...(imageUrl && { images: [imageUrl] }),
        },
    };
}

// ─── Page Component ───
export default async function ApartmentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const seo = APARTMENT_SEO[id];
    const rawName = id.charAt(0).toUpperCase() + id.slice(1);
    const name = id === 'arje' ? 'Arjé' : rawName;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Accommodation",
        "name": `Apartamento ${name} — Glak Apart`,
        "description": seo?.description || `Alojamiento turístico ${name} en Urdinarrain, Entre Ríos.`,
        "url": `https://glakapart.com.ar/apartamentos/${id}`,
        "occupancy": {
            "@type": "QuantitativeValue",
            "description": seo?.capacity || "2–5 personas"
        },
        "accommodationCategory": seo?.type || "apartment",
        "numberOfRooms": 1,
        "petsAllowed": true,
        "containedInPlace": {
            "@type": "LodgingBusiness",
            "name": "Glak Apart",
            "url": "https://glakapart.com.ar",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Urdinarrain",
                "addressRegion": "Entre Ríos",
                "addressCountry": "AR"
            }
        },
        "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Piscina", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "WiFi de alta velocidad", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Aire Acondicionado", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Parrilla", "value": true },
            { "@type": "LocationFeatureSpecification", "name": "Cocina equipada", "value": true },
        ]
    };

    return (
        <>
            <Script id={`schema-${id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <ApartmentDetail />
        </>
    );
}
