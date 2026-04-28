'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { uploadImage } from '@/services/images';
import { generateBlurredImage } from '@/utils/imageUtils';
import { Toast } from '../ui/Toast';
import { Bot, Save, Palette, Image as ImageIcon, Link as LinkIcon, AlertTriangle } from 'lucide-react';

const AdminBranding: React.FC = () => {
    // Branding States
    const [logoType, setLogoType] = useState<'svg' | 'image'>('svg');
    const [logoSvg, setLogoSvg] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [faviconUrl, setFaviconUrl] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#10595a');
    const [secondaryColor, setSecondaryColor] = useState('#819488');
    
    // Header Images State
    const [headerSettings, setHeaderSettings] = useState<Record<string, string>>({});
    const [activeSection, setActiveSection] = useState<'home' | 'gastronomia' | 'lugares' | 'eventos' | 'apartamentos'>('home');
    
    // Social / Links State
    const [instagramUrl, setInstagramUrl] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);

    // Chatbot State
    const [chatbotEnabled, setChatbotEnabled] = useState(false);
    const [chatbotPrompt, setChatbotPrompt] = useState('');

    const [loading, setLoading] = useState(true);
    const [uploadStatus, setUploadStatus] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const [settingsData, chatbotData] = await Promise.all([
                getContent('settings'),
                getContent('chatbot')
            ]);
            
            if (settingsData) {
                setLogoType(settingsData.logoType || 'svg');
                setLogoSvg(settingsData.logoSvg || '');
                setLogoUrl(settingsData.logoUrl || '');
                setFaviconUrl(settingsData.faviconUrl || '');
                setPrimaryColor(settingsData.primaryColor || '#10595a');
                setSecondaryColor(settingsData.secondaryColor || '#819488');
                setInstagramUrl(settingsData.instagramUrl || '');
                setFacebookUrl(settingsData.facebookUrl || '');
                setWhatsappNumber(settingsData.whatsappNumber || '');
                setMaintenanceEnabled(settingsData.maintenanceEnabled || false);

                const newSettings: any = {};
                ['home', 'gastronomia', 'lugares', 'eventos', 'apartamentos'].forEach(sec => {
                    newSettings[`header_${sec}_bg`] = settingsData[`header_${sec}_bg`] || '';
                    newSettings[`header_${sec}_blur`] = settingsData[`header_${sec}_blur`] || '';
                });

                if (!newSettings['header_home_bg'] && settingsData.headerBgUrl) {
                    newSettings['header_home_bg'] = settingsData.headerBgUrl;
                    newSettings['header_home_blur'] = settingsData.headerBgBlurredUrl;
                }

                setHeaderSettings(newSettings);
            }
            
            if (chatbotData) {
                setChatbotEnabled(chatbotData.enabled || false);
                setChatbotPrompt(chatbotData.systemPrompt || '');
            }
        } catch (error) {
            console.error('Error loading config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updates = [
                updateContent('settings', 'logoType', logoUrl ? 'image' : logoType), // Auto switch if image uploaded
                updateContent('settings', 'logoUrl', logoUrl),
                updateContent('settings', 'faviconUrl', faviconUrl),
                updateContent('settings', 'primaryColor', primaryColor),
                updateContent('settings', 'secondaryColor', secondaryColor),
                updateContent('settings', 'instagramUrl', instagramUrl),
                updateContent('settings', 'facebookUrl', facebookUrl),
                updateContent('settings', 'whatsappNumber', whatsappNumber),
                updateContent('settings', 'maintenanceEnabled', maintenanceEnabled),
                updateContent('chatbot', 'enabled', chatbotEnabled),
                updateContent('chatbot', 'systemPrompt', chatbotPrompt),
                ...Object.entries(headerSettings).map(([key, value]) => updateContent('settings', key, value))
            ];

            await Promise.all(updates);

            setToast({ message: 'Configuración guardada con éxito', type: 'success' });
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al guardar la configuración', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            setLoading(true);
            try {
                const url = await uploadImage(e.target.files[0], (status) => {
                    setUploadStatus(status === 'optimizing' ? 'OPTIMIZANDO...' : 'SUBIENDO...');
                });
                setter(url);
            } catch (error) {
                setToast({ message: 'Error al subir la imagen', type: 'error' });
            } finally {
                setLoading(false);
                setUploadStatus('');
            }
        }
    };

    const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLoading(true);
            try {
                const originalUrl = await uploadImage(file, (status) => {
                    setUploadStatus(status === 'optimizing' ? 'OPTIMIZANDO FONDO...' : 'SUBIENDO IMAGEN...');
                });

                setUploadStatus('GENERANDO FONDO BLUR...');
                const blurredFile = await generateBlurredImage(file);
                const blurredUrl = await uploadImage(blurredFile, (status) => {
                    setUploadStatus(status === 'optimizing' ? 'OPTIMIZANDO BLUR...' : 'SUBIENDO BLUR...');
                });

                setHeaderSettings(prev => ({
                    ...prev,
                    [`header_${section}_bg`]: originalUrl,
                    [`header_${section}_blur`]: blurredUrl
                }));

                setToast({ message: 'Imágenes subidas correctamente', type: 'success' });
            } catch (error) {
                console.error(error);
                setToast({ message: 'Error al procesar imágenes', type: 'error' });
            } finally {
                setLoading(false);
                setUploadStatus('');
            }
        }
    };

    return (
        <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-5xl relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {loading && uploadStatus && (
                <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-sage border-t-forest rounded-full animate-spin mb-4"></div>
                    <p className="text-xs text-forest font-bold tracking-widest animate-pulse">{uploadStatus}</p>
                </div>
            )}

            <div className="mb-10">
                <h3 className="font-ui tracking-widest text-lg mb-2 text-forest">AJUSTES DEL SITIO</h3>
                <p className="text-sm text-gray-500">
                    Administra la identidad gráfica, redes sociales y configuraciones de asistentes inteligentes de tu plataforma.
                </p>
            </div>

            <div className="space-y-12">
                {/* 1. BRANDING & COLORS */}
                <section>
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <Palette className="w-5 h-5 text-sage" />
                        <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm">Identidad Visual</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Logo & Favicon */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Logo Principal</label>
                                {logoType === 'svg' && !logoUrl && (
                                    <p className="text-[10px] text-amber-600 mb-2 bg-amber-50 p-2 rounded">El logo actual es SVG. Para editarlo, sube una nueva imagen y lo reemplazará automáticamente.</p>
                                )}
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, setLogoUrl)}
                                        className="w-full border p-2 text-xs bg-white rounded-lg"
                                    />
                                    {(logoUrl || logoSvg) && (
                                        <div className="w-12 h-12 bg-forest rounded shadow-inner flex items-center justify-center p-2 shrink-0">
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Logo" className="w-full object-contain" />
                                            ) : (
                                                <div className="w-full text-white [&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: logoSvg }} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Favicon (Ícono de Pestaña)</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, setFaviconUrl)}
                                        className="w-full border p-2 text-xs bg-white rounded-lg"
                                    />
                                    {faviconUrl && (
                                        <img src={faviconUrl} alt="Favicon" className="w-8 h-8 rounded-md border border-gray-200 object-contain shrink-0" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. HEADER IMAGES */}
                <section>
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <ImageIcon className="w-5 h-5 text-sage" />
                        <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm">Fondos de Cabecera</h4>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                        <div className="flex flex-wrap overflow-x-auto border-b border-gray-200 bg-white">
                            {[
                                { id: 'home', label: 'INICIO' },
                                { id: 'gastronomia', label: 'GASTRONOMÍA' },
                                { id: 'lugares', label: 'LUGARES' },
                                { id: 'eventos', label: 'EVENTOS' },
                                { id: 'apartamentos', label: 'APARTAMENTOS' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSection(tab.id as any)}
                                    className={`px-5 py-3 text-xs font-bold tracking-widest whitespace-nowrap transition-colors border-b-2 ${activeSection === tab.id
                                        ? 'border-forest text-forest bg-forest/5'
                                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-forest hover:bg-gray-50 transition-colors mb-6 shadow-sm">
                                <ImageIcon size={14} /> SUBIR NUEVA IMAGEN
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleHeaderUpload(e, activeSection)}
                                    className="hidden"
                                />
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Original</span>
                                    {headerSettings[`header_${activeSection}_bg`] ? (
                                        <img src={headerSettings[`header_${activeSection}_bg`]} alt="Original" className="w-full h-32 object-cover rounded-xl shadow-sm border border-gray-200" />
                                    ) : (
                                        <div className="w-full h-32 bg-gray-200 rounded-xl flex items-center justify-center text-xs font-ui tracking-widest uppercase text-gray-400">Sin imagen</div>
                                    )}
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Desenfocada (Blur)</span>
                                    {headerSettings[`header_${activeSection}_blur`] ? (
                                        <img src={headerSettings[`header_${activeSection}_blur`]} alt="Blur" className="w-full h-32 object-cover rounded-xl shadow-sm border border-gray-200" />
                                    ) : (
                                        <div className="w-full h-32 bg-gray-200 rounded-xl flex items-center justify-center text-xs font-ui tracking-widest uppercase text-gray-400">Sin imagen</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. SOCIAL MEDIA & LINKS */}
                <section>
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <LinkIcon className="w-5 h-5 text-sage" />
                        <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm">Redes y Contacto</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">WhatsApp (URL wa.me)</label>
                            <input
                                type="url"
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                placeholder="https://wa.me/..."
                                className="w-full border border-gray-200 p-3 text-sm rounded-lg focus:border-forest focus:outline-none bg-white"
                            />
                        </div>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Instagram URL</label>
                            <input
                                type="url"
                                value={instagramUrl}
                                onChange={(e) => setInstagramUrl(e.target.value)}
                                placeholder="https://instagram.com/..."
                                className="w-full border border-gray-200 p-3 text-sm rounded-lg focus:border-forest focus:outline-none bg-white"
                            />
                        </div>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Facebook URL</label>
                            <input
                                type="url"
                                value={facebookUrl}
                                onChange={(e) => setFacebookUrl(e.target.value)}
                                placeholder="https://facebook.com/..."
                                className="w-full border border-gray-200 p-3 text-sm rounded-lg focus:border-forest focus:outline-none bg-white"
                            />
                        </div>
                    </div>
                </section>

                {/* 4. MANTENIMIENTO */}
                <section>
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm">Estado del Sitio</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-amber-50 border border-amber-100 p-5 rounded-xl gap-4">
                            <div>
                                <h5 className="font-bold text-amber-900 text-sm mb-1">Modo Mantenimiento</h5>
                                <p className="text-xs text-amber-700">Activa esta opción para ocultar el sitio público a los visitantes. Solo verán una pantalla de mantenimiento con redirección a WhatsApp.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={maintenanceEnabled}
                                    onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* 5. CHATBOT CONFIGURATION */}
                <section>
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        <Bot className="w-5 h-5 text-sage" />
                        <h4 className="font-bold text-gray-700 uppercase tracking-widest text-sm">Asistente IA (Chatbot)</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 border border-gray-100 p-5 rounded-xl gap-4">
                            <div>
                                <h5 className="font-bold text-gray-700 text-sm mb-1">Activar Chatbot de Atención</h5>
                                <p className="text-xs text-gray-500">Un pequeño widget de chat aparecerá en todas las páginas para interactuar con los visitantes a través de IA.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={chatbotEnabled}
                                    onChange={(e) => setChatbotEnabled(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10595a]"></div>
                            </label>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 p-5 rounded-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h5 className="font-bold text-gray-700 text-sm">Base de Conocimiento (System Prompt)</h5>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all">
                                Ingresa aquí todas las reglas, precios, y la personalidad que el asistente debe seguir. Ejemplo: "Eres el recepcionista de Glak. Eres amable e invitas a reservar por WhatsApp."
                            </p>
                            <textarea
                                value={chatbotPrompt}
                                onChange={(e) => setChatbotPrompt(e.target.value)}
                                className="w-full h-48 bg-white border border-gray-200 rounded-lg p-4 text-sm focus:outline-none focus:border-forest text-gray-700 font-mono resize-y"
                                placeholder="Escribe el contexto para el Asistente IA..."
                            />
                        </div>
                    </div>
                </section>

                <div className="flex justify-center sm:justify-end pt-8 border-t border-gray-100">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-forest text-white px-8 py-4 rounded-xl text-sm font-bold tracking-widest hover:bg-forest/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 w-full sm:w-auto justify-center"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        GUARDAR TODA LA CONFIGURACIÓN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminBranding;
