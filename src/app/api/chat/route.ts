import { getContent } from "@/services/content";
import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';

const IDENTITY_PROMPT = `
**Tu Identidad:**
Eres "Glak Bot", el asistente virtual más buena onda, divertido y servicial de Glak Apart en Urdinarrain, Entre Ríos, Argentina.
Los dueños y anfitriones del establecimiento son Gladys y Adrián. Ellos son quienes recibirán a los huéspedes y les brindarán la mejor atención. Tu rol es recopilar los datos iniciales de los huéspedes para poder pasárselos a Gladys y Adrián.
Tu personalidad es fresca, súper agradable y siempre estás dispuesto a ayudar con una "sonrisa virtual".
Usá emojis de forma natural, cálida y sin exagerar (ej: ☀️, 🧉, 🌿, ✨, 🏡).
Te comunicás de manera cercana y relajada, tratándolos de "vos", como si estuvieras recibiendo a amigos en tu propia casa, pero manteniendo siempre la eficacia de un asesor de ventas de primer nivel.
Respondé siempre en español rioplatense (argentino).

**Reglas de Comunicación:**
- Sé conversacional, amable y natural. 
- Podés extenderte un poco más si te piden información sobre el lugar o actividades (turismo), pero mantené la lectura ágil usando viñetas o saltos de línea.
- Usá saltos de línea para separar ideas.
- Nunca inventes información que no esté en tu contexto. Si no sabés algo, decí que vas a consultar con Gladys y Adrián.
- No menciones que sos una IA ni un bot. Actuá como un asistente de recepción real de Gladys y Adrián.

**Misión de Captación de Datos (Insistencia y Regla de Oro):**
Tu objetivo principal como asesor de ventas es conseguir los datos de la reserva para que Gladys y Adrián puedan cotizarles y confirmarles disponibilidad.
Cuando un cliente muestra interés en alojarse, SIEMPRE debes preguntar y conseguir:
1. ¿Cuál es su nombre? (Si aún no se presentó, preguntáselo amablemente)
2. ¿Entre qué fechas les gustaría ingresar y salir?
3. ¿Cuántos adultos (y menores, si los hay) van a ser?

**REGLA DE INSISTENCIA:**
Debes ser amablemente insistente. Si el usuario te hace preguntas paralelas o esquiva tus preguntas, responde de forma breve y simpática, y de inmediato volvé a pedirle los datos que faltan de la reserva (su nombre, fechas o cantidad de personas).
Deciles algo como: "Pasame esta información así te comunico con Gladys y Adrián, quienes amablemente responderán tu consulta de disponibilidad y tarifas para dejar todo listo. 😊" o "Para poder comunicarte con Gladys y Adrián (que son los anfitriones y quienes te van a confirmar disponibilidad y tarifas), necesito que me dejes tu nombre, las fechas y cantidad de personas, por fa. ¿Me las compartís? 🧉✨". No desvíes la conversación sin insistir por estos datos.

**Flujo de Reserva:**
Cuando el usuario ya te proporcionó los TRES datos (nombre, fechas Y cantidad de personas), debes:
1. Confirmar amigablemente en una sola frase que ya tenés toda la información (resumiendo brevemente nombre, fechas y personas).
2. Incluir EXACTAMENTE este marcador especial en tu respuesta (no lo modifiques): [BOOKING_READY:nombre=NOMBRE_QUE_DIJO|fechas=FECHAS_QUE_DIJO|personas=CANTIDAD_QUE_DIJO]
   Ejemplo: [BOOKING_READY:nombre=Juan Pérez|fechas=15 al 18 de marzo|personas=2 adultos y 1 menor]
3. Invitar al usuario a hacer clic en el botón que aparecerá abajo para enviar la consulta por WhatsApp y contactar directamente a Gladys y Adrián.
IMPORTANTE: Sé directo y breve en este paso. No repitas la confirmación ni el resumen de datos múltiples veces en el mismo mensaje.

IMPORTANTE: Solo incluí el marcador [BOOKING_READY:...] cuando tengas los TRES datos confirmados (nombre, fechas Y personas). Nunca lo incluyas si falta alguno de ellos. Jamás inventes corchetes, ni campos de datos como "Nombre: [PREGUNTAR]" o "BOOKING_READY: [PREGUNTAR]". Si no tienes los tres datos, NO pongas ningún marcador ni intentes rellenar plantillas, simplemente sigue charlando amigablemente.
`;

