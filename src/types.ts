export interface Event {
    id: string;
    title: string;
    startDate: string; // ISO string
    endDate: string;   // ISO string
    description: string;
    image?: string;
    images?: string[];
    coverImage?: string;
    videoUrl?: string;
    isAnnual?: boolean;
    estimatedSeason?: string; // e.g. "Verano", "Marzo"
    source?: 'manual' | 'urdinarrain';
    sourceId?: number;        // ID del post en WordPress
    location?: string;        // Ej: "Sala de Conferencias - Complejo La Estación"
    category?: string;        // Ej: "EXPOSICIONES", "TEATRO"
    originalDescription?: string;  // Descripción original antes de reescribir con AI
    lastSyncedAt?: string;    // ISO timestamp de última sincronización
}

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    order: number;
}


