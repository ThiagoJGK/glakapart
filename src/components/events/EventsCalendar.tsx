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
                modifiersClassNames={{
                    selected: 'selected-day-active',
                    today: 'today-day-active',
                    hasEvent: 'has-event-day',
                    hasMultipleEvents: 'multiple-events-day',
                    isSelectedRange: 'selected-range-day'
                }}
                styles={{
                    caption: { color: colors.text, fontFamily: '"Outfit", sans-serif', fontWeight: 'bold' },
                    head_cell: { color: colors.muted, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' },
                    cell: { fontSize: '1rem', color: colors.text },
                    nav_button: { color: colors.primary, opacity: 0.8 }
                }}
                className="font-ui event-calendar-custom"
            />

             <style>{`
                .event-calendar-custom {
                    --rdp-cell-size: 46px;
                    margin: 0;
                }
                
                /* Cell Reset */
                .event-calendar-custom .rdp-day {
                    position: relative;
                    padding: 0 !important;
                }
                
                /* Day Button Styling - A perfect 34px centered circle */
                .event-calendar-custom .rdp-day_button {
                    width: 34px !important;
                    height: 34px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 50% !important;
                    margin: 4px auto !important;
                    position: relative !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    background-color: transparent !important;
                    border: none !important;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.95rem;
                    padding: 0 !important; /* Reset padding to center the number perfectly */
                    text-align: center !important;
                    line-height: 1 !important;
                    overflow: visible !important;
                }

                /* Force Text Colors on all calendar components by default */
                .event-calendar-custom .rdp-caption_label,
                .event-calendar-custom .rdp-nav_button,
                .event-calendar-custom .rdp-head_cell,
                .event-calendar-custom td button {
                    color: #10595a !important;
                }
                
                /* Low opacity for unselected/unhighlighted days to stand out the event selection */
                .event-calendar-custom .rdp-day:not(.has-event-day):not(.selected-day-active):not(.today-day-active):not(.selected-range-day) .rdp-day_button {
                    opacity: 0.45;
                }
                
                .event-calendar-custom .rdp-day_button:hover {
                    opacity: 1 !important;
                }
                
                /* Highlighting days with events - Soft sage background and subtle shadow (no borders) */
                .event-calendar-custom .has-event-day:not(.selected-day-active) .rdp-day_button {
                    font-weight: 600 !important;
                    background-color: #ebf4ed !important; /* Solid background to prevent stack color bleed-through */
                    box-shadow: 0 4px 10px rgba(16, 89, 90, 0.06) !important;
                    opacity: 1 !important;
                    border: none !important;
                }
                
                /* Stack effect when more than one event on a date - 3D offset using layered solid box-shadows (guarantees top green button is 100% visible and overlapping) */
                .event-calendar-custom .multiple-events-day:not(.selected-day-active) .rdp-day_button {
                    box-shadow: 
                        3px 3px 0 0 #fbeba7, 
                        6px 6px 0 0 #fed4b2, 
                        2px 2px 8px rgba(16, 89, 90, 0.08) !important;
                }
                
                .event-calendar-custom .multiple-events-day:not(.selected-day-active) .rdp-day_button:hover:not([disabled]) {
                    box-shadow: 
                        3px 3px 0 0 #fbeba7, 
                        6px 6px 0 0 #fed4b2, 
                        4px 4px 14px rgba(16, 89, 90, 0.15) !important;
                }
                
                /* Selected event date range style (no borders) */
                .event-calendar-custom .selected-range-day:not(.selected-day-active) .rdp-day_button {
                    opacity: 1 !important;
                    font-weight: 700 !important;
                    background-color: rgba(144, 198, 158, 0.22) !important;
                    border: none !important;
                }
                
                /* Selected Day Active style */
                .event-calendar-custom .selected-day-active .rdp-day_button {
                    color: #ffffff !important;
                    background-color: #10595a !important;
                    box-shadow: 0 6px 18px rgba(16, 89, 90, 0.22) !important;
                    transform: scale(1.08);
                    opacity: 1 !important;
                    font-weight: 700 !important;
                    z-index: 5;
                    border: none !important;
                }
                
                .event-calendar-custom .selected-day-active .rdp-day_button::before {
                    display: none !important; /* Hide stack behind selected day for clean look */
                }

                .event-calendar-custom .selected-day-active .rdp-day_button * { 
                    color: #ffffff !important;
                }
 
                /* Hover Effect */
                .event-calendar-custom .rdp-day_button:hover:not([disabled]) {
                    background-color: #f4f1ea !important;
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(16, 89, 90, 0.1) !important;
                    opacity: 1 !important;
                    z-index: 6;
                }

                .event-calendar-custom .has-event-day .rdp-day_button:hover:not([disabled]):not(.selected-day-active) {
                    background-color: rgba(144, 198, 158, 0.28) !important;
                }
                
                /* Today style - dot below the number, with absolute override to prevent default top-right float */
                .event-calendar-custom .rdp-day_today::after,
                .event-calendar-custom .today-day-active .rdp-day_button::after {
                    content: '' !important;
                    position: absolute !important;
                    bottom: 4px !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    width: 4px !important;
                    height: 4px !important;
                    border-radius: 50% !important;
                    background-color: #90c69e !important;
                    top: auto !important;
                    right: auto !important;
                    display: block !important;
                }

                /* Guarantee white text color when today is selected */
                .event-calendar-custom .selected-day-active.today-day-active .rdp-day_button,
                .event-calendar-custom .selected-day-active.rdp-day_today .rdp-day_button,
                .event-calendar-custom .selected-day-active .rdp-day_button {
                    color: #ffffff !important;
                }

                .event-calendar-custom .selected-day-active.today-day-active .rdp-day_button::after,
                .event-calendar-custom .selected-day-active.rdp-day_today::after {
                    background-color: #ffffff !important;
                }

                /* Override hover on selected day to prevent white-on-white text */
                .event-calendar-custom .selected-day-active .rdp-day_button:hover:not([disabled]) {
                    background-color: #10595a !important;
                    color: #ffffff !important;
                    box-shadow: 0 6px 20px rgba(16, 89, 90, 0.3) !important;
                }
            `}</style>
        </div>
    );
};

export default EventsCalendar;






