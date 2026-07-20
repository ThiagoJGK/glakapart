'use client';
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getContent } from '@/services/content';
import { MessageCircle, X, Send, Bot, Phone } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { trackEvent } from '@/services/analytics';

const WHATSAPP_NUMBER = '5491169675050';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

// Parse [BOOKING_READY:nombre=...|fechas=...|personas=...] from bot message
function parseBookingData(text: string): { nombre: string; fechas: string; personas: string } | null {
    const match = text.match(/\[BOOKING_READY:nombre=([^|]+)\|fechas=([^|]+)\|personas=([^\]]+)\]/);
    if (match) {
        return { nombre: match[1].trim(), fechas: match[2].trim(), personas: match[3].trim() };
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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleMenuToggle = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail) {
                setIsMobileMenuOpen(!!detail.open);
            }
        };
        window.addEventListener('GLAK_MOBILE_MENU_TOGGLE', handleMenuToggle);
        return () => {
            window.removeEventListener('GLAK_MOBILE_MENU_TOGGLE', handleMenuToggle);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('chat-open');
        } else {
            document.body.classList.remove('chat-open');
        }
        return () => {
            document.body.classList.remove('chat-open');
        };
    }, [isOpen]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFooterVisible(entry.isIntersecting);
            },
            { root: null, threshold: 0.1 }
        );

        const footer = document.querySelector('footer');
        if (footer) observer.observe(footer);

        return () => {
            if (footer) observer.unobserve(footer);
        };
    }, []);

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
        if (!isOpen) return;

        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessageRef.current && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const element = lastMessageRef.current;
            
            setTimeout(() => {
                container.scrollTo({
                    top: element.offsetTop - 12,
                    behavior: 'smooth'
                });
            }, 100);
        } else {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            setTimeout(() => {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }, 50);
        }
    };

    const handleWhatsAppClick = (nombre: string, fechas: string, personas: string) => {
        // Track final whatsapp click from chatbot context
        trackEvent('chatbot_whatsapp_click');
        const msg = `¡Hola! Estuve charlando con Glak Bot. Mi nombre es ${nombre} y me gustaría consultar disponibilidad para las fechas del ${fechas} para ${personas}. ¿Me confirman disponibilidad y tarifa? ¡Gracias!`;
        const encoded = encodeURIComponent(msg);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsgContent = inputValue.trim();
        const userMsg: Message = { role: 'user', content: userMsgContent };
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
            
            // 1. Track chatbot response metadata (success, provider, model)
            trackEvent('chatbot_response', {
                provider: data.provider || 'unknown',
                model: data.model || 'unknown',
                success: data.provider !== 'static-fallback'
            });

            // 2. Track event inquiries based on keywords or response content
            const textLower = data.response.toLowerCase();
            const userTextLower = userMsgContent.toLowerCase();
            const askedForEvents = userTextLower.includes("evento") || 
                                   userTextLower.includes("actividad") || 
                                   userTextLower.includes("hacer") || 
                                   userTextLower.includes("agenda") || 
                                   userTextLower.includes("fiesta") || 
                                   textLower.includes("evento vigentes") || 
                                   textLower.includes("evento en urdinarrain");
            if (askedForEvents) {
                trackEvent('chatbot_event_inquiry');
            }

            // 3. Track if reservation was completed (booking ready)
            if (data.response.includes('[BOOKING_READY:')) {
                trackEvent('chatbot_booking_ready');
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            if (data.interactionId) {
                setInteractionId(data.interactionId);
            }

        } catch (error: any) {
            console.error('Chat error:', error);
            if (error.message === 'RATE_LIMIT') {
                trackEvent('chatbot_response', { provider: 'rate-limit', model: 'none', success: false });
                setMessages(prev => [...prev, { role: 'assistant', content: '⏳ ¡Uy! Me están escribiendo muchas personas a la vez. Por favor, dame 1 minuto y volvé a preguntarme, o escribinos directo por WhatsApp. 📲' }]);
            } else {
                trackEvent('chatbot_response', { provider: 'network-error', model: 'none', success: false });
                setMessages(prev => [...prev, { role: 'assistant', content: 'Ups, parece que tuve un problema de conexión. Intentá de nuevo o escribinos directo por WhatsApp. 📲' }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isAdminPage = pathname?.startsWith('/admin');
    if (!isEnabled || isAdminPage || isMobileMenuOpen) return null;

    return (
        <>
            {/* Mobile backdrop blur overlay - fixed full viewport */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[48] bg-black/15 backdrop-blur-[4px] md:hidden pointer-events-auto transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}
            
            <div 
                id="chat-widget" 
                className={`fixed bottom-6 right-6 z-[49] flex flex-col items-end transition-all duration-500 ${
                    isFooterVisible ? 'translate-y-24 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
                }`}
            >
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
                        <div className="flex items-center gap-1">
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('¡Hola! Quisiera hacer una consulta directa por WhatsApp.')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Contacto directo por WhatsApp"
                                onClick={() => trackEvent('chatbot_direct_whatsapp_click')}
                                className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs"
                            >
                                <Phone size={16} className="fill-current text-green-300" />
                            </a>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                                aria-label="Cerrar chat"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div 
                        ref={scrollContainerRef} 
                        className="flex-1 bg-zinc-50 p-4 overflow-y-auto flex flex-col gap-3 scrollbar-thin"
                    >
                        {/* Bot Purpose Explanation & Direct WhatsApp Action Card */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-3.5 shadow-sm text-xs space-y-2.5">
                            <div className="flex items-center gap-2 text-[#10595a] font-semibold">
                                <Bot size={16} className="text-[#10595a] shrink-0" />
                                <span>¿Para qué sirve Glak Bot?</span>
                            </div>
                            <p className="text-gray-600 text-[11px] leading-relaxed">
                                Puedo ayudarte con:
                            </p>
                            <ul className="text-[11px] text-gray-700 space-y-1 pl-1 font-medium">
                                <li className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10595a]"></span>
                                    Información turística y eventos en Urdinarrain
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10595a]"></span>
                                    Tomar reservas y consultar disponibilidad
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10595a]"></span>
                                    Reglas y servicios del establecimiento
                                </li>
                            </ul>
                            <div className="pt-2 border-t border-emerald-200/60">
                                <p className="text-[10px] text-gray-500 mb-1.5 font-medium">¿Preferís no chatear con el bot?</p>
                                <a
                                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('¡Hola! Quisiera hacer una consulta directa por WhatsApp.')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackEvent('chatbot_direct_whatsapp_click')}
                                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold py-2 px-3 rounded-xl shadow-sm hover:shadow transition-all group"
                                >
                                    <Phone size={14} className="fill-current" />
                                    <span>Contacto directo por WhatsApp</span>
                                </a>
                            </div>
                        </div>
                        {messages.map((msg, idx) => {
                            const bookingData = msg.role === 'assistant' ? parseBookingData(msg.content) : null;
                            const displayContent = msg.role === 'assistant' ? cleanMessage(msg.content) : msg.content;
                            const isLast = idx === messages.length - 1;

                            return (
                                <div key={idx} ref={isLast ? lastMessageRef : null}>
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
                                                ),
                                                img: ({ node, ...props }) => (
                                                    <img 
                                                        {...props} 
                                                        className="rounded-xl max-w-full h-auto mt-2 mb-1 shadow-md border border-gray-200 hover:scale-[1.02] transition-transform duration-200 object-cover" 
                                                        alt={props.alt || 'Imagen del evento'}
                                                        loading="lazy"
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
                                                onClick={() => handleWhatsAppClick(bookingData.nombre, bookingData.fechas, bookingData.personas)}
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
                    w-14 h-14 rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.28)] flex items-center justify-center transition-all duration-300 hover:scale-105 will-change-transform
                    ${isOpen 
                        ? 'bg-white text-gray-800 border border-gray-100 rotate-90 scale-90' 
                        : 'bg-[#10595a]/80 backdrop-blur-md border border-white/20 md:bg-[#10595a] md:backdrop-blur-none md:border-0 text-white md:hover:bg-[#0c4445]'
                    }
                `}
                aria-label="Abrir chat"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
            </button>
            </div>
        </>
    );
};

export default ChatWidget;
