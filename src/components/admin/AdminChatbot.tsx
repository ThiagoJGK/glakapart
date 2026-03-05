'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { Toast } from '../ui/Toast';
import { Bot, Save } from 'lucide-react';

const AdminChatbot: React.FC = () => {
    const [enabled, setEnabled] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getContent('chatbot');
            if (data) {
                setEnabled(data.enabled || false);
                setSystemPrompt(data.systemPrompt || '');
            }
        } catch (error) {
            console.error('Error loading chatbot data:', error);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateContent('chatbot', 'enabled', enabled);
            await updateContent('chatbot', 'systemPrompt', systemPrompt);
            setToast({ message: 'Configuración de Chatbot guardada', type: 'success' });
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error('Error saving chatbot data:', error);
            setToast({ message: 'Error al guardar la configuración', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 md:p-8 rounded-sm shadow-sm border border-gray-100 max-w-5xl">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="mb-8">
                <h3 className="font-ui tracking-widest text-sm text-sage mb-2">INTEGRACIONES</h3>
                <h2 className="text-2xl font-script text-forest flex items-center gap-3">
                    <Bot className="w-8 h-8 text-[#10595a]" />
                    Asistente de Inteligencia Artificial
                </h2>
                <p className="text-gray-400 text-xs mt-2">
                    Configura el comportamiento del chatbot automatizado. Proporcionále al asistente la información necesaria para que pueda responder dudas de los clientes, actuar amistosamente y dirigir reservas de manera efectiva hacia WhatsApp.
                </p>
            </div>

            <div className="space-y-8">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 p-6 rounded-xl">
                    <div>
                        <h4 className="font-bold text-gray-700 text-sm mb-1">Estado del Chatbot</h4>
                        <p className="text-xs text-gray-500">Al activar, un pequeño globo de chat aparecerá en todas las páginas para los visitantes.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={enabled}
                            onChange={(e) => setEnabled(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10595a]"></div>
                    </label>
                </div>

                {/* System Prompt Textarea */}
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-700 text-sm">Contexto de la IA (System Prompt)</h4>
                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-bold uppercase tracking-widest">Base de Conocimiento</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                        Escribí aquí todas las reglas, precios, links y personalidad que el bot debe seguir.
                        Ejemplo: <i>"Sos el recepcionista de Glak Apart en Urdinarrain. Sé divertido e invitá a venir. Las piletas son techadas. Para reservar tenés que preguntar primero fechas. Nuestro link de cobro es wa.me/XX..."</i>
                    </p>
                    <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="w-full h-64 bg-white border border-gray-200 rounded-lg p-4 text-sm focus:outline-none focus:border-[#10595a] text-gray-700 font-mono resize-y"
                        placeholder="Escribe el contexto para tu Asistente IA..."
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#10595a] text-white px-8 py-3 rounded-xl text-sm font-bold tracking-widest hover:bg-[#0c4445] transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        GUARDAR CONFIGURACIÓN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminChatbot;
