'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { uploadImage } from '@/services/images';
import { generateBlurredImage } from '@/utils/imageUtils';
import { Toast } from '../ui/Toast';

const SLIDES_INFO = [
    { id: 0, label: 'Slide 1: Experiencia (Inicial)', defaultImg: 'https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?auto=format&fit=crop&q=80&w=2000' },
    { id: 1, label: 'Slide 2: Cielo Estrellado', defaultImg: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2000' },
    { id: 2, label: 'Slide 3: Atardeceres', defaultImg: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=2000' }
];

const AdminHome: React.FC = () => {
    const [images, setImages] = useState<Record<string, string>>({});
    const [promoVideoUrl, setPromoVideoUrl] = useState<string>('');
    const [loading, setLoading] = useState<number | null>(null); // Index of slide loading
    const [uploadStatus, setUploadStatus] = useState<string>(''); // Progress detail MSG
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [poolGallery, setPoolGallery] = useState<string[]>([]);
    const [gardenGallery, setGardenGallery] = useState<string[]>([]);
    const [galleryUploading, setGalleryUploading] = useState<'pool' | 'garden' | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getContent('home');
            if (data) {
                setImages(data);
                if (data.promoVideoUrl) setPromoVideoUrl(data.promoVideoUrl);
                if (data['common.pool.gallery']) setPoolGallery(data['common.pool.gallery']);
                if (data['common.garden.gallery']) setGardenGallery(data['common.garden.gallery']);
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

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pool' | 'garden') => {
        if (e.target.files && e.target.files.length > 0) {
            setGalleryUploading(type);
            setUploadStatus('SUBIENDO IMÁGENES...');
            
            try {
                const files = Array.from(e.target.files);
                const uploadPromises = files.map(file => uploadImage(file));
                const uploadedUrls = await Promise.all(uploadPromises);

                const currentGallery = type === 'pool' ? poolGallery : gardenGallery;
                const newGallery = [...currentGallery, ...uploadedUrls].filter((x: string) => x);

                if (type === 'pool') {
                    setPoolGallery(newGallery);
                    await updateContent('home', 'common.pool.gallery', newGallery);
                } else {
                    setGardenGallery(newGallery);
                    await updateContent('home', 'common.garden.gallery', newGallery);
                }

                setToast({ message: 'Imágenes añadidas a la galería.', type: 'success' });
                window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
            } catch (error) {
                console.error(error);
                setToast({ message: 'Error al subir imágenes', type: 'error' });
            } finally {
                setGalleryUploading(null);
                setUploadStatus('');
            }
        }
    };

    const handleGalleryDelete = async (index: number, type: 'pool' | 'garden') => {
        if (window.confirm('¿Eliminar esta imagen de la galería?')) {
            try {
                const currentGallery = type === 'pool' ? poolGallery : gardenGallery;
                const newGallery = currentGallery.filter((_, i) => i !== index);

                if (type === 'pool') {
                    setPoolGallery(newGallery);
                    await updateContent('home', 'common.pool.gallery', newGallery);
                } else {
                    setGardenGallery(newGallery);
                    await updateContent('home', 'common.garden.gallery', newGallery);
                }

                setToast({ message: 'Imagen eliminada.', type: 'success' });
                window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
            } catch (error) {
                console.error(error);
                setToast({ message: 'Error al eliminar imagen', type: 'error' });
            }
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
                <h3 className="font-ui tracking-widest text-sm text-sage mb-2">PÁGINA DE INICIO</h3>
                <h2 className="text-2xl font-script text-forest">Hero Carousel y Video</h2>
                <p className="text-gray-400 text-xs mt-2">Gestiona las imágenes del carrusel principal y el video promocional de la experiencia.</p>
            </div>

            <div className="mb-10 bg-gray-50 border border-gray-100 p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-gray-500 tracking-widest">ENLACE VIDEO PROMOCIONAL (YOUTUBE / VIMEO)</label>
                    <span className="bg-sage/10 text-sage text-[10px] px-2 py-1 rounded font-bold">OPCIONAL</span>
                </div>
                <div className="flex gap-4">
                    <input
                        type="url"
                        value={promoVideoUrl}
                        onChange={(e) => setPromoVideoUrl(e.target.value)}
                        placeholder="Ej: https://www.youtube.com/watch?v=..."
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-forest text-gray-700"
                    />
                    <button
                        onClick={async () => {
                            await updateContent('home', 'promoVideoUrl', promoVideoUrl);
                            setToast({ message: 'Video guardado', type: 'success' });
                        }}
                        className="bg-forest text-white px-6 py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-forest/90 transition-colors"
                    >
                        GUARDAR ENLACE
                    </button>
                    <button
                        onClick={async () => {
                            setPromoVideoUrl('');
                            await updateContent('home', 'promoVideoUrl', '');
                            setToast({ message: 'Video ocultado', type: 'success' });
                        }}
                        className="bg-gray-200 text-gray-600 px-6 py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-gray-300 transition-colors"
                        title="Borrar y Ocultar Video"
                    >
                        X
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Al dejar en blanco, el botón "Ver Video" se oculta en la web. Pegar enlace público. Se incrustará en la landing page usando un reproductor liviano.</p>
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
                                <img width={800} height={600}
                                    src={currentImg}
                                    alt={`Slide ${slide.id}`}
                                    className="w-full h-full object-cover"
                                />

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

            {/* --- EXTRAS: Common Spaces Galleries --- */}
            <div className="mt-16 mb-8 border-t border-gray-100 pt-16">
                <h3 className="font-ui tracking-widest text-sm text-sage mb-2">SECCIÓN: ESPACIOS PARA COMPARTIR</h3>
                <h2 className="text-2xl font-script text-forest">Galerías de Fotos</h2>
                <p className="text-gray-400 text-xs mt-2">Sube múltiples imágenes para crear un carrusel deslizable en cada tarjeta (Piscina / Parque).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Pool Gallery */}
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">Piscina y Solarium</label>
                        <label className={`bg-[#10595a] text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-forest transition-colors cursor-pointer ${galleryUploading === 'pool' ? 'opacity-50 pointer-events-none' : ''}`}>
                            {galleryUploading === 'pool' ? 'SUBIENDO...' : 'AÑADIR FOTOS'}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleGalleryUpload(e, 'pool')}
                                disabled={galleryUploading !== null}
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {poolGallery.map((url, index) => (
                            <div key={index} className="relative group aspect-square rounded overflow-hidden">
                                <img width={800} height={600} src={url} alt={`Pool ${index}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => handleGalleryDelete(index, 'pool')}
                                    className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                        {poolGallery.length === 0 && (
                            <div className="col-span-3 text-center py-8 text-xs text-gray-400">Sin imágenes extra. Actualmente usa la de Editable.</div>
                        )}
                    </div>
                </div>

                {/* Garden Gallery */}
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">Parque y Asadores</label>
                        <label className={`bg-[#10595a] text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-forest transition-colors cursor-pointer ${galleryUploading === 'garden' ? 'opacity-50 pointer-events-none' : ''}`}>
                            {galleryUploading === 'garden' ? 'SUBIENDO...' : 'AÑADIR FOTOS'}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleGalleryUpload(e, 'garden')}
                                disabled={galleryUploading !== null}
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {gardenGallery.map((url, index) => (
                            <div key={index} className="relative group aspect-square rounded overflow-hidden">
                                <img width={800} height={600} src={url} alt={`Garden ${index}`} className="w-full h-full object-cover" />
                                <button
                                    onClick={() => handleGalleryDelete(index, 'garden')}
                                    className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                        {gardenGallery.length === 0 && (
                            <div className="col-span-3 text-center py-8 text-xs text-gray-400">Sin imágenes extra. Actualmente usa la de Editable.</div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminHome;
