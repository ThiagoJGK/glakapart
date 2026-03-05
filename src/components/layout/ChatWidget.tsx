'use client';
import React, { useState, useEffect, useRef } from 'react';
import { getContent } from '@/services/content';
import { MessageCircle, X, Send, Bot, Phone } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const WHATSAPP_NUMBER = '5491169675050';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

// Parse [BOOKING_READY:fechas=...|personas=...] from bot message
function parseBookingData(text: string): { fechas: string; personas: string } | null {
    const match = text.match(/\[BOOKING_READY:fechas=([^|]+)\|personas=([^\]]+)\]/);
    if (match) {
        return { fechas: match[1].trim(), personas: match[2].trim() };
    }
    return null;
}

// Remove the marker from displayed text
function cleanMessage(text: string): string {
    return text.replace(/\[BOOKING_READY:[^\]]+\]/g, '').trim();
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: '¡Hola! Bienvenido a Glak Apart. 🧉✨ ¿En qué te puedo ayudar hoy? ¿Estás pensando en venir a relajarte a Urdinarrain?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [interactionId, setInteractionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getContent('chatbot').then(data => {
            if (data && data.enabled) {
                setIsEnabled(true);
            }
        });

        const handleUpdate = () => {
            getContent('chatbot').then(data => {
                setIsEnabled(data?.enabled || false);
            });
        };
        window.addEventListener('GLAK_CONTENT_UPDATE', handleUpdate);
        return () => window.removeEventListener('GLAK_CONTENT_UPDATE', handleUpdate);
    }, []);

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleWhatsAppClick = (fechas: string, personas: string) => {
        const msg = `¡Hola! Estuve charlando con Glak Bot y me gustaría consultar disponibilidad:\n\n* Fechas: ${fechas}\n* Personas: ${personas}\n\n¿Pueden confirmarme disponibilidad y tarifa? ¡Gracias!`;
        const encoded = encodeURIComponent(msg);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: inputValue.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const currentMessages = [...messages, userMsg].map(m => ({
                role: m.role,
                content: m.content
            }));

            const payload: any = { messages: currentMessages };
            if (interactionId) {
                payload.previousInteractionId = interactionId;
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429) {
                throw new Error('RATE_LIMIT');
            }
            if (!response.ok) {
                throw new Error('NETWORK_ERROR');
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            if (data.interactionId) {
                setInteractionId(data.interactionId);
            }

        } catch (error: any) {
            console.error('Chat error:', error);
            if (error.message === 'RATE_LIMIT') {
                setMessages(prev => [...prev, { role: 'assistant', content: '⏳ ¡Uy! Me están escribiendo muchas personas a la vez. Por favor, dame 1 minuto y volvé a preguntarme, o escribinos directo por WhatsApp. 📲' }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: 'Ups, parece que tuve un problema de conexión. Intentá de nuevo o escribinos directo por WhatsApp. 📲' }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isEnabled) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-[370px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] rounded-2xl shadow-2xl border border-gray-100 mb-4 flex flex-col overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-[#10595a] text-white p-4 flex justify-between items-center shadow-md z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wider">Glak Bot</h3>
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                    <p className="text-[10px] text-white/80 uppercase tracking-wider">En línea</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 bg-zinc-50 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-thin">
                        {messages.map((msg, idx) => {
                            const bookingData = msg.role === 'assistant' ? parseBookingData(msg.content) : null;
                            const displayContent = msg.role === 'assistant' ? cleanMessage(msg.content) : msg.content;

                            return (
                                <div key={idx}>
                                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                        <div
                                            className={`
                                                max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                                                ${msg.role === 'user'
                                                    ? 'bg-[#10595a] text-white rounded-br-none'
                                                    : 'bg-white border border-gray-100 text-gray-700 shadow-sm rounded-bl-none'
                                                }
                                            `}
                                        >
                                            <ReactMarkdown components={{
                                                p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                                a: ({ node, ...props }) => (
                                                    <a {...props} target="_blank" rel="noopener noreferrer"
                                                        className={msg.role === 'user' ? 'text-green-300 underline' : 'text-[#10595a] font-bold underline'}
                                                    />
                                                )
                                            }}>
                                                {displayContent}
                                            </ReactMarkdown>
                                        </div>
                                    </div>

                                    {/* WhatsApp Booking Button */}
                                    {bookingData && (
                                        <div className="flex justify-start mt-3 animate-fade-in-up">
                                            <button
                                                onClick={() => handleWhatsAppClick(bookingData.fechas, bookingData.personas)}
                                                className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-2xl rounded-bl-none shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all group"
                                            >
                                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                                    <Phone size={16} className="fill-current" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-xs font-bold tracking-wider">SOLICITAR RESERVA</span>
                                                    <span className="block text-[10px] text-green-100 tracking-wide">Continuar por WhatsApp →</span>
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 text-gray-500 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1.5 items-center">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Escribí tu mensaje..."
                                disabled={isLoading}
                                className="flex-1 bg-gray-100 border-transparent rounded-full px-4 py-2.5 text-sm focus:bg-white focus:border-[#10595a] focus:ring-2 focus:ring-[#10595a]/20 transition-all outline-none disabled:opacity-50 text-gray-700"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="bg-[#10595a] text-white p-2.5 rounded-full hover:bg-[#0c4445] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
                            >
                                <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105
                    ${isOpen ? 'bg-white text-gray-800 border border-gray-100 rotate-90 scale-90' : 'bg-[#10595a] text-white hover:bg-[#0c4445]'}
                `}
                aria-label="Abrir chat"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
