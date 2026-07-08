import { NextResponse } from 'next/server';
import { parseWPEvent, isTouristOrCulturalEvent } from '@/services/eventSync';
import { Event } from '@/types';

// Helper para pausar la ejecución y dar un respiro a las cuotas de la API de Gemini
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET(req: Request) {
    // Usamos GET para Server-Sent Events, lo cual facilita la suscripción desde EventSource en el navegador
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Missing GEMINI_API_KEY in server environment" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    // Permitir al cliente enviar sus eventos actuales como query params o procesar solo los nuevos.
    // Para simplificar, el cliente enviará el string de IDs que ya tiene en localStorage/state para verificar cuáles son nuevos.
    const existingIdsParam = searchParams.get('existingIds') || '';
    const existingIds = existingIdsParam ? existingIdsParam.split(',') : [];

    const responseStream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            const sendEvent = (event: string, data: any) => {
                controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
            };

            try {
                sendEvent('progress', { message: 'Conectando con el portal del municipio...', progress: 10 });

                // 1. Obtener eventos de Urdinarrain (limitamos a 15 para traer más opciones y poder filtrar)
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

                const wpEvents = await response.json();
                if (!Array.isArray(wpEvents)) {
                    sendEvent('error', { message: 'Respuesta inválida de la API del municipio' });
                    controller.close();
                    return;
                }

                sendEvent('progress', { message: `Se encontraron ${wpEvents.length} eventos en el municipio. Analizando interés...`, progress: 20 });

                const processedEvents: Event[] = [];
                let currentItem = 0;

                for (const wpEvent of wpEvents) {
                    currentItem++;
                    const wpId = wpEvent.id;
                    const cleanTitle = wpEvent.title.rendered.replace(/<[^>]+>/g, '').trim();
                    const percent = Math.min(20 + Math.round((currentItem / wpEvents.length) * 70), 90);

                    // --- PASO PREVIO: Filtrar únicamente interés turístico/cultural ---
                    if (!isTouristOrCulturalEvent(wpEvent)) {
                        sendEvent('progress', { 
                            message: `[${currentItem}/${wpEvents.length}] Ignorando "${cleanTitle}" (sin interés turístico/cultural)`, 
                            progress: percent 
                        });
                        await delay(150); // Pausa estética breve
                        continue;
                    }

                    // Verificar si ya existe este evento
                    const exists = existingIds.includes(`sync-urdinarrain-${wpId}`);

                    if (exists) {
                        sendEvent('progress', { 
                            message: `[${currentItem}/${wpEvents.length}] Omitiendo "${cleanTitle}" (ya existe localmente)`, 
                            progress: percent 
                        });
                        // Agregamos un objeto mínimo para indicar que se conserva
                        processedEvents.push({
                            id: `sync-urdinarrain-${wpId}`,
                            title: cleanTitle,
                            startDate: '',
                            endDate: '',
                            description: '',
                            source: 'urdinarrain',
                            sourceId: wpId,
                            // Este campo especial le indicará al frontend que no debe reescribir ni tocar este evento
                            _keepExisting: true 
                        } as any);
                        await delay(100); // Pequeña pausa estética
                    } else {
                        sendEvent('progress', { 
                            message: `[${currentItem}/${wpEvents.length}] Analizando y reescribiendo "${cleanTitle}"...`, 
                            progress: percent 
                        });

                        const parsed = await parseWPEvent(wpEvent, apiKey);
                        if (parsed) {
                            processedEvents.push(parsed);
                        }
                        
                        // Retardo de 1.5 segundos para evitar límite de cuota (429) en Gemini gratis
                        await delay(1500); 
                    }
                }

                sendEvent('progress', { message: 'Procesamiento finalizado. Guardando cambios...', progress: 95 });
                await delay(500);

                // Enviar la lista de eventos procesados lista para ser guardada en el cliente
                sendEvent('complete', { 
                    events: processedEvents, 
                    summary: {
                        totalFetched: wpEvents.length,
                        processed: processedEvents.filter(e => !(e as any)._keepExisting).length,
                        skipped: processedEvents.filter(e => (e as any)._keepExisting).length
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
