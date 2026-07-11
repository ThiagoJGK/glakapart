import { GoogleGenAI } from '@google/genai';
import { Event } from '@/types';

// Normalizar strings de fechas ISO malformados (ej: "2026-7-26T00:30+0:00" -> "2026-07-26T00:30+0:00")
export function normalizeIsoDateString(dateStr: string): string {
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
    } catch (e) {
        console.error("Error normalizing date:", dateStr, e);
    }
    return dateStr;
}

// Limpiar etiquetas HTML y decodificar caracteres especiales básicos
export function cleanNewlines(text: string): string {
    if (!text) return '';
    return text
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// Limpiar etiquetas HTML y decodificar caracteres especiales básicos
export function stripHtml(html: string): string {
    if (!html) return '';
    let text = html
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    const cleaned = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&#8211;/g, '–')
        .replace(/&ndash;/g, '–')
        .replace(/&#8212;/g, '—')
        .replace(/&mdash;/g, '—')
        .replace(/&#8216;/g, '‘')
        .replace(/&#8217;/g, '’')
        .replace(/&rsquo;/g, '’')
        .replace(/&#8220;/g, '“')
        .replace(/&ldquo;/g, '“')
        .replace(/&#8221;/g, '”')
        .replace(/&rdquo;/g, '”')
        .replace(/&#038;/g, '&')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    return cleanNewlines(cleaned);
}

const MONTHS: Record<string, string> = {
    enero: '01', febrero: '02', marzo: '03', abril: '04',
    mayo: '05', junio: '06', julio: '07', agosto: '08',
    septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
};

function parseEvoDateText(text: string): { startDate: string; endDate: string } | null {
    let textLower = text.toLowerCase();
    textLower = textLower.replace(/\d{1,2}:\d{2}/g, ''); // Remover horas
    
    const yearMatch = textLower.match(/\b(20\d\d)\b/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
    
    const words = textLower.match(/[a-z]+/g) || [];
    const monthsFound: string[] = [];
    
    for (const word of words) {
        if (MONTHS[word]) monthsFound.push(word);
    }
    
    if (monthsFound.length === 0) {
        Object.keys(MONTHS).forEach(m => {
            if (textLower.includes(m)) monthsFound.push(m);
        });
    }
    
    if (monthsFound.length === 0) return null;
    monthsFound.sort((a,b) => textLower.indexOf(a) - textLower.indexOf(b));
    
    const startMonthName = monthsFound[0];
    const startMonthNum = MONTHS[startMonthName];
    
    const dayMatches = textLower.match(/\b([1-9]|[12]\d|3[01])\b/g) || [];
    const filteredDays = dayMatches.filter(d => d !== year);
    
    if (filteredDays.length === 0) return null;
    
    const startDay = filteredDays[0].padStart(2, '0');
    let endDay = startDay;
    let endMonthNum = startMonthNum;
    
    if (filteredDays.length > 1) {
        endDay = filteredDays[1].padStart(2, '0');
    }
    if (monthsFound.length > 1) {
        endMonthNum = MONTHS[monthsFound[monthsFound.length - 1]];
    }
    
    return {
        startDate: `${year}-${startMonthNum}-${startDay}T00:00:00Z`,
        endDate: `${year}-${endMonthNum}-${endDay}T23:59:59Z`
    };
}

// Fetch individual del HTML de cada evento para extraer startDate y endDate desde el JSON-LD o el DOM
export async function fetchEventDates(eventUrl: string): Promise<{ startDate: string; endDate: string } | null> {
    try {
        const response = await fetch(eventUrl, {
            cache: 'no-store', // Evitar almacenamiento en caché para sincronizaciones
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        if (!response.ok) return null;
        const html = await response.text();

        // 1. Intentar usar Schema.org JSON-LD (Prioridad)
        const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = jsonLdRegex.exec(html)) !== null) {
            try {
                const data = JSON.parse(match[1].trim());
                let eventObj = null;
                if (data['@type'] === 'Event') eventObj = data;
                else if (data['@graph']) eventObj = data['@graph'].find((item: any) => item['@type'] === 'Event');
                else if (Array.isArray(data)) eventObj = data.find((item: any) => item['@type'] === 'Event');

                if (eventObj && eventObj.startDate) {
                    return { 
                        startDate: normalizeIsoDateString(eventObj.startDate), 
                        endDate: normalizeIsoDateString(eventObj.endDate || eventObj.startDate) 
                    };
                }
            } catch (e) {}
        }

        // 2. Fallback: Parsear fecha desde el texto HTML interno (evo_eventcard_time_t)
        const htmlTimeRegex = /<span\s+class=["'][^"']*evo_eventcard_time_t[^"']*["']>([^<]+)<\/span>/i;
        const htmlTimeMatch = html.match(htmlTimeRegex);
        
        if (htmlTimeMatch && htmlTimeMatch[1]) {
            const parsedHTMLDate = parseEvoDateText(htmlTimeMatch[1].trim());
            if (parsedHTMLDate) return parsedHTMLDate;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching event dates from ${eventUrl}:`, error);
        return null;
    }
}

// Auxiliar para descargar una imagen y convertirla a Base64
async function fetchImageAsBase64(url: string): Promise<{ data: string, mimeType: string } | null> {
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
            
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                console.warn(`[Image Fetch] Intento ${attempt} fallido con status ${response.status} para ${url}`);
                if (attempt < maxAttempts) {
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
                return null;
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const mimeType = response.headers.get('content-type') || 'image/jpeg';
            return {
                data: buffer.toString('base64'),
                mimeType
            };
        } catch (error: any) {
            console.warn(`[Image Fetch] Intento ${attempt} fallido por error para ${url}:`, error.message || error);
            if (attempt < maxAttempts) {
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }
        }
    }
    return null;
}

// Llamar a Gemini para reescribir la descripción y adaptarla al tono turístico de Urdinarrain
export async function rewriteDescriptionWithAI(
    title: string, 
    rawDescription: string, 
    apiKey: string, 
    imageUrl?: string,
    onStatus?: (status: string) => void
): Promise<{ description: string, startDate?: string, endDate?: string }> {
    const maxRetries = 2;
    let delayMs = 4000;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const ai = new GoogleGenAI({ apiKey });
            
            const currentYear = new Date().getFullYear();
            const todayStr = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            let systemPrompt = `Sos un redactor publicitario y turístico profesional. Tu tarea es redactar o reescribir la descripción de un evento local para que sea sumamente atractiva, bien redactada, clara y entusiasta para cualquier visitante o turista que esté en Urdinarrain.
- REFERENCIA TEMPORAL: Hoy es ${todayStr} (año ${currentYear}). Utiliza esta referencia para deducir correctamente el año de los eventos (por ejemplo, si el texto del evento o flyer dice "sábado 27 de junio" o "vacaciones de invierno", asume que se refiere a fechas de este año ${currentYear} o del año entrante según corresponda, y nunca a años pasados).
- Mantené un tono cálido, alegre y profesional.
- Estructurá la descripción de manera clara utilizando Markdown (títulos '###' para secciones importantes como horarios o actividades, negritas '**' para destacar datos clave, y un uso amigable y moderado de emojis).
- Asegúrate de limpiar cualquier carácter extraño, enlaces rotos, o textos mal formateados para maximizar la compatibilidad y legibilidad.
- Escribí en español rioplatense (argentino).
- NO hagas menciones obligatorias a "Glak Apart" ni promociones del hospedaje (enfócate en el EVENTO en sí de forma objetiva pero atractiva).
- MUY IMPORTANTE: Asegurate de generar la respuesta completa y concluir el texto correctamente sin dejar oraciones a medias o cortadas. Si la descripción es muy extensa, sintetizala de forma elegante antes de finalizar para asegurar un cierre perfecto.
- EXTRAE LAS FECHAS: Analiza el texto (u opcionalmente la imagen provista) para deducir la fecha de inicio y fin (si existe). Devuelve la respuesta en formato JSON de acuerdo al esquema solicitado.
Si no encuentras una fecha, deja startDate y endDate como null.`;

            const parts: any[] = [];
            let prompt = '';

            if (!rawDescription && imageUrl) {
                systemPrompt += `\n- ¡ATENCIÓN!: La descripción original del evento está vacía. Se te ha proporcionado la imagen/flyer oficial del evento. Debes analizar visualmente la imagen para extraer toda la información relevante (de qué trata el evento, qué actividades se realizarán, horarios, etc.) y redactar una descripción atractiva y completa basándote únicamente en ella. También debes deducir las fechas de inicio y fin a partir de los textos contenidos en la imagen y el contexto del año corriente (2026).`;
                prompt = `Título del evento: ${title}\n\nAnaliza la imagen adjunta y redacta una descripción atractiva en Markdown, además de extraer las fechas de inicio y fin:`;
                
                const imageBase64 = await fetchImageAsBase64(imageUrl);
                if (imageBase64) {
                    parts.push({
                        inlineData: {
                            data: imageBase64.data,
                            mimeType: imageBase64.mimeType
                        }
                    });
                } else {
                    prompt = `Título del evento: ${title}\n\nLa descripción original está vacía y no pudimos cargar la imagen del flyer. Redacta una invitación general y entusiasta para este evento a realizarse en Urdinarrain, animando a los visitantes a estar atentos a los canales oficiales del municipio para más detalles, y deja las fechas de inicio y fin como null si no se pueden inferir del título.`;
                }
            } else {
                prompt = `Título del evento: ${title}\n\nDescripción original:\n${rawDescription}\n\nPor favor, reescribila siguiendo las reglas anteriores devolviendo el formato solicitado:`;
            }

            parts.push({ text: prompt });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts }],
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "object",
                        properties: {
                            description: {
                                type: "string",
                                description: "Descripción redactada o reescrita del evento estructurada con Markdown."
                            },
                            startDate: {
                                type: "string",
                                description: "Fecha de inicio del evento (formato YYYY-MM-DD), o null/vacío si no se puede determinar."
                            },
                            endDate: {
                                type: "string",
                                description: "Fecha de fin del evento (formato YYYY-MM-DD), o null/vacío si no se puede determinar."
                            }
                        },
                        required: ["description"]
                    }
                }
            });

            const text = response.text?.trim();
            if (!text) {
                throw new Error("La respuesta de Gemini está vacía");
            }
            
            const parsed = JSON.parse(text);
            const finalDesc = cleanNewlines(parsed.description || rawDescription);
            
            if (!finalDesc && !rawDescription) {
                throw new Error("No se pudo extraer ninguna descripción de la imagen");
            }

            return {
                description: finalDesc,
                startDate: parsed.startDate || undefined,
                endDate: parsed.endDate || undefined
            };
        } catch (error: any) {
            const isRateLimit = error.status === 429 || 
                                (error.message && error.message.includes('429')) || 
                                (error.message && error.message.includes('quota'));
                                
            if (isRateLimit && attempt < maxRetries) {
                let waitTimeMs = 30000; // Por defecto 30 segundos
                const match = error.message && error.message.match(/Please retry in (\d+(\.\d+)?)/i);
                if (match) {
                    waitTimeMs = Math.ceil(parseFloat(match[1]) * 1000) + 1500; // 1.5 segundos extra de margen
                }
                const waitSecs = Math.round(waitTimeMs / 1000);
                onStatus?.(`Límite de cuota alcanzado. Esperando ${waitSecs}s para reintentar...`);
                console.warn(`[Gemini API] Límite de cuota alcanzado para "${title}". Esperando ${waitTimeMs}ms antes de reintentar (intento ${attempt + 1}/${maxRetries})...`);
                await new Promise(r => setTimeout(r, waitTimeMs));
                continue;
            }
            console.error('Error in rewriteDescriptionWithAI:', error);
            throw error; // Lanzar el error para que lo gestione parseWPEvent
        }
    }
    throw new Error(`Excedido el número máximo de reintentos para reescribir "${title}"`);
}

// Mapear un evento de la REST API de WP a la estructura de Event
export async function parseWPEvent(wpEvent: any, apiKey: string, onStatus?: (status: string) => void): Promise<Event | null> {
    try {
        const cleanTitle = stripHtml(wpEvent.title.rendered).replace(/\s*\|\s*/g, ' | ');
        const rawDescription = stripHtml(wpEvent.content.rendered);
        
        // 1. Extraer imagen destacada primero para poder usarla en la IA si la descripción está vacía
        let imageUrl = undefined;
        if (wpEvent._embedded && wpEvent._embedded['wp:featuredmedia'] && wpEvent._embedded['wp:featuredmedia'][0]) {
            imageUrl = wpEvent._embedded['wp:featuredmedia'][0].source_url;
        }

        // 2. Obtener descripción pulida con IA (e intentar extraer fechas desde la descripción/flyer)
        let aiResult;
        let isFallback = false;
        try {
            aiResult = await rewriteDescriptionWithAI(cleanTitle, rawDescription, apiKey, imageUrl, onStatus);
        } catch (aiError: any) {
            // Plan de Contingencia: Si es un evento visual y falla Gemini, activamos el generador de respaldo
            if (!rawDescription && imageUrl) {
                isFallback = true;
                onStatus?.(`⚠️ Usando descripción de respaldo para "${cleanTitle}" (Gemini Vision falló)`);
                console.warn(`[Vision Fallback] Falló Gemini Vision para "${cleanTitle}". Usando generador de respaldo. Motivo:`, aiError.message || aiError);
                aiResult = {
                    description: '',
                    startDate: undefined,
                    endDate: undefined
                };
            } else {
                throw aiError; // Si es texto, relanzamos para que use la contingencia batch
            }
        }

        let dates = null;
        if (aiResult.startDate) {
            dates = {
                startDate: `${normalizeIsoDateString(aiResult.startDate)}T00:00:00Z`,
                endDate: aiResult.endDate ? `${normalizeIsoDateString(aiResult.endDate)}T23:59:59Z` : `${normalizeIsoDateString(aiResult.startDate)}T23:59:59Z`
            };
        } else {
            // 3. Caso contrario: extraer fechas raspando la página web del evento
            dates = await fetchEventDates(wpEvent.link);
        }

        if (!dates) {
            console.warn(`No se pudieron obtener las fechas para el evento "${cleanTitle}". Se omitirá.`);
            return null;
        }

        // 4. Extraer categoría de wp:term
        let category = undefined;
        if (wpEvent._embedded && wpEvent._embedded['wp:term'] && wpEvent._embedded['wp:term'][1]) {
            const terms = wpEvent._embedded['wp:term'][1];
            if (Array.isArray(terms) && terms.length > 0) {
                category = terms[0].name?.toUpperCase();
            }
        }

        // 5. Inferir ubicación del listado de clases de CSS
        let location = 'Urdinarrain, Entre Ríos';
        if (wpEvent.class_list && Array.isArray(wpEvent.class_list)) {
            const locClass = wpEvent.class_list.find((c: string) => c.startsWith('event_location-'));
            if (locClass) {
                location = locClass
                    .replace('event_location-', '')
                    .split('-')
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
        }

        let aiDescription = aiResult.description;
        if (isFallback) {
            aiDescription = generateFallbackDescription(cleanTitle, location, category, dates.startDate);
        }

        return {
            id: `sync-urdinarrain-${wpEvent.id}`,
            title: cleanTitle,
            startDate: normalizeIsoDateString(dates.startDate),
            endDate: normalizeIsoDateString(dates.endDate),
            description: aiDescription,
            image: imageUrl,
            source: 'urdinarrain',
            sourceId: wpEvent.id,
            location: location,
            category: category,
            originalDescription: rawDescription,
            lastSyncedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error parsing WP Event ID ${wpEvent?.id}:`, error);
        return null;
    }
}

// Determinar de forma inteligente si el evento posee interés turístico o cultural
export function isTouristOrCulturalEvent(wpEvent: any): boolean {
    try {
        const title = (wpEvent.title?.rendered || '').toLowerCase();
        const content = (wpEvent.content?.rendered || '').toLowerCase();

        // 1. Palabras clave administrativas o internas a descartar automáticamente
        const administrativeKeywords = [
            'licitacion', 'asamblea', 'consorcio', 'vencimiento', 'impuestos', 
            'tasas', 'boleta', 'concejo deliberante', 'sesion del concejo', 
            'comunicado oficial', 'convocatoria ordinaria', 'prórroga', 'vencen',
            'pago anual', 'vence', 'tasa general', 'mobiliario', 'moratoria', 'contribuyentes'
        ];

        for (const kw of administrativeKeywords) {
            if (title.includes(kw) || (title.length < 60 && content.includes(kw))) {
                console.log(`🚫 Filtrado por contenido administrativo: "${wpEvent.title?.rendered}"`);
                return false;
            }
        }

        // 2. Palabras clave de interés puramente local o para residentes a descartar automaticamente
        const localResidentKeywords = [
            'carreras', 'oferta academica', 'oferta académica', 'estudiante', 
            'inscripcion', 'inscripción', 'inscripciones', 'ciclo lectivo', 'vacunacion', 'vacunación', 
            'castracion', 'castración', 'antirrabica', 'antirrábica', 'quirófano', 'quirofano',
            'campaña de salud', 'capacitacion', 'capacitación', 'charla informativa', 
            'curso de', 'taller de empleo', 'bolsa de trabajo', 'taller municipal', 
            'talleres municipales', 'clases de', 'donacion de sangre', 'donación de sangre',
            'colecta', 'rifa', 'sorteo'
        ];

        for (const kw of localResidentKeywords) {
            if (title.includes(kw) || content.includes(kw)) {
                console.log(`🚫 Filtrado por interés puramente local/residente: "${wpEvent.title?.rendered}"`);
                return false;
            }
        }

        // 2. Comprobar tags o categorías asignadas por el WordPress
        let categories: string[] = [];
        if (wpEvent._embedded && wpEvent._embedded['wp:term'] && wpEvent._embedded['wp:term'][1]) {
            const terms = wpEvent._embedded['wp:term'][1];
            if (Array.isArray(terms)) {
                categories = terms.map((t: any) => (t.name || '').toLowerCase());
            }
        }

        const touristCategories = [
            'exposiciones', 'teatro', 'cultura', 'fiesta', 'musica', 'turismo', 
            'show', 'deportes', 'feria', 'gastronomia', 'artesania', 'cine', 
            'danza', 'concierto', 'charla', 'taller', 'paseo', 'recreacion'
        ];

        for (const cat of categories) {
            if (touristCategories.some(tc => cat.includes(tc))) {
                return true;
            }
        }

        // 3. Palabras clave de interés turístico, recreativo o cultural
        const interestKeywords = [
            'teatro', 'muestra', 'exposicion', 'museo', 'musica', 'concierto', 
            'recital', 'festival', 'fiesta', 'feria', 'taller', 'charla', 
            'cine', 'danza', 'carrera', 'turismo', 'visita', 'guiada', 
            'peña', 'degustacion', 'artesano', 'show', 'espectaculo', 'cantar', 
            'vacaciones', 'infantil', 'gastronomia', 'maraton', 'deportivo', 'torneo',
            'evento', 'celebracion', 'aniversario', 'banda', 'coro', 'titeres', 'juegos'
        ];

        for (const kw of interestKeywords) {
            if (title.includes(kw) || content.includes(kw)) {
                return true;
            }
        }

        // Si no coincide con ninguna categoría ni palabra clave de interés, se filtra para mantener la agenda limpia
        console.log(`⏭️ Evento filtrado (sin interés turístico evidente): "${wpEvent.title?.rendered}"`);
        return false;
    } catch (e) {
        // En caso de error, dejamos pasar el evento preventivamente
        return true;
    }
}

export interface BatchInputEvent {
    id: string;
    title: string;
    rawDescription: string;
}

export interface BatchOutputEvent {
    id: string;
    description: string;
    startDate?: string | null;
    endDate?: string | null;
}

// Procesar múltiples eventos de texto en una sola llamada a Gemini
export async function rewriteEventsBatchWithAI(
    eventsList: BatchInputEvent[],
    apiKey: string,
    onStatus?: (status: string) => void
): Promise<BatchOutputEvent[]> {
    if (eventsList.length === 0) return [];
    
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const ai = new GoogleGenAI({ apiKey });
            
            const systemPrompt = `Sos un redactor publicitario y turístico profesional. Tu tarea es procesar un lote (batch) de eventos locales y reescribir la descripción de cada uno para que sea sumamente atractiva, bien redactada, clara y entusiasta para cualquier visitante o turista que esté en Urdinarrain.
Reglas para cada evento:
- Mantené un tono cálido, alegre y profesional.
- Estructurá la descripción de manera clara utilizando Markdown (títulos '###' para secciones importantes como horarios o actividades, negritas '**' para destacar datos clave, y un uso amigable y moderado de emojis).
- Asegúrate de limpiar cualquier carácter extraño, enlaces rotos, o textos mal formateados para maximizar la compatibilidad y legibilidad.
- Escribí en español rioplatense (argentino).
- NO hagas menciones obligatorias a "Glak Apart" ni promociones del hospedaje (enfócate en el EVENTO en sí de forma objetiva pero atractiva).
- EXTRAE LAS FECHAS: Analiza el texto para deducir la fecha de inicio y fin (si existe). Devuelve la respuesta en formato de objeto con startDate y endDate (en formato YYYY-MM-DD), o null/vacío si no se puede determinar.
Devuelve los resultados en el arreglo correspondiente respetando el ID de cada evento.`;

            const prompt = `Procesa el siguiente listado de eventos en formato JSON. Devuelve el resultado en formato JSON array con la estructura solicitada:\n\n${JSON.stringify(eventsList, null, 2)}`;

            onStatus?.(`Procesando lote de ${eventsList.length} eventos con Gemini...`);
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.7,
                    maxOutputTokens: 2500,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id: {
                                    type: "string",
                                    description: "ID del evento recibido en la entrada."
                                },
                                description: {
                                    type: "string",
                                    description: "Descripción reescrita en Markdown en español rioplatense."
                                },
                                startDate: {
                                    type: "string",
                                    description: "Fecha de inicio (YYYY-MM-DD) o null si no se puede inferir."
                                },
                                endDate: {
                                    type: "string",
                                    description: "Fecha de fin (YYYY-MM-DD) o null si no se puede inferir."
                                }
                            },
                            required: ["id", "description"]
                        }
                    }
                }
            });

            const text = response.text?.trim();
            if (text) {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed)) {
                    return parsed as BatchOutputEvent[];
                }
            }
            throw new Error("La respuesta de Gemini no es un arreglo válido");
        } catch (error: any) {
            const isRateLimit = error.status === 429 || (error.message && error.message.includes('429')) || (error.message && error.message.includes('Quota exceeded'));
            if (isRateLimit && attempt < maxRetries) {
                let waitTimeMs = 30000;
                const match = error.message && error.message.match(/Please retry in (\d+(\.\d+)?)/i);
                if (match) {
                    waitTimeMs = Math.ceil(parseFloat(match[1]) * 1000) + 1500;
                }
                const waitSecs = Math.round(waitTimeMs / 1000);
                onStatus?.(`Límite de cuota alcanzado. Esperando ${waitSecs}s para reintentar lote...`);
                console.warn(`[Gemini API] Límite de cuota para lote. Esperando ${waitTimeMs}ms...`);
                await new Promise(r => setTimeout(r, waitTimeMs));
                continue;
            }
            console.error('Error in rewriteEventsBatchWithAI:', error);
            throw error;
        }
    }
    throw new Error("Superado el número de reintentos en lote");
}

