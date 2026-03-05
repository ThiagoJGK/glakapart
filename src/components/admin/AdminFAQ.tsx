'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { FAQItem } from '@/types';
import { Toast } from '../ui/Toast';

const DEFAULT_FAQS: FAQItem[] = [
    { id: 'default-1', order: 0, question: '¿Dónde queda Glak Apart?', answer: 'Glak Apart se encuentra en Salta 435, Urdinarrain, Entre Ríos, Argentina (CP 2812). Estamos en el corazón del campo entrerriano, a pocos minutos del centro de Urdinarrain.' },
    { id: 'default-2', order: 1, question: '¿Qué apartamentos tiene Glak Apart?', answer: 'Contamos con 3 apartamentos: Nacarado (3-4 personas, ideal familias), Arrebol (4-5 personas, amplio con vista al parque) y Arje (2 personas, exclusivo para parejas frente a la piscina). Todos equipados con cocina, aire acondicionado, WiFi y Smart TV.' },
    { id: 'default-3', order: 2, question: '¿Glak Apart tiene pileta?', answer: 'Sí, Glak Apart cuenta con piscina al aire libre rodeada de espacios verdes. El apartamento Arje tiene acceso directo frente a la piscina.' },
    { id: 'default-4', order: 3, question: '¿Cuál es el horario de check-in y check-out?', answer: 'El check-in es a las 14:00 hs y el check-out a las 10:00 hs. Consultá por opciones de early check-in o late check-out por WhatsApp.' },
    { id: 'default-5', order: 4, question: '¿Cómo reservo en Glak Apart?', answer: 'Podés reservar directamente por WhatsApp al +54 9 11 6967-5050 o enviarnos un email a hola@glakapart.com.ar. Consultá disponibilidad y tarifas sin compromiso.' },
    { id: 'default-6', order: 5, question: '¿Qué se puede hacer cerca de Glak Apart en Urdinarrain?', answer: 'Urdinarrain y la región de Entre Ríos ofrecen termas, paseos por el río, gastronomía regional con asados y productos artesanales, eventos culturales y la tranquilidad del paisaje rural entrerriano.' },
];

const AdminFAQ: React.FC = () => {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFaq, setCurrentFaq] = useState<Partial<FAQItem>>({});
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadFaqs();
    }, []);

    const loadFaqs = async () => {
        const data = await getContent('faq');
        if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
            const sorted = [...data.items].sort((a: FAQItem, b: FAQItem) => a.order - b.order);
            setFaqs(sorted);
        } else {
            // Show defaults locally (no write to Firebase until admin saves manually)
            setFaqs(DEFAULT_FAQS);
        }
    };

    const saveToDb = async (items: FAQItem[]) => {
        await updateContent('faq', 'items', items);
        window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
    };

    const handleSave = async () => {
        if (!currentFaq.question?.trim() || !currentFaq.answer?.trim()) {
            setToast({ message: 'Completá la pregunta y la respuesta', type: 'error' });
            return;
        }

        const newFaq: FAQItem = {
            id: currentFaq.id || Date.now().toString(),
            question: currentFaq.question!.trim(),
            answer: currentFaq.answer!.trim(),
            order: currentFaq.order ?? faqs.length,
        };

        let updated: FAQItem[];
        if (currentFaq.id) {
            updated = faqs.map(f => f.id === newFaq.id ? newFaq : f);
        } else {
            updated = [...faqs, newFaq];
        }

        setFaqs(updated);
        await saveToDb(updated);
        setIsEditing(false);
        setCurrentFaq({});
        setToast({ message: currentFaq.id ? 'Pregunta actualizada' : 'Pregunta creada', type: 'success' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta pregunta?')) return;
        const updated = faqs.filter(f => f.id !== id).map((f, i) => ({ ...f, order: i }));
        setFaqs(updated);
        await saveToDb(updated);
        setToast({ message: 'Pregunta eliminada', type: 'success' });
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        const newFaqs = [...faqs];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newFaqs.length) return;

        // Swap
        [newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]];
        // Re-assign order
        const reordered = newFaqs.map((f, i) => ({ ...f, order: i }));
        setFaqs(reordered);
        await saveToDb(reordered);
    };

    const startEdit = (faq?: FAQItem) => {
        if (faq) {
            setCurrentFaq({ ...faq });
        } else {
            setCurrentFaq({});
        }
        setIsEditing(true);
    };

    return (
        <div className="space-y-8">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h3 className="text-2xl font-script text-forest">Preguntas Frecuentes</h3>
                    <p className="text-gray-400 text-xs mt-1">Gestioná las FAQ que se muestran en la web. También podés editarlas inline con Edición Rápida.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => startEdit()}
                        className="bg-sage text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-forest transition-colors w-full sm:w-auto text-center"
                    >
                        + NUEVA PREGUNTA
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Pregunta</label>
                        <input
                            type="text"
                            value={currentFaq.question || ''}
                            onChange={e => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-sage"
                            placeholder="Ej: ¿Cuál es el horario de check-in?"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Respuesta</label>
                        <textarea
                            value={currentFaq.answer || ''}
                            onChange={e => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                            className="w-full border border-gray-200 rounded-lg px-4 py-2 h-32 focus:outline-none focus:border-sage resize-none"
                            placeholder="Escribí la respuesta a esta pregunta..."
                        />
                    </div>
                    <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                        <button
                            onClick={() => { setIsEditing(false); setCurrentFaq({}); }}
                            className="border border-gray-300 px-6 py-2 rounded-lg font-bold text-gray-500 text-xs tracking-widest hover:bg-gray-50"
                        >
                            CANCELAR
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-forest text-white px-6 py-2 rounded-lg font-bold text-xs tracking-widest hover:opacity-90"
                        >
                            GUARDAR
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {faqs.length === 0 && <p className="text-gray-400 italic">No hay preguntas cargadas. Las FAQs por defecto se seguirán mostrando en el sitio.</p>}
                    {faqs.map((faq, index) => (
                        <div key={faq.id} className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-50 group hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-ui text-sm md:text-base font-bold text-forest leading-snug">{faq.question}</h4>
                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{faq.answer}</p>
                                </div>
                                <div className="flex gap-1 opacity-100 sm:opacity-10 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    <button
                                        onClick={() => handleMove(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full disabled:opacity-20 disabled:cursor-not-allowed"
                                        title="Mover arriba"
                                    >↑</button>
                                    <button
                                        onClick={() => handleMove(index, 'down')}
                                        disabled={index === faqs.length - 1}
                                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full disabled:opacity-20 disabled:cursor-not-allowed"
                                        title="Mover abajo"
                                    >↓</button>
                                    <button onClick={() => startEdit(faq)} className="p-1.5 text-sage hover:bg-sage/10 rounded-full" title="Editar">✎</button>
                                    <button onClick={() => handleDelete(faq.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-full" title="Eliminar">🗑</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminFAQ;







