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

// ─── UUID helper — crypto.randomUUID() requires HTTPS (secure context).
// This polyfill falls back to crypto.getRandomValues or Math.random so it
// works when testing over HTTP on a local IP address.
function generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback: use crypto.getRandomValues if available (works over HTTP)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const buf = new Uint8Array(16);
        crypto.getRandomValues(buf);
        buf[6] = (buf[6] & 0x0f) | 0x40; // version 4
        buf[8] = (buf[8] & 0x3f) | 0x80; // variant
        const hex = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    }
    // Last resort: Math.random
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// ─── Session & Visitor IDs ───

function getVisitorId(): string {
    let id = localStorage.getItem('glak_vid');
    if (!id) {
        id = generateUUID();
        localStorage.setItem('glak_vid', id);
    }
    return id;
}

function getSessionId(): string {
    let id = sessionStorage.getItem('glak_sid');
    if (!id) {
        id = generateUUID();
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


