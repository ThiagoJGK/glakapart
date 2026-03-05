/**
 * Availability service - fetches booked dates from Booking.com via API proxy
 */

interface BookedRange {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
    summary: string;
}

let cachedDates: Date[] | null = null;
let lastFetch = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Expand date ranges into individual Date objects
 */
function expandRanges(ranges: BookedRange[]): Date[] {
    const dates: Date[] = [];

    for (const range of ranges) {
        const start = new Date(range.start + 'T00:00:00');
        const end = new Date(range.end + 'T00:00:00');
        const current = new Date(start);

        // DTEND in iCal is exclusive (the checkout day), so we go up to but not including it
        while (current < end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
    }

    return dates;
}

/**
 * Fetch booked/unavailable dates. Returns array of Date objects.
 * Caches results in memory for 30 minutes.
 */
export async function getBookedDates(): Promise<Date[]> {
    const now = Date.now();

    // Return cached if fresh
    if (cachedDates && (now - lastFetch) < CACHE_DURATION) {
        return cachedDates;
    }

    try {
        const res = await fetch('/api/availability');
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const data = await res.json();
        cachedDates = expandRanges(data.ranges || []);
        lastFetch = now;

        return cachedDates;
    } catch (error) {
        console.warn('Failed to fetch availability:', error);
        return cachedDates || []; // Return stale cache or empty
    }
}


