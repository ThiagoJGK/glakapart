'use client';
import React, { useState, useEffect } from 'react';
import { getContent, updateContent } from '@/services/content';
import SingleImageManager from '../shared/SingleImageManager';
import GalleryManager from '../shared/GalleryManager';
import { apartmentData, ApartmentKey } from '@/data/apartments';
import { Toast } from '../../ui/Toast';
import { Image as ImageIcon, Sparkles, Navigation, Layers, Compass, Loader2 } from 'lucide-react';

const SECTIONS = [
    { id: 'inicio', label: 'CARRUSEL INICIO', icon: Sparkles },
    { id: 'cabeceras', label: 'CABECERAS DE PÁGINAS', icon: Navigation },
    { id: 'estaciones', label: 'ESTACIONES DEL AÑO', icon: Layers },
    { id: 'comunes', label: 'ESPACIOS COMUNES', icon: Compass },
    { id: 'apartamentos', label: 'GALERÍAS DE APARTAMENTOS', icon: ImageIcon },
];

export const AdminImages: React.FC = () => {
    const [activeSection, setActiveSection] = useState('inicio');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Dynamic states
    const [homeData, setHomeData] = useState<Record<string, any>>({});
    const [settingsData, setSettingsData] = useState<Record<string, any>>({});
    const [selectedApt, setSelectedApt] = useState<ApartmentKey>('nacarado');
    const [aptGallery, setAptGallery] = useState<string[]>([]);
    const [aptLoading, setAptLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (activeSection === 'apartamentos') {
            loadAptData();
        }
    }, [selectedApt, activeSection]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [home, settings] = await Promise.all([
                getContent('home'),
                getContent('settings'),
            ]);
            setHomeData(home || {});
            setSettingsData(settings || {});
        } catch (error) {
            console.error('Error loading images content:', error);
            showToast('Error al cargar contenido de imágenes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadAptData = async () => {
        setAptLoading(true);
        try {
            const data = await getContent(`apartment_${selectedApt}`);
            if (data?.gallery) {
                setAptGallery(data.gallery);
            } else {
                // Fallback to local default images
                setAptGallery(apartmentData[selectedApt]?.images?.filter((x: string) => x) || []);
            }
        } catch (error) {
            console.error('Error loading apartment gallery:', error);
            showToast('Error al cargar galería del apartamento', 'error');
        } finally {
            setAptLoading(false);
        }
    };

    // --- CAROUSEL SAVE CALLBACK ---
    const handleCarouselChange = async (index: number, originalUrl: string, blurUrl?: string) => {
        try {
            await updateContent('home', `heroImage.${index}`, originalUrl);
            if (blurUrl) {
                await updateContent('home', `heroImage.${index}_blur`, blurUrl);
            }

            setHomeData(prev => ({
                ...prev,
                [`heroImage.${index}`]: originalUrl,
                [`heroImage.${index}_blur`]: blurUrl || prev[`heroImage.${index}_blur`],
            }));

            showToast(`Slide ${index + 1} actualizado correctamente`);
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error(error);
            showToast('Error al guardar imagen del carrusel', 'error');
        }
    };

    // --- PAGE HEADERS SAVE CALLBACK ---
    const handleHeaderChange = async (page: string, originalUrl: string, blurUrl?: string) => {
        try {
            await updateContent('settings', `header_${page}_bg`, originalUrl);
            if (blurUrl) {
                await updateContent('settings', `header_${page}_blur`, blurUrl);
            }

            setSettingsData(prev => ({
                ...prev,
                [`header_${page}_bg`]: originalUrl,
                [`header_${page}_blur`]: blurUrl || prev[`header_${page}_blur`],
            }));

            showToast(`Cabecera de ${page.toUpperCase()} actualizada correctamente`);
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error(error);
            showToast('Error al guardar cabecera', 'error');
        }
    };

    // --- SEASONS SAVE CALLBACK ---
    const handleSeasonChange = async (seasonId: string, originalUrl: string) => {
        try {
            await updateContent('settings', `season_${seasonId}`, originalUrl);

            setSettingsData(prev => ({
                ...prev,
                [`season_${seasonId}`]: originalUrl,
            }));

            showToast(`Estación ${seasonId.toUpperCase()} guardada con éxito`);
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error(error);
            showToast('Error al guardar estación', 'error');
        }
    };

    // --- COMMON SPACES SAVE CALLBACKS ---
    const handleCommonGalleryChange = async (type: 'pool' | 'garden' | 'guest', newImages: string[]) => {
        try {
            const firestoreKey = type === 'pool'
                ? 'common.pool.gallery'
                : type === 'garden'
                ? 'common.garden.gallery'
                : 'home.guests.gallery';

            await updateContent('home', firestoreKey, newImages);

            setHomeData(prev => ({
                ...prev,
                [firestoreKey]: newImages,
            }));

            showToast('Galería de espacios comunes actualizada');
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error(error);
            showToast('Error al guardar imágenes de espacio común', 'error');
        }
    };

    // --- APARTMENTS SAVE CALLBACK ---
    const handleAptGalleryChange = async (newImages: string[]) => {
        try {
            await updateContent(`apartment_${selectedApt}`, 'gallery', newImages);
            setAptGallery(newImages);
            showToast('Galería del apartamento guardada');
            window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE'));
        } catch (error) {
            console.error(error);
            showToast('Error al guardar galería', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <Loader2 className="w-10 h-10 text-sage animate-spin mb-4" />
                <p className="text-xs text-gray-400 tracking-widest uppercase">Cargando fotos...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-6xl">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Sub-navigation Menu (Mobile scrollable, Desktop flex-wrap) */}
            <div className="flex overflow-x-auto gap-2 pb-2 border-b border-gray-200 scrollbar-hide shrink-0 snap-x">
                {SECTIONS.map((sec) => {
                    const Icon = sec.icon;
                    const isActive = activeSection === sec.id;

                    return (
                        <button
                            key={sec.id}
                            onClick={() => setActiveSection(sec.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-bold tracking-widest transition-all snap-start shrink-0 ${isActive
                                ? 'bg-forest text-white shadow'
                                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <Icon size={14} />
                            {sec.label}
                        </button>
                    );
                })}
            </div>

            {/* --- 1. CARRUSEL INICIO --- */}
            {activeSection === 'inicio' && (
                <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 md:p-6 mb-4">
                        <h3 className="font-bold text-gray-700 text-sm tracking-wider uppercase mb-1">Carrusel de Experiencias</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">Carga las fotos gigantes que rotan en la portada de Inicio. Se generará automáticamente una versión difuminada (*blur*) para cargar el fondo de manera instantánea.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[0, 1, 2].map((id) => (
                            <div key={id} className="h-full">
                                <SingleImageManager
                                    imageUrl={homeData[`heroImage.${id}`] || ''}
                                    blurUrl={homeData[`heroImage.${id}_blur`] || ''}
                                    onChange={(img, blur) => handleCarouselChange(id, img, blur)}
                                    label={`Slide ${id + 1}`}
                                    withBlur={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 2. CABECERAS DE PAGINAS --- */}
            {activeSection === 'cabeceras' && (
                <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 md:p-6 mb-4">
                        <h3 className="font-bold text-gray-700 text-sm tracking-wider uppercase mb-1">Fondos de Cabeceras</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">Configura la imagen panorámica de fondo que se visualiza detrás del título en cada una de las secciones principales del sitio.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { id: 'home', label: 'Página de Inicio' },
                            { id: 'gastronomia', label: 'Gastronomía' },
                            { id: 'lugares', label: 'Lugares' },
                            { id: 'eventos', label: 'Eventos' },
                            { id: 'apartamentos', label: 'Apartamentos (Listado)' }
                        ].map((page) => (
                            <div key={page.id} className="h-full">
                                <SingleImageManager
                                    imageUrl={settingsData[`header_${page.id}_bg`] || ''}
                                    blurUrl={settingsData[`header_${page.id}_blur`] || ''}
                                    onChange={(img, blur) => handleHeaderChange(page.id, img, blur)}
                                    label={`Cabecera: ${page.label}`}
                                    withBlur={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 3. ESTACIONES DEL AÑO --- */}
            {activeSection === 'estaciones' && (
                <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 md:p-6 mb-4">
                        <h3 className="font-bold text-gray-700 text-sm tracking-wider uppercase mb-1">Atmósferas de Estaciones</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">Modifica las fotos de fondo que representan las cuatro estaciones climáticas dentro de la agenda de eventos.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { id: 'summer', label: 'Verano' },
                            { id: 'autumn', label: 'Otoño' },
                            { id: 'winter', label: 'Invierno' },
                            { id: 'spring', label: 'Primavera' }
                        ].map((season) => (
                            <div key={season.id} className="h-full">
                                <SingleImageManager
                                    imageUrl={settingsData[`season_${season.id}`] || ''}
                                    onChange={(img) => handleSeasonChange(season.id, img)}
                                    label={`Estación: ${season.label}`}
                                    withBlur={false}
                                    aspectRatio="aspect-[4/3]"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- 4. ESPACIOS COMUNES --- */}
            {activeSection === 'comunes' && (
                <div className="space-y-8">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 md:p-6">
                        <h3 className="font-bold text-gray-700 text-sm tracking-wider uppercase mb-1">Galerías de Instalaciones</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">Organiza las colecciones de fotos para la Piscina, el Parque y los Huéspedes. Arrastra las tarjetas para ordenarlas.</p>
                    </div>

                    <GalleryManager
                        images={homeData['common.pool.gallery'] || []}
                        onChange={(imgs) => handleCommonGalleryChange('pool', imgs)}
                        title="Piscina y Solarium"
                        description="Fotos de la piscina, reposeras y deck de madera."
                        isVertical={false}
                    />

                    <GalleryManager
                        images={homeData['common.garden.gallery'] || []}
                        onChange={(imgs) => handleCommonGalleryChange('garden', imgs)}
                        title="Parque y Parrillas"
                        description="Imágenes del jardín, juegos para niños y asadores."
                        isVertical={false}
                    />

                    <GalleryManager
                        images={homeData['home.guests.gallery'] || []}
                        onChange={(imgs) => handleCommonGalleryChange('guest', imgs)}
                        title="Reseñas de Huéspedes"
                        description="Fotos de visitantes y momentos capturados en el complejo (Se muestra en carrusel móvil compactado a 3 columnas)."
                        isVertical={true}
                    />
                </div>
            )}

            {/* --- 5. GALERÍAS DE APARTAMENTOS --- */}
            {activeSection === 'apartamentos' && (
                <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="font-bold text-gray-700 text-sm tracking-wider uppercase mb-1">Fotos de los Apartamentos</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">Administra el book fotográfico de cada unidad. La primera foto será la portada principal en la web.</p>
                        </div>
                        
                        {/* Selector de Apartamento */}
                        <div className="flex gap-1.5 bg-white p-1 rounded-lg border border-gray-200 shrink-0 select-none">
                            {Object.keys(apartmentData).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setSelectedApt(key as ApartmentKey)}
                                    className={`px-4 py-2 rounded-md text-[10px] font-bold tracking-widest uppercase transition-colors ${selectedApt === key
                                        ? 'bg-forest text-white'
                                        : 'text-gray-500 hover:text-forest hover:bg-gray-50'
                                        }`}
                                >
                                    {apartmentData[key as ApartmentKey].name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={aptLoading ? 'opacity-40 pointer-events-none transition-opacity' : 'transition-opacity'}>
                        <GalleryManager
                            images={aptGallery}
                            onChange={handleAptGalleryChange}
                            title={`Galería de: ${apartmentData[selectedApt].name}`}
                            description="Arrastra las fotos para reordenar. El primer ítem será el banner principal."
                            showCoverIndicator={true}
                            isVertical={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminImages;
