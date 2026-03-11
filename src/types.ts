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
}

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    order: number;
}


