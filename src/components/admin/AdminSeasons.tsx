'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import { uploadImage } from '@/services/images';
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

            <h3 className="font-ui tracking-widest text-sm mb-8 text-sage">FOTOS DE LAS 4 ESTACIONES</h3>
            <p className="text-sm text-gray-500 mb-8">
                Aquí puedes modificar las fotos de fondo que representan las cuatro estaciones en la página de Eventos.
            </p>

            <div className="space-y-8 mb-12">
                {SEASONS.map((season) => (
                    <div key={season.id} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">{season.label}</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, season.id)}
                            className="w-full border p-3 text-xs bg-white mb-4"
                        />

                        <div>
                            {seasonImages[`season_${season.id}`] ? (
                                <img width={800} height={600}
                                    src={seasonImages[`season_${season.id}`]}
                                    alt={season.label}
                                    className="w-full h-48 object-cover rounded shadow-sm border border-gray-200"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                                    Sin imagen asignada (se usará una por defecto)
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleSave}
                disabled={loading}
                className="bg-forest text-white px-8 py-3 text-xs tracking-widest hover:bg-sage transition-colors w-full disabled:opacity-50"
            >
                {loading ? 'PROCESANDO...' : 'GUARDAR TODAS LAS IMÁGENES'}
            </button>
        </div>
    );
};

export default AdminSeasons;









