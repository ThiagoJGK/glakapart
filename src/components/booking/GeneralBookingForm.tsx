'use client';
import React, { useState, useEffect } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/style.css';
import { motion, AnimatePresence } from 'framer-motion';

import { trackEvent } from '@/services/analytics';

const GeneralBookingForm: React.FC = () => {
    const todayForModifiers = React.useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);
    const [range, setRange] = useState<DateRange | undefined>();
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [message, setMessage] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
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
*Consulta*: ${message || 'Quisiera consultar sobre una reserva y precios.'}

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
            --rdp-accent-background-color: rgba(157, 209, 166, 0.15);
            --rdp-selected-border: none;
            --rdp-outside-opacity: 0.3;
            --rdp-day-height: 44px;
            --rdp-day-width: 44px;
            --track-height: 36px; /* 36px track & button on mobile */
            margin: 0;
        }

        /* Responsive adjustments for very small mobiles (like iPhone SE) */
        @media (max-width: 350px) {
            .rdp-root {
                --rdp-day-height: 38px;
                --rdp-day-width: 38px;
                --track-height: 30px;
            }
            .rdp-month, .rdp-months {
                min-height: 290px !important;
            }
        }

        /* Fixed calendar height to prevent layout shift */
        .rdp-month, .rdp-months {
            min-height: 320px;
        }

        @media (min-width: 768px) {
            .rdp-root {
                --rdp-day-height: 46px;
                --rdp-day-width: 46px;
                --track-height: 38px; /* 38px track & button on desktop */
            }
            .rdp-month, .rdp-months {
                min-height: 360px !important;
            }
        }

        /* Caption / Month label */
        .rdp-caption_label,
        .rdp-month_caption {
            color: #ffffff !important;
            font-weight: 400;
            font-size: 1.25rem;
            text-transform: capitalize;
            margin-bottom: 12px !important;
        }

        /* Navigation arrows */
        .rdp-button_previous,
        .rdp-button_next,
        .rdp-nav button {
            color: #9dd1a6 !important;
            transition: all 0.2s ease;
        }
        .rdp-button_previous,
        .rdp-button_next {
            width: 32px !important;
            height: 32px !important;
        }
        .rdp-button_previous:hover,
        .rdp-button_next:hover {
            opacity: 0.8;
            transform: scale(1.1);
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
            font-size: 0.8rem;
            opacity: 0.9;
            padding-bottom: 8px !important;
        }

        /* All day cells - table-cell display to prevent layout collapse */
        .rdp-day {
            color: #ffffff;
            font-size: 1.05rem;
            padding: 0 !important;
            position: relative;
            display: table-cell !important;
            text-align: center !important;
            vertical-align: middle !important;
            width: var(--rdp-day-width);
            height: var(--rdp-day-height);
        }

        /* Interactive Day Buttons */
        .rdp-day_button {
            color: #ffffff;
            width: var(--track-height) !important;
            height: var(--track-height) !important;
            border-radius: 50% !important;
            transition: all 0.2s ease;
            font-weight: 400;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: relative;
            z-index: 1;
            margin: auto !important;
            box-sizing: border-box !important;
        }

        /* Hover effect on standard day buttons */
        .rdp-day:not(.rdp-range_start):not(.rdp-range_end):not(.rdp-range_middle) .rdp-day_button:not(.rdp-selected):hover {
            background-color: rgba(255, 255, 255, 0.15) !important;
            border-radius: 50% !important;
        }

        /* Today's date (if not selected) */
        .rdp-today:not(.rdp-selected) .rdp-day_button {
            color: #9dd1a6 !important;
            font-weight: 700 !important;
            border: 1px solid rgba(157, 209, 166, 0.4) !important;
        }

        /* ----- RANGE SELECTION (PREMIUM PILL EFFECT) ----- */

        /* Base rule for track background */
        .rdp-range_middle::before,
        .rdp-range_start::before,
        .rdp-range_end::before {
            content: "";
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: var(--track-height);
            background-color: rgba(157, 209, 166, 0.15) !important;
            z-index: 0;
        }

        /* 1. Range Middle Cell Track */
        .rdp-range_middle {
            background-color: transparent !important;
        }
        .rdp-range_middle::before {
            left: 0;
            right: 0;
        }
        .rdp-range_middle .rdp-day_button {
            border-radius: 0 !important;
            background-color: transparent !important;
            color: #ffffff !important;
            font-weight: 500 !important;
        }

        /* Rounding edges of the track at row boundaries (Monday/Sunday) */
        .rdp-day:first-child.rdp-range_middle::before {
            left: 4px;
            border-top-left-radius: 9999px;
            border-bottom-left-radius: 9999px;
        }
        .rdp-day:last-child.rdp-range_middle::before {
            right: 4px;
            border-top-right-radius: 9999px;
            border-bottom-right-radius: 9999px;
        }

        /* 2. Range Start */
        .rdp-range_start {
            background: transparent !important;
        }
        .rdp-range_start::before {
            left: 50%;
            right: 0;
        }
        .rdp-range_start .rdp-day_button {
            background-color: #9dd1a6 !important;
            color: #10595a !important;
            font-weight: 800 !important;
            border-radius: 50% !important;
            box-shadow: none !important;
        }
        .rdp-range_start .rdp-day_button:hover {
            background-color: #9dd1a6 !important;
            color: #10595a !important;
            opacity: 1 !important;
            box-shadow: 0 4px 12px rgba(157, 209, 166, 0.5) !important;
        }
        /* Start day on row boundary (Sunday) */
        .rdp-day:last-child.rdp-range_start::before {
            right: 4px;
            border-top-right-radius: 9999px;
            border-bottom-right-radius: 9999px;
        }

        /* 3. Range End */
        .rdp-range_end {
            background: transparent !important;
        }
        .rdp-range_end::before {
            left: 0;
            right: 50%;
        }
        .rdp-range_end .rdp-day_button {
            background-color: #9dd1a6 !important;
            color: #10595a !important;
            font-weight: 800 !important;
            border-radius: 50% !important;
            box-shadow: none !important;
        }
        .rdp-range_end .rdp-day_button:hover {
            background-color: #9dd1a6 !important;
            color: #10595a !important;
            opacity: 1 !important;
            box-shadow: 0 4px 12px rgba(157, 209, 166, 0.5) !important;
        }
        /* End day on row boundary (Monday) */
        .rdp-day:first-child.rdp-range_end::before {
            left: 4px;
            border-top-left-radius: 9999px;
            border-bottom-left-radius: 9999px;
        }

        /* 4. Single Selection / Start matches End (cancel connection) */
        .rdp-range_start.rdp-range_end::before {
            display: none !important;
        }

        /* ----- DISABLED / PAST DAYS ----- */
        .rdp-disabled {
            opacity: 0.3 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
        }
        .rdp-disabled .rdp-day_button {
            color: rgba(255, 255, 255, 0.3) !important;
            cursor: not-allowed !important;
        }

        /* ----- CLEAN OUTLINES / FOCUS ----- */
        .rdp-day:focus,
        .rdp-day:focus-visible,
        .rdp-day_button:focus,
        .rdp-day_button:focus-visible,
        .rdp-button_previous:focus,
        .rdp-button_next:focus {
            outline: none !important;
            box-shadow: none !important;
            -webkit-tap-highlight-color: transparent !important;
        }
    `;

    return (
        <div className="bg-white rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-5xl mx-auto overflow-hidden flex flex-col md:flex-row border border-white/20">
            <style>{calendarStyles}</style>

            {/* Left Panel: Calendar (Green Experience) */}
            <div className="md:w-3/5 bg-[#10595a] px-4 py-8 md:p-10 flex flex-col items-center justify-center text-white relative">
                {/* Subtle Grain or Pattern can be added here if needed */}
                <div className="text-center mb-6 md:mb-8">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#9dd1a6] mb-2">Selecciona tus fechas</p>
                    <h3 className="font-script text-3xl md:text-5xl text-white">Reserva tu estadía</h3>
                </div>

                <div className="booking-calendar-wrapper w-full flex justify-center booking-calendar-dark md:scale-95 origin-top">
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
                            { before: new Date() }
                        ]}
                        modifiers={{
                            past: { before: todayForModifiers }
                        }}
                        modifiersClassNames={{
                            past: 'day-past',
                            selected: 'rdp-selected',
                            range_start: 'rdp-range_start',
                            range_middle: 'rdp-range_middle',
                            range_end: 'rdp-range_end'
                        }}
                    />
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







