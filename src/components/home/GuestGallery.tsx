'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Editable from '../ui/Editable';

// Placeholder vertical images (9:16 portrait). Will be replaced by admin-uploaded guest photos.
const DUMMY_GUESTS = [
    { id: 1, image: 'https://images.unsplash.com/photo-1544498308-410a6ccb01a1?auto=format&fit=crop&w=500&q=70' },
    { id: 2, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=500&q=70' },
    { id: 3, image: 'https://images.unsplash.com/photo-1506836467174-27f1042aa48c?auto=format&fit=crop&w=500&q=70' },
    { id: 4, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=70' },
    { id: 5, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=70' },
    { id: 6, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=70' },
    { id: 7, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=70' },
];

// --- Arc geometry constants ---
const ARC_ANGLE_STEP = 22;    // degrees between each card
const ARC_RADIUS = 600;       // radius of the virtual cylinder (px)
const CARD_WIDTH_DESKTOP = 220;
const CARD_WIDTH_MOBILE = 140;

/**
 * Calculates the 3D transform for a card in the concave arc.
 * idx: 0-based index of the card
 * total: total number of cards
 * The center card faces forward (rotateY=0), cards fan out symmetrically.
 */
function getCardTransform(idx: number, total: number, isMobile: boolean) {
    const center = (total - 1) / 2;
    const offset = idx - center; // negative = left, positive = right
    const angle = offset * ARC_ANGLE_STEP;
    const radius = isMobile ? ARC_RADIUS * 0.55 : ARC_RADIUS;

    // Position on the arc: translateX from sin, translateZ from cos
    const x = Math.sin((angle * Math.PI) / 180) * radius;
    const z = Math.cos((angle * Math.PI) / 180) * radius - radius; // shift so center z=0

    // Opacity: center=1, edges fade
    const absOffset = Math.abs(offset);
    const opacity = Math.max(0.3, 1 - absOffset * 0.15);

    // Scale: center=1, edges slightly smaller
    const scale = Math.max(0.75, 1 - absOffset * 0.04);

    return {
        transform: `translateX(${x}px) translateZ(${z}px) rotateY(${angle}deg) scale(${scale})`,
        opacity,
        zIndex: total - Math.round(absOffset), // center on top
    };
}

const GuestGallery: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [activeIndex, setActiveIndex] = useState(3); // center card initially

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Slow auto-rotation: shift the "center" every few seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % DUMMY_GUESTS.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    // Memoize transforms so they only recalc on activeIndex or resize
    const cards = useMemo(() => {
        const total = DUMMY_GUESTS.length;
        return DUMMY_GUESTS.map((guest, idx) => {
            // Shift indices so activeIndex is always the center
            const shiftedIdx = ((idx - activeIndex + total) % total);
            // Remap so center is at (total-1)/2
            const displayIdx = shiftedIdx;
            const style = getCardTransform(displayIdx, total, isMobile);
            return { ...guest, style, displayIdx };
        });
    }, [activeIndex, isMobile]);

    const cardWidth = isMobile ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP;
    const cardHeight = cardWidth * (16 / 9); // 9:16 vertical

    return (
        <section className="py-20 md:py-32 relative overflow-hidden bg-[#f4f1ea]">
            {/* Header */}
            <div className="container mx-auto px-4 text-center mb-12 md:mb-20 relative z-20">
                <Editable
                    id="home.guests.badge"
                    defaultValue="Experiencias Reales"
                    className="font-ui text-[10px] md:text-xs tracking-[0.25em] bg-transparent border border-[#10595a]/20 text-[#10595a]/70 px-4 py-2 rounded-full w-fit uppercase font-bold mb-6 mx-auto inline-block"
                    label="Insignia Huéspedes"
                />
                <Editable
                    id="home.guests.title"
                    defaultValue="Nuestros Huéspedes"
                    className="font-script text-5xl md:text-7xl text-[#10595a] mb-4 block"
                    label="Título Huéspedes"
                />
                <Editable
                    id="home.guests.subtitle"
                    defaultValue="Momentos que se viven en Glak Apart"
                    className="font-ui tracking-widest text-sm text-[#10595a]/50 block"
                    label="Subtítulo Huéspedes"
                />
            </div>

            {/* 3D Arc Container */}
            <div
                className="relative w-full flex items-center justify-center"
                style={{
                    perspective: '1200px',
                    perspectiveOrigin: '50% 50%',
                    height: `${cardHeight + 80}px`,
                }}
            >
                {/* The arc scene */}
                <div
                    className="relative"
                    style={{
                        transformStyle: 'preserve-3d',
                        width: `${cardWidth}px`,
                        height: `${cardHeight}px`,
                    }}
                >
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className="absolute top-0 left-0 transition-all duration-700 ease-out cursor-pointer"
                            style={{
                                width: `${cardWidth}px`,
                                height: `${cardHeight}px`,
                                transform: card.style.transform,
                                opacity: card.style.opacity,
                                zIndex: card.style.zIndex,
                                transformStyle: 'preserve-3d',
                            }}
                            onClick={() => setActiveIndex(DUMMY_GUESTS.findIndex(g => g.id === card.id))}
                        >
                            <div className="w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src={card.image}
                                    alt="Huésped de Glak Apart"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    draggable={false}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-8 md:mt-12">
                {DUMMY_GUESTS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            idx === activeIndex
                                ? 'bg-[#10595a] w-6'
                                : 'bg-[#10595a]/20 hover:bg-[#10595a]/40'
                        }`}
                        aria-label={`Ver huésped ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default GuestGallery;
