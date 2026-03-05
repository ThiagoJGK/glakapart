'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { uploadImage } from '@/services/images';
import { generateBlurredImage } from '@/utils/imageUtils';
import { Toast } from '../ui/Toast';

const AdminBranding: React.FC = () => {
    const [headerSettings, setHeaderSettings] = useState<Record<string, string>>({});
    const [activeSection, setActiveSection] = useState<'home' | 'gastronomia' | 'lugares' | 'eventos' | 'apartamentos'>('home');
    const [faviconUrl, setFaviconUrl] = useState('');
    const [logoType, setLogoType] = useState<'svg' | 'image'>('svg');
    const [logoSvg, setLogoSvg] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploadStatus, setUploadStatus] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await getContent('settings');
        if (data) {
            setLogoType(data.logoType || 'svg');
            setLogoSvg(data.logoSvg || '');
            setLogoUrl(data.logoUrl || '');
            setFaviconUrl(data.faviconUrl || '');

            // Load all keys starting with header_
            // For now, we manually map or just accept that initial state is overwritten
            // New logic: store all unknown keys if relevant, or just look for specific sections
            const newSettings: any = {};
            ['home', 'gastronomia', 'lugares', 'eventos', 'apartamentos'].forEach(sec => {
                newSettings[`header_${sec}_bg`] = data[`header_${sec}_bg`] || '';
                newSettings[`header_${sec}_blur`] = data[`header_${sec}_blur`] || '';
            });

            // Backwards compatibility for old 'headerBgUrl' -> assign to home if home empty?
            if (!newSettings['header_home_bg'] && data.headerBgUrl) {
                newSettings['header_home_bg'] = data.headerBgUrl;
                newSettings['header_home_blur'] = data.headerBgBlurredUrl;
            }

            setHeaderSettings(newSettings);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        try {
            const updates = [
                updateContent('settings', 'logoType', logoType),
                updateContent('settings', 'logoSvg', logoSvg),
                updateContent('settings', 'logoUrl', logoUrl),
                updateContent('settings', 'faviconUrl', faviconUrl),
                // Spread current header settings
                ...Object.entries(headerSettings).map(([key, value]) => updateContent('settings', key, value))
            ];

            await Promise.all(updates);

            setToast({ message: 'Configuración guardada con éxito', type: 'success' });
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al guardar la configuración', type: 'error' });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            setLoading(true);
            try {
                const url = await uploadImage(e.target.files[0], (status) => {
                    setUploadStatus(status === 'optimizing' ? 'OPTIMIZANDO LOGO...' : 'SUBIENDO DATO...');
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
            setLoading(true); // Re-using loading state or just blocking interaction
            try {
                // 1. Upload Original
                const originalUrl = await uploadImage(file, (status) => {
                    setUploadStatus(status === 'optimizing' ? 'OPTIMIZANDO FONDO...' : 'SUBIENDO IMAGEN...');
                });

                // 2. Generate and Upload Blur
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

                setToast({ message: 'Imágenes generadas y subidas correctamente', type: 'success' });
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
        <div className="bg-white p-4 md:p-8 rounded-sm shadow-sm border border-gray-100 max-w-4xl relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {loading && uploadStatus && (
                <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center rounded-sm">
                    <div className="w-8 h-8 border-4 border-sage border-t-forest rounded-full animate-spin mb-4"></div>
                    <p className="text-xs text-forest font-bold tracking-widest animate-pulse">{uploadStatus}</p>
                </div>
            )}

            <h3 className="font-ui tracking-widest text-sm mb-8 text-sage">IDENTIDAD DE MARCA</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Editor */}
                <div className="space-y-12">
                    {/* Logo Section */}
                    <div className="space-y-6">
                        <label className="block text-xs font-bold text-gray-400 mb-4 border-b pb-2">LOGO PRINCIPAL</label>
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setLogoType('svg')}
                                className={`px-4 py-2 text-xs border ${logoType === 'svg' ? 'bg-forest text-white border-forest' : 'border-gray-200 text-gray-400'}`}
                            >
                                CÓDIGO SVG
                            </button>
                            <button
                                onClick={() => setLogoType('image')}
                                className={`px-4 py-2 text-xs border ${logoType === 'image' ? 'bg-forest text-white border-forest' : 'border-gray-200 text-gray-400'}`}
                            >
                                IMAGEN (PNG/JPG)
                            </button>
                        </div>

                        {logoType === 'svg' ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">CÓDIGO SVG</label>
                                <textarea
                                    value={logoSvg}
                                    onChange={(e) => setLogoSvg(e.target.value)}
                                    className="w-full h-32 border p-3 font-mono text-xs focus:border-sage focus:outline-none"
                                    placeholder="<svg>..."
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">IMAGEN DE LOGO</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, setLogoUrl)}
                                    className="w-full border p-3 text-xs"
                                />
                                {logoUrl && <p className="text-[10px] text-gray-400 mt-2 break-all">URL: {logoUrl}</p>}
                            </div>
                        )}
                    </div>

                    {/* Header Background Section with Tabs */}
                    <div className="space-y-6">
                        <label className="block text-xs font-bold text-gray-400 mb-4 border-b pb-2">FONDOS DE ENCABEZADO POR SECCIÓN</label>

                        {/* Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
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
                                    className={`px-4 py-2 text-[10px] font-bold tracking-widest rounded-full whitespace-nowrap transition-colors ${activeSection === tab.id
                                        ? 'bg-[#10595a] text-white'
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <label className="block text-xs font-bold text-gray-400 mb-2">IMAGEN PRINCIPAL ({activeSection.toUpperCase()})</label>
                            <p className="text-[10px] text-gray-400 mb-4">La versión desenfocada se generará automáticamente.</p>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleHeaderUpload(e, activeSection)}
                                className="w-full border p-3 text-xs bg-white mb-4"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-[10px] text-gray-400 block mb-1">Original</span>
                                    {headerSettings[`header_${activeSection}_bg`] ? (
                                        <img width={800} height={600} src={headerSettings[`header_${activeSection}_bg`]} alt="Original" className="w-full h-24 object-cover rounded shadow-sm" />
                                    ) : (
                                        <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400">Sin imagen</div>
                                    )}
                                </div>
                                <div>
                                    <span className="text-[10px] text-gray-400 block mb-1">Desenfocada (Auto)</span>
                                    {headerSettings[`header_${activeSection}_blur`] ? (
                                        <img width={800} height={600} src={headerSettings[`header_${activeSection}_blur`]} alt="Blur" className="w-full h-24 object-cover rounded shadow-sm" />
                                    ) : (
                                        <div className="w-full h-24 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400">Sin imagen</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Favicon Section */}
                    <div className="space-y-6">
                        <label className="block text-xs font-bold text-gray-400 mb-4 border-b pb-2">FAVICON DE LA PESTAÑA</label>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-2">IMAGEN O SVG (RECOMENDADO 32x32)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, setFaviconUrl)}
                                className="w-full border p-3 text-xs"
                            />
                            {faviconUrl && <img width={800} height={600} src={faviconUrl} alt="Favicon" className="mt-2 w-8 h-8 object-contain rounded" />}
                        </div>
                    </div>


                    <button
                        onClick={handleSave}
                        className="bg-forest text-white px-8 py-3 text-xs tracking-widest hover:bg-sage transition-colors w-full"
                    >
                        GUARDAR CAMBIOS
                    </button>
                </div>

                {/* Preview (hidden on small mobile for space) */}
                <div className="hidden md:block space-y-8">
                    <div className="bg-gray-100 p-8 flex flex-col items-center justify-center rounded-sm border-dashed border-2 border-gray-200 min-h-[300px]">
                        <p className="text-[10px] tracking-widest text-gray-400 mb-8">VISTA PREVIA DE LOGO</p>
                        <div className="bg-forest w-full p-8 flex justify-center mb-8 rounded-sm">
                            {logoType === 'svg' && logoSvg ? (
                                <div
                                    className="w-48 text-white admin-logo-preview [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-full flex items-center justify-center"
                                    dangerouslySetInnerHTML={{ __html: logoSvg }}
                                />
                            ) : logoType === 'image' && logoUrl ? (
                                <img width={800} height={600} src={logoUrl} alt="Logo Preview" className="w-48 object-contain" />
                            ) : (
                                <p className="text-white/20 text-xs">Sin logo seleccionado</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBranding;









