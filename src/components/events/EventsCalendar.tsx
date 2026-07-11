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
    selectedEvent?: Event | null;
}

const parseLocalDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const cleanStr = dateStr.split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    return new Date(dateStr);
};

const EventsCalendar: React.FC<EventsCalendarProps> = ({ events, selectedDate, onSelectDate, theme = 'light', selectedEvent }) => {
    const isDark = theme === 'dark';

    // Organic Palette - Forced High Contrast
    const colors = {
        text: '#10595a', // Always Deep Teal for readability on beige
        muted: '#8BA6A9',
        accent: '#90c69e',
        primary: '#10595a',
        highlight: '#e8d5b5'
    };

    // Modifiers
    const modifiers = {
        hasEvent: (date: Date) => events.some(ev =>
            isSameDay(date, parseLocalDate(ev.startDate)) ||
            (parseLocalDate(ev.startDate) <= date && parseLocalDate(ev.endDate) >= date)
        ),
        hasMultipleEvents: (date: Date) => {
            const count = events.filter(ev =>
                isSameDay(date, parseLocalDate(ev.startDate)) ||
                (parseLocalDate(ev.startDate) <= date && parseLocalDate(ev.endDate) >= date)
            ).length;
            return count > 1;
        },
        isSelectedRange: (date: Date) => {
            if (!selectedEvent || !selectedEvent.startDate) return false;
            const start = parseLocalDate(selectedEvent.startDate);
            const end = selectedEvent.endDate ? parseLocalDate(selectedEvent.endDate) : start;
            
            const checkTime = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
            const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
            const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
            
            return checkTime >= startTime && checkTime <= endTime;
        }
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
                    today: 'text-[#90c69e] font-black border-none relative after:content-[""] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#90c69e] after:rounded-full',
                    hasEvent: 'has-event-day',
                    hasMultipleEvents: 'multiple-events-day',
                    isSelectedRange: 'selected-range-day'
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
                /* Force Text Colors on all calendar components including day buttons */
                .event-calendar-custom .rdp-day, 
                .event-calendar-custom .rdp-caption_label,
                .event-calendar-custom .rdp-nav_button,
                .event-calendar-custom .rdp-head_cell,
                .event-calendar-custom td button,
                .event-calendar-custom td button * {
                    color: #10595a !important;
                }
                
                /* Low opacity for unselected/unhighlighted days to stand out the event selection */
                .event-calendar-custom .rdp-day:not([aria-selected="true"]):not(.rdp-day_selected):not(.selected-range-day) {
                    opacity: 0.5;
                    transition: opacity 0.3s ease;
                }
                
                .event-calendar-custom .rdp-day:hover {
                    opacity: 1 !important;
                }
                
                /* Highlighting days with events - Smaller, light green circle */
                .event-calendar-custom .has-event-day:not([aria-selected="true"]):not(.rdp-day_selected) {
                    font-weight: 900 !important;
                    position: relative;
                }
                
                .event-calendar-custom .has-event-day:not([aria-selected="true"]):not(.rdp-day_selected)::after {
                    content: '';
                    position: absolute;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background-color: rgba(144, 198, 158, 0.2) !important;
                    border: 1.5px solid #90c69e !important;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: -1;
                }
                
                /* Stack effect when more than one event on a date */
                .event-calendar-custom .multiple-events-day:not([aria-selected="true"]):not(.rdp-day_selected)::before {
                    content: '';
                    position: absolute;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background-color: rgba(144, 198, 158, 0.1) !important;
                    border: 1.5px dashed rgba(144, 198, 158, 0.6) !important;
                    top: 54%;
                    left: 54%;
                    transform: translate(-50%, -50%);
                    z-index: -2;
                }
                
                /* Selected event date range style and pulsating animation */
                @keyframes range-pulse {
                    0% {
                        box-shadow: 0 0 0 0px rgba(144, 198, 158, 0.5);
                        background-color: rgba(144, 198, 158, 0.15);
                    }
                    50% {
                        box-shadow: 0 0 0 4px rgba(144, 198, 158, 0);
                        background-color: rgba(144, 198, 158, 0.35);
                    }
                    100% {
                        box-shadow: 0 0 0 0px rgba(144, 198, 158, 0);
                        background-color: rgba(144, 198, 158, 0.15);
                    }
                }
                
                .event-calendar-custom .selected-range-day:not([aria-selected="true"]):not(.rdp-day_selected) {
                    opacity: 1 !important;
                    font-weight: 900 !important;
                    color: #10595a !important;
                }
                
                .event-calendar-custom .selected-range-day:not([aria-selected="true"]):not(.rdp-day_selected)::after {
                    content: '';
                    position: absolute;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 2px solid #90c69e !important;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    animation: range-pulse 2s infinite ease-in-out;
                    z-index: -1;
                    background-color: rgba(144, 198, 158, 0.2) !important;
                }
                
                /* Selected Day Override - TARGETING ATTRIBUTES TO ENSURE HIT */
                .event-calendar-custom [aria-selected="true"] .rdp-day_button,
                .event-calendar-custom [data-selected="true"] .rdp-day_button,
                .event-calendar-custom .rdp-selected .rdp-day_button,
                .event-calendar-custom [aria-selected="true"]:hover .rdp-day_button,
                .event-calendar-custom [data-selected="true"]:hover .rdp-day_button,
                .event-calendar-custom .rdp-selected:hover .rdp-day_button,
                .event-calendar-custom td[aria-selected="true"] button,
                .event-calendar-custom td[aria-selected="true"] button * { 
                    color: #ffffff !important;
                    background-color: #10595a !important;
                    border: none !important;
                    opacity: 1 !important;
                }
                
                /* AGGRESSIVELY Force WHITE text on everything inside selected day */
                .event-calendar-custom [aria-selected="true"] .rdp-day_button *,
                .event-calendar-custom [data-selected="true"] .rdp-day_button *,
                .event-calendar-custom .rdp-selected .rdp-day_button *,
                .event-calendar-custom [aria-selected="true"] .rdp-day_button,
                .event-calendar-custom [data-selected="true"] .rdp-day_button,
                .event-calendar-custom .rdp-selected .rdp-day_button {
                    color: #ffffff !important;
                    fill: #ffffff !important;
                    z-index: 50 !important;
                    position: relative !important;
                    opacity: 1 !important;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
                }
 
                /* Hover Effect */
                .event-calendar-custom .rdp-button:hover:not([disabled]):not(.rdp-day_selected):not([aria-selected="true"]) {
                    background-color: #f4f1ea !important;
                    color: #90c69e !important;
                    border-radius: 50%;
                    font-weight: bold;
                    transform: scale(1.1);
                    transition: all 0.2s ease;
                    opacity: 1 !important;
                }
                
                /* Today style correction if needed */
                .event-calendar-custom .rdp-day_today:not(.rdp-day_selected):not([aria-selected="true"]) {
                    color: #90c69e !important;
                    font-weight: 900;
                    background-color: transparent !important;
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
};

export default EventsCalendar;






