import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

/**
 * Inicializa Firebase Admin SDK (solo corre en el servidor).
 * Usa las credenciales de la variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY
 * o bien las Application Default Credentials si está en GCP/Cloud Run.
 */
function getAdminApp(): App {
    if (adminApp) return adminApp;
    if (getApps().length > 0) {
        adminApp = getApps()[0];
        return adminApp;
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
        const serviceAccount = JSON.parse(serviceAccountKey);
        adminApp = initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id,
        });
    } else {
        // En Cloud Run / GCE usa las credenciales del ambiente automáticamente
        adminApp = initializeApp({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'apart-glak',
        });
    }

    return adminApp;
}

// Cache en memoria del servidor (se resetea con cada deploy / reinicio)
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

        const app = getAdminApp();
        const db = getFirestore(app);
        const docSnap = await db.collection('content').doc('main').get();

        if (!docSnap.exists) {
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
