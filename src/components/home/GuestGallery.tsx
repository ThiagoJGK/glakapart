'use client';
import React, { useRef, useState, useEffect } from 'react';
import Editable from '../ui/Editable';
import { Camera } from 'lucide-react';

const DUMMY_GUESTS = [
    { id: 1, image: 'https://images.unsplash.com/photo-1544498308-410a6ccb01a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 2, image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 3, image: 'https://images.unsplash.com/photo-1506836467174-27f1042aa48c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 4, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 5, image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 6, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 7, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 8, image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
];

const GuestGallery: React.FC = () => {
    // Determine number of copies to ensure seamless loop
    const SCROLL_ITEMS = [...DUMMY_GUESTS, ...DUMMY_GUESTS, ...DUMMY_GUESTS];
    const [isHovered, setIsHovered] = useState(false);

    return (
        <section className="py-24 md:py-32 bg-[#10595a] relative overflow-hidden text-white">
            <div className="container mx-auto px-4 text-center mb-16 relative z-20">
                <Editable
                    id="home.guests.badge"
                    defaultValue="Experiencias Reales"
                    className="font-ui text-[10px] md:text-xs tracking-[0.25em] bg-transparent border border-white/20 text-white/80 px-4 py-2 rounded-full w-fit uppercase font-bold mb-6 mx-auto inline-block"
                    label="Insignia Huéspedes"
                />
                <Editable
                    id="home.guests.title"
                    defaultValue="Nuestros Huéspedes"
                    className="font-script text-5xl md:text-7xl mb-4 block"
                    label="Título Huéspedes"
                />
                <Editable
                    id="home.guests.subtitle"
                    defaultValue="Momentos que se viven en Glak Apart"
                    className="font-ui tracking-widest text-sm text-white/60 block"
                    label="Subtítulo Huéspedes"
                />
            </div>

            {/* 3D Carousel Container */}
            <div 
                className="relative w-full h-[600px] md:h-[700px] overflow-hidden flex items-center"
                style={{
                    perspective: '1200px', // Creates the 3D depth
                    perspectiveOrigin: '50% 50%'
                }}
            >
                {/* Gradient Masks */}
                <div className="absolute top-0 left-0 w-32 md:w-64 h-full z-20 bg-gradient-to-r from-[#10595a] to-transparent pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-32 md:w-64 h-full z-20 bg-gradient-to-l from-[#10595a] to-transparent pointer-events-none"></div>

                {/* Animated Track */}
                <div 
                    className="flex gap-8 px-[50vw] items-center"
                    style={{
                        width: 'max-content',
                        animation: `scroll-gallery ${SCROLL_ITEMS.length * 3}s linear infinite`,
                        animationPlayState: isHovered ? 'paused' : 'running',
                        transformStyle: 'preserve-3d'
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {SCROLL_ITEMS.map((guest, idx) => (
                        <div 
                            key={`${guest.id}-${idx}`}
                            className="relative flex-shrink-0 group cursor-pointer transition-transform duration-500 hover:scale-105"
                            style={{
                                width: '280px',
                                aspectRatio: '9/16',
                                // CSS magic: as the item moves across the viewport (relative to the perspective center), 
                                // using rotateY based on viewport position happens implicitly if we just translate the parent,
                                // BUT a static rotateY facing inward works beautifully for a fixed cylinder effect.
                                // However, a truly dynamic effect uses JS IntersectionObserver or CSS scroll-timeline.
                                // For a pure CSS infinite scroll with 3D, we can use a clever trick: 
                                // The items themselves don't need individual rotateY if the parent just translates. 
                                // Wait, actually standard perspective + translateX naturally bows the ends away! 
                                // We just need to give the items `transformStyle: preserve-3d` and maybe a slight Z offset or rotate Y.
                                // To make it a strong tape effect, we can apply a CSS custom property via JS or just let perspective do the work.
                                // Let's use pure perspective mapping!
                            }}
                        >
                            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 relative z-10 bg-[#0a3839]">
                                <img 
                                    src={guest.image} 
                                    alt="Guest at Glak Apart" 
                                    className="w-full h-full object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-500"
                                    loading="lazy"
                                />
                                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scroll-gallery {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); /* Move 1/3 of the way (one full set) */ }
                }

                /* Add implicit 3D bowing using CSS trick: child items naturally rotate away from center of perspective */
                /* The closer they are to the edges of the screen, the more they skew because of perspective: 1200px */
            `}} />
        </section>
    );
};

export default GuestGallery;
