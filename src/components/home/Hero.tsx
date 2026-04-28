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
        <div className={`bg-[#90c69e] shadow-2xl rounded-3xl transform transition-transform hover:scale-[1.02] flex flex-col items-center justify-center overflow-hidden ${isMobile ? 'px-8 py-5 mx-auto' : 'px-6 py-4 md:px-12 md:py-6'}`}>
            <Editable
                id={`hero.slide${currentSlide}.badgeTitle1`}
                defaultValue={slides[currentSlide].badge1}
                className={`font-ui text-black font-light tracking-widest block text-center ${isMobile ? 'text-lg' : 'text-lg md:text-3xl lg:text-4xl'}`}
                label="Título 1"
            />
            <Editable
                id={`hero.slide${currentSlide}.badgeTitle2`}
                defaultValue={slides[currentSlide].badge2}
                className={`font-script text-black block text-center ${isMobile ? 'text-5xl leading-tight pt-1' : 'text-4xl md:text-7xl lg:text-9xl leading-tight md:my-1'}`}
                label="Título Script"
            />
            <Editable
                id={`hero.slide${currentSlide}.badgeTitle3`}
                defaultValue={slides[currentSlide].badge3}
                className={`font-ui text-black font-light tracking-[0.2em] block text-center ${isMobile ? 'text-sm' : 'text-xs md:text-2xl lg:text-3xl'}`}
                label="Título 3"
            />
        </div>
    );

    const renderTextContent = (isMobile = false) => (
        <div className={`space-y-6 ${isMobile ? 'text-center px-4 pb-8' : 'mt-8 inline-block'} `}>
            <Editable
                id={`hero.slide${currentSlide}.mainTitle`}
                defaultValue={slides[currentSlide].mainTitle}
                className={`font-script text-forest block leading-none ${isMobile ? 'text-6xl md:text-7xl mt-4 pb-2' : 'text-3xl md:text-4xl'} `}
                label="Título Principal"
            />

            <div className={isMobile ? 'max-w-xs mx-auto' : 'max-w-sm'}>
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

            {/* --- MOBILE LAYOUT (VERTICAL FLOW) --- */}
            {/* Added pt-44 (was pt-36) to push content below logo as requested */}
            <div className="lg:hidden relative z-10 min-h-screen flex flex-col pt-44">
                {/* 1. Badges Section (Upper-Mid) */}
                <div className="relative z-20 w-full flex justify-center pb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="text-center"
                        >
                            {renderBadges(true)}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 2. White Card Container (Slides Up) */}
                <div className="flex-1 w-[90%] mx-auto bg-[#f4f1ea] rounded-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] relative z-30 mt-auto overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col h-full"
                        >
                            {/* Image Part of Card */}
                            {/* Changed aspect-video to a fixed taller height to prevent cutting off */}
                            <div className="w-full h-[40vh] min-h-[300px] max-h-[380px] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div> {/* Placeholder */}
                                <Editable
                                    id={`home.heroImage.${currentSlide}`}
                                    type="image"
                                    defaultValue={slides[currentSlide].image}
                                    className="w-full h-full object-cover"
                                    label="Imagen Principal"
                                    withBlur={true}
                                />
                                {/* Gradient to blend image into text part - Modified to use fully opaque base color to avoid beige tone mismatches */}
                                <div className="absolute bottom-0 left-0 w-full h-12 bg-[#f4f1ea]"></div>
                                {/* Smoother step above it */}
                                <div className="absolute bottom-12 left-0 w-full h-24 bg-gradient-to-t from-[#f4f1ea] to-transparent"></div>
                            </div>

                            {/* Content Part of Card */}
                            <div className="relative pt-0">
                                {renderTextContent(true)}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Review Badge - Mobile */}
                <div className="relative w-[90%] mx-auto -mt-2 flex justify-end pr-4 z-[100]">
                    {renderReviewBadge(true)}
                </div>
            </div>


            {/* --- DESKTOP LAYOUT (PRESERVED) --- */}
            <div className="hidden lg:block container mx-auto px-6 md:px-10 pt-32 md:pt-48 relative z-10">
                <div className="flex flex-col lg:flex-row items-start gap-12">

                    {/* Left Side: Brand Identity */}
                    <div className="w-full lg:w-2/5 mt-12 md:mt-32 relative z-30 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                className="absolute inset-0"
                            >
                                {/* Brand Titles */}
                                <div className="mb-10 relative z-50 flex flex-col items-start space-y-4 lg:mr-[-100px]">
                                    {renderBadges(false)}
                                </div>

                                {/* Description */}
                                {renderTextContent(false)}
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
                                    </motion.div>
                                </AnimatePresence>
                                <div className="absolute inset-0 bg-white/50 rounded-[3rem] transform translate-x-4 translate-y-4 -z-10 rotate-2"></div>
                                <div className="absolute inset-0 bg-white/20 rounded-[3rem] transform translate-x-8 translate-y-8 -z-20 rotate-3"></div>

                                <div className="absolute bottom-6 right-6 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors border border-white/30"><ChevronLeft size={20} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors border border-white/30"><ChevronRight size={20} /></button>
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
