'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Editable from '../ui/Editable';
import { getContent } from '@/services/content';

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
                if (data['common.pool.gallery']) {
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

    const handleSwipe = (type: 'pool' | 'garden', direction: 1 | -1) => {
        if (type === 'pool') {
            if (poolGallery.length <= 1) return;
            setPoolIndex((prev) => {
                let next = prev + direction;
                if (next < 0) next = poolGallery.length - 1;
                if (next >= poolGallery.length) next = 0;
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

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="text-center mb-24 max-w-2xl mx-auto">
                    <Editable id="home.common.badge" defaultValue="ESPACIOS PARA COMPARTIR" className="font-ui text-[10px] md:text-xs tracking-[0.3em] font-bold block mb-6 uppercase bg-transparent border border-sage text-[#10595a] px-4 py-2 rounded-full w-fit mx-auto" label="Badge" />
                    <Editable id="home.common.title" defaultValue="Rincones con Encanto" className="font-script text-4xl md:text-5xl text-forest block mb-8" label="Título Principal" />
                    <Editable
                        id="home.common.desc"
                        type="textarea"
                        defaultValue="Más allá de tu apartamento, disfrutá de nuestras áreas comunes pensadas para el relax. Espacios verdes y recreativos para desconectar."
                        className="text-gray-600 font-light text-xl leading-relaxed block"
                        label="Descripción"
                    />
                </div>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Pool Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col">
                        <div className="h-[350px] w-full relative group/gallery isolate">
                            {galleriesLoaded && poolGallery.length > 0 ? (
                                <AnimatePresence initial={false} mode="wait">
                                    <motion.img
                                        key={poolIndex}
                                        src={poolGallery[poolIndex]}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="w-full h-full object-cover"
                                    />
                                </AnimatePresence>
                            ) : (
                                <Editable
                                    id="home.common.pool.image"
                                    type="image"
                                    defaultValue=""
                                    className="w-full h-full object-cover"
                                    label="Foto Piscina"
                                />
                            )}
                            
                            {/* Inner Shadow for better text/button contrast */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                            {poolGallery.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover/gallery:opacity-100 transition-opacity z-10">
                                    <button 
                                        onClick={(e) => { e.preventDefault(); handleSwipe('pool', -1); }}
                                        className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur transition-all active:scale-90"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); handleSwipe('pool', 1); }}
                                        className="p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur transition-all active:scale-90"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}

                            {poolGallery.length > 1 && (
                                <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5 z-10 opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                                    {poolGallery.map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`h-1.5 rounded-full transition-all ${i === poolIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-8 space-y-6 flex-1 flex flex-col">
                            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-2 text-center lg:text-left">
                                <Editable id="home.common.pool.title" defaultValue="Piscina y Solarium" className="font-script text-5xl md:text-6xl text-forest block" label="Título Piscina" />
                                <h3 className="font-ui text-xs font-bold text-sage tracking-widest lg:text-right">RELAX & SOL</h3>
                            </div>
                            <Editable
                                id="home.common.pool.text"
                                type="textarea"
                                defaultValue="Sumergite en nuestra piscina rodeada de verde o disfrutá del sol en nuestras reposeras. El lugar perfecto para las tardes de verano."
                                className="text-gray-600 leading-7 block text-base flex-1"
                                label="Texto Piscina"
                            />
                            <ul className="grid grid-cols-2 gap-3 text-sm font-medium text-gray-500 pt-4 border-t border-gray-100 mt-auto">
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.feat1" defaultValue="Deck de madera" className="inline" label="Feature 1" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.feat2" defaultValue="Toallones incluidos" className="inline" label="Feature 2" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.feat3" defaultValue="Mantenimiento diario" className="inline" label="Feature 3" /></li>
                                <li className="flex items-center gap-2"><span className="text-forest">✓</span> <Editable id="home.common.feat4" defaultValue="Zona de sombra" className="inline" label="Feature 4" /></li>
                            </ul>
                        </div>
                    </div>

                    {/* Garden Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col">
                        <div className="h-[350px] w-full relative group/gallery isolate">
                            {galleriesLoaded && gardenGallery.length > 0 ? (
                                <AnimatePresence initial={false} mode="wait">
                                    <motion.img
                                        key={gardenIndex}
                                        src={gardenGallery[gardenIndex]}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
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

                            {/* Inner Shadow for better text/button contrast */}
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
                                <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5 z-10 opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                                    {gardenGallery.map((_, i) => (
                                        <div 
                                            key={i} 
                                            className={`h-1.5 rounded-full transition-all ${i === gardenIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-8 space-y-6 flex-1 flex flex-col">
                            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-2 text-center lg:text-left">
                                <Editable id="home.common.garden.title" defaultValue="Parque y Asadores" className="font-script text-5xl md:text-6xl text-forest block" label="Título Parque" />
                                <h3 className="font-ui text-xs font-bold text-sage tracking-widest lg:text-right">AIRE LIBRE</h3>
                            </div>
                            <Editable
                                id="home.common.garden.text"
                                type="textarea"
                                defaultValue="Nuestro extenso parque invita a matear bajo los árboles. Contamos con asadores disponibles para que no falte el tradicional asado en tu estadía."
                                className="text-gray-600 leading-7 block text-base flex-1"
                                label="Texto Parque"
                            />
                            <ul className="grid grid-cols-2 gap-3 text-sm font-medium text-gray-500 pt-4 border-t border-gray-100 mt-auto">
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






