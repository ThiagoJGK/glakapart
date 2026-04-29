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
    // Return empty array to keep the calendar fully available
    // Previous logic was fetching from /api/availability which connected to Booking.com
    return [];
}


