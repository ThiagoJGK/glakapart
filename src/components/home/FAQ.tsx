'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { getContent } from '@/services/content';
import { useAdmin } from '@/context/AdminContext';
import EditModal from '../admin/EditModal';
import { updateContent } from '@/services/content';
import { FAQItem } from '@/types';
import { trackEvent } from '@/services/analytics';

// Fallback FAQs when Firebase has no data
const DEFAULT_FAQS: FAQItem[] = [
    {
        id: 'default-1', order: 0,
        question: '¿Dónde queda Glak Apart?',
        answer: 'Glak Apart se encuentra en Salta 435, Urdinarrain, Entre Ríos, Argentina (CP 2812). Estamos en el corazón del campo entrerriano, a pocos minutos del centro de Urdinarrain.',
    },
    {
        id: 'default-2', order: 1,
        question: '¿Qué apartamentos tiene Glak Apart?',
        answer: 'Contamos con 3 apartamentos: Nacarado (3-4 personas, ideal familias), Arrebol (4-5 personas, amplio con vista al parque) y Arje (2 personas, exclusivo para parejas frente a la piscina). Todos equipados con cocina, aire acondicionado, WiFi y Smart TV.',
    },
    {
        id: 'default-3', order: 2,
        question: '¿Glak Apart tiene pileta?',
        answer: 'Sí, Glak Apart cuenta con piscina al aire libre rodeada de espacios verdes. El apartamento Arje tiene acceso directo frente a la piscina.',
    },
    {
        id: 'default-4', order: 3,
        question: '¿Cuál es el horario de check-in y check-out?',
        answer: 'El check-in es a las 14:00 hs y el check-out a las 10:00 hs. Consultá por opciones de early check-in o late check-out por WhatsApp.',
    },
    {
        id: 'default-5', order: 4,
        question: '¿Cómo reservo en Glak Apart?',
        answer: 'Podés reservar directamente por WhatsApp al +54 9 11 6967-5050 o enviarnos un email a hola@glakapart.com.ar. Consultá disponibilidad y tarifas sin compromiso.',
    },
    {
        id: 'default-6', order: 5,
        question: '¿Qué se puede hacer cerca de Glak Apart en Urdinarrain?',
        answer: 'Urdinarrain y la región de Entre Ríos ofrecen termas, paseos por el río, gastronomía regional con asados y productos artesanales, eventos culturales y la tranquilidad del paisaje rural entrerriano.',
    },
];

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [faqs, setFaqs] = useState<FAQItem[]>(DEFAULT_FAQS);
    const { isAdminMode } = useAdmin();

    // Modal state for fast editing
    const [editModal, setEditModal] = useState<{ isOpen: boolean; faqId: string; field: 'question' | 'answer'; value: string }>({
        isOpen: false, faqId: '', field: 'question', value: ''
    });

    useEffect(() => {
        loadFaqs();
        const handleUpdate = () => loadFaqs();
        window.addEventListener('GLAK_CONTENT_UPDATE', handleUpdate);
        return () => window.removeEventListener('GLAK_CONTENT_UPDATE', handleUpdate);
    }, []);

    const loadFaqs = async () => {
        try {
            const data = await getContent('faq');
            if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
                const sorted = [...data.items].sort((a: FAQItem, b: FAQItem) => a.order - b.order);
                setFaqs(sorted);
            } else {
                setFaqs(DEFAULT_FAQS);
            }
        } catch {
            setFaqs(DEFAULT_FAQS);
        }
    };

    const toggle = (i: number) => {
        const isOpening = openIndex !== i;
        setOpenIndex(isOpening ? i : null);
        if (isOpening && faqs[i]) trackEvent('faq_open', { question: faqs[i].question });
    };

    const handleInlineEdit = (faqId: string, field: 'question' | 'answer', currentValue: string) => {
        setEditModal({ isOpen: true, faqId, field, value: currentValue });
    };

    const handleInlineSave = async (newValue: string) => {
        const { faqId, field } = editModal;
        const updatedFaqs = faqs.map(f =>
            f.id === faqId ? { ...f, [field]: newValue } : f
        );
        setFaqs(updatedFaqs);
        await updateContent('faq', 'items', updatedFaqs);
        window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
    };

    return (
        <section className="py-24 bg-[#f4f1ea]" id="faq">
            <div className="container mx-auto px-6 md:px-10 max-w-3xl">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <span className="font-ui text-[10px] tracking-[0.4em] text-gray-400 block mb-4">
                        RESPUESTAS A TUS DUDAS
                    </span>
                    <h2 className="font-script text-forest text-6xl md:text-7xl mb-4">
                        Preguntas frecuentes
                    </h2>
                    <div className="w-16 h-0.5 bg-[#90c69e] mx-auto mt-6"></div>
                </div>

                {/* FAQ Items */}
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div
                            key={faq.id}
                            className="bg-white/60 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-white/80"
                        >
                            <button
                                onClick={() => toggle(i)}
                                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                                aria-expanded={openIndex === i}
                            >
                                <h3
                                    className={`text-base md:text-lg font-medium text-gray-800 leading-snug ${isAdminMode ? 'relative group/q' : ''}`}
                                    onClick={isAdminMode ? (e) => { e.stopPropagation(); handleInlineEdit(faq.id, 'question', faq.question); } : undefined}
                                >
                                    {faq.question}
                                    {isAdminMode && (
                                        <span className="absolute -top-2 -right-6 opacity-0 group-hover/q:opacity-100 transition-opacity bg-white text-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg border border-forest/20 cursor-pointer text-xs">✏️</span>
                                    )}
                                </h3>
                                <ChevronDown
                                    size={20}
                                    className={`text-forest flex-shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <p
                                    className={`px-6 pb-5 text-gray-600 font-light leading-relaxed ${isAdminMode ? 'relative group/a cursor-pointer' : ''}`}
                                    onClick={isAdminMode ? (e) => { e.stopPropagation(); handleInlineEdit(faq.id, 'answer', faq.answer); } : undefined}
                                >
                                    {faq.answer}
                                    {isAdminMode && (
                                        <span className="absolute -top-2 -right-2 opacity-0 group-hover/a:opacity-100 transition-opacity bg-white text-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg border border-forest/20 cursor-pointer text-xs">✏️</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Fast Edit Modal */}
            <EditModal
                isOpen={editModal.isOpen}
                onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
                onSave={handleInlineSave}
                initialValue={editModal.value}
                type={editModal.field === 'answer' ? 'textarea' : 'text'}
                label={editModal.field === 'question' ? 'Editar Pregunta' : 'Editar Respuesta'}
            />
        </section>
    );
};

export default FAQ;







