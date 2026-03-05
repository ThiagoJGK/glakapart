import { NextResponse } from 'next/server';

const ICAL_URL = 'https://ical.booking.com/v1/export/t/3c55dd0e-1ae1-4a53-9743-a1dda39fc3e4.ics';

interface BookedRange {
    start: string; // YYYY-MM-DD
    end: string;   // YYYY-MM-DD
    summary: string;
}

function parseICalToRanges(ical: string): BookedRange[] {
    const ranges: BookedRange[] = [];
    const events = ical.split('BEGIN:VEVENT');

    for (let i = 1; i < events.length; i++) {
        const event = events[i];

        const startMatch = event.match(/DTSTART;VALUE=DATE:(\d{4})(\d{2})(\d{2})/);
        const endMatch = event.match(/DTEND;VALUE=DATE:(\d{4})(\d{2})(\d{2})/);
        const summaryMatch = event.match(/SUMMARY:(.+)/);

        if (startMatch && endMatch) {
            ranges.push({
                start: `${startMatch[1]}-${startMatch[2]}-${startMatch[3]}`,
                end: `${endMatch[1]}-${endMatch[2]}-${endMatch[3]}`,
                summary: summaryMatch ? summaryMatch[1].trim() : 'Occupied'
            });
        }
    }

    return ranges;
}

export async function GET() {
    try {
        const response = await fetch(ICAL_URL, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch iCal: ${response.status}`);
        }

        const icalText = await response.text();
        const ranges = parseICalToRanges(icalText);

        return NextResponse.json({ ranges }, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error: any) {
        console.error('iCal fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch availability', ranges: [] }, { status: 500 });
    }
}
