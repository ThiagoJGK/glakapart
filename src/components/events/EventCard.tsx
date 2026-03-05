'use client';
import React from 'react';
import { Event } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

interface EventCardProps {
    event: Event | null;
    selectedDate: Date | undefined;
}

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
                            ? `No hay programacion para el ${format(selectedDate, 'dd MMMM', { locale: es })}.`
                            : 'Selecciona una fecha en el calendario.'}
                    </p>
                </div>
            </div>
        );
    }

    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    return (
        <div className="h-full flex flex-col justify-between p-6 md:p-12 relative">
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div className="bg-[#10595a] text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg transform transition-transform hover:scale-105 duration-300">
                        <span className="block text-[10px] font-bold tracking-widest uppercase leading-none mb-1">
                            {format(start, 'MMM', { locale: es }).replace('.', '')}
                        </span>
                        <span className="block text-2xl font-bold leading-none">
                            {format(start, 'dd')}
                        </span>
                    </div>
                    {event.endDate && (
                        <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase border border-gray-200 px-3 py-1 rounded-full">
                            HASTA {format(end, 'dd MMM', { locale: es })}
                        </span>
                    )}
                </div>

                <div className="space-y-4 mb-8">
                    <h2 className="font-script text-4xl md:text-5xl text-[#10595a] leading-tight">
                        {event.title}
                    </h2>
                    <div className="w-12 h-1 bg-[#90c69e] rounded-full"></div>
                </div>

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






