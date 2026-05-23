'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import Editable from '../ui/Editable';
import { Logo } from '../layout/Logo';
import { getContent } from '@/services/content';
import { trackEvent } from '@/services/analytics';

const slides = [
    {
        id: 0,
        badge1: "EXPERIENCIA",
        badge2: "natural",
        badge3: "URDINARRAIN",
        mainTitle: "Desenchufate del mundo...",
        description: "Viví la experiencia Glak Apart entre paisaje y naturaleza. Alojamientos turísticos pensados para desconectar y disfrutar con los tuyos.",
        image: ""
    },
    {
        id: 1,
        badge1: "CIELO",
        badge2: "estrellado",
        badge3: "SIN CONTAMINACIÓN",
        mainTitle: "Noches mágicas...",
        description: "Descubrí un cielo profundo y brillante, lejos de las luces de la ciudad. La paz de la noche entrerriana te espera.",
        image: ""
    },
    {
        id: 2,
        badge1: "MAGIA",
        badge2: "atardeceres",
        badge3: "EN EL CAMPO",
        mainTitle: "Colores que enamoran...",
        description: "Cada tarde es un espectáculo único. Relajate y disfrutá de la caída del sol en un entorno rural inigualable.",
        image: ""
    }
];

const Hero: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [promoVideoUrl, setPromoVideoUrl] = useState<string>('');
    const [showVideo, setShowVideo] = useState(false);
    const { isAdmin, isDraftMode } = useAdmin();

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    // Notify Header about current slide background
    useEffect(() => {
        const notifyHeader = async () => {
            // 1. Get default image from static list (fallback)
            let imageUrl = slides[currentSlide].image;
            let blurUrl = ""; // Default empty

            // 2. Try to fetch dynamic overrides
            try {
                const data = await getContent('home');
                const key = `heroImage.${currentSlide}`;
                if (data) {
                    if (data[key]) imageUrl = data[key];
                    if (data[`${key}_blur`]) blurUrl = data[`${key}_blur`];
                    if (data.promoVideoUrl) setPromoVideoUrl(data.promoVideoUrl);
                }
            } catch (e) {
                console.warn("Error fetching hero slide data", e);
            }

            // 3. Dispatch event
            const event = new CustomEvent('HERO_SLIDE_CHANGE', {
                detail: {
                    index: currentSlide,
                    image: imageUrl,
                    blur: blurUrl
                }
            });
            window.dispatchEvent(event);
        };

        notifyHeader();
    }, [currentSlide]);

    useEffect(() => {
        if (isAdmin || isDraftMode) return;

        // The user wants 8 seconds for mobile, 7 seconds for desktop
        const isMobile = window.innerWidth < 1024;
        const intervalTime = isMobile ? 8000 : 7000;

        const timer = setInterval(() => {
            nextSlide();
        }, intervalTime);
        return () => clearInterval(timer);
    }, [isAdmin, isDraftMode]);

    const scrollToApartments = () => {
        trackEvent('hero_cta_click');
        document.getElementById('apartamentos')?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- RENDER HELPERS ---

    const renderBadges = (isMobile = false) => (
        <div className={`transform transition-transform hover:scale-[1.02] flex flex-col items-center justify-center ${isMobile ? 'px-8 py-2 mx-auto' : 'px-2 py-4'}`}>
            <Editable
                id={`hero.slide${currentSlide}.badgeTitle1`}
                defaultValue={slides[currentSlide].badge1}
                className={`font-ui text-white/95 font-light tracking-widest block text-center ${isMobile ? 'text-xs md:text-sm' : 'text-sm md:text-xl lg:text-2xl'}`}
                label="Título 1"
            />
            <Editable
                id={`hero.slide${currentSlide}.badgeTitle2`}
                defaultValue={slides[currentSlide].badge2}
                className={`font-script text-[#E6C687] block text-center ${isMobile ? 'text-4xl md:text-5xl leading-none pt-1 pb-1' : 'text-5xl md:text-7xl lg:text-8xl leading-none md:my-1'}`}
                label="Título Script"
            />
            <Editable
                id={`hero.slide${currentSlide}.badgeTitle3`}
                defaultValue={slides[currentSlide].badge3}
                className={`font-ui text-white/85 font-light tracking-[0.25em] block text-center ${isMobile ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm lg:text-base'}`}
                label="Título 3"
            />
        </div>
    );

    const renderTextContent = (isMobile = false) => (
        <div className={`space-y-6 ${isMobile ? 'text-center px-4 pb-8' : 'mt-8 inline-block'} `}>
            <Editable
                id={`hero.slide${currentSlide}.mainTitle`}
                defaultValue={slides[currentSlide].mainTitle}
                className={`font-script text-forest block leading-none ${isMobile ? 'text-5xl md:text-6xl mt-4 pb-2' : 'text-5xl md:text-6xl'} `}
                label="Título Principal"
            />

            <div className={isMobile ? 'max-w-xs mx-auto' : 'max-w-md'}>
                <Editable
                    id={`hero.slide${currentSlide}.description`}
                    type="textarea"
                    defaultValue={slides[currentSlide].description}
                    className={`text-black font-light leading-relaxed block ${isMobile ? 'text-base' : 'text-lg md:text-xl'} `}
                    label="Descripción"
                />
            </div>

            <div className="pt-2 flex flex-col md:flex-row items-center gap-4">
                <button
                    onClick={scrollToApartments}
                    className={`${isMobile ? 'bg-[#10595a] text-white hover:bg-[#0a3839] rounded-full' : 'btn-black'} w-full md:w-auto text-xs py-4 px-12 transition-transform hover:-translate-y-1 font-ui tracking-widest uppercase shadow-md`}
                >
                    RESERVAR
                </button>
                {promoVideoUrl && (
                    <button
                        onClick={() => setShowVideo(true)}
                        className="btn-white bg-white w-full md:w-auto flex items-center justify-center gap-2 text-xs py-4 px-6 md:px-8 border border-gray-200 transition-transform hover:-translate-y-1 hover:border-[#10595a] hover:text-[#10595a]"
                    >
                        <Play size={14} className="fill-current" />
                        VER EXPERIENCIA
                    </button>
                )}
            </div>
        </div>
    );
    const renderReviewBadge = (isMobile = false) => null;


    return (
        <>
            {/* SEO: Hidden H1 for crawlers */}
            <h1 className="sr-only">Glak Apart — Apartamentos turísticos en Urdinarrain, Entre Ríos</h1>

            {/* --- MOBILE LAYOUT (VERTICAL FLOW WITH IMAGE BACKGROUND CARD) --- */}
            <div className="lg:hidden relative z-10 min-h-[85vh] flex flex-col pt-32">
                <div className="relative z-10 w-[92%] mx-auto min-h-[75vh] flex flex-col rounded-[2.5rem] overflow-hidden border-[8px] border-white shadow-2xl bg-black/10 relative">
                    {/* Background Image Slider */}
                    <AnimatePresence initial={false} mode="popLayout">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 w-full h-full"
                        >
                            <Editable
                                id={`home.heroImage.${currentSlide}`}
                                type="image"
                                defaultValue={slides[currentSlide].image}
                                className="w-full h-full object-cover"
                                label="Imagen Principal"
                                withBlur={true}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Vertical bottom-up gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10"></div>

                    {/* Content Overlayed on Gradient */}
                    <div className="relative z-20 flex flex-col justify-end flex-1 p-6 pb-8 text-center mt-auto">
                        {/* The text badge container sits cleanly at the bottom-center over the gradient */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.5 }}
                                className="w-full mb-3"
                            >
                                {renderBadges(true)}
                            </motion.div>
                        </AnimatePresence>

                        {/* Main Title & Description & CTA */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.5 }}
                                className="w-full space-y-4"
                            >
                                <Editable
                                    id={`hero.slide${currentSlide}.mainTitle`}
                                    defaultValue={slides[currentSlide].mainTitle}
                                    className="font-script text-[#E6C687] block text-4xl md:text-5xl leading-none"
                                    label="Título Principal"
                                />
                                
                                <div className="max-w-xs mx-auto">
                                    <Editable
                                        id={`hero.slide${currentSlide}.description`}
                                        type="textarea"
                                        defaultValue={slides[currentSlide].description}
                                        className="text-white/95 font-light leading-relaxed block text-sm"
                                        label="Descripción"
                                    />
                                </div>

                                <div className="pt-2 flex justify-center gap-3">
                                    <button
                                        onClick={scrollToApartments}
                                        className="bg-[#10595a] text-white hover:bg-[#0a3839] rounded-full w-full max-w-[200px] text-xs py-3 px-8 transition-transform hover:-translate-y-0.5 font-ui tracking-widest uppercase shadow-md"
                                    >
                                        RESERVAR
                                    </button>
                                    {promoVideoUrl && (
                                        <button
                                            onClick={() => setShowVideo(true)}
                                            className="bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full w-full max-w-[200px] flex items-center justify-center gap-2 text-xs py-3 px-4 transition-transform hover:-translate-y-0.5 shadow-md"
                                        >
                                            <Play size={12} className="fill-current" />
                                            VER EXPERIENCIA
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>


            {/* --- DESKTOP LAYOUT --- */}
            <div className="hidden lg:block container mx-auto px-6 md:px-10 pt-32 md:pt-48 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12">

                    {/* Left Side: Brand Identity */}
                    <div className="w-full lg:w-2/5 mt-12 md:mt-20 relative z-30 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="absolute inset-0"
                            >
                                {/* Description */}
                                <div className="mt-8">
                                    {renderTextContent(false)}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Side: Hero Image Frame */}
                    {/* Added relative and high z-index to the wrapper to force child absolute badges on top of everything */}
                    <div className="w-full lg:w-3/5 relative mt-10 lg:mt-0 z-[70]">
                        <div
                            className="w-full h-[500px] md:h-[700px] relative z-[60] perspective-1000 group"
                        >
                            <div className="relative w-full h-full">
                                <AnimatePresence initial={false} mode="popLayout">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, x: 100, rotate: 5, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, rotate: 0, scale: 1, zIndex: 10 }}
                                        exit={{ opacity: 0, x: -100, rotate: -5, scale: 0.9, zIndex: 0 }}
                                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                        className="absolute inset-0 w-full h-full border-[12px] border-white shadow-2xl rounded-[3rem] overflow-hidden"
                                    >
                                        <Editable
                                            id={`home.heroImage.${currentSlide}`}
                                            type="image"
                                            defaultValue={slides[currentSlide].image}
                                            className="w-full h-full object-cover"
                                            label="Imagen Principal"
                                            withBlur={true}
                                        />

                                        {/* Subtle, elegant left-to-right gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent pointer-events-none z-10"></div>

                                        {/* Badge container floats overlayed on the left side of the hero image frame */}
                                        <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-20 max-w-[80%] md:max-w-[70%]">
                                            {renderBadges(false)}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                                <div className="absolute inset-0 bg-white/50 rounded-[3rem] transform translate-x-4 translate-y-4 -z-10 rotate-2"></div>
                                <div className="absolute inset-0 bg-white/20 rounded-[3rem] transform translate-x-8 translate-y-8 -z-20 rotate-3"></div>

                                <div className="absolute bottom-6 right-6 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button aria-label="Ver slide anterior" onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors border border-white/30"><ChevronLeft size={20} /></button>
                                    <button aria-label="Ver slide siguiente" onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors border border-white/30"><ChevronRight size={20} /></button>
                                </div>
                            </div>
                        </div>
                        {renderReviewBadge(false)}
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            <AnimatePresence>
                {showVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4 md:p-10"
                        onClick={() => setShowVideo(false)}
                    >
                        <button
                            onClick={() => setShowVideo(false)}
                            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[100000] bg-black/50 p-2 rounded-full backdrop-blur-md border border-white/20"
                        >
                            <X size={24} />
                        </button>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <iframe
                                src={promoVideoUrl.includes('watch?v=') ? promoVideoUrl.replace('watch?v=', 'embed/') : promoVideoUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Hero;
