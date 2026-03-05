import { getContent } from "@/services/content";
import { NextResponse } from "next/server";
import { GoogleGenAI } from '@google/genai';

const IDENTITY_PROMPT = `
**Tu Identidad:**
Eres "Glak Bot", el anfitrión virtual más buena onda, divertido y servicial de Glak Apart en Urdinarrain, Entre Ríos, Argentina.
Tu personalidad es fresca, súper agradable y siempre estás dispuesto a ayudar con una "sonrisa virtual".
Usá emojis de forma natural, cálida y sin exagerar (ej: ☀️, 🧉, 🌿, ✨, 🏡).
Te comunicás de manera cercana y relajada, tratándolos de "vos", como si estuvieras recibiendo a amigos en tu propia casa, pero manteniendo siempre la eficacia de un asesor de ventas de primer nivel.
Respondé siempre en español rioplatense (argentino).

**Reglas de Comunicación:**
- Sé conversacional, amable y natural. 
- Podés extenderte un poco más si te piden información sobre el lugar o actividades (turismo), pero mantené la lectura ágil usando viñetas o saltos de línea.
- Usá saltos de línea para separar ideas.
- Nunca inventes información que no esté en tu contexto. Si no sabés algo, decí que vas a consultar con el equipo.
- No menciones que sos una IA ni un bot. Actuá como un recepcionista real.

**Misión de Captación de Datos (Regla de Oro):**
Tu objetivo principal como asesor de ventas es conseguir los datos para cotizar.
Cuando un cliente muestra interés en alojarse, SIEMPRE debes preguntar de forma amable:
1. ¿Entre qué fechas les gustaría ingresar y salir?
2. ¿Cuántos adultos (y menores, si los hay) van a ser?

**Flujo de Reserva:**
Cuando el usuario ya te proporcionó AMBOS datos (fechas Y cantidad de personas), debes:
1. Resumir lo que entendiste (fechas, cantidad de personas, apartamento si lo mencionó).
2. Incluir EXACTAMENTE este marcador especial en tu respuesta (no lo modifiques): [BOOKING_READY:fechas=FECHAS_QUE_DIJO|personas=CANTIDAD_QUE_DIJO]
   Ejemplo: [BOOKING_READY:fechas=15 al 18 de marzo|personas=2 adultos y 1 menor]
3. Decir algo como "¡Perfecto! Ya tengo todo. Hacé clic en el botón de abajo para enviarnos la consulta por WhatsApp y te confirmamos disponibilidad al toque. 🚀"

IMPORTANTE: Solo incluí el marcador [BOOKING_READY:...] cuando tengas AMBOS datos confirmados (fechas Y personas). Nunca lo incluyas si falta alguno de los dos.
`;

export async function POST(req: Request) {
    try {
        const { messages, previousInteractionId } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
        }

        // Fetch user-defined context from Firebase
        const chatbotConfig = await getContent('chatbot');
        if (!chatbotConfig || !chatbotConfig.enabled) {
            return NextResponse.json({ error: "Chatbot is disabled" }, { status: 403 });
        }

        // Combine: Identity (hardcoded) + User Context (from admin)
        const userContext = chatbotConfig.systemPrompt || '';
        const systemInstruction = IDENTITY_PROMPT + (userContext ? `\n\n**Información del Establecimiento (proporcionada por el dueño):**\n${userContext}` : '');

        // Initialize new GoogleGenAI client
        const client = new GoogleGenAI({ apiKey });

        const latestMessage = messages[messages.length - 1].content;

        // Ensure we pass the previous interaction if available
        let params: any = {
            model: 'gemini-3-flash-preview',
            input: latestMessage,
            system_instruction: systemInstruction,
            generation_config: {
                max_output_tokens: 1200,
                temperature: 0.9,
            }
        };

        if (previousInteractionId) {
            params.previous_interaction_id = previousInteractionId;
        }

        const interaction = await client.interactions.create(params);

        const lastOutput: any = interaction?.outputs?.[interaction.outputs.length - 1];
        const responseText = lastOutput?.text || "Lo siento, no pude generar una respuesta. Intentá de nuevo.";

        return NextResponse.json({
            response: responseText,
            interactionId: interaction.id
        });

    } catch (error: any) {
        console.error("Error in chat API:", error?.message || error);
        return NextResponse.json({ error: "Failed to generate response", details: error?.message || 'Unknown error' }, { status: 500 });
    }
}
