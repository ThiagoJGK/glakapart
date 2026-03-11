'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { uploadImage } from '@/services/images';
import { Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Toast } from '../ui/Toast';

const SEASONS = [
    { id: 'summer', label: 'Verano' },
    { id: 'autumn', label: 'Otoño' },
    { id: 'winter', label: 'Invierno' },
    { id: 'spring', label: 'Primavera' }
];

const AdminSeasons: React.FC = () => {
    const [seasonImages, setSeasonImages] = useState<Record<string, string>>({});
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
            const newSettings: Record<string, string> = {
                season_summer: data.season_summer || '',
                season_autumn: data.season_autumn || '',
                season_winter: data.season_winter || '',
                season_spring: data.season_spring || ''
            };
            setSeasonImages(newSettings);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        try {
            const updates = SEASONS.map(season =>
                updateContent('settings', `season_${season.id}`, seasonImages[`season_${season.id}`] || '')
            );

            await Promise.all(updates);

            setToast({ message: 'Imágenes de estaciones guardadas con éxito', type: 'success' });
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error(error);
            setToast({ message: 'Error al guardar las imágenes', type: 'error' });
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, seasonId: string) => {
        if (e.target.files && e.target.files[0]) {
            setLoading(true);
            try {
                const url = await uploadImage(e.target.files[0], (status) => {
                    setUploadStatus(status === 'optimizing' ? 'OPTIMIZANDO...' : 'SUBIENDO...');
                });
                setSeasonImages(prev => ({
                    ...prev,
                    [`season_${seasonId}`]: url
                }));
                setToast({ message: 'Imagen subida correctamente. Recuerda guardar.', type: 'success' });
            } catch (error) {
                console.error(error);
                setToast({ message: 'Error al subir la imagen', type: 'error' });
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
                    <Loader2 className="w-10 h-10 text-sage animate-spin mb-4" />
                    <p className="text-xs text-forest font-bold tracking-widest animate-pulse">{uploadStatus}</p>
                </div>
            )}

            <div className="mb-10 text-center max-w-2xl mx-auto">
                <h3 className="font-ui tracking-widest text-lg mb-2 text-forest">ESTACIONES DEL AÑO</h3>
                <p className="text-sm text-gray-500">
                    Modifica las fotos de fondo que representan las cuatro estaciones en la página de Eventos. Estas imágenes crean la atmósfera para cada temporada.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {SEASONS.map((season) => (
                    <div key={season.id} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="aspect-[16/10] bg-gray-50 relative overflow-hidden">
                            {seasonImages[`season_${season.id}`] ? (
                                <img
                                    src={seasonImages[`season_${season.id}`]}
                                    alt={season.label}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                                    <ImageIcon size={32} className="opacity-50" />
                                    <span className="text-xs font-ui tracking-widest uppercase">Sin asignar</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-forest/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                <label className="cursor-pointer bg-white hover:bg-gray-50 text-forest px-6 py-3 rounded-full text-xs font-bold tracking-widest shadow-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                                    <Upload size={16} /> CAMBIAR FOTO
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, season.id)}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="p-5 bg-white border-t border-gray-50 flex items-center justify-between">
                            <h4 className="font-ui text-base tracking-widest text-forest uppercase">{season.label}</h4>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${seasonImages[`season_${season.id}`] ? 'bg-sage/10 text-sage' : 'bg-gray-100 text-gray-400'}`}>
                                {seasonImages[`season_${season.id}`] ? 'Lista' : 'Por defecto'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center border-t border-gray-100 pt-8">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-forest text-white px-10 py-4 rounded-full text-xs font-bold tracking-widest hover:bg-forest/90 hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'PROCESANDO...' : 'GUARDAR TODAS LAS ESTACIONES'}
                </button>
            </div>
        </div>
    );
};

export default AdminSeasons;









