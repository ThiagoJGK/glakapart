import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { applySampleData, SAMPLE_DATA } from '@/data/sampleData';

const CACHE_KEY = 'site_content';
let memCache: Record<string, unknown> | null = null;
let fetchPromise: Promise<void> | null = null; // Evitar múltiples fetches simultáneos

/**
 * Pre-fetch ALL content desde el API route server-side.
 * Al ir a /api/content (mismo origen), el browser nunca bloquea el request.
 * Call this once at app startup so all Editable components
 * can read from cache instantly without individual network requests.
 */
export const prefetchContent = async (): Promise<void> => {
    // Durante SSR/SSG (build time) las URLs relativas no funcionan → usar defaults y cargar en el cliente
    if (typeof window === 'undefined') return;

    // Si ya hay un fetch en progreso, esperar al mismo
    if (fetchPromise) return fetchPromise;

    fetchPromise = (async () => {
        try {
            const res = await fetch('/api/content', {
                // next.js cache: revalidar cada 5 min en el browser
                next: { revalidate: 300 },
            } as RequestInit);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            memCache = await res.json();
        } catch (e) {
            console.warn('Prefetch failed, components will fetch individually:', e);
        } finally {
            fetchPromise = null;
        }
    })();

    return fetchPromise;
};

export const getContent = async (section: string) => {
    // Return mock data for initial load/dev if DB fails or is empty
    const defaults: Record<string, unknown> = {
        hero: {
            title: "natural",
            subtitle: "URDINARRAIN",
            description: "Viví la experiencia Glak Apart entre paisaje y naturaleza. Alojamientos turísticos pensados para desconectar y disfrutar con los tuyos."
        },
        settings: {
            logoType: 'svg',
            logoSvg: null,
            logoUrl: null
        },
        events: { items: [] },
        faq: { items: [] }
    };

    try {
        // Si el cache ya está populado, usarlo directamente
        if (memCache) {
            const rawData = (memCache[section] as Record<string, unknown>) || defaults[section];
            const isSampleMode = (memCache?.settings as Record<string, unknown>)?.sampleMode === true;
            if (isSampleMode && SAMPLE_DATA[section]) {
                return applySampleData(rawData, SAMPLE_DATA[section]);
            }
            return rawData;
        }

        // Si no hay cache, disparar prefetch y esperar
        await prefetchContent();

        if (memCache) {
            const rawData = (memCache[section] as Record<string, unknown>) || defaults[section];
            const isSampleMode = (memCache?.settings as Record<string, unknown>)?.sampleMode === true;
            if (isSampleMode && SAMPLE_DATA[section]) {
                return applySampleData(rawData, SAMPLE_DATA[section]);
            }
            return rawData;
        }

        return defaults[section];
    } catch (e) {
        console.error('Error fetching content:', e);
        return defaults[section];
    }
};

export const updateContent = async (section: string, key: string, value: any) => {
    try {
        const docRef = doc(db, "content", "main");

        // Ensure cache is populated
        if (!memCache) {
            const docSnap = await getDoc(docRef);
            memCache = docSnap.exists() ? docSnap.data() : {};
        }

        // Update local cache
        if (!memCache[section]) memCache[section] = {};
        memCache[section][key] = value;

        // Update Firestore
        await setDoc(docRef, memCache, { merge: true });
        console.log("Document successfully written!");
        return true;
    } catch (e) {
        console.error("Error updating document: ", e);
        return false;
    }
};


