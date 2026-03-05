import React from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { Event } from '@/types';
import { isSameDay } from 'date-fns';
import 'react-day-picker/style.css';

interface EventsCalendarProps {
    events: Event[];
    selectedDate: Date | undefined;
    onSelectDate: (date: Date | undefined) => void;
    theme?: 'light' | 'dark';
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ events, selectedDate, onSelectDate, theme = 'light' }) => {
    const isDark = theme === 'dark';

    // Organic Palette - Forced High Contrast
    const colors = {
        text: '#10595a', // Always Deep Teal for readability on beige
        muted: '#8BA6A9',
        accent: '#90c69e',
        primary: '#10595a',
        highlight: '#e8d5b5'
    };

    // Modifier: Days with events
    const modifiers = {
        hasEvent: (date: Date) => events.some(ev =>
            isSameDay(date, new Date(ev.startDate)) ||
            (new Date(ev.startDate) <= date && new Date(ev.endDate) >= date)
        )
    };

    const modifiersStyles = {
        hasEvent: {
            fontWeight: '900',
            color: colors.primary
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={onSelectDate}
                locale={es}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                modifiersClassNames={{
                    selected: 'bg-[#10595a] text-white rounded-full transition-all duration-300 transform scale-110 shadow-lg shadow-[#10595a]/20',
                    today: 'text-[#90c69e] font-black border-none relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#90c69e] after:rounded-full'
                }}
                styles={{
                    caption: { color: colors.text, fontFamily: '"Outfit", sans-serif', fontWeight: 'bold' },
                    head_cell: { color: colors.muted, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' },
                    cell: { fontSize: '1rem', color: colors.text },
                    nav_button: { color: colors.primary, opacity: 0.8 },
                    day: { margin: '0.2rem' }
                }}
                className="font-ui event-calendar-custom"
            />

            <style>{`
                .event-calendar-custom {
                    --rdp-cell-size: 45px;
                    margin: 0;
                }
                /* Force Text Colors */
                .event-calendar-custom .rdp-day, 
                .event-calendar-custom .rdp-caption_label,
                .event-calendar-custom .rdp-nav_button,
                .event-calendar-custom .rdp-head_cell {
                    color: #10595a !important;
                }
                
                /* Selected Day Override - TARGETING ATTRIBUTES TO ENSURE HIT */
                .event-calendar-custom [aria-selected="true"],
                .event-calendar-custom [data-selected="true"],
                .event-calendar-custom [aria-selected="true"]:hover,
                .event-calendar-custom [data-selected="true"]:hover { 
                    color: #ffffff !important;
                    background-color: #10595a !important;
                    border: none !important;
                }
                
                /* AGGRESSIVELY Force WHITE text on everything inside selected day */
                .event-calendar-custom [aria-selected="true"] *,
                .event-calendar-custom [data-selected="true"] *,
                .event-calendar-custom [aria-selected="true"] button,
                .event-calendar-custom [data-selected="true"] button,
                .event-calendar-custom [aria-selected="true"] span,
                .event-calendar-custom [data-selected="true"] span {
                    color: #ffffff !important;
                    fill: #ffffff !important;
                    z-index: 50 !important;
                    position: relative !important;
                    opacity: 1 !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }

                /* Hover Effect */
                .event-calendar-custom .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                    background-color: #f4f1ea;
                    color: #90c69e !important;
                    border-radius: 50%;
                    font-weight: bold;
                    transform: scale(1.1);
                    transition: all 0.2s ease;
                }
                
                /* Today style correction if needed */
                .event-calendar-custom .rdp-day_today:not(.rdp-day_selected) {
                    color: #90c69e !important;
                    font-weight: 900;
                    background-color: transparent !important;
                }
            `}</style>
        </div>
    );
};

export default EventsCalendar;






