'use client';
import React, { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/style.css';
import { motion, AnimatePresence } from 'framer-motion';

import { trackEvent } from '@/services/analytics';
import { getBookedDates } from '@/services/availability';

const GeneralBookingForm: React.FC = () => {
    const [range, setRange] = useState<DateRange | undefined>();
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [message, setMessage] = useState('');
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        getBookedDates().then(setBookedDates).catch(console.warn);
        trackEvent('booking_form_open');
        setIsDesktop(window.innerWidth >= 768);
    }, []);

    const handleWhatsAppRedirect = () => {
        if (!range?.from || !range?.to) {
            alert('Por favor selecciona las fechas de ingreso y egreso.');
            return;
        }

        const checkIn = format(range.from, 'dd/MM/yyyy');
        const checkOut = format(range.to, 'dd/MM/yyyy');

        trackEvent('booking_inquiry', { adults, children, checkIn, checkOut });

        // Construct the message
        const text = `Hola! Me interesa reservar en Glak Apart.
    
*Fechas*: Del ${checkIn} al ${checkOut}
*Huéspedes*: ${adults} Adultos, ${children} Niños
*Consulta*: ${message || 'Quisiera saber disponibilidad y precios.'}

Espero su respuesta, gracias!`;

        // Encode and redirect
        const encodedText = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/5491169675050?text=${encodedText}`;

        window.open(whatsappUrl, '_blank');
    };

    const calendarStyles = `
        /* ===== REACT-DAY-PICKER v9 OVERRIDES ===== */

        /* Root - fixed dimensions to prevent resizing on month change */
        .rdp-root {
            --rdp-accent-color: #9dd1a6;
            --rdp-accent-background-color: #9dd1a6;
            --rdp-range_start-color: #9dd1a6;
            --rdp-range_end-color: #9dd1a6;
            --rdp-range_middle-color: rgba(157, 209, 166, 0.25);
            --rdp-range_middle-background-color: rgba(157, 209, 166, 0.25);
            --rdp-selected-border: none;
            --rdp-outside-opacity: 0.3;
            --rdp-day-height: 34px;
            --rdp-day-width: 34px;
            margin: 0;
        }

        /* Fixed calendar height to prevent layout shift */
        .rdp-month {
            min-height: 280px;
        }
        .rdp-months {
            min-height: 280px;
        }

        @media (min-width: 768px) {
            .rdp-root {
                --rdp-day-height: 40px;
                --rdp-day-width: 40px;
            }
            .rdp-month, .rdp-months {
                min-height: 340px;
            }
        }

        /* Caption / Month label */
        .rdp-caption_label,
        .rdp-month_caption {
            color: #ffffff !important;
            font-weight: 300;
            font-size: 1.1rem;
            text-transform: capitalize;
        }

        /* Navigation arrows */
        .rdp-button_previous,
        .rdp-button_next,
        .rdp-nav button {
            color: #9dd1a6 !important;
        }
        .rdp-button_previous svg,
        .rdp-button_next svg,
        .rdp-nav button svg {
            fill: #9dd1a6 !important;
            stroke: #9dd1a6 !important;
        }
        .rdp-chevron {
            fill: #9dd1a6 !important;
        }

        /* Weekday headers */
        .rdp-weekday {
            color: #9dd1a6 !important;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.7rem;
            opacity: 0.8;
        }

        /* All day cells - base circular shape */
        .rdp-day {
            color: #ffffff;
            font-size: 0.95rem;
        }

        /* ---- SELECTED start & end (green circles) ---- */
        .rdp-day[data-selected] {
            background-color: #9dd1a6 !important;
            color: #10595a !important;
            font-weight: 900 !important;
            border-radius: 50% !important;
            outline: none !important;
            border: none !important;
        }
        .rdp-day[data-selected] button,
        .rdp-day[data-selected] .rdp-day_button {
            color: #10595a !important;
            font-weight: 900 !important;
            outline: none !important;
            border: none !important;
        }

        /* ---- RANGE START (circle) ---- */
        .rdp-day[data-range-start] {
            border-radius: 50% !important;
            background-color: #9dd1a6 !important;
        }

        /* ---- RANGE END (darker circle to differentiate) ---- */
        .rdp-day[data-range-end] {
            border-radius: 50% !important;
            background-color: #7ec48e !important;
        }

        /* ---- RANGE MIDDLE day (rectangular connected bar) ---- */
        .rdp-day[data-range-middle] {
            background-color: rgba(157, 209, 166, 0.3) !important;
            color: #ffffff !important;
            font-weight: 400 !important;
            border-radius: 0 !important;
        }
        .rdp-day[data-range-middle] button,
        .rdp-day[data-range-middle] .rdp-day_button {
            color: #ffffff !important;
            background: transparent !important;
            border-radius: 0 !important;
        }

        /* ---- DISABLED / BOOKED DAYS ---- */
        .rdp-day[data-disabled] {
            opacity: 0.3 !important;
            text-decoration: line-through !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
        }
        .rdp-day[data-disabled] button,
        .rdp-day[data-disabled] .rdp-day_button {
            color: #ffffff50 !important;
            cursor: not-allowed !important;
        }

        /* ---- TD WRAPPERS: half-bar behind start/end circles ---- */
        /* In v9 .rdp-day IS the <td>, so use .rdp-range_start on same element */
        .rdp-day[data-range-start]:not([data-range-end]) {
            background: linear-gradient(to right, transparent 50%, rgba(157, 209, 166, 0.3) 50%) !important;
        }
        .rdp-day[data-range-start]:not([data-range-end]) .rdp-day_button {
            background-color: #9dd1a6 !important;
            border-radius: 50% !important;
        }
        .rdp-day[data-range-end]:not([data-range-start]) {
            background: linear-gradient(to left, transparent 50%, rgba(157, 209, 166, 0.3) 50%) !important;
        }
        .rdp-day[data-range-end]:not([data-range-start]) .rdp-day_button {
            background-color: #7ec48e !important;
            border-radius: 50% !important;
        }



        /* ---- TODAY ---- */
        .rdp-day[data-today]:not([data-selected]) {
            color: #9dd1a6 !important;
            font-weight: 900 !important;
            border: none !important;
            background-color: transparent !important;
        }
        .rdp-day[data-today]:not([data-selected]) button,
        .rdp-day[data-today]:not([data-selected]) .rdp-day_button {
            color: #9dd1a6 !important;
        }

        /* ---- HOVER on unselected days ---- */
        .rdp-day:not([data-selected]):not([data-range-middle]):hover {
            background-color: rgba(255, 255, 255, 0.15) !important;
            border-radius: 50% !important;
        }

        /* ---- KILL ALL BLUE OUTLINES/FOCUS ---- */
        .rdp-day:focus,
        .rdp-day:focus-visible,
        .rdp-day:active,
        .rdp-day button:focus,
        .rdp-day button:focus-visible,
        .rdp-day button:active,
        .rdp-day_button:focus,
        .rdp-day_button:focus-visible,
        .rdp-day_button:active,
        .rdp-button_previous:focus,
        .rdp-button_next:focus,
        .rdp-focused,
        .rdp-day[data-focused] {
            outline: none !important;
            box-shadow: none !important;
            border-color: transparent !important;
            -webkit-tap-highlight-color: transparent !important;
        }
    `;

    return (
        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-5xl mx-auto overflow-hidden flex flex-col md:flex-row border border-white/20">
            <style>{calendarStyles}</style>

            {/* Left Panel: Calendar (Green Experience) */}
            <div className="md:w-3/5 bg-[#10595a] p-5 py-6 md:p-10 flex flex-col items-center justify-center text-white relative">
                {/* Subtle Grain or Pattern can be added here if needed */}
                <div className="text-center mb-4 md:mb-6">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-light text-white/60 mb-1 md:mb-2">Selecciona tus fechas</p>
                    <h3 className="font-script text-3xl md:text-5xl text-white">Disponibilidad</h3>
                </div>

                <div className="booking-calendar-wrapper w-full flex justify-center booking-calendar-dark scale-90 md:scale-95 origin-top">
                    <DayPicker
                        mode="range"
                        selected={range}
                        onSelect={(newRange) => {
                            setRange(newRange);
                            if (newRange?.from || newRange?.to) {
                                setShowDetails(true);
                            }
                        }}
                        locale={es}
                        numberOfMonths={1}
                        disabled={[
                            { before: new Date() },
                            ...bookedDates
                        ]}
                    />
                </div>

                <div className="mt-4 md:mt-8 flex items-center justify-center gap-6 text-[9px] md:text-[10px] uppercase tracking-widest text-white/50">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#9dd1a6]"></span>
                        <span>Selección</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white/20"></span>
                        <span>Ocupado</span>
                    </div>
                </div>
            </div>

            {/* Right Panel: Form (Clean White) */}
            <div className="md:w-2/5 bg-white p-6 md:p-8 md:px-10 flex flex-col justify-center relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#10595a] to-[#2c7a7b] md:hidden"></div>

                {/* Mobile Toggle Button */}
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="md:hidden flex items-center justify-between w-full font-ui text-[10px] font-bold tracking-[0.2em] text-[#10595a] uppercase mb-2 border-b border-[#10595a]/10 pb-3"
                >
                    <span>Detalles de Reserva</span>
                    <motion.svg
                        animate={{ rotate: showDetails ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-4 h-4 text-[#10595a]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </motion.svg>
                </button>

                {/* Desktop Header */}
                <h3 className="hidden md:block font-ui text-xs font-bold tracking-[0.2em] text-[#10595a] uppercase mb-8 border-b border-[#10595a]/10 pb-4">
                    Detalles de Reserva
                </h3>

                {/* Collapsible Content */}
                <div className="md:h-auto md:opacity-100 md:overflow-visible">
                    <AnimatePresence initial={false}>
                        {(showDetails || isDesktop) && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden md:!h-auto md:!opacity-100"
                            >
                                <div className="space-y-4 md:space-y-6 pt-2 md:pt-0 pb-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="group">
                                            <label className="block text-[8px] font-bold tracking-[0.2em] text-gray-400 mb-2 group-focus-within:text-[#10595a] transition-colors">ADULTOS</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={adults}
                                                onChange={(e) => setAdults(parseInt(e.target.value))}
                                                className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 md:px-4 md:py-3 text-base md:text-lg font-bold text-[#10595a] focus:ring-1 focus:ring-[#10595a] transition-all"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="block text-[8px] font-bold tracking-[0.2em] text-gray-400 mb-1 md:mb-2 group-focus-within:text-[#10595a] transition-colors">NIÑOS</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={children}
                                                onChange={(e) => setChildren(parseInt(e.target.value))}
                                                className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 md:px-4 md:py-3 text-base md:text-lg font-bold text-[#10595a] focus:ring-1 focus:ring-[#10595a] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="block text-[8px] font-bold tracking-[0.2em] text-gray-400 mb-1 md:mb-2 group-focus-within:text-[#10595a] transition-colors">MENSAJE (OPCIONAL)</label>
                                        <textarea
                                            rows={2}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="w-full bg-gray-50 border-none rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm text-[#10595a] placeholder-gray-300 focus:ring-1 focus:ring-[#10595a] resize-none transition-all"
                                            placeholder="¿Alguna consulta especial?"
                                        />
                                    </div>

                                    <button
                                        onClick={handleWhatsAppRedirect}
                                        className="w-full mt-2 md:mt-4 bg-[#10595a] text-white py-3 md:py-4 rounded-xl shadow-[0_10px_20px_-5px_rgba(16,89,90,0.4)] hover:shadow-xl hover:bg-[#0d4a4b] hover:-translate-y-0.5 transition-all duration-300 group flex items-center justify-center gap-3 overflow-hidden relative"
                                    >
                                        <span className="relative z-10 text-[10px] font-bold tracking-[0.25em] uppercase">Consultar</span>
                                        <svg className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1 decoration-clone" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </button>
                                    <p className="text-[9px] text-gray-300 text-center tracking-wide mt-3">Redirige a WhatsApp</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default GeneralBookingForm;







