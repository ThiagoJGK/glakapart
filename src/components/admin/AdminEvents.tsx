'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import Editable from '../ui/Editable';
import { Event } from '@/types';
import { DayPicker, DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarHeart, Play, Image as ImageIcon, Star, Trash2, RefreshCw, MapPin } from 'lucide-react';
import { uploadImage } from '@/services/images';
import 'react-day-picker/style.css';
import GalleryManager from './GalleryManager';

const SEASON_OPTIONS = ['Verano', 'Otoño', 'Invierno', 'Primavera', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const normalizeIsoDateString = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('T');
        const datePart = parts[0];
        const timePart = parts[1] || '';
        
        const dateSegments = datePart.split('-');
        if (dateSegments.length === 3) {
            const y = dateSegments[0];
            const m = dateSegments[1].padStart(2, '0');
            const d = dateSegments[2].padStart(2, '0');
            
            const normalizedDate = `${y}-${m}-${d}`;
            if (timePart) {
                return `${normalizedDate}T${timePart}`;
            }
            return normalizedDate;
        }
    } catch (e) {}
    return dateStr;
};

const AdminEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({});
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncStatus, setSyncStatus] = useState('');

    const handleSync = () => {
        setIsSyncing(true);
        setSyncProgress(0);
        setSyncStatus('Iniciando sincronización...');

        const existingIds = events.map(e => e.id).join(',');
        const eventSource = new EventSource(`/api/sync-events?existingIds=${encodeURIComponent(existingIds)}`);

        eventSource.addEventListener('progress', (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                if (data.message) setSyncStatus(data.message);
                if (data.progress !== undefined) setSyncProgress(data.progress);
            } catch (err) {
                console.error(err);
            }
        });

        eventSource.addEventListener('complete', async (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                eventSource.close();
                
                // Unir eventos
                const syncedResults: Event[] = data.events;
                const manualEvents = events.filter(ev => !ev.source || ev.source === 'manual');
                const previousSyncedEvents = events.filter(ev => ev.source === 'urdinarrain');

                const finalSyncedList: Event[] = [];

                for (const item of syncedResults) {
                    if ((item as any)._keepExisting) {
                        const found = previousSyncedEvents.find(pe => pe.id === item.id);
                        if (found) finalSyncedList.push(found);
                    } else {
                        finalSyncedList.push(item);
                    }
                }

                const fetchedIds = syncedResults.map(r => r.id);
                const olderSynced = previousSyncedEvents.filter(pe => !fetchedIds.includes(pe.id));

                const combinedEvents = [
                    ...manualEvents,
                    ...finalSyncedList,
                    ...olderSynced
                ];

                setSyncStatus('Guardando cambios en base de datos...');
                setSyncProgress(98);

                const success = await saveToDb(combinedEvents);
                if (success) {
                    setEvents(combinedEvents);
                    setSyncStatus('¡Sincronización exitosa!');
                    setSyncProgress(100);
                    setTimeout(() => {
                        setIsSyncing(false);
                        setSyncStatus('');
                        setSyncProgress(0);
                    }, 2000);
                } else {
                    alert('Error de permisos al guardar en Firestore. Asegurate de estar logueado.');
                    setIsSyncing(false);
                }
            } catch (err) {
                console.error(err);
                alert('Error al procesar los datos de sincronización.');
                setIsSyncing(false);
            }
        });

        eventSource.addEventListener('error', (e: any) => {
            console.error('SSE Error:', e);
            let errMsg = 'Ocurrió un error en la conexión.';
            eventSource.close();
            alert(`Error de sincronización: ${errMsg}`);
            setIsSyncing(false);
        });
    };

    const handleClearSynced = async () => {
        if (!confirm('¿Seguro que querés borrar todos los eventos importados del municipio? Esto no afectará tus eventos manuales.')) return;
        setIsSyncing(true);
        setSyncStatus('Eliminando eventos del municipio...');
        setSyncProgress(20);
        try {
            const manualEvents = events.filter(ev => !ev.source || ev.source === 'manual');
            setSyncProgress(60);
            const success = await saveToDb(manualEvents);
            if (success) {
                setEvents(manualEvents);
                setSyncProgress(100);
                setSyncStatus('¡Eventos del municipio eliminados con éxito!');
                setTimeout(() => {
                    setIsSyncing(false);
                    setSyncStatus('');
                    setSyncProgress(0);
                }, 2000);
            } else {
                alert('Error al guardar cambios en Firestore.');
                setIsSyncing(false);
            }
        } catch (err) {
            console.error(err);
            alert('Ocurrió un error al intentar eliminar los eventos.');
            setIsSyncing(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploadingImage(true);
        const newImages = [...(currentEvent.images || [])];
        for (let i = 0; i < e.target.files.length; i++) {
            const url = await uploadImage(e.target.files[i]);
            newImages.push(url);
        }
        let cover = currentEvent.coverImage;
        if (!cover && newImages.length > 0) cover = newImages[0];
        
        setCurrentEvent({ ...currentEvent, images: newImages, coverImage: cover });
        setUploadingImage(false);
    };

    const removeImage = (url: string) => {
        const newImages = (currentEvent.images || []).filter(img => img !== url);
        let cover = currentEvent.coverImage;
        if (cover === url) {
            cover = newImages.length > 0 ? newImages[0] : '';
        }
        setCurrentEvent({ ...currentEvent, images: newImages, coverImage: cover });
    };

    const setCover = (url: string) => {
        setCurrentEvent({ ...currentEvent, coverImage: url });
    };

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

    const saveToDb = async (newEvents: Event[]): Promise<boolean> => {
        return await updateContent('events', 'items', newEvents);
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
                from: new Date(normalizeIsoDateString(ev.startDate)),
                to: new Date(normalizeIsoDateString(ev.endDate))
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
            images: currentEvent.images || [],
            coverImage: currentEvent.coverImage || '',
            videoUrl: currentEvent.videoUrl || '',
            isAnnual: currentEvent.isAnnual || false,
            estimatedSeason: currentEvent.estimatedSeason || '',
            source: currentEvent.source || 'manual',
            sourceId: currentEvent.sourceId,
            location: currentEvent.location || '',
            category: currentEvent.category || '',
            originalDescription: currentEvent.originalDescription || '',
            lastSyncedAt: currentEvent.lastSyncedAt || '',
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

    const formatDateSafely = (dateStr: string, formatPattern: string) => {
        try {
            if (!dateStr) return 'Sin fecha';
            const normalized = normalizeIsoDateString(dateStr);
            const date = new Date(normalized);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return format(date, formatPattern, { locale: es });
        } catch (e) {
            return 'Fecha inválida';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-2xl font-script text-forest">Gestión de Eventos</h3>
                {!isEditing && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleClearSynced}
                            disabled={isSyncing}
                            className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-red-100 transition-colors w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <Trash2 size={14} />
                            LIMPIAR MUNICIPIO
                        </button>
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="bg-forest/10 text-forest border border-forest/20 px-4 py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-forest/20 transition-colors w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                            {isSyncing ? 'SINCRONIZANDO...' : 'SINCRONIZAR EVENTOS'}
                        </button>
                        <button
                            onClick={() => startEdit()}
                            className="bg-sage text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-forest transition-colors w-full sm:w-auto text-center cursor-pointer"
                        >
                            + NUEVO EVENTO
                        </button>
                    </div>
                )}
            </div>

            {isSyncing && (
                <div className="bg-forest/5 border border-forest/10 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-forest">
                        <span className="animate-pulse">{syncStatus}</span>
                        <span>{syncProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200/50 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-sage transition-all duration-300 rounded-full"
                            style={{ width: `${syncProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Ubicación</label>
                                    <input
                                        type="text"
                                        value={currentEvent.location || ''}
                                        onChange={e => setCurrentEvent({ ...currentEvent, location: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-sage"
                                        placeholder="Ej: Sala de Conferencias o Cantares"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Categoría</label>
                                    <input
                                        type="text"
                                        value={currentEvent.category || ''}
                                        onChange={e => setCurrentEvent({ ...currentEvent, category: e.target.value })}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-sage"
                                        placeholder="Ej: Exposiciones, Teatro, Fiesta"
                                    />
                                </div>
                            </div>

                            {currentEvent.source === 'urdinarrain' && (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                                    <p className="text-xs text-blue-800 font-bold flex items-center gap-2">
                                        ℹ️ Evento Sincronizado del Municipio
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        Este evento se sincronizó automáticamente desde el portal oficial. Si modificás el título, las fechas o la descripción aquí, tené en cuenta que podrían sobrescribirse la próxima vez que el municipio actualice su publicación.
                                    </p>
                                    {currentEvent.originalDescription && (
                                        <div className="mt-2 pt-2 border-t border-blue-200">
                                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Descripción Original (Sin IA):</p>
                                            <p className="text-[11px] text-blue-700 italic max-h-24 overflow-y-auto mt-1 whitespace-pre-line bg-white/50 p-2 rounded-lg">
                                                {currentEvent.originalDescription}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Images Section using unified GalleryManager */}
                            <div className="mt-6 border-t border-gray-100 pt-4">
                                <GalleryManager
                                    images={currentEvent.images || []}
                                    onChange={(newImages) => setCurrentEvent(prev => ({ ...prev, images: newImages }))}
                                    coverImage={currentEvent.coverImage}
                                    onCoverChange={(newCover) => setCurrentEvent(prev => ({ ...prev, coverImage: newCover }))}
                                    title="Imágenes del Evento"
                                    description="Carga y reordena fotos para este evento. Marca con estrella la que será la portada."
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
                                    {ev.images && ev.images.length > 0 && (
                                        <span className="bg-sage/10 text-sage px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                                            <ImageIcon size={10} /> {ev.images.length}
                                        </span>
                                    )}
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
                                    {ev.source === 'urdinarrain' && (
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase">
                                            📍 Municipio
                                        </span>
                                    )}
                                    {ev.category && (
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase">
                                            {ev.category}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-500 mt-1">
                                    <p>
                                        {formatDateSafely(ev.startDate, 'dd MMM')} - {formatDateSafely(ev.endDate, 'dd MMM yyyy')}
                                        {ev.estimatedSeason && <span className="ml-2 text-amber-600 text-xs">· Estimado: {ev.estimatedSeason}</span>}
                                    </p>
                                    {ev.location && (
                                        <span className="flex items-center gap-1 text-xs text-forest/70 bg-forest/5 px-2 py-0.5 rounded-md self-start sm:self-auto">
                                            <MapPin size={10} /> {ev.location}
                                        </span>
                                    )}
                                </div>
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








