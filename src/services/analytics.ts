/**
 * Lightweight analytics service — writes events to Firestore.
 * Each visitor gets a persistent visitorId (localStorage) and a per-tab sessionId (sessionStorage).
 * Admin users (authenticated via Firebase Auth) are excluded from tracking.
 */
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/services/firebase';

const COLLECTION = 'analytics_events';

// Admin emails — these users are excluded from all tracking
const ADMIN_EMAILS = [
    'thiagojgk@gmail.com',
    'adrigglak@gmail.com',
    'apartglak@gmail.com',
];

// ─── Session & Visitor IDs ───

function getVisitorId(): string {
    let id = localStorage.getItem('glak_vid');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('glak_vid', id);
    }
    return id;
}

function getSessionId(): string {
    let id = sessionStorage.getItem('glak_sid');
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem('glak_sid', id);
    }
    return id;
}

// ─── Admin Check ───

function isAdmin(): boolean {
    const user = auth.currentUser;
    if (!user?.email) return false;
    return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

// ─── Track Event ───

export function trackEvent(event: string, params?: Record<string, any>): void {
    // Skip tracking for admin users
    if (isAdmin()) return;

    const doc = {
        event,
        params: params || {},
        sessionId: getSessionId(),
        visitorId: getVisitorId(),
        page: window.location.pathname,
        referrer: document.referrer || '',
        isMobile: window.innerWidth < 768,
        timestamp: Timestamp.now(),
    };

    // Fire and forget — don't block the UI
    addDoc(collection(db, COLLECTION), doc).catch(() => {
        // Silently fail — analytics should never break the app
    });
}


