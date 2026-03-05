'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import Editable from '../ui/Editable';
import { Event } from '@/types';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarHeart, Play } from 'lucide-react';
import 'react-day-picker/style.css';

const SEASON_OPTIONS = ['Verano', 'Otoño', 'Invierno', 'Primavera', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const AdminEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({});
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        const data = await getContent('events');
        if (data && data.items && Array.isArray(data.items)) {
            setEvents(data.items);
        } else if (Array.isArray(data)) {
            setEvents(data);
        }
    };

    const saveToDb = async (newEvents: Event[]) => {
        await updateContent('events', 'items', newEvents);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que quieres eliminar este evento?')) return;
        const updated = events.filter(e => e.id !== id);
        setEvents(updated);
        await saveToDb(updated);
    };

    const startEdit = (ev?: Event) => {
        if (ev) {
            setCurrentEvent(ev);
            setSelectedRange({
                from: new Date(ev.startDate),
                to: new Date(ev.endDate)
            });
        } else {
            setCurrentEvent({});
            setSelectedRange(undefined);
        }
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!currentEvent.title || !selectedRange?.from || !selectedRange?.to) {
            alert('Por favor completa Título y Fechas');
            return;
        }

        const newEv: Event = {
            id: currentEvent.id || Date.now().toString(),
            title: currentEvent.title!,
            description: currentEvent.description || '',
            startDate: selectedRange.from!.toISOString(),
            endDate: selectedRange.to!.toISOString(),
            image: currentEvent.image || '',
            videoUrl: currentEvent.videoUrl || '',
            isAnnual: currentEvent.isAnnual || false,
            estimatedSeason: currentEvent.estimatedSeason || '',
        };

        let newEvents = [...events];
        if (currentEvent.id) {
            newEvents = newEvents.map(e => e.id === newEv.id ? newEv : e);
        } else {
            newEvents.push(newEv);
        }

        setEvents(newEvents);
        await saveToDb(newEvents);
        setIsEditing(false);
        setCurrentEvent({});
        setSelectedRange(undefined);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-2xl font-script text-forest">Gestión de Eventos</h3>
                {!isEditing && (
                    <button
                        onClick={() => startEdit()}
                        className="bg-sage text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-forest transition-colors w-full sm:w-auto text-center"
                    >
                        + NUEVO EVENTO
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left: Text fields */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Título</label>
                                <input
                                    type="text"
                                    value={currentEvent.title || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-sage"
                                    placeholder="Ej: Fiesta de la Cerveza"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Descripción</label>
                                <textarea
                                    value={currentEvent.description || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 h-24 focus:outline-none focus:border-sage"
                                    placeholder="Breve descripción del evento..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">URL de Video (YouTube o directo)</label>
                                <input
                                    type="url"
                                    value={currentEvent.videoUrl || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, videoUrl: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-sage"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                            </div>
                        </div>

                        {/* Right: Calendar */}
                        <div className="flex-1 flex flex-col items-center">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Seleccionar Fechas (Inicio - Fin)</label>
                            <div className="border border-gray-100 rounded-xl p-2">
                                <DayPicker
                                    mode="range"
                                    selected={selectedRange}
                                    onSelect={setSelectedRange}
                                    locale={es}
                                    modifiersClassNames={{
                                        selected: 'bg-sage text-white rounded-full'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Annual event options */}
                    <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100/50 space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={currentEvent.isAnnual || false}
                                onChange={e => setCurrentEvent({ ...currentEvent, isAnnual: e.target.checked })}
                                className="w-4 h-4 text-sage rounded border-gray-300 focus:ring-sage"
                            />
                            <div>
                                <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <CalendarHeart size={14} className="text-amber-600" /> Evento Anual / Recurrente
                                </span>
                                <span className="text-xs text-gray-400 block">Se mostrará en la sección "Eventos Anuales"</span>
                            </div>
                        </label>

                        {currentEvent.isAnnual && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Temporada / Mes Estimado (cuando no hay fecha confirmada)</label>
                                <select
                                    value={currentEvent.estimatedSeason || ''}
                                    onChange={e => setCurrentEvent({ ...currentEvent, estimatedSeason: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-sage bg-white"
                                >
                                    <option value="">Seleccionar...</option>
                                    {SEASON_OPTIONS.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handleSave}
                            className="bg-forest text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 text-xs tracking-widest flex-1 sm:flex-none"
                        >
                            GUARDAR
                        </button>
                        <button
                            onClick={() => { setIsEditing(false); setCurrentEvent({}); setSelectedRange(undefined); }}
                            className="border border-gray-300 px-6 py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-50 text-xs tracking-widest"
                        >
                            CANCELAR
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {events.length === 0 && <p className="text-gray-400 italic">No hay eventos cargados.</p>}
                    {events.map(ev => (
                        <div key={ev.id} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3 group hover:shadow-md transition-shadow">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-ui text-base md:text-lg font-bold text-forest">{ev.title}</h4>
                                    {ev.isAnnual && (
                                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                                            <CalendarHeart size={10} /> Anual
                                        </span>
                                    )}
                                    {ev.videoUrl && (
                                        <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                                            <Play size={10} /> Video
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">
                                    {format(new Date(ev.startDate), 'dd MMM', { locale: es })} - {format(new Date(ev.endDate), 'dd MMM yyyy', { locale: es })}
                                    {ev.estimatedSeason && <span className="ml-2 text-amber-600 text-xs">· Estimado: {ev.estimatedSeason}</span>}
                                </p>
                                <p className="text-gray-400 text-sm mt-1 line-clamp-1">{ev.description}</p>
                            </div>
                            <div className="flex gap-2 opacity-100 sm:opacity-10 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button onClick={() => startEdit(ev)} className="p-2 text-sage hover:bg-sage/10 rounded-full">✎</button>
                                <button onClick={() => handleDelete(ev.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full">🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminEvents;








