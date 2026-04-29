'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { uploadImage } from '@/services/images';
import { generateBlurredImage } from '@/utils/imageUtils';
import { Toast } from '../ui/Toast';
import MissingImagePlaceholder from '../ui/MissingImagePlaceholder';

const SLIDES_INFO = [
    { id: 0, label: 'Slide 1: Experiencia (Inicial)', defaultImg: '' },
    { id: 1, label: 'Slide 2: Cielo Estrellado', defaultImg: '' },
    { id: 2, label: 'Slide 3: Atardeceres', defaultImg: '' }
];

const AdminHome: React.FC = () => {
    const [images, setImages] = useState<Record<string, string>>({});
    const [headerSettings, setHeaderSettings] = useState<Record<string, string>>({});
    const [activeSection, setActiveSection] = useState<'home' | 'gastronomia' | 'lugares' | 'eventos' | 'apartamentos'>('home');
    const [loading, setLoading] = useState<number | null>(null); // Index of slide loading
    const [uploadStatus, setUploadStatus] = useState<string>(''); // Progress detail MSG
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLoading(-1); // Use -1 or any flag for header upload loading
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

                await updateContent('settings', `header_${section}_bg`, originalUrl);
                await updateContent('settings', `header_${section}_blur`, blurredUrl);

                setToast({ message: 'Imágenes subidas correctamente', type: 'success' });
            } catch (error) {
                console.error(error);
                setToast({ message: 'Error al procesar imágenes', type: 'error' });
            } finally {
                setLoading(null);
                setUploadStatus('');
            }
        }
    };

    const loadData = async () => {
        try {
            const [data, settingsData] = await Promise.all([
                getContent('home'),
                getContent('settings')
            ]);
            
            if (data) {
                setImages(data);
            }
            if (settingsData) {
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
        } catch (error) {
            console.error('Error loading home data:', error);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLoading(index);

            try {
                // 1. Upload Original
                const originalUrl = await uploadImage(file, (status) => {
                    setUploadStatus(status === 'optimizing' ? 'OPTIMIZANDO IMAGEN...' : 'SUBIENDO A SERVIDOR...');
                });

                // 2. Generate and Upload Blur
                setUploadStatus('GENERANDO FONDO...');
                const blurredFile = await generateBlurredImage(file);
                const blurredUrl = await uploadImage(blurredFile, (status) => {
                    setUploadStatus(status === 'optimizing' ? 'OPTIMIZANDO FONDO...' : 'SUBIENDO FONDO...');
                });

                // 3. Save to DB
                await updateContent('home', `heroImage.${index}`, originalUrl);
                await updateContent('home', `heroImage.${index}_blur`, blurredUrl);

                // Update local state
                setImages(prev => ({
                    ...prev,
                    [`heroImage.${index}`]: originalUrl,
                    [`heroImage.${index}_blur`]: blurredUrl
                }));

                setToast({ message: `Slide ${index + 1} actualizado correctamente`, type: 'success' });

                // Notify app
                window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));

            } catch (error) {
                console.error(error);
                setToast({ message: 'Error al subir imagen', type: 'error' });
            } finally {
                setLoading(null);
                setUploadStatus('');
            }
        }
    };

    // Galleries removed to AdminCommonSpaces.tsx

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
                <h3 className="font-ui tracking-widest text-sm text-sage mb-2">PÁGINA DE INICIO</h3>
                <h2 className="text-2xl font-script text-forest">Hero Carousel y Video</h2>
                <p className="text-gray-400 text-xs mt-2">Gestiona las imágenes del carrusel principal y el video promocional de la experiencia.</p>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {SLIDES_INFO.map((slide) => {
                    const currentImg = images[`heroImage.${slide.id}`] || slide.defaultImg;
                    const currentBlur = images[`heroImage.${slide.id}_blur`];

                    return (
                        <div key={slide.id} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                            {/* Header */}
                            <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-xs text-gray-500 uppercase tracking-wider">{slide.label}</span>
                                {loading === slide.id && <span className="text-[10px] text-forest font-bold animate-pulse">PROCESANDO...</span>}
                            </div>

                            {/* Preview Area */}
                            <div className="relative h-48 w-full bg-gray-200 group-hover:opacity-90 transition-opacity">
                                {currentImg ? (
                                    <img width={800} height={600}
                                        src={currentImg}
                                        alt={`Slide ${slide.id}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <MissingImagePlaceholder id={`home.heroImage.${slide.id}`} label={`Imagen ${slide.label}`} />
                                )}

                                {/* Overlay Upload Button */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                    {loading === slide.id ? (
                                        <div className="flex flex-col items-center justify-center pointer-events-none p-4">
                                            <div className="w-8 h-8 border-4 border-sage border-t-forest rounded-full animate-spin mb-3"></div>
                                            <span className="text-white text-[10px] font-bold tracking-widest bg-black/50 px-3 py-1 rounded animate-pulse">{uploadStatus}</span>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-full text-xs font-bold tracking-widest hover:bg-forest hover:text-white transition-colors shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-300">
                                            CAMBIAR IMAGEN
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleUpload(e, slide.id)}
                                                disabled={loading !== null}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Blur Preview Strip */}
                            <div className="h-12 w-full bg-gray-100 relative overflow-hidden border-t border-white/20">
                                {currentBlur ? (
                                    <>
                                        <img width={800} height={600} src={currentBlur} alt="Blur" className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-[9px] text-white font-bold tracking-widest drop-shadow-md bg-black/20 px-2 py-0.5 rounded">VERSION BLUR GENERADA</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400">Sin blur generado</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 mb-8 border-t border-gray-100 pt-8">
                <h2 className="text-xl md:text-2xl font-script text-forest">Fondos de Cabecera</h2>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">Gestiona las imágenes de cabecera de cada sección del sitio.</p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 bg-white snap-x">
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
                            className={`px-4 py-3 md:px-5 md:py-4 text-[10px] md:text-xs font-bold tracking-widest whitespace-nowrap transition-colors border-b-2 snap-start shrink-0 ${activeSection === tab.id
                                ? 'border-forest text-forest bg-forest/5'
                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-4 md:p-6">
                    <label className="cursor-pointer inline-flex items-center justify-center w-full md:w-auto gap-2 bg-white border border-gray-200 px-6 py-3 rounded-lg text-xs font-bold text-forest hover:bg-gray-50 transition-colors mb-6 shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        SUBIR NUEVA IMAGEN
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleHeaderUpload(e, activeSection)}
                            className="hidden"
                            disabled={loading !== null}
                        />
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2 px-1">Original</span>
                            {headerSettings[`header_${activeSection}_bg`] ? (
                                <img src={headerSettings[`header_${activeSection}_bg`]} alt="Original" className="w-full h-32 md:h-40 object-cover rounded-lg shadow-sm" />
                            ) : (
                                <div className="w-full h-32 md:h-40 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-widest uppercase text-gray-400">Sin imagen</div>
                            )}
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2 px-1">Desenfocada (Blur)</span>
                            {headerSettings[`header_${activeSection}_blur`] ? (
                                <img src={headerSettings[`header_${activeSection}_blur`]} alt="Blur" className="w-full h-32 md:h-40 object-cover rounded-lg shadow-sm" />
                            ) : (
                                <div className="w-full h-32 md:h-40 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-bold tracking-widest uppercase text-gray-400">Sin imagen</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Extra spaces moved to AdminCommonSpaces */}

        </div>
    );
};

export default AdminHome;
