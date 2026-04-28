import type { Metadata } from 'next';
import ArenasBlancas from '@/pages/ArenasBlancas';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
    const title = 'Arenas Blancas - Balneario en Urdinarrain | Glak Apart';
    const description = 'Descubrí el balneario Arenas Blancas a minutos de Glak Apart en Urdinarrain. Playa de río, camping y naturaleza en Entre Ríos.';
    
    return {
        title,
        description,
        keywords: 'Arenas Blancas, balneario Urdinarrain, camping Urdinarrain, playas Entre Ríos, turismo naturaleza Urdinarrain, río Gualeguay',
        alternates: { canonical: 'https://glakapart.com.ar/lugares/arenas-blancas' },
        openGraph: { title, description },
        twitter: { card: 'summary_large_image', title, description },
    };
}

export default function ArenasBlancasPage() {
    return <ArenasBlancas />;
}
