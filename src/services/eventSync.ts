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
        .replace(/&#8217;/g, "'")
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

// Llamar a Gemini para reescribir la descripción y adaptarla al tono turístico de Urdinarrain
export async function rewriteDescriptionWithAI(title: string, rawDescription: string, apiKey: string): Promise<{ description: string, startDate?: string, endDate?: string }> {
    try {
        const ai = new GoogleGenAI({ apiKey });
        
        const systemPrompt = `Sos un redactor publicitario y turístico profesional. Tu tarea es reescribir la descripción de un evento local para que sea sumamente atractiva, bien redactada, clara y entusiasta para cualquier visitante o turista que esté en Urdinarrain.
- Mantené un tono cálido, alegre y profesional.
- Estructurá la descripción de manera clara (usa hasta 3 párrafos como máximo).
- NO utilices múltiples saltos de línea innecesarios. Usa solo un salto de línea simple para separar párrafos. No agregues espacios en blanco excesivos.
- No inventes información que no esté en el texto original.
- Si el texto original está en mayúsculas sostenidas o tiene emojis excesivos de redes sociales, límpialos para dar una presentación impecable.
- Escribí en español rioplatense (argentino).
- NO hagas menciones obligatorias a "Glak Apart" ni promociones del hospedaje (enfócate en el EVENTO en sí de forma objetiva pero atractiva).
- MUY IMPORTANTE: Asegurate de generar la respuesta completa y concluir el texto correctamente sin dejar oraciones a medias o cortadas. Si la descripción es muy extensa, sintetizala de forma elegante antes de finalizar para asegurar un cierre perfecto.
- EXTRAE LAS FECHAS: Analiza el texto para deducir la fecha de inicio y fin (si existe). Devuelve la respuesta ESTRICTAMENTE en este formato JSON:
{
  "description": "Tu texto reescrito aquí...",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}
Si no encuentras una fecha, deja startDate y endDate como null.`;

        const prompt = `Título del evento: ${title}\n\nDescripción original:\n${rawDescription}\n\nPor favor, reescribila siguiendo las reglas anteriores devolviendo el JSON solicitado:`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
                maxOutputTokens: 1000,
                responseMimeType: "application/json"
            }
        });

        const text = response.text?.trim();
        if (text) {
            const parsed = JSON.parse(text);
            return {
                description: cleanNewlines(parsed.description || rawDescription),
                startDate: parsed.startDate,
                endDate: parsed.endDate
            };
        }
        return { description: cleanNewlines(rawDescription) };
    } catch (error) {
        console.error('Error in rewriteDescriptionWithAI:', error);
        return { description: cleanNewlines(rawDescription) }; // Fallback a la original limpia si falla la IA
    }
}

// Mapear un evento de la REST API de WP a la estructura de Event
export async function parseWPEvent(wpEvent: any, apiKey: string): Promise<Event | null> {
    try {
        const cleanTitle = stripHtml(wpEvent.title.rendered).replace(/\s*\|\s*/g, ' | ');
        const rawDescription = stripHtml(wpEvent.content.rendered);
        
        // 1. Obtener fechas exactas desde la página individual
        let dates = await fetchEventDates(wpEvent.link);

        // 2. Obtener descripción pulida con IA (y fechas como fallback)
        const aiResult = await rewriteDescriptionWithAI(cleanTitle, rawDescription, apiKey);

        // Usar las fechas de la IA si la página no las tenía
        if (!dates && aiResult.startDate) {
            dates = {
                startDate: `${normalizeIsoDateString(aiResult.startDate)}T00:00:00Z`,
                endDate: aiResult.endDate ? `${normalizeIsoDateString(aiResult.endDate)}T23:59:59Z` : `${normalizeIsoDateString(aiResult.startDate)}T23:59:59Z`
            };
        }

        if (!dates) {
            console.warn(`No se pudieron obtener las fechas para el evento "${cleanTitle}". Se omitirá.`);
            return null;
        }

        const aiDescription = aiResult.description;

        // 3. Extraer imagen destacada
        let imageUrl = undefined;
        if (wpEvent._embedded && wpEvent._embedded['wp:featuredmedia'] && wpEvent._embedded['wp:featuredmedia'][0]) {
            imageUrl = wpEvent._embedded['wp:featuredmedia'][0].source_url;
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
