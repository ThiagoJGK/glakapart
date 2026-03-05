'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { uploadImage } from '@/services/images';
import { Toast } from '../ui/Toast';
import { Plus, Trash2, ChevronUp, ChevronDown, CheckCircle, Save, X } from 'lucide-react';
import { apartmentData, ApartmentKey } from '@/data/apartments';

const AdminApartments: React.FC = () => {
    const [selectedApt, setSelectedApt] = useState<ApartmentKey>('nacarado');
    const [gallery, setGallery] = useState<string[]>([]);
    const [tourUrl, setTourUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadData();
    }, [selectedApt]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getContent(`apartment_${selectedApt}`);
            if (data?.gallery) {
                setGallery(data.gallery);
            } else {
                setGallery(apartmentData[selectedApt].images.filter(x => x)); // Fallback
            }
            if (data?.tour360Url) {
                setTourUrl(data.tour360Url);
            } else {
                setTourUrl('');
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setLoading(true);
        setToast({ message: 'Subiendo imágenes...', type: 'success' });

        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const url = await uploadImage(file);
                uploadedUrls.push(url);
            }

            const newGallery = [...gallery, ...uploadedUrls].filter((x: string) => x);
            setGallery(newGallery);
            await updateContent(`apartment_${selectedApt}`, 'gallery', newGallery);
            setToast({ message: 'Imágenes subidas y guardadas', type: 'success' });
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error('Upload error:', error);
            setToast({ message: 'Error al subir imágenes', type: 'error' });
        } finally {
            setLoading(false);
            if (e.target) e.target.value = ''; // clear input
        }
    };

    const removeImage = async (index: number) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta foto?')) return;
        setLoading(true);
        try {
            const newGallery = gallery.filter((_, i) => i !== index);
            setGallery(newGallery);
            await updateContent(`apartment_${selectedApt}`, 'gallery', newGallery);
            setToast({ message: 'Imagen eliminada', type: 'success' });
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al eliminar', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const moveUp = async (index: number) => {
        if (index === 0) return;
        setLoading(true);
        const newGallery = [...gallery];
        [newGallery[index - 1], newGallery[index]] = [newGallery[index], newGallery[index - 1]];
        setGallery(newGallery);
        await updateContent(`apartment_${selectedApt}`, 'gallery', newGallery);
        setLoading(false);
        window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
    };

    const moveDown = async (index: number) => {
        if (index === gallery.length - 1) return;
        setLoading(true);
        const newGallery = [...gallery];
        [newGallery[index], newGallery[index + 1]] = [newGallery[index + 1], newGallery[index]];
        setGallery(newGallery);
        await updateContent(`apartment_${selectedApt}`, 'gallery', newGallery);
        setLoading(false);
        window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
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

            <div className="mb-10">
                <h3 className="font-ui tracking-widest text-sm text-sage mb-2">GALERÍA</h3>
                <h2 className="text-2xl font-script text-forest">Gestión de Apartamentos</h2>
                <p className="text-gray-400 text-xs mt-2">
                    Administra las fotos y los tours 360 de cada apartamento. La primera foto será la principal que se muestra en la web.
                </p>
            </div>

            {/* Apartment Selector */}
            <div className="flex gap-2 overflow-x-auto pb-6 mb-6 border-b border-gray-100">
                {Object.keys(apartmentData).map((key) => (
                    <button
                        key={key}
                        onClick={() => setSelectedApt(key as ApartmentKey)}
                        className={`px-6 py-3 rounded-lg text-xs font-bold tracking-widest whitespace-nowrap transition-colors ${selectedApt === key
                            ? 'bg-[#10595a] text-white'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        {apartmentData[key as ApartmentKey].name.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {/* Tour 360 Setup */}
                <div className="mb-10 bg-gray-50 border border-gray-100 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-xs font-bold text-gray-500 tracking-widest">TOUR VIRTUAL 360º (YOUTUBE/KUULA/MATTERPORT)</label>
                        <span className="bg-sage/10 text-sage text-[10px] px-2 py-1 rounded font-bold">OPCIONAL</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="url"
                            value={tourUrl}
                            onChange={(e) => setTourUrl(e.target.value)}
                            placeholder="Ej: https://kuula.co/share/..."
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#10595a] text-gray-700"
                        />
                        <button
                            onClick={async () => {
                                await updateContent(`apartment_${selectedApt}`, 'tour360Url', tourUrl);
                                setToast({ message: 'Tour guardado', type: 'success' });
                            }}
                            className="bg-[#10595a] text-white px-8 py-3 rounded-lg text-xs font-bold tracking-widest hover:bg-[#0c4445] transition-colors whitespace-nowrap shadow-sm"
                        >
                            GUARDAR URL
                        </button>
                        <button
                            onClick={async () => {
                                setTourUrl('');
                                await updateContent(`apartment_${selectedApt}`, 'tour360Url', '');
                                setToast({ message: 'Tour ocultado', type: 'success' });
                            }}
                            className="bg-gray-200 text-gray-600 px-6 py-3 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors shadow-sm"
                            title="Borrar y Ocultar Tour"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-3">
                        Pegar la URL pública del visor. Si lo dejas en blanco, el botón no aparecerá en la web del departamento.
                    </p>
                </div>

                {/* Info Text */}
                <p className="text-xs text-sage mb-6 font-bold flex items-center gap-2">
                    <CheckCircle size={16} /> Editando fotos de: <span className="uppercase text-forest">{apartmentData[selectedApt].name}</span>
                </p>

                {/* Photos Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {/* Upload New Card */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center h-48 bg-gray-50 hover:bg-gray-100 hover:border-forest transition-colors group relative cursor-pointer">
                        <Plus size={40} className="text-gray-400 group-hover:text-forest transition-colors mb-2" />
                        <span className="text-xs font-bold tracking-widest text-gray-500 group-hover:text-forest">AGREGAR FOTOS</span>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleUpload}
                            disabled={loading}
                        />
                    </div>

                    {/* Existing Images */}
                    {gallery.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm h-48">
                            <img width={800} height={600} src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />

                            {/* Badges / Indicators */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">
                                    {index === 0 ? 'PRINCIPAL' : `#${index + 1}`}
                                </span>
                                {index >= 1 && index <= 3 && (
                                    <span className="bg-sage/90 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">
                                        GRILLA
                                    </span>
                                )}
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                {index !== 0 && (
                                    <button
                                        onClick={() => moveUp(index)}
                                        className="bg-white text-forest p-1.5 rounded-full hover:bg-forest hover:text-white transition-colors shadow-sm"
                                        title="Mover arriba"
                                    >
                                        <ChevronUp size={20} />
                                    </button>
                                )}

                                <button
                                    onClick={() => removeImage(index)}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                    title="Eliminar foto"
                                >
                                    <Trash2 size={20} />
                                </button>

                                {index !== gallery.length - 1 && (
                                    <button
                                        onClick={() => moveDown(index)}
                                        className="bg-white text-forest p-1.5 rounded-full hover:bg-forest hover:text-white transition-colors shadow-sm"
                                        title="Mover abajo"
                                    >
                                        <ChevronDown size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {gallery.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl mt-6">
                        No hay fotos en esta galería. Comienza subiendo algunas haciendo clic en "AGREGAR FOTOS".
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminApartments;