// Procesar múltiples eventos de texto en una sola llamada a la API de Groq Cloud
export async function rewriteEventsBatchWithGroq(
    eventsList: BatchInputEvent[],
    apiKey: string,
    onStatus?: (status: string) => void
): Promise<BatchOutputEvent[]> {
    if (eventsList.length === 0) return [];
    
    const maxRetries = 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            onStatus?.(`Procesando lote de ${eventsList.length} eventos con Groq (Llama 3.1)...`);
            
            const currentYear = new Date().getFullYear();
            const todayStr = new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            const systemPrompt = `Sos un redactor publicitario y turístico profesional. Tu tarea es procesar un lote (batch) de eventos locales y reescribir la descripción de cada uno para que sea sumamente atractiva, bien redactada, clara y entusiasta para cualquier visitante o turista que esté en Urdinarrain.
Reglas para cada evento:
- REFERENCIA TEMPORAL: Hoy es ${todayStr} (año ${currentYear}). Utiliza esta referencia para deducir correctamente el año de los eventos (por ejemplo, si el texto del evento dice "sábado 27 de junio" o "vacaciones de invierno", asume que se refiere a fechas de este año ${currentYear} o del año entrante según corresponda, y nunca a años pasados).
- Mantené un tono cálido, alegre y profesional.
- Estructurá la descripción de manera clara utilizando Markdown (títulos '###' para secciones importantes como horarios o actividades, negritas '**' para destacar datos clave, y un uso amigable y moderado de emojis).
- Asegúrate de limpiar cualquier carácter extraño, enlaces rotos, o textos mal formateados para maximizar la compatibilidad y legibilidad.
- Escribí en español rioplatense (argentino).
- NO hagas menciones obligatorias a "Glak Apart" ni promociones del hospedaje (enfócate en el EVENTO en sí de forma objetiva pero atractiva).
- EXTRAE LAS FECHAS: Analiza el texto para deducir la fecha de inicio y fin (si existe).

Debes responder ÚNICAMENTE con un objeto JSON que tenga una propiedad "events" la cual contenga un array de objetos con el siguiente esquema exacto:
{
  "events": [
    {
      "id": "ID del evento recibido en la entrada",
      "description": "Descripción reescrita en Markdown en español rioplatense",
      "startDate": "Fecha de inicio (YYYY-MM-DD) o null si no se puede inferir",
      "endDate": "Fecha de fin (YYYY-MM-DD) o null si no se puede inferir"
    }
  ]
}`;

            const prompt = `Procesa el siguiente listado de eventos en formato JSON. Devuelve el resultado en el formato JSON solicitado:\n\n${JSON.stringify(eventsList, null, 2)}`;

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Groq API respondió con error ${response.status}: ${errText}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content?.trim();
            if (content) {
                const parsed = JSON.parse(content);
                if (parsed && Array.isArray(parsed.events)) {
                    return parsed.events as BatchOutputEvent[];
                }
            }
            throw new Error("La respuesta de Groq no contiene la estructura de eventos requerida");
        } catch (error: any) {
            const isRateLimit = error.status === 429 || (error.message && error.message.includes('429')) || (error.message && error.message.includes('Quota exceeded'));
            if (isRateLimit && attempt < maxRetries) {
                const waitTimeMs = 5000;
                onStatus?.(`Límite de velocidad en Groq. Esperando 5s para reintentar...`);
                console.warn(`[Groq API] Rate limit hit. Waiting 5s...`);
                await new Promise(r => setTimeout(r, waitTimeMs));
                continue;
            }
            console.error('Error in rewriteEventsBatchWithGroq:', error);
            throw error;
        }
    }
    throw new Error("Superado el número de reintentos en Groq");
}

// Generar una descripción básica de respaldo atractiva basada en metadatos del evento
export function generateFallbackDescription(title: string, location: string, category?: string, startDate?: string): string {
    const categoryText = category ? ` de categoría **${category.toLowerCase()}**` : '';
    const locationText = location ? ` en **${location}**` : ' en Urdinarrain';
    
    let dateText = '';
    if (startDate) {
        try {
            const dateStr = startDate.split('T')[0];
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                const date = new Date(year, month, day);
                const formatted = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
                dateText = ` el próximo **${formatted}**`;
            }
        } catch (e) {}
    }
    
    return `¡Te invitamos a disfrutar de **${title}**! Una excelente propuesta local${categoryText} que se llevará a cabo${locationText}${dateText}.\n\nNo te pierdas esta oportunidad de sumarte a las actividades y eventos de Urdinarrain. ¡Te esperamos!`;
}
