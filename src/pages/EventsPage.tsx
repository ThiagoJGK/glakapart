'use client';
import React, { useState, useEffect } from 'react';
import { getContent } from '@/services/content';
import { Event } from '@/types';
import EventsCalendar from '@/components/events/EventsCalendar';
import EventCard from '@/components/events/EventCard';
import FloatingBookingButton from '@/components/events/FloatingBookingButton';
import { format, isSameDay, differenceInCalendarDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { SeasonSummer } from '@/components/events/SeasonSummer';
import { SeasonAutumn } from '@/components/events/SeasonAutumn';
import { SeasonWinter } from '@/components/events/SeasonWinter';
import { SeasonSpring } from '@/components/events/SeasonSpring';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useRef } from 'react';
import Editable from '@/components/ui/Editable';
import { getOptimizedCloudinaryUrl } from '@/utils/cloudinaryHelper';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const stripMarkdown = (md: string) => {
    if (!md) return '';
    return md
        .replace(/[#*`_-]/g, '') // remove markdown symbols
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // remove links but keep text
        .trim();
};

const cleanDescription = (description: string, title: string) => {
    if (!description) return '';
    let cleaned = description.trim();
    if (!title) return cleaned;

    const normalize = (str: string) => {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim();
    };

    const normTitle = normalize(title);
    if (!normTitle) return cleaned;

    let testDesc = cleaned;
    const leadingCleanPattern = /^[#*_\-\s]+/;
    while (leadingCleanPattern.test(testDesc)) {
        testDesc = testDesc.replace(leadingCleanPattern, '');
    }

    const normDesc = normalize(testDesc);
    if (normDesc.startsWith(normTitle)) {
        let charCount = 0;
        let normCount = 0;
        const targetLen = normTitle.length;
        
        while (charCount < testDesc.length && normCount < targetLen) {
            const char = testDesc[charCount].toLowerCase();
            if (/[a-z0-9]/.test(char)) {
                normCount++;
            }
            charCount++;
        }
        
        const matchIndex = cleaned.indexOf(testDesc);
        if (matchIndex !== -1) {
            cleaned = cleaned.slice(matchIndex + charCount).trim();
        }
        
        while (/^[#*_\-\s\r\n]+/.test(cleaned)) {
            cleaned = cleaned.replace(/^[#*_\-\s\r\n]+/, '');
        }
    }

    return cleaned;
};

const getEventStatusTag = (startDateStr: string, endDateStr: string): string | null => {
    if (!startDateStr) return null;
    try {
        const start = parseLocalDate(startDateStr);
        const end = endDateStr ? parseLocalDate(endDateStr) : start;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const diffDaysToStart = differenceInCalendarDays(startDay, today);
        
        // 1. Si el evento está vigente (hoy está en el rango)
        if (today >= startDay && today <= endDay) {
            const diffDaysToEnd = differenceInCalendarDays(endDay, today);
            if (diffDaysToEnd === 0) {
                return 'Termina hoy 🚨';
            } else if (diffDaysToEnd === 1) {
                return 'Termina mañana';
            } else if (diffDaysToEnd === 2) {
                return 'Termina en 2 días';
            } else {
                return 'Vigente';
            }
        }
        
        // 2. Si el evento es futuro
        if (diffDaysToStart > 0) {
            if (diffDaysToStart === 1) {
                return 'Mañana';
            } else if (diffDaysToStart === 2) {
                return 'Pasado mañana';
            } else if (diffDaysToStart > 2 && diffDaysToStart < 7) {
                const weekday = format(startDay, 'EEEE', { locale: es }).toLowerCase();
                return `Este ${weekday}`;
            } else if (diffDaysToStart >= 7 && diffDaysToStart < 14) {
                const weekday = format(startDay, 'EEEE', { locale: es }).toLowerCase();
                return `Próximo ${weekday}`;
            }
        }
    } catch (e) {
        return null;
    }
    return null;
};

const getStatusBadgeClass = (tag: string) => {
    if (!tag) return '';
    if (tag.includes('hoy') || tag.includes('🚨')) {
        return 'bg-red-500 text-white font-extrabold shadow-sm';
    } else if (tag.includes('mañana') || tag.includes('2 días')) {
        return 'bg-amber-500 text-white font-extrabold shadow-sm';
    } else if (tag === 'Vigente') {
        return 'bg-emerald-600 text-white font-extrabold shadow-sm';
    }
    return 'bg-[#90c69e] text-white';
};

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

const EventsPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedEventIndex, setSelectedEventIndex] = useState<number>(0);
    const [blurBg, setBlurBg] = useState<string>('');
    const [seasonImages, setSeasonImages] = useState<Record<string, string>>({});

    const detailRef = useRef<HTMLDivElement>(null);
    const upcomingSliderRef = useRef<HTMLDivElement>(null);
    const pastSliderRef = useRef<HTMLDivElement>(null);

    const scrollSlider = (sliderRef: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const container = sliderRef.current;
            const scrollAmount = direction === 'left' ? -350 : 350;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollToDetail = () => {
        if (detailRef.current) {
            const yOffset = -120; // offset para sticky header
            const y = detailRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const formatDateSafely = (dateStr: string, formatPattern: string) => {
        try {
            if (!dateStr) return 'Sin fecha';
            const date = parseLocalDate(dateStr);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return format(date, formatPattern, { locale: es });
        } catch (e) {
            return 'Fecha inválida';
        }
    };

    const formatEventRange = (startStr: string, endStr: string) => {
        try {
            if (!startStr) return 'Sin fecha';
            const start = parseLocalDate(startStr);
            if (isNaN(start.getTime())) return 'Fecha inválida';
            
            if (!endStr) return format(start, 'dd MMM', { locale: es });
            const end = parseLocalDate(endStr);
            if (isNaN(end.getTime()) || isSameDay(start, end)) {
                return format(start, 'dd MMM', { locale: es });
            }
            
            // Si son del mismo mes: "27 - 31 jul"
            if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
                return `${format(start, 'dd', { locale: es })} - ${format(end, 'dd MMM', { locale: es })}`;
            }
            
            // Diferente mes: "27 jun - 01 ago"
            return `${format(start, 'dd MMM', { locale: es })} - ${format(end, 'dd MMM', { locale: es })}`;
        } catch (e) {
            return 'Fecha inválida';
        }
    };

    // Controlled animation states for the 4 season cards
    const [activeSeason, setActiveSeason] = useState<string | null>(null);
    const seasonTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

    const router = useRouter();

    useEffect(() => {
        const loadContent = async () => {
            // Load Events
            const eventsData = await getContent('events');
            if (eventsData && eventsData.items) {
                setEvents(eventsData.items);
                // Try to find an event today or the next upcoming one
                const upcoming = eventsData.items
                    .map((e: Event) => ({ ...e, start: parseLocalDate(e.startDate) }))
                    .filter((e: any) => e.start >= new Date().setHours(0, 0, 0, 0))
                    .sort((a: any, b: any) => a.start.getTime() - b.start.getTime())[0];

                if (upcoming) {
                    setSelectedDate(parseLocalDate(upcoming.startDate));
                    setSelectedEventIndex(0);
                }
            } else if (Array.isArray(eventsData)) {
                setEvents(eventsData);
            }

            // Load Settings for Background
            const settingsData = await getContent('settings');
            if (settingsData) {
                const url = settingsData.header_events_blur ||
                    settingsData.header_home_blur ||
                    "";
                setBlurBg(url);

                setSeasonImages({
                    season_summer: settingsData.season_summer || '',
                    season_autumn: settingsData.season_autumn || '',
                    season_winter: settingsData.season_winter || '',
                    season_spring: settingsData.season_spring || ''
                });
            }
        };
        loadContent();
    }, []);

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        setSelectedEventIndex(0);
        if (date) {
            setTimeout(scrollToDetail, 100);
        }
    };

    const handleSelectEvent = (ev: Event) => {
        const date = parseLocalDate(ev.startDate);
        setSelectedDate(date);
        
        // Calcular los eventos de ese día
        const dayEvs = events.filter(e =>
            isSameDay(date, parseLocalDate(e.startDate)) ||
            (parseLocalDate(e.startDate) <= date && parseLocalDate(e.endDate) >= date)
        );
        const idx = dayEvs.findIndex(e => e.id === ev.id);
        setSelectedEventIndex(idx >= 0 ? idx : 0);
    };

    const handleSelectEventAndScroll = (ev: Event) => {
        handleSelectEvent(ev);
        setTimeout(scrollToDetail, 50);
    };

    const handleSeasonInteractionStart = (season: string) => {
        setActiveSeason(season);
    };

    const handleSeasonInteractionEnd = (season: string) => {
        setActiveSeason(null);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents = events
        .filter(e => parseLocalDate(e.endDate) >= today)
        .sort((a, b) => parseLocalDate(a.startDate).getTime() - parseLocalDate(b.startDate).getTime());
    const pastEvents = events
        .filter(e => parseLocalDate(e.endDate) < today)
        .sort((a, b) => parseLocalDate(b.startDate).getTime() - parseLocalDate(a.startDate).getTime());

    const selectedDateEvents = selectedDate ? events.filter(e =>
        isSameDay(selectedDate, parseLocalDate(e.startDate)) ||
        (parseLocalDate(e.startDate) <= selectedDate && parseLocalDate(e.endDate) >= selectedDate)
    ) : [];

    const selectedEvent = selectedDateEvents[selectedEventIndex] || selectedDateEvents[0] || null;

    return (
        <main className="min-h-screen pt-52 md:pt-[480px] pb-20 relative z-30 overflow-hidden selection:bg-[#90c69e] selection:text-white">
            {/* SEO: Semantic H1 */}
            <Editable
                id="events.seo.h1"
                defaultValue="Eventos y actividades en Urdinarrain — Glak Apart"
                className="sr-only"
                label="SEO H1"
            />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header - Friendly & Organic */}
                <div className="text-center mb-32 relative group">
                    <div className="inline-block relative">
                        <Editable
                            id="events.header.subtitle"
                            defaultValue="Descubrí"
                            className="font-script text-5xl md:text-6xl text-[#90c69e] absolute -top-8 left-0 md:-left-8 transform -rotate-12 opacity-90 drop-shadow-sm group-hover:-rotate-6 transition-transform duration-500 block"
                            label="Subtítulo Header"
                        />
                        <Editable
                            id="events.header.title"
                            defaultValue="Momentos en Urdinarrain"
                            className="font-ui text-3xl md:text-6xl font-bold text-[#10595a] tracking-tight relative z-10 drop-shadow-sm block"
                            label="Título Header"
                        />
                        <div className="absolute -bottom-2 right-0 w-[110%] h-4 bg-[#e8d5b5]/80 rounded-full -rotate-1 z-0 mix-blend-multiply"></div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">

                    {/* LEFT: Calendar "Notebook" Style */}
                    <div className="lg:col-span-4 relative z-10 flex flex-col">
                        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(16,89,90,0.15)] border border-white/50 relative group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_70px_-12px_rgba(16,89,90,0.2)] h-full flex flex-col justify-between">

                            {/* Decorative Binding Effect */}
                            <div className="absolute top-0 left-0 w-full h-full rounded-[3rem] border-[4px] border-[#f4f1ea] pointer-events-none"></div>

                            {/* Decorative Tape */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#e8d5b5] transform -rotate-1 shadow-md border border-white/20 flex items-center justify-center opacity-90">
                                <div className="w-full h-full opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:4px_4px]"></div>
                            </div>

                            <div className="text-center mb-8 mt-2">
                                <Editable id="events.calendar.badge" defaultValue="AGENDA DE EVENTOS" className="font-ui text-xs font-bold text-[#10595a] tracking-[0.3em] uppercase border-b-2 border-[#90c69e]/30 pb-2 block w-fit mx-auto" label="Etiqueta Calendario" />
                            </div>

                            <div className="text-[#10595a] flex-grow flex items-center justify-center">
                                <EventsCalendar
                                    events={events}
                                    selectedDate={selectedDate}
                                    onSelectDate={handleDateSelect}
                                    theme="light"
                                    selectedEvent={selectedEvent}
                                />
                            </div>

                            <div className="text-center mt-8">
                                <Editable id="events.calendar.hint" defaultValue="¡Hacé click en una fecha!" className="font-ui text-xs tracking-[0.2em] uppercase font-bold text-[#10595a]/50 mt-4 animate-pulse block" label="Pista Calendario" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Active Event "Floating Note" */}
                    <div ref={detailRef} className="lg:col-span-8 relative z-10 flex flex-col scroll-mt-28">
                        {selectedEvent ? (
                            <div className="relative animate-fade-in-up h-fit min-h-[500px]">
                                {/* Solid Container with Adaptive Height and Premium Shadow */}
                                <div className="bg-white/90 backdrop-blur-md rounded-[3rem] p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(16,89,90,0.12)] border border-white/80 relative overflow-hidden transition-all duration-500 min-h-[500px] h-fit flex flex-col justify-between">
                                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-stretch h-full">
                                        {/* Image Container with Blur Background Effect */}
                                        <div className="w-full md:w-1/2 min-h-[320px] md:min-h-[380px] rounded-[2.5rem] relative overflow-hidden group shrink-0 shadow-inner bg-[#10595a]/15 flex items-center justify-center">
                                            {/* Blurred background flyer */}
                                            {selectedEvent.image && (
                                                <img
                                                    src={getOptimizedCloudinaryUrl(selectedEvent.image, 100)}
                                                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-80 scale-125 pointer-events-none"
                                                    alt="Fondo difuminado"
                                                />
                                            )}
                                            {/* Front sharp flyer */}
                                            <img
                                                src={getOptimizedCloudinaryUrl(selectedEvent.image || "", 800)}
                                                decoding="async"
                                                className="relative z-10 w-full h-full max-h-[300px] md:max-h-[360px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)] transform transition-transform duration-700 group-hover:scale-102"
                                                alt={selectedEvent.title || 'Evento en Urdinarrain'}
                                            />
                                            <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-xl shadow-md border border-gray-100">
                                                <span className="font-bold text-[#10595a] text-xs tracking-wider">
                                                    {formatEventRange(selectedEvent.startDate, selectedEvent.endDate)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Text Content - Responsive Flex-1 Layout */}
                                        <div className="w-full md:flex-1 text-left flex flex-col justify-between py-2 min-w-0">
                                            <div>
                                                {/* Selector para múltiples eventos en el mismo día */}
                                                {selectedDateEvents.length > 1 && (
                                                    <div className="flex items-center gap-4 mb-4 border-b border-[#10595a]/10 pb-3 w-fit">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => setSelectedEventIndex(prev => (prev - 1 + selectedDateEvents.length) % selectedDateEvents.length)}
                                                                className="p-1.5 rounded-xl bg-[#10595a]/5 text-[#10595a] hover:bg-[#10595a]/10 transition-all active:scale-95"
                                                                aria-label="Evento anterior"
                                                            >
                                                                <ChevronLeft size={14} className="stroke-[3]" />
                                                            </button>
                                                            
                                                            <span className="text-[10px] font-black text-[#10595a] tracking-widest uppercase px-2 min-w-[120px] text-center select-none">
                                                                EVENTO {selectedEventIndex + 1} DE {selectedDateEvents.length}
                                                            </span>
                                                            
                                                            <button
                                                                onClick={() => setSelectedEventIndex(prev => (prev + 1) % selectedDateEvents.length)}
                                                                className="p-1.5 rounded-xl bg-[#10595a]/5 text-[#10595a] hover:bg-[#10595a]/10 transition-all active:scale-95"
                                                                aria-label="Siguiente evento"
                                                            >
                                                                <ChevronRight size={14} className="stroke-[3]" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#10595a]/5 text-[#10595a] text-[11px] font-bold tracking-widest uppercase border border-[#10595a]/10">
                                                        {formatDateSafely(selectedEvent.startDate, 'EEEE')}
                                                    </span>
                                                    {getEventStatusTag(selectedEvent.startDate, selectedEvent.endDate) && (
                                                        <span className={`inline-block px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest border border-black/5 font-extrabold ${
                                                            getEventStatusTag(selectedEvent.startDate, selectedEvent.endDate) === 'Vigente' || getEventStatusTag(selectedEvent.startDate, selectedEvent.endDate)?.includes('Termina')
                                                            ? getStatusBadgeClass(getEventStatusTag(selectedEvent.startDate, selectedEvent.endDate) || '')
                                                            : 'bg-[#90c69e]/20 text-[#10595a] border-[#90c69e]/30'
                                                        }`}>
                                                            ✨ {getEventStatusTag(selectedEvent.startDate, selectedEvent.endDate)}
                                                        </span>
                                                    )}
                                                    {selectedEvent.location ? (
                                                        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase border border-blue-100 truncate max-w-[200px] sm:max-w-[280px]">
                                                            📍 {selectedEvent.location}
                                                        </span>
                                                    ) : selectedEvent.source === 'urdinarrain' && (
                                                        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase border border-blue-100">
                                                            📍 Urdinarrain
                                                        </span>
                                                    )}
                                                </div>

                                                <h2 className="font-ui font-bold text-2xl md:text-2xl text-[#10595a] leading-snug mb-4 tracking-tight">
                                                    {selectedEvent.title}
                                                </h2>

                                                <div 
                                                    key={selectedEvent.id}
                                                    className="text-[#10595a]/80 font-medium text-sm leading-relaxed mb-6 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin markdown-description"
                                                >
                                                    <ReactMarkdown>{cleanDescription(selectedEvent.description, selectedEvent.title)}</ReactMarkdown>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' })}
                                                className="bg-[#10595a] hover:bg-[#157173] text-white px-8 py-3.5 rounded-2xl font-bold tracking-widest text-xs uppercase shadow-md hover:shadow-lg transition-all duration-300 w-full md:w-auto overflow-hidden relative group mt-6"
                                            >
                                                <span className="relative z-10"><Editable id="events.detail.btnText" defaultValue="¡Me sumo!" className="inline" label="Botón Registrarse" /></span>
                                                <div className="absolute inset-0 bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-[3rem] border border-white/60 bg-gradient-to-b from-white/80 to-[#f4f1ea]/50 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#90c69e]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#e8d5b5]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                                <div className="text-8xl mb-8 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 drop-shadow-md">🌿</div>
                                <Editable id="events.relax.title" defaultValue="Día de Relax" className="font-script text-6xl text-[#10595a] mb-6 drop-shadow-md block" label="Título Vacío" />
                                <div className="w-16 h-1 bg-[#e8d5b5] rounded-full mb-6"></div>
                                <div className="text-[#10595a]/80 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                                    <Editable id="events.relax.desc" defaultValue="No hay eventos programados para esta fecha." className="block" label="Descripción Vacío" />
                                    <Editable id="events.relax.highlight" defaultValue="¡Desconectá y disfrutá!" className="text-[#90c69e] font-bold mt-2 block text-xl" label="Destacado Vacío" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-20 max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-12 px-4 relative">
                        <div>
                            <Editable
                                id="events.upcoming.subtitle"
                                defaultValue="Lo que se viene..."
                                className="font-script text-5xl md:text-6xl text-[#90c69e] block mb-2 -rotate-2"
                                label="Subtítulo Próximos"
                            />
                            <Editable
                                id="events.upcoming.title"
                                defaultValue="PRÓXIMAS FECHAS"
                                className="font-ui text-2xl font-black text-[#10595a] tracking-tight block"
                                label="Título Próximos"
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-[#10595a]/20 via-[#10595a]/5 to-transparent"></div>

                        {/* Navigation arrows */}
                        <div className="flex items-center gap-2 mb-2 relative z-20">
                            <button
                                onClick={() => scrollSlider(upcomingSliderRef, 'left')}
                                className="p-2.5 rounded-full border border-[#10595a]/20 text-[#10595a] hover:bg-[#10595a] hover:text-white transition-all duration-300 active:scale-90 bg-white/80 backdrop-blur-sm shadow-sm"
                                aria-label="Anterior"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => scrollSlider(upcomingSliderRef, 'right')}
                                className="p-2.5 rounded-full border border-[#10595a]/20 text-[#10595a] hover:bg-[#10595a] hover:text-white transition-all duration-300 active:scale-90 bg-white/80 backdrop-blur-sm shadow-sm"
                                aria-label="Siguiente"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div 
                        ref={upcomingSliderRef}
                        className="flex gap-8 overflow-x-auto snap-x snap-mandatory py-6 px-4 md:px-6 scrollbar-hide scroll-smooth"
                        onWheel={(e) => {
                            if (e.deltaY !== 0) {
                                e.currentTarget.scrollLeft += e.deltaY;
                            }
                        }}
                    >
                        {upcomingEvents.map((ev, i) => (
                            <div
                                key={ev.id}
                                className="flip-card min-w-[300px] w-[300px] md:min-w-[340px] md:w-[340px] h-[440px] shrink-0 snap-center cursor-pointer group"
                            >
                                <div className="flip-card-inner">
                                    {/* FRONT */}
                                    <div className="flip-card-front p-4 flex flex-col justify-between text-left border border-[#10595a]/5 shadow-sm">
                                        <div>
                                            <div className="h-52 rounded-[2rem] overflow-hidden mb-5 relative z-0">
                                                <img
                                                    src={getOptimizedCloudinaryUrl(ev.image || "", 600)}
                                                    decoding="async"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                                                    alt={ev.title || 'Evento en Urdinarrain'}
                                                    onError={(e) => (e.currentTarget.src = "")}
                                                />
                                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                                <div className="absolute top-4 left-4 bg-white/95 px-4 py-2 rounded-xl shadow-lg z-20">
                                                    <span className="font-bold text-[#10595a] text-xs tracking-widest uppercase">
                                                        {formatDateSafely(ev.startDate, 'dd MMM')}
                                                    </span>
                                                </div>
                                                {getEventStatusTag(ev.startDate, ev.endDate) && (
                                                    <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl shadow-lg z-20 text-[10px] uppercase tracking-wider font-extrabold ${getStatusBadgeClass(getEventStatusTag(ev.startDate, ev.endDate) || '')}`}>
                                                        {getEventStatusTag(ev.startDate, ev.endDate)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-3">
                                                <h4 className="font-ui font-black text-xl text-[#10595a] mb-2 line-clamp-1 group-hover:text-[#90c69e] transition-colors">{ev.title}</h4>
                                                <p className="text-[#10595a]/60 text-sm line-clamp-2 leading-relaxed">{stripMarkdown(cleanDescription(ev.description, ev.title))}</p>
                                            </div>
                                        </div>
                                        <div className="px-3 pb-3 flex items-center justify-between">
                                            <div className="h-px flex-grow bg-[#f4f1ea] group-hover:bg-[#90c69e]/30 transition-colors"></div>
                                            <span className="text-[#90c69e] font-bold text-[10px] tracking-[0.2em] uppercase pl-4 opacity-70 group-hover:opacity-100 transition-opacity">
                                                VER INFO
                                            </span>
                                        </div>
                                    </div>

                                    {/* BACK */}
                                    <div 
                                        onClick={() => handleSelectEventAndScroll(ev)}
                                        className="flip-card-back p-6 flex flex-col justify-between text-left bg-gradient-to-b from-white to-[#f4f1ea]/30 border border-[#90c69e]/30 shadow-md"
                                    >
                                        <div className="flex-grow flex flex-col justify-between min-h-0">
                                            <div>
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    <span className="bg-[#10595a]/10 text-[#10595a] text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                        {formatDateSafely(ev.startDate, 'EEEE dd/MM')}
                                                    </span>
                                                    {getEventStatusTag(ev.startDate, ev.endDate) && (
                                                        <span className={`text-white text-[9px] px-2 py-1 rounded uppercase tracking-wider font-extrabold ${getStatusBadgeClass(getEventStatusTag(ev.startDate, ev.endDate) || '')}`}>
                                                            {getEventStatusTag(ev.startDate, ev.endDate)}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <h4 className="font-ui font-black text-lg text-[#10595a] mb-3 leading-snug line-clamp-2 border-b border-[#10595a]/10 pb-2">
                                                    {ev.title}
                                                </h4>

                                                {ev.location && (
                                                    <div className="flex items-start gap-1.5 text-xs text-[#10595a]/70 font-semibold mb-4">
                                                        <span>📍</span>
                                                        <span className="line-clamp-2">{ev.location}</span>
                                                    </div>
                                                )}

                                                <div className="text-[#10595a]/80 text-xs leading-relaxed overflow-y-auto max-h-[140px] pr-1 scrollbar-thin font-medium">
                                                    {stripMarkdown(cleanDescription(ev.description, ev.title))}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className="w-full bg-[#10595a] text-white py-3 rounded-xl font-bold tracking-widest text-[10px] uppercase shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 mt-4"
                                        >
                                            VER DETALLES
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* VISUAL PAST EVENTS */}
                {pastEvents.length > 0 && (
                    <div className="mt-20 max-w-7xl mx-auto opacity-80 hover:opacity-100 transition-opacity duration-500">
                        <div className="flex items-end justify-between mb-12 px-4 relative">
                            <div>
                                <Editable
                                    id="events.past.subtitle"
                                    defaultValue="Lo que pasó..."
                                    className="font-script text-4xl md:text-5xl text-gray-400 block mb-2 -rotate-2"
                                    label="Subtítulo Pasados"
                                />
                                <Editable
                                    id="events.past.title"
                                    defaultValue="EVENTOS PASADOS"
                                    className="font-ui text-xl font-black text-gray-500 tracking-tight block"
                                    label="Título Pasados"
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-gray-300 via-gray-200 to-transparent"></div>

                            {/* Navigation arrows for past events */}
                            <div className="flex items-center gap-2 mb-2 relative z-20">
                                <button
                                    onClick={() => scrollSlider(pastSliderRef, 'left')}
                                    className="p-2.5 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-500 hover:text-white transition-all duration-300 active:scale-90 bg-white/80 backdrop-blur-sm shadow-sm"
                                    aria-label="Anterior"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => scrollSlider(pastSliderRef, 'right')}
                                    className="p-2.5 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-500 hover:text-white transition-all duration-300 active:scale-90 bg-white/80 backdrop-blur-sm shadow-sm"
                                    aria-label="Siguiente"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div 
                            ref={pastSliderRef}
                            className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-6 px-4 md:px-6 scrollbar-hide scroll-smooth grayscale-[30%] hover:grayscale-0 transition-all duration-500"
                            onWheel={(e) => {
                                if (e.deltaY !== 0) {
                                    e.currentTarget.scrollLeft += e.deltaY;
                                }
                            }}
                        >
                            {pastEvents.map((ev, i) => (
                                <div
                                    key={ev.id}
                                    className="flip-card min-w-[260px] w-[260px] md:min-w-[290px] md:w-[290px] h-[380px] shrink-0 snap-center cursor-pointer group"
                                >
                                    <div className="flip-card-inner">
                                        {/* FRONT */}
                                        <div className="flip-card-front p-3 flex flex-col justify-between text-left bg-gray-50 border border-gray-200 shadow-sm">
                                            <div>
                                                <div className="h-40 rounded-[1.5rem] overflow-hidden mb-4 relative z-0">
                                                    <img
                                                        src={getOptimizedCloudinaryUrl(ev.image || "", 400)}
                                                        decoding="async"
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750"
                                                        alt={ev.title || 'Evento pasado'}
                                                        onError={(e) => (e.currentTarget.src = "")}
                                                    />
                                                    <div className="absolute top-3 left-3 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm z-20">
                                                        <span className="font-bold text-gray-600 text-[10px] tracking-widest uppercase">
                                                            {formatDateSafely(ev.startDate, 'dd MMM yyyy')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="px-2">
                                                    <h4 className="font-ui font-bold text-base text-gray-700 mb-2 line-clamp-1">{ev.title}</h4>
                                                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{stripMarkdown(cleanDescription(ev.description, ev.title))}</p>
                                                </div>
                                            </div>
                                            <div className="px-2 pb-2 flex items-center justify-between">
                                                <div className="h-px flex-grow bg-gray-200"></div>
                                                <span className="text-gray-500 font-bold text-[9px] tracking-[0.2em] uppercase pl-4 opacity-75 group-hover:opacity-100 transition-opacity">
                                                    VER INFO
                                                </span>
                                            </div>
                                        </div>

                                        {/* BACK */}
                                        <div 
                                            onClick={() => handleSelectEventAndScroll(ev)}
                                            className="flip-card-back p-5 flex flex-col justify-between text-left bg-gradient-to-b from-white to-gray-50 border border-gray-300 shadow-md"
                                        >
                                            <div className="flex-grow flex flex-col justify-between min-h-0">
                                                <div>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        <span className="bg-gray-100 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                                            {formatDateSafely(ev.startDate, 'EEEE dd/MM/yyyy')}
                                                        </span>
                                                        {getEventStatusTag(ev.startDate, ev.endDate) && (
                                                            <span className={`text-white text-[9px] px-2 py-0.5 rounded uppercase tracking-wider font-extrabold ${getStatusBadgeClass(getEventStatusTag(ev.startDate, ev.endDate) || '')}`}>
                                                                {getEventStatusTag(ev.startDate, ev.endDate)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <h4 className="font-ui font-bold text-base text-gray-800 mb-2 leading-snug line-clamp-2 border-b border-gray-200 pb-1.5">
                                                        {ev.title}
                                                    </h4>

                                                    {ev.location && (
                                                        <div className="flex items-start gap-1 text-[11px] text-gray-600 font-semibold mb-3">
                                                            <span>📍</span>
                                                            <span className="line-clamp-2">{ev.location}</span>
                                                        </div>
                                                    )}

                                                    <div className="text-gray-600 text-[11px] leading-relaxed overflow-y-auto max-h-[110px] pr-1 scrollbar-thin">
                                                        {stripMarkdown(cleanDescription(ev.description, ev.title))}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2.5 rounded-xl font-bold tracking-widest text-[9px] uppercase shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 mt-3"
                                            >
                                                VER DETALLES
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* NEW SECTION: SEASONS OF URDINARRAIN */}
                <div className="my-32 max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <Editable
                            id="events.seasons.subtitle"
                            defaultValue="Todo el año"
                            className="font-script text-5xl md:text-6xl text-[#90c69e] block mb-2 transform -rotate-2"
                            label="Subtítulo Estaciones"
                        />
                        <Editable
                            id="events.seasons.title"
                            defaultValue="URDINARRAIN EN 4 ESTACIONES"
                            className="font-ui text-4xl md:text-5xl font-black text-[#10595a] tracking-tight block"
                            label="Título Estaciones"
                        />
                        <div className="w-24 h-1 bg-[#e8d5b5] rounded-full mx-auto mt-6"></div>
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={{
                            hidden: {},
                            visible: {
                                transition: { staggerChildren: 0 }
                            }
                        }}
                        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
                    >
                        {/* SUMMER */}
                        <motion.div
                            initial="hidden"
                            animate={activeSeason === 'summer' ? "hover" : "hidden"}
                            whileInView="cardVisible"
                            variants={{
                                hidden: { opacity: 1, y: 0 },
                                cardVisible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                            }}
                            onHoverStart={() => handleSeasonInteractionStart('summer')}
                            onHoverEnd={() => handleSeasonInteractionEnd('summer')}
                            onClick={() => setActiveSeason(current => current === 'summer' ? null : 'summer')}
                            className="group relative h-[220px] md:h-[400px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2 cursor-pointer"
                        >
                            <Editable
                                id="settings.season_summer"
                                type="image"
                                defaultValue={seasonImages.season_summer || ""}
                                className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-110"
                                label="Imagen Verano"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#10595a] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                            <SeasonSummer />

                            <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full z-20 transition-transform duration-500 group-hover:translate-y-[-10px] group-active:translate-y-[-10px]">
                                <Editable
                                    id="events.season.summer.title"
                                    defaultValue="Verano"
                                    className="font-script text-5xl md:text-6xl text-[#e8d5b5] mb-1 md:mb-2 drop-shadow-md block"
                                    label="Título Verano"
                                />
                                <div className="hidden md:block">
                                    <Editable
                                        id="events.season.summer.desc"
                                        type="textarea"
                                        defaultValue="Días largos de sol, piscina and tardes eternas en el parque. La estación perfecta para desconectar."
                                        className="text-white/90 text-[10px] md:text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 delay-100 block"
                                        label="Descripción Verano"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* AUTUMN */}
                        <motion.div
                            initial="hidden"
                            animate={activeSeason === 'autumn' ? "hover" : "hidden"}
                            whileInView="cardVisible"
                            variants={{
                                hidden: { opacity: 1, y: 0 },
                                cardVisible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                            }}
                            onHoverStart={() => handleSeasonInteractionStart('autumn')}
                            onHoverEnd={() => handleSeasonInteractionEnd('autumn')}
                            onClick={() => setActiveSeason(current => current === 'autumn' ? null : 'autumn')}
                            className="group relative h-[220px] md:h-[400px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2 cursor-pointer"
                        >
                            <Editable
                                id="settings.season_autumn"
                                type="image"
                                defaultValue={seasonImages.season_autumn || ""}
                                className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-110"
                                label="Imagen Otoño"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#8d5e32] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                            <SeasonAutumn />

                            <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full z-20 transition-transform duration-500 group-hover:translate-y-[-10px] group-active:translate-y-[-10px]">
                                <Editable
                                    id="events.season.autumn.title"
                                    defaultValue="Otoño"
                                    className="font-script text-5xl md:text-6xl text-[#e8d5b5] mb-1 md:mb-2 drop-shadow-md block"
                                    label="Título Otoño"
                                />
                                <div className="hidden md:block">
                                    <Editable
                                        id="events.season.autumn.desc"
                                        type="textarea"
                                        defaultValue="Colores ocres, aire fresco y paseos tranquilos. La ciudad se viste de dorado y calma."
                                        className="text-white/90 text-[10px] md:text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 delay-100 block"
                                        label="Descripción Otoño"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* WINTER */}
                        <motion.div
                            initial="hidden"
                            animate={activeSeason === 'winter' ? "hover" : "hidden"}
                            whileInView="cardVisible"
                            variants={{
                                hidden: { opacity: 1, y: 0 },
                                cardVisible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                            }}
                            onHoverStart={() => handleSeasonInteractionStart('winter')}
                            onHoverEnd={() => handleSeasonInteractionEnd('winter')}
                            onClick={() => setActiveSeason(current => current === 'winter' ? null : 'winter')}
                            className="group relative h-[220px] md:h-[400px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2 cursor-pointer"
                        >
                            <Editable
                                id="settings.season_winter"
                                type="image"
                                defaultValue={seasonImages.season_winter || ""}
                                className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-110"
                                label="Imagen Invierno"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                            <SeasonWinter />

                            <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full z-20 transition-transform duration-500 group-hover:translate-y-[-10px] group-active:translate-y-[-10px]">
                                <Editable
                                    id="events.season.winter.title"
                                    defaultValue="Invierno"
                                    className="font-script text-5xl md:text-6xl text-[#e8d5b5] mb-1 md:mb-2 drop-shadow-md block"
                                    label="Título Invierno"
                                />
                                <div className="hidden md:block">
                                    <Editable
                                        id="events.season.winter.desc"
                                        type="textarea"
                                        defaultValue="El encanto del frío, lecturas junto a la ventana y la calidez de nuestro hogar."
                                        className="text-white/90 text-[10px] md:text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 delay-100 block"
                                        label="Descripción Invierno"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* SPRING */}
                        <motion.div
                            initial="hidden"
                            animate={activeSeason === 'spring' ? "hover" : "hidden"}
                            whileInView="cardVisible"
                            variants={{
                                hidden: { opacity: 1, y: 0 },
                                cardVisible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                            }}
                            onHoverStart={() => handleSeasonInteractionStart('spring')}
                            onHoverEnd={() => handleSeasonInteractionEnd('spring')}
                            onClick={() => setActiveSeason(current => current === 'spring' ? null : 'spring')}
                            className="group relative h-[220px] md:h-[400px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2 cursor-pointer"
                        >
                            <Editable
                                id="settings.season_spring"
                                type="image"
                                defaultValue={seasonImages.season_spring || ""}
                                className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-110"
                                label="Imagen Primavera"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#4a7c59] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                            <SeasonSpring />

                            <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full z-20 transition-transform duration-500 group-hover:translate-y-[-10px] group-active:translate-y-[-10px]">
                                <Editable
                                    id="events.season.spring.title"
                                    defaultValue="Primavera"
                                    className="font-script text-5xl md:text-6xl text-[#e8d5b5] mb-1 md:mb-2 drop-shadow-md block"
                                    label="Título Primavera"
                                />
                                <div className="hidden md:block">
                                    <Editable
                                        id="events.season.spring.desc"
                                        type="textarea"
                                        defaultValue="Naturaleza en flor, aromas dulces y vida al aire libre. La energía renace en cada rincón."
                                        className="text-white/90 text-[10px] md:text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 delay-100 block"
                                        label="Descripción Primavera"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <FloatingBookingButton />
            <style>{`
                .markdown-description h3 {
                    font-weight: bold;
                    font-size: 1.1rem;
                    margin-top: 0.75rem;
                    margin-bottom: 0.25rem;
                    color: #10595a;
                }
                .markdown-description p {
                    margin-bottom: 0.5rem;
                }
                .markdown-description strong {
                    font-weight: bold;
                    color: #10595a;
                }
                .markdown-description ul {
                    list-style-type: disc;
                    padding-left: 1.25rem;
                    margin-bottom: 0.5rem;
                }
                .markdown-description li {
                    margin-bottom: 0.25rem;
                }
                .scrollbar-hide::-webkit-scrollbar { display: none; } 
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

                /* Card Flip styles */
                .flip-card {
                    background-color: transparent;
                    perspective: 1000px;
                }

                .flip-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-style: preserve-3d;
                }

                .flip-card:hover .flip-card-inner {
                    transform: rotateY(180deg);
                }

                .flip-card-front, .flip-card-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    border-radius: 2.5rem;
                    overflow: hidden;
                    box-shadow: 0 12px 36px -10px rgba(16, 89, 90, 0.12), 0 2px 8px rgba(16, 89, 90, 0.04);
                    transition: box-shadow 0.4s ease, border-color 0.4s ease;
                }

                .flip-card-front {
                    z-index: 2;
                    transform: rotateY(0deg);
                    border: 1px solid rgba(16, 89, 90, 0.05);
                }

                .flip-card-back {
                    z-index: 1;
                    transform: rotateY(180deg);
                    border: 1.5px solid rgba(144, 198, 158, 0.25);
                }
                
                .flip-card:hover .flip-card-front,
                .flip-card:hover .flip-card-back {
                    box-shadow: 0 24px 48px -12px rgba(16, 89, 90, 0.22), 0 4px 14px rgba(16, 89, 90, 0.08);
                    border-color: rgba(144, 198, 158, 0.45);
                }
                
                /* Line clamp fix to avoid title overflow */
                .line-clamp-2 {
                    display: -webkit-box !important;
                    -webkit-line-clamp: 2 !important;
                    -webkit-box-orient: vertical !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                }
                
                /* Custom scrollbar for small areas */
                .scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background-color: rgba(16, 89, 90, 0.2);
                    border-radius: 10px;
                }
            `}</style>
        </main >
    );
};

export default EventsPage;

