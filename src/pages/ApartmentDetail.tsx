'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trackEvent } from '@/services/analytics';
import { apartmentData, ApartmentKey } from '@/data/apartments';
import { getContent } from '@/services/content';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Editable from '@/components/ui/Editable';
import { ChevronLeft, ChevronRight, X, View } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ApartmentDetail: React.FC = () => {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [unifiedGallery, setUnifiedGallery] = useState<string[]>([]);
    const [tourUrl, setTourUrl] = useState<string>('');
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (id) trackEvent('apartment_view', { apartment: id });
    }, [id]);

    // Load unified gallery array from Firestore
    useEffect(() => {
        const loadGallery = async () => {
            if (!id) return;
            const data = await getContent(`apartment_${id}`);
            if (data?.tour360Url) setTourUrl(data.tour360Url);
            if (data?.gallery && Array.isArray(data.gallery)) {
                setUnifiedGallery(data.gallery.filter((url: string) => url));
            }
        };
        loadGallery();
    }, [id]);

    const aptKey = id as ApartmentKey;
    const apt = apartmentData[aptKey];

    if (!apt) return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Apartamento no encontrado. <button onClick={() => router.push('/')} className="text-sage underline">Volver</button></p>
        </div>
    );

    // Use unified gallery if available, otherwise fallback to local apt.images
    const displayGallery = unifiedGallery.length > 0 ? unifiedGallery : apt.images.filter((url: string) => url);
    const displayedCount = 3; // We display 3 in the grid (plus the hero)
    const hiddenCount = Math.max(0, displayGallery.length - (displayedCount + 1)); // -1 for hero

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        document.body.style.overflow = '';
    };

    const prevImage = () => setLightboxIndex(i => (i - 1 + displayGallery.length) % displayGallery.length);
    const nextImage = () => setLightboxIndex(i => (i + 1) % displayGallery.length);

    // Handle keyboard and swipe
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxOpen]);

    return (
        <main className="relative z-30 pt-64 md:pt-[400px] pb-32 animate-fade-in group/main">
            {/* Artistic Hero Image Framed */}
            <div className="container mx-auto px-6 md:px-10 mb-20 text-center relative z-10">
                <div className="relative h-[60vh] md:h-[500px] w-full max-w-6xl mx-auto overflow-hidden rounded-[3rem] shadow-2xl border-[8px] border-white cursor-pointer transform hover:rotate-1 transition-transform duration-500" onClick={() => displayGallery.length > 0 && openLightbox(0)}>
                    {displayGallery[0] && (
                        <img
                            src={displayGallery[0]}
                            alt="Imagen Principal"
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                    <div className="absolute bottom-10 left-0 right-0 text-center text-white pointer-events-none">
                        <div className="pointer-events-auto">
                            <Editable
                                id={`apartment.${aptKey}.tagline`}
                                defaultValue={apt.tagline.toUpperCase()}
                                className="font-ui tracking-[0.4em] text-xs md:text-sm block mb-4"
                                label="Tagline"
                            />
                            <Editable
                                id={`apartment.${aptKey}.name`}
                                defaultValue={apt.name}
                                className="font-script text-8xl md:text-9xl mb-4"
                                label="Nombre Apartamento"
                            />
                            {tourUrl && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowTour(true); }}
                                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/40 text-white px-6 py-3 rounded-full text-xs font-bold tracking-widest hover:bg-white/30 hover:scale-105 transition-all shadow-lg"
                                >
                                    <View size={16} />
                                    VER TOUR 360º
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 md:px-20">
                {/* Main Content Grid */}
                <div className="flex flex-col gap-16 mb-24 relative">

                    {/* Details (Full Width Centered) */}
                    <div className="w-full max-w-5xl mx-auto">
                        <ScrollReveal>
                            <div className="bg-white p-10 rounded-[2rem] shadow-xl border border-white/50 mb-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                    <svg width="100" height="100" viewBox="0 0 100 100" fill="#10595a"><circle cx="50" cy="50" r="50" /></svg>
                                </div>
                                <Editable
                                    id={`apartment.${aptKey}.capacity`}
                                    defaultValue={apt.capacity}
                                    className="text-2xl font-script text-[#10595a] mb-6 block"
                                    label="Capacidad"
                                />
                                <Editable
                                    id={`apartment.${aptKey}.description`}
                                    type="textarea"
                                    defaultValue={apt.description}
                                    className="text-gray-600 leading-8 font-light text-lg block"
                                    label="Descripción"
                                />
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={200}>
                            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-xl border border-white/50">
                                <h3 className="font-ui tracking-[0.2em] text-[#10595a] text-sm font-bold mb-10 text-center uppercase">Comodidades</h3>
                                <ul className="grid grid-cols-2 gap-y-6 gap-x-8">
                                    {[0, 1, 2, 3, 4, 5].map((i) => (
                                        <li key={i} className="flex items-center gap-4 text-sm text-gray-600 group">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#f4f1ea] text-[#10595a] group-hover:bg-[#10595a] group-hover:text-white transition-colors duration-300">
                                                ✓
                                            </span>
                                            <Editable
                                                id={`apartment.${aptKey}.feature.${i}`}
                                                defaultValue={apt.features[i] || "Comodidad extra..."}
                                                className="inline font-light"
                                                label={`Comodidad ${i + 1}`}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>
                    </div>

                </div>

                {/* Artistic Photo Grid (Masonry-like) */}
                <div className="mb-24">
                    <ScrollReveal>
                        <h3 className="font-script text-6xl text-center mb-16 text-[#10595a]">Galería Visual</h3>
                    </ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-[600px]">
                        <ScrollReveal className="h-64 md:h-auto overflow-hidden rounded-[2.5rem] group relative h-full shadow-2xl skew-y-0 transform transition-all duration-500 hover:-translate-y-2 cursor-pointer" onClick={() => displayGallery.length > 1 && openLightbox(1)}>
                            {displayGallery[1] && (
                                <img
                                    src={displayGallery[1]}
                                    alt="Foto Galería 1"
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                        </ScrollReveal>
                        <div className="grid grid-rows-2 gap-6 h-full">
                            <ScrollReveal delay={200} className="overflow-hidden rounded-[2.5rem] group relative h-full shadow-xl transform transition-all duration-500 hover:-translate-y-1 cursor-pointer" onClick={() => displayGallery.length > 2 && openLightbox(2)}>
                                {displayGallery[2] && (
                                    <img
                                        src={displayGallery[2]}
                                        alt="Foto Galería 2"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                )}
                            </ScrollReveal>
                            <ScrollReveal delay={400} className="overflow-hidden rounded-[2.5rem] group relative h-full shadow-xl transform transition-all duration-500 hover:-translate-y-1 cursor-pointer" onClick={() => displayGallery.length > 3 && openLightbox(3)}>
                                {displayGallery[3] && (
                                    <img
                                        src={displayGallery[3]}
                                        alt="Foto Galería 3"
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                )}
                                {/* "+X fotos" overlay */}
                                {hiddenCount > 0 && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <span className="text-white text-2xl font-bold tracking-wider">+{hiddenCount} fotos</span>
                                    </div>
                                )}
                            </ScrollReveal>
                        </div>
                    </div>
                </div>

            </div>

            {/* Navigation to others */}
            <div className="mt-12 relative z-20 container mx-auto px-6 md:px-10">
                <div className="bg-white rounded-[3rem] py-12 px-10 shadow-xl border border-white/50">
                    <div className="text-center">
                        <p className="font-ui text-xs tracking-[0.3em] text-[#10595a] mb-12 opacity-60 uppercase font-bold">Seguir Explorando</p>
                        <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-20 items-center">
                            {Object.keys(apartmentData).map((k) => (
                                k !== id && (
                                    <button
                                        key={k}
                                        onClick={() => router.push(`/apartamentos/${k}`)}
                                        className="group flex flex-col items-center gap-3"
                                    >
                                        <span className="font-script text-5xl md:text-6xl text-[#10595a] group-hover:scale-110 transition-transform duration-300">
                                            {apartmentData[k as ApartmentKey].name}
                                        </span>
                                        <div className="h-px w-12 bg-[#10595a]/30 group-hover:w-full group-hover:bg-[#10595a] transition-all duration-300"></div>
                                    </button>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {lightboxOpen && displayGallery.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
                        onClick={closeLightbox}
                    >
                        {/* Close button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
                        >
                            <X size={32} />
                        </button>

                        {/* Image counter */}
                        <div className="absolute top-6 left-6 text-white/50 text-sm font-ui tracking-widest">
                            {lightboxIndex + 1} / {displayGallery.length}
                        </div>

                        {/* Previous */}
                        {displayGallery.length > 1 && (
                            <button
                                onClick={e => { e.stopPropagation(); prevImage(); }}
                                className="absolute left-4 md:left-8 text-white/50 hover:text-white transition-colors p-2"
                            >
                                <ChevronLeft size={40} />
                            </button>
                        )}

                        {/* Image */}
                        <motion.img
                            key={lightboxIndex}
                            src={displayGallery[lightboxIndex]}
                            alt={`${apt.name} - Foto ${lightboxIndex + 1}`}
                            initial={{ opacity: 0, scale: 0.9, x: 0 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl cursor-grab active:cursor-grabbing"
                            onClick={e => e.stopPropagation()}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.7}
                            onDragEnd={(_, info) => {
                                if (info.offset.x > 50) {
                                    prevImage();
                                } else if (info.offset.x < -50) {
                                    nextImage();
                                }
                            }}
                        />

                        {/* Next */}
                        {displayGallery.length > 1 && (
                            <button
                                onClick={e => { e.stopPropagation(); nextImage(); }}
                                className="absolute right-4 md:right-8 text-white/50 hover:text-white transition-colors p-2"
                            >
                                <ChevronRight size={40} />
                            </button>
                        )}

                        {/* Thumbnail strip */}
                        {displayGallery.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto py-2 px-4">
                                {displayGallery.map((img: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                                        className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === lightboxIndex ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-80'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 360 Tour Modal */}
            <AnimatePresence>
                {showTour && tourUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-2 md:p-8"
                        onClick={() => setShowTour(false)}
                    >
                        <button
                            onClick={() => setShowTour(false)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-[100000] bg-black/50 p-3 rounded-full backdrop-blur-md border border-white/20 shadow-xl"
                        >
                            <X size={24} />
                        </button>

                        <div className="absolute top-4 left-4 text-white font-ui tracking-widest text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2">
                            <View size={16} /> TOUR VIRTUAL 360º
                        </div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full h-[85vh] md:h-[90vh] max-w-7xl bg-gray-900 rounded-3xl overflow-hidden shadow-2xl relative border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <iframe
                                src={tourUrl}
                                className="w-full h-full border-none"
                                allow="fullscreen; vr; accelerometer; gyroscope; autoplay"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
};

export default ApartmentDetail;

