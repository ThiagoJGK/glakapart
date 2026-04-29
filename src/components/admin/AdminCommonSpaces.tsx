'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { uploadImage } from '@/services/images';
import { Toast } from '../ui/Toast';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

const AdminCommonSpaces: React.FC = () => {
    const [poolGallery, setPoolGallery] = useState<string[]>([]);
    const [gardenGallery, setGardenGallery] = useState<string[]>([]);
    const [guestGallery, setGuestGallery] = useState<string[]>([]);
    const [galleryUploading, setGalleryUploading] = useState<'pool' | 'garden' | 'guest' | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getContent('home');
            if (data) {
                if (data['common.pool.gallery']) setPoolGallery(data['common.pool.gallery']);
                if (data['common.garden.gallery']) setGardenGallery(data['common.garden.gallery']);
                if (data['home.guests.gallery']) setGuestGallery(data['home.guests.gallery']);
            }
        } catch (error) {
            console.error('Error loading gallery data:', error);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'pool' | 'garden' | 'guest') => {
        if (e.target.files && e.target.files.length > 0) {
            setGalleryUploading(type);
            setUploadStatus('SUBIENDO IMÁGENES...');
            
            try {
                const files = Array.from(e.target.files);
                const uploadPromises = files.map(file => uploadImage(file));
                const uploadedUrls = await Promise.all(uploadPromises);

                const currentGallery = type === 'pool' ? poolGallery : type === 'garden' ? gardenGallery : guestGallery;
                const newGallery = [...currentGallery, ...uploadedUrls].filter((x: string) => x);

                if (type === 'pool') {
                    setPoolGallery(newGallery);
                    await updateContent('home', 'common.pool.gallery', newGallery);
                } else if (type === 'garden') {
                    setGardenGallery(newGallery);
                    await updateContent('home', 'common.garden.gallery', newGallery);
                } else {
                    setGuestGallery(newGallery);
                    await updateContent('home', 'home.guests.gallery', newGallery);
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

    const handleGalleryDelete = async (index: number, type: 'pool' | 'garden' | 'guest') => {
        if (window.confirm('¿Eliminar esta imagen de la galería?')) {
            try {
                const currentGallery = type === 'pool' ? poolGallery : type === 'garden' ? gardenGallery : guestGallery;
                const newGallery = currentGallery.filter((_, i) => i !== index);

                if (type === 'pool') {
                    setPoolGallery(newGallery);
                    await updateContent('home', 'common.pool.gallery', newGallery);
                } else if (type === 'garden') {
                    setGardenGallery(newGallery);
                    await updateContent('home', 'common.garden.gallery', newGallery);
                } else {
                    setGuestGallery(newGallery);
                    await updateContent('home', 'home.guests.gallery', newGallery);
                }

                setToast({ message: 'Imagen eliminada.', type: 'success' });
                window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
            } catch (error) {
                console.error(error);
                setToast({ message: 'Error al eliminar imagen', type: 'error' });
            }
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down', type: 'pool' | 'garden' | 'guest') => {
        const currentGallery = type === 'pool' ? poolGallery : type === 'garden' ? gardenGallery : guestGallery;
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === currentGallery.length - 1)
        ) return;

        const newGallery = [...currentGallery];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newGallery[index], newGallery[swapIndex]] = [newGallery[swapIndex], newGallery[index]];

        try {
            if (type === 'pool') {
                setPoolGallery(newGallery);
                await updateContent('home', 'common.pool.gallery', newGallery);
            } else if (type === 'garden') {
                setGardenGallery(newGallery);
                await updateContent('home', 'common.garden.gallery', newGallery);
            } else {
                setGuestGallery(newGallery);
                await updateContent('home', 'home.guests.gallery', newGallery);
            }
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error('Error moviendo imagen', error);
            setToast({ message: 'Error al mover la imagen', type: 'error' });
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
                <h3 className="font-ui tracking-widest text-sm text-sage mb-2">PROPIEDAD E INSTALACIONES</h3>
                <h2 className="text-2xl font-script text-forest">Espacios Comunes y Huéspedes</h2>
                <p className="text-gray-400 text-xs mt-2">Gestiona las fotos de la piscina, el parque, y el carrusel de experiencias de los huéspedes.</p>
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
                            <div key={index} className="relative group aspect-square rounded overflow-hidden shadow-sm">
                                <img width={800} height={600} src={url} alt={`Pool ${index}`} className="w-full h-full object-cover" />
                                
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <button
                                        onClick={() => handleMove(index, 'up', 'pool')}
                                        disabled={index === 0}
                                        className={`p-1.5 rounded-full shadow-sm transition-colors ${index === 0 ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-forest hover:bg-forest hover:text-white'}`}
                                    >
                                        <ChevronUp size={16} className="-rotate-90" />
                                    </button>

                                    <button
                                        onClick={() => handleGalleryDelete(index, 'pool')}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <button
                                        onClick={() => handleMove(index, 'down', 'pool')}
                                        disabled={index === poolGallery.length - 1}
                                        className={`p-1.5 rounded-full shadow-sm transition-colors ${index === poolGallery.length - 1 ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-forest hover:bg-forest hover:text-white'}`}
                                    >
                                        <ChevronDown size={16} className="-rotate-90" />
                                    </button>
                                </div>
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
                            <div key={index} className="relative group aspect-square rounded overflow-hidden shadow-sm">
                                <img width={800} height={600} src={url} alt={`Garden ${index}`} className="w-full h-full object-cover" />
                                
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <button
                                        onClick={() => handleMove(index, 'up', 'garden')}
                                        disabled={index === 0}
                                        className={`p-1.5 rounded-full shadow-sm transition-colors ${index === 0 ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-forest hover:bg-forest hover:text-white'}`}
                                    >
                                        <ChevronUp size={16} className="-rotate-90" />
                                    </button>

                                    <button
                                        onClick={() => handleGalleryDelete(index, 'garden')}
                                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <button
                                        onClick={() => handleMove(index, 'down', 'garden')}
                                        disabled={index === gardenGallery.length - 1}
                                        className={`p-1.5 rounded-full shadow-sm transition-colors ${index === gardenGallery.length - 1 ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-forest hover:bg-forest hover:text-white'}`}
                                    >
                                        <ChevronDown size={16} className="-rotate-90" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {gardenGallery.length === 0 && (
                            <div className="col-span-3 text-center py-8 text-xs text-gray-400">Sin imágenes extra. Actualmente usa la de Editable.</div>
                        )}
                    </div>
                </div>

                {/* Guest Gallery */}
                <div className="bg-gray-50 border border-gray-100 p-6 rounded-xl md:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">Galería de Huéspedes</label>
                        <label className={`bg-[#10595a] text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest hover:bg-forest transition-colors cursor-pointer ${galleryUploading === 'guest' ? 'opacity-50 pointer-events-none' : ''}`}>
                            {galleryUploading === 'guest' ? 'SUBIENDO...' : 'AÑADIR FOTOS'}
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleGalleryUpload(e, 'guest')}
                                disabled={galleryUploading !== null}
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {guestGallery.map((url, index) => (
                            <div key={index} className="relative group aspect-square rounded overflow-hidden shadow-sm">
                                <img width={800} height={600} src={url} alt={`Guest ${index}`} className="w-full h-full object-cover" />
                                
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 sm:gap-2 backdrop-blur-[2px]">
                                    <button
                                        onClick={() => handleMove(index, 'up', 'guest')}
                                        disabled={index === 0}
                                        className={`p-1 sm:p-1.5 rounded-full shadow-sm transition-colors ${index === 0 ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-forest hover:bg-forest hover:text-white'}`}
                                    >
                                        <ChevronUp size={14} className="-rotate-90" />
                                    </button>

                                    <button
                                        onClick={() => handleGalleryDelete(index, 'guest')}
                                        className="bg-red-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                    >
                                        <Trash2 size={14} />
                                    </button>

                                    <button
                                        onClick={() => handleMove(index, 'down', 'guest')}
                                        disabled={index === guestGallery.length - 1}
                                        className={`p-1 sm:p-1.5 rounded-full shadow-sm transition-colors ${index === guestGallery.length - 1 ? 'bg-white/20 text-white/50 cursor-not-allowed' : 'bg-white text-forest hover:bg-forest hover:text-white'}`}
                                    >
                                        <ChevronDown size={14} className="-rotate-90" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {guestGallery.length === 0 && (
                            <div className="col-span-3 md:col-span-6 text-center py-8 text-xs text-gray-400">Sin imágenes. Se mostrará placeholder o nada.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCommonSpaces;
