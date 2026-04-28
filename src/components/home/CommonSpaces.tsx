'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Editable from '../ui/Editable';
import { getContent } from '@/services/content';

const DEFAULT_POOL_IMAGES = [
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1572331165267-854da2b10ccc?auto=format&fit=crop&q=80"
];

const CommonSpaces: React.FC = () => {
    const [poolGallery, setPoolGallery] = useState<string[]>([]);
    const [gardenGallery, setGardenGallery] = useState<string[]>([]);
    const [galleriesLoaded, setGalleriesLoaded] = useState(false);
    
    const [poolIndex, setPoolIndex] = useState(0);
    const [gardenIndex, setGardenIndex] = useState(0);

    useEffect(() => {
        const fetchGalleries = async () => {
            const data = await getContent('home');
            if (data) {
                if (data['common.pool.gallery'] && data['common.pool.gallery'].length > 0) {
                    setPoolGallery(data['common.pool.gallery']);
                }
                if (data['common.garden.gallery']) {
                    setGardenGallery(data['common.garden.gallery']);
                }
            }
            setGalleriesLoaded(true);
        };
        fetchGalleries();
    }, []);

    // Auto-play for the pool gallery
    const activePoolGallery = poolGallery.length > 0 ? poolGallery : DEFAULT_POOL_IMAGES;
    
    useEffect(() => {
        if (!galleriesLoaded || activePoolGallery.length <= 1) return;
        const interval = setInterval(() => {
            setPoolIndex((prev) => (prev + 1) % activePoolGallery.length);
        }, 4000); // changes every 4 seconds
        return () => clearInterval(interval);
    }, [galleriesLoaded, activePoolGallery.length]);

    const handleSwipe = (type: 'pool' | 'garden', direction: 1 | -1) => {
        if (type === 'pool') {
            if (activePoolGallery.length <= 1) return;
            setPoolIndex((prev) => {
                let next = prev + direction;
                if (next < 0) next = activePoolGallery.length - 1;
                if (next >= activePoolGallery.length) next = 0;
                return next;
            });
        } else {
            if (gardenGallery.length <= 1) return;
            setGardenIndex((prev) => {
                let next = prev + direction;
                if (next < 0) next = gardenGallery.length - 1;
                if (next >= gardenGallery.length) next = 0;
                return next;
            });
        }
    };
    
    return (
        <section className="py-32 relative">
            {/* Decorative background blob */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-sage/10 rounded-full filter blur-3xl -z-0 translate-y-1/2 -translate-x-1/2"></div>

            <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
                <div className="text-center mb-24 max-w-2xl mx-auto">
                    <Editable id="home.common.badge" defaultValue="ESPACIOS PARA COMPARTIR" className="font-ui text-[10px] md:text-xs tracking-[0.3em] font-bold block mb-6 uppercase bg-transparent border border-sage text-[#10595a] px-4 py-2 rounded-full w-fit mx-auto" label="Badge" />
                    <Editable id="home.common.title" defaultValue="Rincones con Encanto" className="font-script text-5xl md:text-6xl text-forest block mb-8" label="Título Principal" />
                    <Editable
                        id="home.common.desc"
                        type="textarea"
                        defaultValue="Más allá de tu apartamento, disfrutá de nuestras áreas comunes pensadas para el relax. Espacios verdes y recreativos para desconectar."
                        className="text-gray-600 font-light text-xl leading-relaxed block"
                        label="Descripción"
                    />
                </div>

                <div className="flex flex-col gap-16 lg:gap-24">
                    {/* --- POOL CARD (FULL WIDTH & HIGH IMPACT) --- */}
                    <div className="bg-white rounded-[40px] shadow-lg border border-gray-100 group hover:shadow-2xl transition-all duration-700 overflow-hidden flex flex-col lg:flex-row relative">
                        
                        {/* Unique Badge for Desktop */}
                        <div className="hidden lg:flex absolute top-10 right-10 bg-gradient-to-r from-sage to-forest text-white text-xs font-ui font-bold px-6 py-3 rounded-full shadow-lg z-20 items-center gap-2 transform rotate-2 hover:rotate-0 transition-transform">
                            <Star size={14} className="fill-current" />
                            ÚNICO ALOJAMIENTO CON PISCINA
                        </div>

                        {/* Image Gallery */}
                        <div className="h-[400px] lg:h-[600px] w-full lg:w-[55%] relative group/gallery isolate overflow-hidden">
                            <AnimatePresence initial={false} mode="wait">
                                <motion.img
                                    key={poolIndex}
                                    src={activePoolGallery[poolIndex]}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                            
                            {/* Inner Shadow for better text/button contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                            {/* Mobile Unique Badge */}
                            <div className="absolute top-4 left-4 lg:hidden bg-gradient-to-r from-sage to-forest text-white text-[10px] font-ui font-bold px-4 py-2 rounded-full shadow-md z-20 flex items-center gap-1.5">
                                <Star size={12} className="fill-current" />
                                ÚNICO CON PISCINA
                            </div>

                            {activePoolGallery.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={(e) => { e.preventDefault(); handleSwipe('pool', -1); }}
                                        className="p-3 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur transition-all active:scale-90"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); handleSwipe('pool', 1); }}
                                        className="p-3 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur transition-all active:scale-90"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </div>
                            )}

                            {activePoolGallery.length > 1 && (
                                <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2 z-10">
                                    {activePoolGallery.map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`h-1.5 rounded-full transition-all duration-500 ${i === poolIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-8 lg:p-16 space-y-6 lg:w-[45%] flex flex-col justify-center bg-white z-10">
                            <div className="flex flex-col gap-4">
                                <h3 className="font-ui text-xs font-bold text-sage tracking-[0.2em] uppercase">Exclusividad & Relax</h3>
                                <Editable id="home.common.pool.title" defaultValue="Nuestra Piscina" className="font-script text-6xl md:text-7xl text-forest block" label="Título Piscina" />
                            </div>
                            <Editable
                                id="home.common.pool.text"
                                type="textarea"
                                defaultValue="Somos el único hospedaje en Urdinarrain que te ofrece una piscina exclusiva para que te refresques en verano. Rodeada de un parque espectacular, es el lugar perfecto para relajarte bajo el sol entrerriano."
                                className="text-gray-600 leading-relaxed text-lg md:text-xl font-light py-4"
                                label="Texto Piscina"
                            />
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base font-medium text-gray-500 pt-6 border-t border-gray-100">
                                <li className="flex items-center gap-3"><span className="text-forest bg-sage/20 p-1 rounded-full">✓</span> <Editable id="home.common.feat1" defaultValue="Deck solarium" className="inline" label="Feature 1" /></li>
                                <li className="flex items-center gap-3"><span className="text-forest bg-sage/20 p-1 rounded-full">✓</span> <Editable id="home.common.feat2" defaultValue="Toallones de cortesía" className="inline" label="Feature 2" /></li>
                                <li className="flex items-center gap-3"><span className="text-forest bg-sage/20 p-1 rounded-full">✓</span> <Editable id="home.common.feat3" defaultValue="Agua cristalina" className="inline" label="Feature 3" /></li>
                                <li className="flex items-center gap-3"><span className="text-forest bg-sage/20 p-1 rounded-full">✓</span> <Editable id="home.common.feat4" defaultValue="Zona de descanso" className="inline" label="Feature 4" /></li>
                            </ul>
                        </div>
                    </div>

                    {/* --- GARDEN CARD (ALTERNATE LAYOUT) --- */}
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col lg:flex-row-reverse relative">
                        
                        {/* Image Gallery */}
                        <div className="h-[350px] lg:h-[500px] w-full lg:w-[45%] relative group/gallery isolate overflow-hidden">
                            {galleriesLoaded && gardenGallery.length > 0 ? (
                                <AnimatePresence initial={false} mode="wait">
                                    <motion.img
                                        key={gardenIndex}
                                        src={gardenGallery[gardenIndex]}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full object-cover"
                                    />
                                </AnimatePresence>
                            ) : (
                                <Editable
                                    id="home.common.garden.image"
                                    type="image"
                                    defaultValue=""
                                    className="w-full h-full object-cover"
                                    label="Foto Parque"
                                />
                            )}

                            {/* Inner Shadow */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                            {gardenGallery.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={(e) => { e.preventDefault(); handleSwipe('garden', -1); }}
                                        className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur transition-all active:scale-90"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); handleSwipe('garden', 1); }}
                                        className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur transition-all active:scale-90"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}

                            {gardenGallery.length > 1 && (
                                <div className="absolute bottom-6 left-0 w-full flex justify-center gap-1.5 z-10">
                                    {gardenGallery.map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`h-1.5 rounded-full transition-all ${i === gardenIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-8 lg:p-16 space-y-6 lg:w-[55%] flex flex-col justify-center bg-[#f9faf9] z-10">
                            <div className="flex flex-col gap-2">
                                <h3 className="font-ui text-xs font-bold text-sage tracking-widest uppercase">Aire Libre</h3>
                                <Editable id="home.common.garden.title" defaultValue="Parque y Asadores" className="font-script text-5xl md:text-6xl text-forest block" label="Título Parque" />
                            </div>
                            <Editable
                                id="home.common.garden.text"
                                type="textarea"
                                defaultValue="Nuestro extenso parque invita a matear bajo los árboles. Contamos con asadores disponibles para que no falte el tradicional asado en tu estadía."
                                className="text-gray-600 leading-relaxed block text-base md:text-lg"
                                label="Texto Parque"
                            />
                            <ul className="grid grid-cols-2 gap-3 text-sm font-medium text-gray-500 pt-4 border-t border-gray-200">
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.garden.feat1" defaultValue="Parrillas equipadas" className="inline" label="Feature 1" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.garden.feat2" defaultValue="Mesas de jardín" className="inline" label="Feature 2" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.garden.feat3" defaultValue="Iluminación nocturna" className="inline" label="Feature 3" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.garden.feat4" defaultValue="Juegos para chicos" className="inline" label="Feature 4" /></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CommonSpaces;






