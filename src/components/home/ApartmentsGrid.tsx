'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Editable from '../ui/Editable';
import { trackEvent } from '@/services/analytics';

const AUTOPLAY_DELAY = 5000;

const ApartmentsGrid: React.FC = () => {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(1); // Start with middle (Arrebol)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef<number | null>(null);

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
            title: 'Arjé',
            pax: 'Parejas (2 Pax)',
            desc: 'Nuestro rincón más íntimo, frente a la piscina. Ideal para escapadas románticas.',
            img: '',
            bgId: 'home.apartments.arje.bg'
        }
    ];

    const N = apartments.length;

    // --- Auto-play: restart timer after each interaction ---
    const startAutoPlay = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % N);
        }, AUTOPLAY_DELAY);
    }, [N]);

    useEffect(() => {
        startAutoPlay();
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [startAutoPlay]);

    const goTo = (index: number) => {
        setActiveIndex(index);
        startAutoPlay(); // reset timer on manual interaction
    };

    const nextSlide = () => goTo((activeIndex + 1) % N);
    const prevSlide = () => goTo((activeIndex - 1 + N) % N);

    // --- Touch swipe handlers ---
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const delta = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 48) {
            delta > 0 ? nextSlide() : prevSlide();
        }
        touchStartX.current = null;
    };

    // --- Dynamic transform per card ---
    // offset: -1 = left, 0 = center, +1 = right
    const getCardStyle = (index: number): React.CSSProperties => {
        let offset = (index - activeIndex + N) % N;
        if (offset > Math.floor(N / 2)) offset -= N; // normalize: e.g. 2 → -1 for N=3

        const isCenter = offset === 0;
        const isVisible = Math.abs(offset) <= 1;

        if (!isVisible) {
            return {
                transform: `translateX(${offset > 0 ? '130%' : '-130%'}) scale(0.75)`,
                opacity: 0,
                zIndex: 0,
                pointerEvents: 'none',
                transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.35s ease',
            };
        }

        const translateX = offset * 72; // % offset for lateral cards
        const scale = isCenter ? 1 : 0.82;
        const opacity = isCenter ? 1 : 0.65;
        const zIndex = isCenter ? 20 : 10;
        const filter = isCenter ? 'none' : 'blur(0.8px)';
        const boxShadow = isCenter
            ? '0 25px 50px -12px rgba(0,0,0,0.5)'
            : '0 8px 24px -4px rgba(0,0,0,0.3)';

        return {
            transform: `translateX(${translateX}%) scale(${scale})`,
            opacity,
            zIndex,
            filter,
            boxShadow,
            pointerEvents: 'auto',
            transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.45s ease, filter 0.45s ease, box-shadow 0.45s ease',
        };
    };

    return (
        <section id="apartamentos" className="relative mt-20 md:mt-32 mb-20 md:mb-32 overflow-x-clip">
            <div className="container mx-auto px-4 md:px-10 relative z-10">

                {/* Section Title */}
                <div className="text-center mb-10 md:mb-16 space-y-2">
                    <Editable
                        id="home.apartments.badge"
                        defaultValue="Nuestros Espacios"
                        className="font-ui text-[10px] md:text-xs tracking-[0.3em] uppercase bg-[#10595a] text-white px-4 py-2 rounded-full inline-block"
                        label="Insignia Apartamentos"
                    />
                    <h2>
                    <Editable
                        id="home.apartments.title"
                        defaultValue="Descubrí tu Lugar"
                        className="font-script text-4xl md:text-5xl text-forest block"
                        label="Título Apartamentos"
                    />
                    </h2>
                </div>

                {/* MOBILE: Improved Coverflow Carousel */}
                <div
                    className="md:hidden relative h-[500px] w-full flex items-center justify-center"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >

                    {/* Cards container — overflow visible so lateral cards peek in */}
                    <div className="relative w-[78%] max-w-[300px] h-[450px] flex items-center justify-center">
                        {apartments.map((apt, index) => {
                            const isActive = index === activeIndex;
                            const cardStyle = getCardStyle(index);

                            return (
                                <div
                                    key={apt.id}
                                    className="absolute top-0 w-full h-full rounded-[30px] overflow-hidden cursor-pointer"
                                    style={cardStyle}
                                    onClick={() => {
                                        if (isActive) {
                                            trackEvent('apartment_click', { apartment: apt.id, source: 'mobile_carousel' });
                                            router.push(`/apartamentos/${apt.id}`);
                                        } else {
                                            goTo(index);
                                        }
                                    }}
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/10 to-transparent pointer-events-none" />
                                    </div>

                                    {/* Content: name always visible, details slide in on active */}
                                    <div className="absolute bottom-0 left-0 w-full p-6">
                                        <Editable
                                            id={`apartment.${apt.id}.name`}
                                            defaultValue={apt.title}
                                            className="font-script text-4xl text-white mb-1 block"
                                            label="Nombre"
                                        />
                                        <div
                                            style={{
                                                maxHeight: isActive ? '120px' : '0px',
                                                opacity: isActive ? 1 : 0,
                                                overflow: 'hidden',
                                                transition: 'max-height 0.4s ease, opacity 0.35s ease',
                                            }}
                                        >
                                            <div className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-3">
                                                <Editable
                                                    id={`apartment.${apt.id}.capacity`}
                                                    defaultValue={apt.pax}
                                                    className="text-[10px] font-ui font-bold text-white tracking-wider block"
                                                    label="Capacidad"
                                                />
                                            </div>
                                            <button className="font-ui text-[10px] tracking-widest text-white border-b border-white pb-1 block mt-1">
                                                VER DETALLES
                                            </button>
                                        </div>
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
                                <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none"></div>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-10 z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <div className="mb-4">
                                    <Editable id={`apartment.${apt.id}.name`} defaultValue={apt.title} className="font-script text-white text-7xl block mb-2" label="Nombre" />
                                    <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full">
                                        <Editable id={`apartment.${apt.id}.capacity`} defaultValue={apt.pax} className="text-[10px] font-ui font-bold text-white tracking-wider block" label="Capacidad" />
                                    </div>
                                </div>

                                <div className="space-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 h-0 group-hover:h-auto overflow-hidden">
                                    <Editable id={`apartment.${apt.id}.description`} type="textarea" defaultValue={apt.desc} className="text-sm leading-relaxed text-white/90 font-light block line-clamp-3" label="Descripción" />
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
