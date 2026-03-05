'use client';
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * SEO Head Manager
 * Updates document title and meta description dynamically based on current route.
 * This helps search engines see unique meta for each page even in a SPA.
 */

interface PageSEO {
    title: string;
    description: string;
    canonical: string;
}

const SEO_DATA: Record<string, PageSEO> = {
    '/': {
        title: 'Glak Apart | Apartamentos turísticos en Urdinarrain, Entre Ríos',
        description: 'Glak Apart: Apartamentos turísticos en Urdinarrain, Entre Ríos. Alojamiento rural con pileta, naturaleza, gastronomía regional y la mejor experiencia de descanso en el campo entrerriano.',
        canonical: 'https://glak-apart.vercel.app/',
    },
    '/gastronomia': {
        title: 'Gastronomía Regional | Glak Apart - Sabores de Entre Ríos',
        description: 'Descubrí la gastronomía de Entre Ríos en Glak Apart, Urdinarrain. Carnes asadas, productos artesanales, cocina regional y los mejores sabores entrerrianos en un entorno rural único.',
        canonical: 'https://glak-apart.vercel.app/gastronomia',
    },
    '/lugares': {
        title: 'Lugares para Visitar | Glak Apart - Turismo en Urdinarrain',
        description: 'Explorá los mejores lugares cerca de Urdinarrain, Entre Ríos. Termas, ríos, historia, cultura entrerriana y experiencias únicas para tu estadía en Glak Apart.',
        canonical: 'https://glak-apart.vercel.app/lugares',
    },
    '/eventos': {
        title: 'Eventos | Glak Apart - Actividades en Urdinarrain, Entre Ríos',
        description: 'Descubrí los próximos eventos y actividades culturales en Urdinarrain y la región de Entre Ríos. Festivales, ferias y experiencias únicas durante tu estadía en Glak Apart.',
        canonical: 'https://glak-apart.vercel.app/eventos',
    },
};

const SEOHead: React.FC = () => {
    const currentPath = usePathname();

    useEffect(() => {
        const path = location.pathname;

        // Match exact path or apartment detail paths
        let seoData = SEO_DATA[path];

        if (!seoData && path.startsWith('/apartamentos/')) {
            const slug = path.replace('/apartamentos/', '');
            const names: Record<string, string> = {
                nacarado: 'Nacarado - Intimidad y Confort Familiar',
                arrebol: 'Arrebol - Amplitud en la Naturaleza',
                arje: 'Arje - El Rincón Romántico',
            };
            const name = names[slug] || slug;
            seoData = {
                title: `${name} | Glak Apart - Apartamento en Urdinarrain`,
                description: `Apartamento ${name} en Glak Apart, Urdinarrain, Entre Ríos. Alojamiento turístico equipado con cocina, aire acondicionado, WiFi y acceso a pileta. Reservá ahora.`,
                canonical: `https://glak-apart.vercel.app/apartamentos/${slug}`,
            };
        }

        if (seoData) {
            document.title = seoData.title;

            // Update meta description
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', seoData.description);
            }

            // Update canonical
            let canonical = document.querySelector('link[rel="canonical"]');
            if (canonical) {
                canonical.setAttribute('href', seoData.canonical);
            }

            // Update OG tags
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.setAttribute('content', seoData.title);

            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', seoData.description);

            const ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl) ogUrl.setAttribute('content', seoData.canonical);

            // Update Twitter tags
            const twTitle = document.querySelector('meta[property="twitter:title"]');
            if (twTitle) twTitle.setAttribute('content', seoData.title);

            const twDesc = document.querySelector('meta[property="twitter:description"]');
            if (twDesc) twDesc.setAttribute('content', seoData.description);

            const twUrl = document.querySelector('meta[property="twitter:url"]');
            if (twUrl) twUrl.setAttribute('content', seoData.canonical);
        }
    }, [location.pathname]);

    return null; // This component renders nothing, just manages head tags
};

export default SEOHead;






