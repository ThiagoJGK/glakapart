'use client';
import React from 'react';
import { Event } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, MapPin } from 'lucide-react';

interface EventCardProps {
    event: Event | null;
    selectedDate: Date | undefined;
}

const formatDateSafely = (dateStr: string, formatPattern: string) => {
    try {
        if (!dateStr) return 'Sin fecha';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return format(date, formatPattern, { locale: es });
    } catch (e) {
        return 'Fecha inválida';
    }
};

const EventCard: React.FC<EventCardProps> = ({ event, selectedDate }) => {
    if (!event) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-8 min-h-[300px]">
                <div className="w-20 h-20 bg-[#f4f1ea] rounded-full flex items-center justify-center text-[#10595a]/40 animate-pulse">
                    <Calendar size={32} />
                </div>
                <div>
                    <h3 className="font-ui text-gray-400 tracking-widest text-xs uppercase mb-2">Sin Eventos</h3>
                    <p className="text-gray-400 font-light text-sm max-w-xs mx-auto">
                        {selectedDate
                            ? `No hay programacion para el ${formatDateSafely(selectedDate.toISOString(), 'dd MMMM')}.`
                            : 'Selecciona una fecha en el calendario.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col justify-between p-6 md:p-12 relative">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#10595a] text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
                            <span className="block text-[10px] font-bold tracking-widest uppercase leading-none mb-1">
                                {formatDateSafely(event.startDate, 'MMM').replace('.', '')}
                            </span>
                            <span className="block text-2xl font-bold leading-none">
                                {formatDateSafely(event.startDate, 'dd')}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            {event.source === 'urdinarrain' && (
                                <span className="text-[8px] font-bold bg-blue-50 text-blue-700 tracking-wider uppercase px-2 py-0.5 rounded-full border border-blue-100 w-fit">
                                    📍 Municipio
                                </span>
                            )}
                            {event.category && (
                                <span className="text-[8px] font-bold bg-gray-50 text-gray-600 tracking-wider uppercase px-2 py-0.5 rounded-full border border-gray-100 w-fit">
                                    {event.category}
                                </span>
                            )}
                        </div>
                    </div>
                    {event.endDate && (
                        <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase border border-gray-200 px-3 py-1 rounded-full">
                            HASTA {formatDateSafely(event.endDate, 'dd MMM')}
                        </span>
                    )}
                </div>

                <div className="space-y-4 mb-4">
                    <h2 className="font-script text-4xl md:text-5xl text-[#10595a] leading-tight">
                        {event.title}
                    </h2>
                    <div className="w-12 h-1 bg-[#90c69e] rounded-full"></div>
                </div>

                {event.location && (
                    <div className="flex items-center gap-1 text-xs text-forest/80 mb-6 bg-forest/5 px-2.5 py-1 rounded-lg w-fit">
                        <MapPin size={10} className="text-[#10595a]" />
                        <span>{event.location}</span>
                    </div>
                )}

                <p className="text-gray-500 font-ui font-light leading-relaxed mb-8 text-sm md:text-base pr-4">
                    "{event.description}"
                </p>
            </div>

            <button
                onClick={() => document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex items-center gap-3 text-[#10595a] text-[10px] font-bold tracking-[0.25em] uppercase hover:text-[#90c69e] transition-colors self-start py-2"
            >
                <span>RESERVAR AHORA</span>
                <span className="block w-8 h-[1px] bg-current group-hover:w-12 transition-all duration-300"></span>
            </button>
        </div>
    );
};

export default EventCard;