// Simple in-memory rate limiting (1-hour window)
const ipCache: Record<string, { count: number; resetTime: number }> = {};
const LIMIT_PER_HOUR = 30;

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = ipCache[ip];
    if (!entry) {
        ipCache[ip] = { count: 1, resetTime: now + 3600000 };
        return false;
    }
    
    if (now > entry.resetTime) {
        ipCache[ip] = { count: 1, resetTime: now + 3600000 };
        return false;
    }
    
    entry.count += 1;
    return entry.count > LIMIT_PER_HOUR;
}

// Utility function to enforce a timeout on promises
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage = "Request timeout"): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs))
    ]);
}

export async function POST(req: Request) {
    try {
        const { messages, previousInteractionId } = await req.json();

        // 1. IP Rate Limiting check
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                   req.headers.get('x-real-ip') || 
                   'unknown-ip';

        if (ip !== 'unknown-ip' && isRateLimited(ip)) {
            return NextResponse.json(
                { error: "RATE_LIMIT", message: "Demasiadas consultas. Por favor, intentá de nuevo en una hora o escribinos por WhatsApp. 📲" },
                { status: 429 }
            );
        }

        // 2. Fetch chatbot config
        const chatbotConfig = await getContent('chatbot');
        if (!chatbotConfig || !chatbotConfig.enabled) {
            return NextResponse.json({ error: "Chatbot is disabled" }, { status: 403 });
        }

        // 3. Fetch active events from Firebase
        const eventsData = await getContent('events');
        const eventsList = Array.isArray(eventsData) ? eventsData : (eventsData?.items || []);
        
        // Filter events that are current or future
        const todayStr = new Date().toISOString().split('T')[0];
        const upcomingEvents = eventsList.filter((ev: any) => {
            const dateToCompare = ev.endDate || ev.startDate || todayStr;
            return dateToCompare >= todayStr;
        });

        // Format events list for LLM context
        let eventsPrompt = "";
        if (upcomingEvents.length > 0) {
            eventsPrompt = "\n\n**Eventos vigentes/próximos en Urdinarrain:**\nSi el usuario te pregunta qué hacer, qué eventos hay o sobre la agenda local, podés recomendarles estos eventos. Si mencionás o recomendás alguno de estos eventos, debés incluir su imagen al final de la descripción usando la sintaxis de imagen markdown standard: `![foto](URL)`. Reemplaza la palabra 'URL' con la dirección web real de la imagen que figura abajo. No inventes campos de datos como 'Nombre:' o corchetes como '[PREGUNTAR]' en tu respuesta. Simplemente habla con naturalidad y coloca la imagen.\n";
            upcomingEvents.forEach((ev: any) => {
                const imgUrl = ev.coverImage || ev.image || (ev.images && ev.images.length > 0 ? ev.images[0] : '');
                eventsPrompt += `- **Título**: ${ev.title}\n`;
                eventsPrompt += `  - **Fechas**: Del ${ev.startDate.split('T')[0]} al ${ev.endDate.split('T')[0]}\n`;
                eventsPrompt += `  - **Ubicación**: ${ev.location || 'No especificada'}\n`;
                eventsPrompt += `  - **Descripción**: ${ev.description}\n`;
                if (imgUrl) {
                    eventsPrompt += `  - **Imagen**: ${imgUrl}\n`;
                }
                eventsPrompt += `\n`;
            });
        }

        // Combine system instruction: IDENTITY + date + custom prompt + active events
        const today = new Date();
        const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const todayStrFormatted = `${dayNames[today.getDay()]} ${today.getDate()} de ${monthNames[today.getMonth()]} de ${today.getFullYear()}`;
        const datePrompt = `\n\n**Fecha de Hoy:** Hoy es ${todayStrFormatted}.\n`;

        const userContext = chatbotConfig.systemPrompt || '';
        const systemInstruction = IDENTITY_PROMPT + 
            datePrompt +
            (userContext ? `\n\n**Información del Establecimiento (proporcionada por el dueño):**\n${userContext}` : '') +
            eventsPrompt;

        let responseText = "";
        let success = false;
        let activeProvider = "none";
        let activeModel = "none";

        // Limit conversation history to the last 10 messages (5 user-assistant turns)
        // to reduce latency, context cost, and avoid model confusion.
        const trimmedMessages = messages.slice(-10);

        // Enhance instructions specifically for Llama models (NVIDIA, Groq, OpenRouter)
        // as 8B open-source models require stricter instructions for state detection.
        // We inject Few-Shot examples to guarantee format adherence and prevent redundancy.
        const llamaSystemInstruction = systemInstruction + `
\n**INSTRUCCIÓN CRÍTICA DE FORMATO PARA LLAMA:**
- Si en el historial de chat el usuario ya mencionó su NOMBRE, las FECHAS del viaje y la CANTIDAD de huéspedes, debés resumirlos amigablemente y escribir EXACTAMENTE la etiqueta: [BOOKING_READY:nombre=NOMBRE|fechas=FECHAS|personas=PERSONAS].
- Si falta alguno de estos datos, NO inventes la etiqueta ni uses marcadores de posición, simplemente seguí charlando de forma simpática e insistí amablemente por el dato que falta.
- Sé conciso, natural y usá siempre el español de Argentina ("vos"). No repitas preguntas que ya fueron respondidas.

**EJEMPLOS DE COMPORTAMIENTO ESPERADO:**
- *Caso A (Faltan datos):*
  Usuario: "Hola, soy Juan. Quisiera reservar para el fin de semana."
  Asistente: "¡Hola Juan! Qué alegría. 🧉 ¿Para qué fechas exactas te gustaría reservar y para cuántas personas serías, che? Así te confirmo disponibilidad." (NO agregues ninguna etiqueta BOOKING_READY aquí)

- *Caso B (Datos completos):*
  Usuario: "Sería del 12 al 15 de diciembre, y venimos 2 adultos." (Conociendo ya que su nombre es Marcos)
  Asistente: "¡Buenísimo, Marcos! Anotado: del 12 al 15 de diciembre para 2 personas. Ya agendé tus datos para pasárselos a Gladys y Adrián. ¡Te esperamos! 😊 [BOOKING_READY:nombre=Marcos|fechas=12 al 15 de diciembre|personas=2 adultos]"
`;

        // ==========================================
        // LEVEL 1: Gemini API with Key Rotation
        // ==========================================
        const geminiKeys = [
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3
        ].filter(Boolean) as string[];

        const geminiContents = trimmedMessages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        for (let i = 0; i < geminiKeys.length; i++) {
            const apiKey = geminiKeys[i];
            try {
                const ai = new GoogleGenAI({ apiKey });
                
                // Enforce an agile 3.5-second timeout for the Gemini request.
                // If it lags, we want to jump quickly to the next key or fallback to keep UI snappy.
                const response = await withTimeout(
                    ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: geminiContents,
                        config: {
                            systemInstruction: systemInstruction,
                            temperature: 0.9,
                            maxOutputTokens: 1200,
                        }
                    }),
                    3500,
                    "Gemini API request timed out"
                );

                if (response.text) {
                    responseText = response.text;
                    activeProvider = `gemini-key-${i + 1}`;
                    activeModel = 'gemini-2.5-flash';
                    success = true;
                    break;
                }
            } catch (err: any) {
                console.warn(`Gemini key ${i + 1} failed, trying next key. Error:`, err?.message || err);
            }
        }

        // ==========================================
        // LEVEL 2: NVIDIA NIM API (OpenAI Compatible)
        // ==========================================
        if (!success && process.env.NVIDIA_API_KEY) {
            console.log("Gemini keys failed/timed out. Attempting NVIDIA fallback...");
            try {
                const nvidiaMessages = [
                    { role: 'system', content: llamaSystemInstruction },
                    ...trimmedMessages.map((m: any) => ({
                        role: m.role === 'assistant' ? 'assistant' : 'user',
                        content: m.content
                    }))
                ];

                // 4-second timeout for NVIDIA NIM API
                const nvidiaRes = await withTimeout(
                    fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${process.env.NVIDIA_API_KEY}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            model: "meta/llama-3.1-8b-instruct",
                            messages: nvidiaMessages,
                            temperature: 0.2, // Lower temperature to 0.2 for Llama to maximize format precision
                            max_tokens: 1000
                        })
                    }),
                    4000,
                    "NVIDIA API request timed out"
                );

                if (nvidiaRes.ok) {
                    const nvidiaData = await nvidiaRes.json();
                    const choice = nvidiaData.choices?.[0];
                    if (choice?.message?.content) {
                        responseText = choice.message.content;
                        activeProvider = "nvidia";
                        activeModel = "meta/llama-3.1-8b-instruct";
                        success = true;
                    }
                } else {
                    console.error("NVIDIA API failed with status:", nvidiaRes.status);
                }
            } catch (err: any) {
                console.error("Error invoking NVIDIA fallback:", err?.message || err);
            }
        }

        // ==========================================
        // LEVEL 3: Groq API
        // ==========================================
        if (!success && process.env.GROQ_API_KEY) {
            console.log("Gemini and NVIDIA failed/timed out. Attempting Groq fallback...");
            try {
                const groqMessages = [
                    { role: 'system', content: llamaSystemInstruction },
                    ...trimmedMessages.map((m: any) => ({
                        role: m.role === 'assistant' ? 'assistant' : 'user',
                        content: m.content
                    }))
                ];

                // 4-second timeout for Groq API
                const groqRes = await withTimeout(
                    fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            model: "llama-3.1-8b-instant",
                            messages: groqMessages,
                            temperature: 0.7,
                            max_completion_tokens: 1000
                        })
                    }),
                    4000,
                    "Groq API request timed out"
                );

                if (groqRes.ok) {
                    const groqData = await groqRes.json();
                    const choice = groqData.choices?.[0];
                    if (choice?.message?.content) {
                        responseText = choice.message.content;
                        activeProvider = "groq";
                        activeModel = "llama-3.1-8b-instant";
                        success = true;
                    }
                } else {
                    console.error("Groq fallback failed with status:", groqRes.status);
                }
            } catch (groqErr: any) {
                console.error("Error invoking Groq fallback:", groqErr?.message || groqErr);
            }
        }

        // ==========================================
        // LEVEL 4: OpenRouter Free API (OpenAI Compatible)
        // ==========================================
        if (!success && process.env.OPENROUTER_API_KEY) {
            console.log("Gemini, NVIDIA, and Groq failed. Attempting OpenRouter free fallback...");
            try {
                const openRouterMessages = [
                    { role: 'system', content: llamaSystemInstruction },
                    ...trimmedMessages.map((m: any) => ({
                        role: m.role === 'assistant' ? 'assistant' : 'user',
                        content: m.content
                    }))
                ];

                // 4-second timeout for OpenRouter
                const openRouterRes = await withTimeout(
                    fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                            "Content-Type": "application/json",
                            "HTTP-Referer": "https://glakapart.com",
                            "X-Title": "Glak Bot Resilient Chat"
                        },
                        body: JSON.stringify({
                            model: "meta-llama/llama-3.3-70b-instruct:free",
                            messages: openRouterMessages,
                            temperature: 0.7,
                            max_tokens: 1000
                        })
                    }),
                    4000,
                    "OpenRouter API request timed out"
                );

                if (openRouterRes.ok) {
                    const openRouterData = await openRouterRes.json();
                    const choice = openRouterData.choices?.[0];
                    if (choice?.message?.content) {
                        responseText = choice.message.content;
                        activeProvider = "openrouter";
                        activeModel = "meta-llama/llama-3.3-70b-instruct:free";
                        success = true;
                    }
                } else {
                    console.error("OpenRouter API failed with status:", openRouterRes.status);
                }
            } catch (err: any) {
                console.error("Error invoking OpenRouter fallback:", err?.message || err);
            }
        }

        // ==========================================
        // LEVEL 5: Static Contingency Fallback
        // ==========================================
        if (!success) {
            console.error("All AI providers failed. Returning friendly error message directly.");
            return NextResponse.json({
                response: "⏳ ¡Uy! Parece que mis sistemas están un poco saturados en este momento. Por favor, intentá de nuevo en unos instantes o escribinos directo por WhatsApp para que Gladys y Adrián te ayuden de inmediato. 📲",
                interactionId: previousInteractionId || "interaction-id",
                provider: "static-fallback",
                model: "none"
            });
        }

        return NextResponse.json({
            response: responseText,
            interactionId: previousInteractionId || "interaction-id",
            provider: activeProvider,
            model: activeModel
        });

    } catch (error: any) {
        console.error("Error in chat API:", error?.message || error);
        return NextResponse.json({ error: "Failed to generate response", details: error?.message || 'Unknown error' }, { status: 500 });
    }
}

