'use client';
import React, { useState, useEffect } from 'react';
import { getContent } from '@/services/content';
import { Event } from '@/types';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, isWithinInterval, parseISO, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CalendarHeart, Play } from 'lucide-react';
import 'react-day-picker/style.css';

const Events: React.FC = () => {
    const [allEvents, setAllEvents] = useState<Event[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [activeEvent, setActiveEvent] = useState<Event | null>(null);
    const [upcomingIndex, setUpcomingIndex] = useState(0);

    useEffect(() => {
        const load = async () => {
            const data = await getContent('events');
            const items = Array.isArray(data) ? data : (data?.items || []);
            if (items.length > 0) {
                const sorted = items.sort((a: Event, b: Event) =>
                    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                );
                setAllEvents(sorted);
            }
        };
        load();
    }, []);

    // Filter: only future events (endDate >= today)
    const upcomingEvents = allEvents.filter(ev => new Date(ev.endDate) >= new Date());

    // Annual events (regardless of date)
    const annualEvents = allEvents.filter(ev => ev.isAnnual);

    // Calendar modifiers for upcoming events only
    const modifiers = {
        eventDay: (date: Date) => {
            return upcomingEvents.some(ev =>
                isWithinInterval(date, { start: parseISO(ev.startDate), end: parseISO(ev.endDate) })
            );
        }
    };

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        const ev = upcomingEvents.find(e =>
            isWithinInterval(day, { start: parseISO(e.startDate), end: parseISO(e.endDate) })
        );
        if (ev) setActiveEvent(ev);
    };

    // Auto-select first upcoming event
    useEffect(() => {
        if (upcomingEvents.length > 0 && !activeEvent) {
            setActiveEvent(upcomingEvents[0]);
            setSelectedDate(parseISO(upcomingEvents[0].startDate));
        }
    }, [allEvents]);

    // Cycle to next event
    const goToNextEvent = () => {
        if (upcomingEvents.length === 0) return;
        const nextIdx = (upcomingIndex + 1) % upcomingEvents.length;
        setUpcomingIndex(nextIdx);
        setActiveEvent(upcomingEvents[nextIdx]);
        setSelectedDate(parseISO(upcomingEvents[nextIdx].startDate));
    };

    // Check if an annual event has a confirmed future date
    const hasUpcomingDate = (ev: Event) => {
        return new Date(ev.endDate) >= new Date();
    };

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-sage/10 rounded-full filter blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-forest/5 rounded-full filter blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <div className="container mx-auto px-6 md:px-10 relative z-10">
                <div className="text-center mb-16">
                    <span className="font-ui bg-[#10595a] text-white px-4 py-2 rounded-full w-fit mx-auto text-[10px] md:text-xs tracking-[0.3em] uppercase font-bold block mb-4">Agenda</span>
                    <h2 className="font-script text-6xl md:text-7xl text-forest mt-2">Próximos Eventos</h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">

                    {/* Calendar visual */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 w-full bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/50 flex flex-col items-center justify-center relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sage/50 to-forest/50"></div>

                        <style>{`
                            .rdp { --rdp-cell-size: 45px; margin: 0; }
                            .rdp-day_selected:not([disabled]), .rdp-day_selected:focus-visible:not([disabled]), .rdp-day_selected:hover:not([disabled]) {
                                background-color: #10595a; 
                                color: white;
                            }
                            .event-circle {
                                background-color: #9dd1a6;
                                color: white;
                                border-radius: 50%;
                                font-weight: bold;
                            }
                            .rdp-caption_label {
                                font-family: 'Montserrat', sans-serif;
                                text-transform: uppercase;
                                letter-spacing: 0.2em;
                                color: #10595a;
                                font-size: 0.9rem;
                            }
                            .rdp-head_cell {
                                font-family: 'Montserrat', sans-serif;
                                font-size: 0.7rem;
                                color: #9ca3af;
                            }
                        `}</style>
                        <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(day: Date | undefined) => { if (day) handleDayClick(day); }}
                            locale={es}
                            modifiers={modifiers}
                            modifiersClassNames={{
                                eventDay: 'event-circle'
                            }}
                            className="font-ui"
                        />

                        <div className="mt-8 flex items-center gap-2 text-[10px] text-gray-400 font-ui tracking-widest uppercase">
                            <span className="w-3 h-3 rounded-full bg-sage block"></span> Fechas con eventos
                        </div>
                    </motion.div>

                    {/* Events List / Details */}
                    <div className="flex-1 w-full flex flex-col justify-center">
                        {activeEvent ? (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeEvent.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-sage/10 rounded-bl-[100px] -mr-8 -mt-8 z-0"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <span className="bg-forest text-white px-4 py-2 rounded-xl text-xs font-bold tracking-widest shadow-lg shadow-forest/20">
                                                {format(parseISO(activeEvent.startDate), 'MMM', { locale: es }).toUpperCase()} {format(parseISO(activeEvent.startDate), 'dd')}
                                            </span>
                                            <div className="h-px flex-1 bg-gray-100"></div>
                                            <span className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                                                Hasta {format(parseISO(activeEvent.endDate), 'dd MMM')}
                                            </span>
                                        </div>

                                        <h3 className="font-script text-6xl text-forest mb-6 leading-[0.8]">{activeEvent.title}</h3>

                                        <p className="text-gray-500 font-light leading-relaxed text-lg mb-6">
                                            {activeEvent.description}
                                        </p>

                                        {/* Video embed */}
                                        {activeEvent.videoUrl && (
                                            <div className="mb-6">
                                                {activeEvent.videoUrl.includes('youtube') || activeEvent.videoUrl.includes('youtu.be') ? (
                                                    <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
                                                        <iframe
                                                            src={activeEvent.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                                            className="w-full h-full"
                                                            allowFullScreen
                                                            title={activeEvent.title}
                                                        />
                                                    </div>
                                                ) : (
                                                    <a href={activeEvent.videoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sage hover:text-forest transition-colors text-sm font-bold">
                                                        <Play size={16} /> Ver video del evento
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        <button className="text-xs font-bold tracking-[0.2em] text-sage border-b border-sage/30 pb-1 hover:text-forest hover:border-forest transition-all">
                                            RESERVAR PARA ESTA FECHA
                                        </button>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <div className="bg-transparent border-2 border-dashed border-gray-200 p-12 rounded-[2.5rem] text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                                <span className="text-4xl mb-4">📅</span>
                                <p className="text-gray-400 font-light text-lg">No hay eventos próximos. ¡Volvé pronto!</p>
                            </div>
                        )}

                        {/* Next Event Button */}
                        {upcomingEvents.length > 1 && (
                            <button
                                onClick={goToNextEvent}
                                className="mt-6 mx-auto flex items-center gap-2 bg-forest/10 hover:bg-forest hover:text-white text-forest px-6 py-3 rounded-full transition-all duration-300 group"
                            >
                                <span className="text-xs font-bold tracking-widest uppercase">Ver Siguiente Evento</span>
                                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Annual Events Section */}
                {annualEvents.length > 0 && (
                    <div className="mt-24">
                        <div className="text-center mb-12">
                            <span className="font-ui bg-[#10595a] text-white px-4 py-2 rounded-full w-fit mx-auto text-[10px] md:text-xs tracking-[0.3em] uppercase font-bold block mb-4">Tradiciones</span>
                            <h3 className="font-script text-5xl md:text-6xl text-forest mt-2">Eventos Anuales</h3>
                            <p className="text-gray-500 font-light mt-3 max-w-lg mx-auto">Eventos que se celebran cada año en nuestra región. ¡No te los pierdas!</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {annualEvents.map((ev, i) => (
                                <motion.div
                                    key={ev.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-3xl p-8 shadow-lg border border-gray-50 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                                >
                                    {/* Annual badge */}
                                    <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                                        <CalendarHeart size={12} /> Anual
                                    </div>

                                    <h4 className="font-script text-4xl text-forest mb-3 pr-20">{ev.title}</h4>
                                    <p className="text-gray-500 font-light text-sm leading-relaxed mb-4 line-clamp-3">{ev.description}</p>

                                    {/* Date info */}
                                    {hasUpcomingDate(ev) ? (
                                        <div className="bg-forest/5 rounded-xl px-4 py-3 flex items-center gap-3">
                                            <span className="bg-forest text-white px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider">
                                                {format(parseISO(ev.startDate), 'dd MMM yyyy', { locale: es }).toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-400">Fecha confirmada</span>
                                        </div>
                                    ) : (
                                        <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-center gap-3">
                                            <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider">
                                                {ev.estimatedSeason || 'Por confirmar'}
                                            </span>
                                            <span className="text-xs text-gray-400">Fecha estimada</span>
                                        </div>
                                    )}

                                    {/* Video link */}
                                    {ev.videoUrl && (
                                        <a href={ev.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center gap-2 text-sage hover:text-forest text-xs font-bold tracking-wider transition-colors">
                                            <Play size={14} /> VER VIDEO
                                        </a>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Events;







