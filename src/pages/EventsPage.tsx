'use client';
import React, { useState, useEffect } from 'react';
import { getContent } from '@/services/content';
import { Event } from '@/types';
import EventsCalendar from '@/components/events/EventsCalendar';
import EventCard from '@/components/events/EventCard';
import FloatingBookingButton from '@/components/events/FloatingBookingButton';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { SeasonSummer } from '@/components/events/SeasonSummer';
import { SeasonAutumn } from '@/components/events/SeasonAutumn';
import { SeasonWinter } from '@/components/events/SeasonWinter';
import { SeasonSpring } from '@/components/events/SeasonSpring';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useRef } from 'react';
import Editable from '@/components/ui/Editable';

const EventsPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [blurBg, setBlurBg] = useState<string>('');
    const [seasonImages, setSeasonImages] = useState<Record<string, string>>({});

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
                    .map((e: Event) => ({ ...e, start: new Date(e.startDate) }))
                    .filter((e: any) => e.start >= new Date().setHours(0, 0, 0, 0))
                    .sort((a: any, b: any) => a.start.getTime() - b.start.getTime())[0];

                if (upcoming) {
                    setSelectedDate(new Date(upcoming.startDate));
                    setSelectedEvent(upcoming);
                }
            } else if (Array.isArray(eventsData)) {
                setEvents(eventsData);
            }

            // Load Settings for Background
            const settingsData = await getContent('settings');
            if (settingsData) {
                const url = settingsData.header_events_blur ||
                    settingsData.header_home_blur ||
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070";
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
        if (date) {
            // Find event on this date
            const ev = events.find(e =>
                isSameDay(date, new Date(e.startDate)) ||
                (new Date(e.startDate) <= date && new Date(e.endDate) >= date)
            );
            setSelectedEvent(ev || null);
        } else {
            setSelectedEvent(null);
        }
    };

    const handleSeasonInteractionStart = (season: string) => {
        // Clear any pending timeout that might turn it off
        if (seasonTimeouts.current[season]) {
            clearTimeout(seasonTimeouts.current[season]);
        }
        setActiveSeason(season);
    };

    const handleSeasonInteractionEnd = (season: string, isTap: boolean = false) => {
        if (isTap) {
            // If it was a quick tap, keep it active for 1 full cycle (e.g., 2 seconds) then turn off
            seasonTimeouts.current[season] = setTimeout(() => {
                setActiveSeason(current => current === season ? null : current);
            }, 2000);
        } else {
            // If it was a hold release, turn off immediately
            setActiveSeason(null);
        }
    };

    return (
        <main className="min-h-screen pt-52 md:pt-[480px] pb-20 relative z-30 overflow-hidden selection:bg-[#90c69e] selection:text-white">

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header - Friendly & Organic */}
                <div className="text-center mb-32 relative group">
                    <div className="inline-block relative">
                        <span className="font-script text-4xl md:text-6xl text-[#90c69e] absolute -top-8 left-0 md:-left-8 transform -rotate-12 opacity-90 drop-shadow-sm group-hover:-rotate-6 transition-transform duration-500">Descubrí</span>
                        <h1 className="font-ui text-3xl md:text-6xl font-bold text-[#10595a] tracking-tight relative z-10 drop-shadow-sm">
                            Momentos en Urdinarrain
                        </h1>
                        <div className="absolute -bottom-2 right-0 w-[110%] h-4 bg-[#e8d5b5]/80 rounded-full -rotate-1 z-0 mix-blend-multiply"></div>
                    </div>
                    <p className="mt-8 text-[#10595a]/70 font-ui font-medium tracking-[0.2em] uppercase text-sm md:text-base">
                        Encuentros <span className="text-[#90c69e] mx-2">•</span> Cultura <span className="text-[#90c69e] mx-2">•</span> Relax
                    </p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 max-w-7xl mx-auto">

                    {/* LEFT: Calendar "Notebook" Style */}
                    <div className="lg:col-span-5 relative z-10 flex flex-col">
                        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(16,89,90,0.15)] border border-white/50 relative group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_70px_-12px_rgba(16,89,90,0.2)] h-full flex flex-col justify-between">

                            {/* Decorative Binding Effect */}
                            <div className="absolute top-0 left-0 w-full h-full rounded-[3rem] border-[4px] border-[#f4f1ea] pointer-events-none"></div>

                            {/* Decorative Tape */}
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#e8d5b5] transform -rotate-1 shadow-md border border-white/20 flex items-center justify-center opacity-90">
                                <div className="w-full h-full opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:4px_4px]"></div>
                            </div>

                            <div className="text-center mb-8 mt-2">
                                <span className="font-ui text-xs font-bold text-[#10595a] tracking-[0.3em] uppercase border-b-2 border-[#90c69e]/30 pb-2">TU AGENDA</span>
                            </div>

                            <div className="text-[#10595a] flex-grow flex items-center justify-center">
                                <EventsCalendar
                                    events={events}
                                    selectedDate={selectedDate}
                                    onSelectDate={handleDateSelect}
                                    theme="light"
                                />
                            </div>

                            <div className="text-center mt-8">
                                <p className="font-script text-[#10595a]/60 text-xl animate-pulse-slow">¡Hacé click en una fecha!</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Active Event "Floating Note" */}
                    <div className="lg:col-span-7 relative z-10 flex flex-col">
                        {selectedEvent ? (
                            <div className="relative animate-fade-in-up h-full">
                                {/* Solid Container */}
                                <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-6 md:p-8 shadow-[0_20px_50px_-10px_rgba(16,89,90,0.15)] border border-white/60 relative overflow-hidden transition-all duration-500 h-full flex flex-col justify-center">
                                    <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                                        {/* Image - Clean & Sharp with Offset Border */}
                                        <div className="w-full md:w-1/2 h-64 md:h-80 rounded-[2.5rem] relative group shrink-0">
                                            <div className="absolute inset-0 bg-[#90c69e]/20 rounded-[2.5rem] transform rotate-3 scale-105 transition-transform group-hover:rotate-6"></div>
                                            <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-lg border-2 border-white">
                                                <img
                                                    src={selectedEvent.image || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069"}
                                                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                                                    alt="Evento"
                                                />
                                            </div>
                                            <div className="absolute top-6 left-6 bg-white/95 px-5 py-2 rounded-2xl shadow-lg border border-[#10595a]/5">
                                                <span className="font-bold text-[#10595a] text-sm tracking-widest uppercase">
                                                    {format(new Date(selectedEvent.startDate), 'dd MMM', { locale: es })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Text Content */}
                                        <div className="w-full md:w-1/2 text-left flex flex-col justify-center h-full">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="inline-block px-4 py-1.5 rounded-full bg-[#10595a]/5 text-[#10595a] text-[11px] font-bold tracking-widest uppercase border border-[#10595a]/10">
                                                    {format(new Date(selectedEvent.startDate), 'EEEE', { locale: es })}
                                                </span>
                                            </div>

                                            <h2 className="font-ui font-black text-3xl md:text-3xl text-[#10595a] leading-tight mb-4 drop-shadow-sm">
                                                {selectedEvent.title}
                                            </h2>
                                            <p className="text-[#10595a]/80 font-medium text-sm leading-relaxed mb-8 line-clamp-5">
                                                {selectedEvent.description}
                                            </p>
                                            <button
                                                onClick={() => document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' })}
                                                className="bg-gradient-to-r from-[#10595a] to-[#157173] text-white px-8 py-3.5 rounded-2xl font-bold tracking-widest text-xs uppercase hover:shadow-[0_10px_30px_-10px_rgba(16,89,90,0.4)] hover:-translate-y-1 transition-all duration-300 w-full md:w-auto overflow-hidden relative group mt-auto"
                                            >
                                                <span className="relative z-10">¡Me sumo!</span>
                                                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
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
                                <h3 className="font-script text-6xl text-[#10595a] mb-6 drop-shadow-sm">Día de Relax</h3>
                                <div className="w-16 h-1 bg-[#e8d5b5] rounded-full mb-6"></div>
                                <p className="text-[#10595a]/80 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                                    No hay eventos programados para esta fecha.
                                    <br /><span className="text-[#90c69e] font-bold mt-2 block text-xl">¡Desconectá y disfrutá!</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>



                {/* NEW SECTION: SEASONS OF URDINARRAIN */}
                <div className="my-32 max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="font-script text-4xl text-[#90c69e] block mb-2 transform -rotate-2">Todo el año</span>
                        <h2 className="font-ui text-4xl md:text-5xl font-black text-[#10595a] tracking-tight">URDINARRAIN EN 4 ESTACIONES</h2>
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
                            onTouchStart={() => handleSeasonInteractionStart('summer')}
                            onTouchEnd={() => handleSeasonInteractionEnd('summer', false)}
                            onTap={() => handleSeasonInteractionEnd('summer', true)}
                            className="group relative h-[220px] md:h-[400px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2 cursor-pointer"
                        >
                            <Editable
                                id="settings.season_summer"
                                type="image"
                                defaultValue={seasonImages.season_summer || "https://images.unsplash.com/photo-1560252829-8aa848520338?q=80&w=800"}
                                className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-110"
                                label="Imagen Verano"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#10595a] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                            <SeasonSummer />

                            <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full z-20 transition-transform duration-500 group-hover:translate-y-[-10px] group-active:translate-y-[-10px]">
                                <h3 className="font-script text-3xl md:text-5xl text-[#e8d5b5] mb-1 md:mb-2 drop-shadow-md">Verano</h3>
                                <p className="text-white/90 text-[10px] md:text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 delay-100 hidden md:block">
                                    Días largos de sol, piscina y tardes eternas en el parque. La estación perfecta para desconectar.
                                </p>
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
                            onTouchStart={() => handleSeasonInteractionStart('autumn')}
                            onTouchEnd={() => handleSeasonInteractionEnd('autumn', false)}
                            onTap={() => handleSeasonInteractionEnd('autumn', true)}
                            className="group relative h-[220px] md:h-[400px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2 cursor-pointer"
                        >
                            <Editable
                                id="settings.season_autumn"
                                type="image"
                                defaultValue={seasonImages.season_autumn || "https://images.unsplash.com/photo-1507371341162-763b5e419408?q=80&w=800"}
                                className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-110"
                                label="Imagen Otoño"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#8d5e32] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                            <SeasonAutumn />

                            <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full z-20 transition-transform duration-500 group-hover:translate-y-[-10px] group-active:translate-y-[-10px]">
                                <h3 className="font-script text-3xl md:text-5xl text-[#e8d5b5] mb-1 md:mb-2 drop-shadow-md">Otoño</h3>
                                <p className="text-white/90 text-[10px] md:text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 delay-100 hidden md:block">
                                    Colores ocres, aire fresco y paseos tranquilos. La ciudad se viste de dorado y calma.
                                </p>
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
                            onTouchStart={() => handleSeasonInteractionStart('winter')}
                            onTouchEnd={() => handleSeasonInteractionEnd('winter', false)}
                            onTap={() => handleSeasonInteractionEnd('winter', true)}
                            className="group relative h-[220px] md:h-[400px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2 cursor-pointer"
                        >
                            <Editable
                                id="settings.season_winter"
                                type="image"
                                defaultValue={seasonImages.season_winter || "https://images.unsplash.com/photo-1486496146582-9ffcd0b2b2b7?q=80&w=800"}
                                className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-110"
                                label="Imagen Invierno"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#2c3e50] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                            <SeasonWinter />

                            <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full z-20 transition-transform duration-500 group-hover:translate-y-[-10px] group-active:translate-y-[-10px]">
                                <h3 className="font-script text-3xl md:text-5xl text-[#e8d5b5] mb-1 md:mb-2 drop-shadow-md">Invierno</h3>
                                <p className="text-white/90 text-[10px] md:text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 delay-100 hidden md:block">
                                    El encanto del frío, lecturas junto a la ventana y la calidez de nuestro hogar.
                                </p>
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
                            onTouchStart={() => handleSeasonInteractionStart('spring')}
                            onTouchEnd={() => handleSeasonInteractionEnd('spring', false)}
                            onTap={() => handleSeasonInteractionEnd('spring', true)}
                            className="group relative h-[220px] md:h-[400px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 md:hover:-translate-y-2 cursor-pointer"
                        >
                            <Editable
                                id="settings.season_spring"
                                type="image"
                                defaultValue={seasonImages.season_spring || "https://images.unsplash.com/photo-1490750967868-69c2f016752d?q=80&w=800"}
                                className="absolute inset-0 w-full h-full transition-transform duration-1000 group-hover:scale-110"
                                label="Imagen Primavera"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#4a7c59] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                            <SeasonSpring />

                            <div className="absolute bottom-0 left-0 p-4 md:p-8 w-full z-20 transition-transform duration-500 group-hover:translate-y-[-10px] group-active:translate-y-[-10px]">
                                <h3 className="font-script text-3xl md:text-5xl text-[#e8d5b5] mb-1 md:mb-2 drop-shadow-md">Primavera</h3>
                                <p className="text-white/90 text-[10px] md:text-sm font-medium leading-relaxed opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 delay-100 hidden md:block">
                                    Naturaleza en flor, aromas dulces y vida al aire libre. La energía renace en cada rincón.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* VISUAL & FRIENDLY UPCOMING LIST */}
                <div className="mt-20 max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-12 px-4 relative">
                        <div>
                            <span className="font-script text-3xl text-[#90c69e] block mb-2 -rotate-2">Lo que se viene...</span>
                            <h3 className="font-ui text-2xl font-black text-[#10595a] tracking-tight">PRÓXIMAS FECHAS</h3>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-[#10595a]/20 via-[#10595a]/5 to-transparent"></div>

                        {/* Mobile Swipe Hint */}
                        <div className="md:hidden flex gap-2 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-[#10595a]"></div>
                            <div className="w-2 h-2 rounded-full bg-[#10595a]/30"></div>
                            <div className="w-2 h-2 rounded-full bg-[#10595a]/10"></div>
                        </div>
                    </div>

                    <div className="flex md:grid md:grid-cols-3 gap-8 overflow-x-auto snap-x snap-mandatory pb-12 md:pb-0 px-4 md:px-0 scrollbar-hide">
                        {events.slice(0, 3).map((ev, i) => (
                            <div
                                key={ev.id}
                                onClick={() => {
                                    setSelectedDate(new Date(ev.startDate));
                                    setSelectedEvent(ev);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="min-w-[300px] md:min-w-0 snap-center bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-[#10595a]/5 hover:border-[#90c69e]/30 hover:-translate-y-3"
                            >
                                <div className="h-52 rounded-[2rem] overflow-hidden mb-6 relative z-0">
                                    <div className="absolute inset-0 bg-[#10595a]/20 group-hover:bg-transparent transition-colors duration-500 z-10 hidden"></div>
                                    <img
                                        src={ev.image || `https://source.unsplash.com/random/800x600?sig=${i}&nature`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069")}
                                    />
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                    <div className="absolute top-4 left-4 bg-white/95 px-4 py-2 rounded-xl shadow-lg z-20">
                                        <span className="font-bold text-[#10595a] text-xs tracking-widest uppercase">
                                            {format(new Date(ev.startDate), 'dd MMM', { locale: es })}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-4 pb-4">
                                    <h4 className="font-ui font-black text-xl text-[#10595a] mb-3 line-clamp-1 group-hover:text-[#90c69e] transition-colors">{ev.title}</h4>
                                    <p className="text-[#10595a]/60 text-sm line-clamp-2 leading-relaxed">{ev.description}</p>
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="h-px flex-grow bg-[#f4f1ea] group-hover:bg-[#90c69e]/30 transition-colors"></div>
                                        <span className="text-[#90c69e] font-bold text-[10px] tracking-[0.2em] uppercase pl-4 opacity-70 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                            VER INFO
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <FloatingBookingButton />
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </main >
    );
};

export default EventsPage;

