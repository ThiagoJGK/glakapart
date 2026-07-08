import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

// Forzar render dinámico (nunca cachear estáticamente)
export const dynamic = 'force-dynamic';

// Cache en memoria del servidor (se resetea con cada deploy)
let serverCache: Record<string, unknown> | null = null;
let serverCacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export async function GET() {
    try {
        const now = Date.now();

        // Servir desde cache si está vigente
        if (serverCache && now - serverCacheTimestamp < CACHE_TTL_MS) {
            return NextResponse.json(serverCache, {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
                    'X-Cache': 'HIT',
                },
            });
        }

        const docRef = doc(db, 'content', 'main');
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({}, {
                headers: { 'Cache-Control': 'public, s-maxage=60' },
            });
        }

        const data = docSnap.data() as Record<string, unknown>;
        serverCache = data;
        serverCacheTimestamp = now;

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
                'X-Cache': 'MISS',
            },
        });
    } catch (error) {
        console.error('[API /content] Error fetching from Firestore:', error);
        return NextResponse.json(
            { error: 'Failed to fetch content' },
            { status: 500 }
        );
    }
}
