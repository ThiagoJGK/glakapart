'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Editable from '../ui/Editable';
import { trackEvent } from '@/services/analytics';

const ApartmentsGrid: React.FC = () => {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(1); // Start with the middle one (Arrebol/1) by default

    const apartments = [
        {
            id: 'nacarado',
            title: 'Nacarado',
            pax: '3-4 Pasajeros',
            desc: 'Un espacio acogedor con dormitorio independiente, cocina equipada y WiFi. Perfecto para pequeñas familias.',
            img: '',
            bgId: 'home.apartments.nacarado.bg'
        },
        {
            id: 'arrebol',
            title: 'Arrebol',
            pax: '4-5 Pasajeros',
            desc: 'Amplitud y confort con dormitorio independiente y cocina completa. Disfruta de la Smart TV y la conexión.',
            img: '',
            bgId: 'home.apartments.arrebol.bg'
        },
        {
            id: 'arje',
            title: 'Arje',
            pax: 'Parejas (2 Pax)',
            desc: 'Nuestro rincón más íntimo, frente a la piscina. Ideal para escapadas románticas.',
            img: '',
            bgId: 'home.apartments.arje.bg'
        }
    ];

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % apartments.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + apartments.length) % apartments.length);
    };

    // Auto-rotation effect
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 5000); // 5 seconds per slide
        return () => clearInterval(interval);
    }, [apartments.length]);

    const getSlideStyles = (index: number) => {
        if (index === activeIndex) return "z-20 scale-100 opacity-100 translate-x-0";

        // Calculate relative position for cyclic wrapping with 3 items
        // If active is 0: 1 is Next (Right), 2 is Prev (Left)
        // If active is 1: 2 is Next (Right), 0 is Prev (Left)
        // If active is 2: 0 is Next (Right), 1 is Prev (Left)

        const isNext = (activeIndex + 1) % 3 === index;
        const isPrev = (activeIndex - 1 + 3) % 3 === index;

        if (isPrev) return "z-10 scale-90 opacity-40 -translate-x-[15%] grayscale"; // Preview Left
        if (isNext) return "z-10 scale-90 opacity-40 translate-x-[15%] grayscale";  // Preview Right

        return "hidden";
    };

    return (
        <section id="apartamentos" className="relative mt-20 md:mt-32 mb-20 md:mb-32 overflow-x-clip">
            <div className="container mx-auto px-4 md:px-10 relative z-10">

                {/* Section Title */}
                <div className="text-center mb-10 md:mb-16 space-y-2">
                    <span className="font-ui text-[10px] md:text-xs tracking-[0.3em] uppercase bg-[#10595a] text-white px-4 py-2 rounded-full inline-block">Nuestros Espacios</span>
                    <h2 className="font-script text-5xl md:text-6xl text-forest">Descubrí tu Lugar</h2>
                </div>

                {/* MOBILE: Coverflow Carousel */}
                <div className="md:hidden relative h-[500px] w-full flex items-center justify-center">
                    {/* Navigation Buttons */}
                    <button onClick={prevSlide} className="absolute left-2 z-30 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} className="absolute right-2 z-30 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20">
                        <ChevronRight size={24} />
                    </button>

                    <div className="relative w-[85%] max-w-[320px] h-[450px] flex items-center justify-center perspective-[1000px]">
                        {apartments.map((apt, index) => {
                            const styles = getSlideStyles(index);
                            const isActive = index === activeIndex;

                            return (
                                <div
                                    key={apt.id}
                                    className={`absolute top-0 w-full h-full transition-all duration-500 ease-out shadow-2xl rounded-[30px] overflow-hidden ${styles}`}
                                    onClick={() => { if (isActive) { trackEvent('apartment_click', { apartment: apt.id, source: 'mobile_carousel' }); router.push(`/apartamentos/${apt.id}`); } else { index === (activeIndex + 1) % 3 ? nextSlide() : prevSlide(); } }}
                                >
                                    {/* Image */}
                                    <div className="absolute inset-0">
                                        <Editable
                                            id={apt.bgId}
                                            type="image"
                                            defaultValue={apt.img}
                                            className="w-full h-full object-cover"
                                            label={`Fondo ${apt.title}`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/10 to-transparent"></div>
                                    </div>

                                    {/* Content - Only visible fully on Active */}
                                    <div className={`absolute bottom-0 left-0 w-full p-8 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                        <h3 className="font-script text-5xl text-white mb-2">{apt.title}</h3>
                                        <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-3">
                                            <span className="text-[10px] font-ui font-bold text-white tracking-wider">{apt.pax}</span>
                                        </div>
                                        <button className="font-ui text-[10px] tracking-widest text-white border-b border-white pb-1 block mt-2">
                                            VER DETALLES
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* DESKTOP: Grid Layout (Unchanged) */}
                <div className="hidden md:grid md:grid-cols-3 gap-8">
                    {apartments.map((apt, index) => (
                        <div
                            key={apt.id}
                            className={`relative h-[600px] rounded-[40px] overflow-hidden group shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer isolate ${index === 1 ? '-mt-12' : ''}`}
                            onClick={() => { trackEvent('apartment_click', { apartment: apt.id, source: 'desktop_grid' }); router.push(`/apartamentos/${apt.id}`); }}
                        >
                            <div className="absolute inset-0 z-0">
                                <Editable
                                    id={apt.bgId}
                                    type="image"
                                    defaultValue={apt.img}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    label={`Fondo ${apt.title}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-10 z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="mb-4">
                                    <h3 className="font-script text-white text-7xl block mb-2">{apt.title}</h3>
                                    <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full">
                                        <span className="text-[10px] font-ui font-bold text-white tracking-wider">{apt.pax}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 h-0 group-hover:h-auto overflow-hidden">
                                    <p className="text-sm leading-relaxed text-white/90 font-light block line-clamp-3">
                                        {apt.desc}
                                    </p>
                                    <button className="font-ui text-[10px] tracking-widest text-white border-b border-white pb-1 hover:text-sage hover:border-sage transition-all mt-4">
                                        VER DETALLES
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ApartmentsGrid;







