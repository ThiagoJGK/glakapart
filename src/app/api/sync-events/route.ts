import { NextResponse } from 'next/server';
import { 
    parseWPEvent, 
    isTouristOrCulturalEvent, 
    rewriteEventsBatchWithAI, 
    rewriteEventsBatchWithGroq,
    fetchEventDates, 
    normalizeIsoDateString,
    stripHtml
} from '@/services/eventSync';
import { Event } from '@/types';

// Helper para pausar la ejecución
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(req: Request) {
    const apiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Missing GEMINI_API_KEY in server environment" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const existingIdsParam = searchParams.get('existingIds') || '';
    const existingIds = existingIdsParam ? existingIdsParam.split(',') : [];
    const force = searchParams.get('force') === 'true';
    const targetIdsParam = searchParams.get('targetIds') || '';
    const targetIds = targetIdsParam ? targetIdsParam.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : [];

    const responseStream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            const sendEvent = (event: string, data: any) => {
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            };

            try {
                sendEvent('progress', { message: 'Conectando con el portal del municipio...', progress: 10 });

                // 1. Obtener eventos de Urdinarrain
                const wpUrl = 'https://urdinarrain.tur.ar/wp-json/wp/v2/ajde_events?_embed&per_page=15';
                const response = await fetch(wpUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (!response.ok) {
                    sendEvent('error', { message: `La API del municipio respondió con error: ${response.status}` });
                    controller.close();
                    return;
                }

                let wpEvents = await response.json();
                if (!Array.isArray(wpEvents)) {
                    sendEvent('error', { message: 'Respuesta inválida de la API del municipio' });
                    controller.close();
                    return;
                }

                // Filtrar solo los eventos especificados si se provee targetIds
                if (targetIds.length > 0) {
                    wpEvents = wpEvents.filter(ev => targetIds.includes(ev.id));
                }

                // 2. Filtrar únicamente eventos de interés turístico/cultural
                const candidateEvents = wpEvents.filter((wpEvent: any) => isTouristOrCulturalEvent(wpEvent));
                sendEvent('progress', { message: `Se encontraron ${candidateEvents.length} eventos de interés. Filtrando ya existentes...`, progress: 20 });

                const eventsToProcess: any[] = [];
                const skippedEvents: Event[] = [];

                for (const wpEvent of candidateEvents) {
                    const wpId = wpEvent.id;
                    const exists = !force && existingIds.includes(`sync-urdinarrain-${wpId}`);
                    const cleanTitle = stripHtml(wpEvent.title.rendered);

                    if (exists) {
                        skippedEvents.push({
                            id: `sync-urdinarrain-${wpId}`,
                            title: cleanTitle,
                            startDate: '',
                            endDate: '',
                            description: '',
                            source: 'urdinarrain',
                            sourceId: wpId,
                            _keepExisting: true
                        } as any);
                    } else {
                        eventsToProcess.push(wpEvent);
                    }
                }

                // 3. Dividir eventos en dos canales: Texto (lote único) y Visión (multimodal individual)
                const textEvents: any[] = [];
                const visionEvents: any[] = [];

                for (const wpEvent of eventsToProcess) {
                    const rawDescription = wpEvent.content.rendered.replace(/<[^>]+>/g, '').trim();
                    const hasFeaturedMedia = wpEvent._embedded && wpEvent._embedded['wp:featuredmedia'] && wpEvent._embedded['wp:featuredmedia'][0];
                    
                    if (!rawDescription && hasFeaturedMedia) {
                        visionEvents.push(wpEvent);
                    } else {
                        textEvents.push(wpEvent);
                    }
                }

                // --- CANAL 1: Procesar lote único de eventos de texto con contingencia ---
                async function processTextEventsBatch(
                    list: any[],
                    key: string,
                    useGroq: boolean,
                    sendStatus: (msg: string) => void
                ): Promise<{ parsed: Event[], failed: { title: string, error: string, sourceId: number }[] }> {
                    if (list.length === 0) return { parsed: [], failed: [] };

                    try {
                        const batchInputs = list.map(ev => ({
                            id: String(ev.id),
                            title: stripHtml(ev.title.rendered),
                            rawDescription: ev.content.rendered.replace(/<[^>]+>/g, '').trim()
                        }));

                        // Intentar procesar todo el lote junto usando Groq o Gemini
                        let batchResults = [];
                        if (useGroq) {
                            batchResults = await rewriteEventsBatchWithGroq(batchInputs, key, sendStatus);
                        } else {
                            batchResults = await rewriteEventsBatchWithAI(batchInputs, key, sendStatus);
                        }
                        const parsedEvents: Event[] = [];

                        for (const ev of list) {
                            const res = batchResults.find(r => r.id === String(ev.id));
                            if (res) {
                                // Obtener fechas exactas prioritarias
                                let dates = null;
                                if (res.startDate) {
                                    dates = {
                                        startDate: `${res.startDate}T00:00:00Z`,
                                        endDate: res.endDate ? `${res.endDate}T23:59:59Z` : `${res.startDate}T23:59:59Z`
                                    };
                                } else {
                                    dates = await fetchEventDates(ev.link);
                                }

                                if (!dates) {
                                    console.warn(`[Batch] Omitiendo "${ev.title.rendered}" por falta de fechas.`);
                                    continue;
                                }

                                // Extraer categoría de wp:term
                                let category = undefined;
                                if (ev._embedded && ev._embedded['wp:term'] && ev._embedded['wp:term'][1]) {
                                    const terms = ev._embedded['wp:term'][1];
                                    if (Array.isArray(terms) && terms.length > 0) {
                                        category = terms[0].name?.toUpperCase();
                                    }
                                }

                                // Inferir ubicación de las clases
                                let location = 'Urdinarrain, Entre Ríos';
                                if (ev.class_list && Array.isArray(ev.class_list)) {
                                    const locClass = ev.class_list.find((c: string) => c.startsWith('event_location-'));
                                    if (locClass) {
                                        location = locClass
                                            .replace('event_location-', '')
                                            .split('-')
                                            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(' ');
                                    }
                                }

                                let imageUrl = undefined;
                                if (ev._embedded && ev._embedded['wp:featuredmedia'] && ev._embedded['wp:featuredmedia'][0]) {
                                    imageUrl = ev._embedded['wp:featuredmedia'][0].source_url;
                                }

                                parsedEvents.push({
                                    id: `sync-urdinarrain-${ev.id}`,
                                    title: stripHtml(ev.title.rendered),
                                    startDate: normalizeIsoDateString(dates.startDate),
                                    endDate: normalizeIsoDateString(dates.endDate),
                                    description: res.description,
                                    image: imageUrl,
                                    source: 'urdinarrain',
                                    sourceId: ev.id,
                                    location: location,
                                    category: category,
                                    originalDescription: ev.content.rendered.replace(/<[^>]+>/g, '').trim(),
                                    lastSyncedAt: new Date().toISOString()
                                });
                            }
                        }

                        return { parsed: parsedEvents, failed: [] };
                    } catch (err: any) {
                        console.warn(`[Contingencia] Falló el lote de tamaño ${list.length}. Subdividiendo...`, err.message || err);

                        if (list.length === 1) {
                            return {
                                parsed: [],
                                failed: [{
                                    title: stripHtml(list[0].title.rendered),
                                    error: err.message || 'Error en Gemini',
                                    sourceId: list[0].id
                                }]
                            };
                        }

                        // Dividir en 2 mitades
                        const mid = Math.floor(list.length / 2);
                        const left = list.slice(0, mid);
                        const right = list.slice(mid);

                        sendStatus(`Reintentando lote dividido: procesando sub-lote A (${left.length} eventos)...`);
                        await delay(2000);
                        const resLeft = await processTextEventsBatch(left, key, useGroq, sendStatus);

                        sendStatus(`Reintentando lote dividido: procesando sub-lote B (${right.length} eventos)...`);
                        await delay(2000);
                        const resRight = await processTextEventsBatch(right, key, useGroq, sendStatus);

                        return {
                            parsed: [...resLeft.parsed, ...resRight.parsed],
                            failed: [...resLeft.failed, ...resRight.failed]
                        };
                    }
                }

                // Ejecutar lote de texto
                let processedTextResults = { parsed: [] as Event[], failed: [] as { title: string, error: string, sourceId: number }[] };
                if (textEvents.length > 0) {
                    sendEvent('progress', { 
                        message: `Procesando lote único de texto con IA (${textEvents.length} eventos)...`, 
                        progress: 30 
                    });
                    
                    const textApiKey = groqApiKey || apiKey;
                    const useGroq = !!groqApiKey;

                    processedTextResults = await processTextEventsBatch(textEvents, textApiKey, useGroq, (statusMsg: string) => {
                        sendEvent('progress', { message: statusMsg, progress: 40 });
                    });
                }

                // --- CANAL 2: Procesar eventos visuales (multimodales) individualmente ---
                const parsedVisionEvents: Event[] = [];
                const failedVisionEvents: { title: string, error: string, sourceId: number }[] = [];

                for (const ev of visionEvents) {
                    const cleanTitle = stripHtml(ev.title.rendered);
                    sendEvent('progress', {
                        message: `Analizando flyer del evento "${cleanTitle}" con visión artificial...`,
                        progress: 60 + Math.round((parsedVisionEvents.length / Math.max(1, visionEvents.length)) * 25)
                    });

                    try {
                        const parsed = await parseWPEvent(ev, apiKey, (msg) => {
                            sendEvent('progress', { message: msg, progress: 75 });
                        });
                        if (parsed) {
                            parsedVisionEvents.push(parsed);
                        } else {
                            failedVisionEvents.push({
                                title: cleanTitle,
                                error: 'No se pudieron extraer fechas ni descripción de la imagen',
                                sourceId: ev.id
                            });
                        }
                    } catch (e: any) {
                        console.error(`Error processing vision event ${cleanTitle}:`, e);
                        failedVisionEvents.push({
                            title: cleanTitle,
                            error: e.message || 'Error en análisis de imagen',
                            sourceId: ev.id
                        });
                    }

                    // Pausa de 4.5 segundos para no agotar la cuota de la API gratuita
                    await delay(4500);
                }

                // --- CONSOLIDAR Y ENVIAR RESUMEN FINAL ---
                const finalParsedList = [...processedTextResults.parsed, ...parsedVisionEvents];
                const finalFailedList = [...processedTextResults.failed, ...failedVisionEvents];

                const updatedTitles = finalParsedList.map(e => e.title);
                const failedReport = finalFailedList.map(f => ({ 
                     title: f.title, 
                     reason: f.error,
                     sourceId: (f as any).sourceId
                }));
                const skippedTitles = skippedEvents.map(e => e.title);

                const allProcessed = [...finalParsedList, ...skippedEvents];

                sendEvent('progress', { message: 'Sincronización finalizada. Guardando cambios...', progress: 95 });
                await delay(500);

                sendEvent('complete', {
                    events: allProcessed,
                    summary: {
                        updated: updatedTitles,
                        failed: failedReport,
                        skipped: skippedTitles
                    }
                });

            } catch (error: any) {
                console.error("Error in sync-events SSE stream:", error);
                sendEvent('error', { message: error.message || 'Error desconocido' });
            } finally {
                controller.close();
            }
        }
    });

    return new Response(responseStream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive'
        }
    });
}
