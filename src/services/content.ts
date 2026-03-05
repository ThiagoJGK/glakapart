import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { applySampleData, SAMPLE_DATA } from '@/data/sampleData';

const CACHE_KEY = 'site_content';
let memCache: any = null;

/**
 * Pre-fetch ALL content from Firebase into memory cache.
 * Call this once at app startup so all Editable components
 * can read from cache instantly without individual network requests.
 */
export const prefetchContent = async (): Promise<void> => {
    try {
        const docRef = doc(db, "content", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            memCache = docSnap.data();
        }
    } catch (e) {
        console.warn("Prefetch failed, components will fetch individually:", e);
    }
};

export const getContent = async (section: string) => {
    // Return mock data for initial load/dev if DB fails or is empty
    const defaults: any = {
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
        if (memCache) {
            const rawData = memCache[section] || defaults[section];
            const isSampleMode = memCache?.settings?.sampleMode === true;
            if (isSampleMode && SAMPLE_DATA[section]) {
                return applySampleData(rawData, SAMPLE_DATA[section]);
            }
            return rawData;
        }

        const docRef = doc(db, "content", "main");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            memCache = docSnap.data();
            const rawData = memCache[section] || defaults[section];
            const isSampleMode = memCache?.settings?.sampleMode === true;
            if (isSampleMode && SAMPLE_DATA[section]) {
                return applySampleData(rawData, SAMPLE_DATA[section]);
            }
            return rawData;
        } else {
            console.log("No such document! using defaults");
            return defaults[section];
        }
    } catch (e) {
        console.error("Error fetching document: ", e);
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


