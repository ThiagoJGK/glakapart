'use client';
import React from 'react';
import { motion } from 'framer-motion';

export const SeasonSummer: React.FC = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">

            {/* 1. THE SUN (Astro Rey) */}
            <motion.div
                variants={{
                    hidden: { opacity: 0, scale: 0.5 },
                    visible: { opacity: 0, scale: 0.5 },
                    hover: { opacity: 1, scale: 1.1, transition: { duration: 0.5 } }
                }}
                className="absolute top-[-10%] right-[-10%] w-48 h-48 origin-center z-0"
                style={{ willChange: 'transform, opacity' }}
            >
                {/* Core Sun */}
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-sm opacity-90 animate-pulse-slow"></div>
                {/* Outer Glows */}
                <div className="absolute -inset-10 bg-orange-400/50 rounded-full blur-2xl"></div>
                <div className="absolute -inset-20 bg-yellow-300/30 rounded-full blur-3xl"></div>

                {/* Lens Flares (Rotating Light Rays) */}
                <div className="absolute inset-0 animate-[spin_30s_linear_infinite]" style={{ willChange: 'transform' }}>
                    <div className="absolute top-1/2 left-[-50%] right-[-50%] h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent transform -translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-[-20%] right-[-20%] h-[4px] bg-gradient-to-r from-transparent via-yellow-200/50 to-transparent transform -translate-y-1/2 rotate-45"></div>
                    <div className="absolute top-1/2 left-[-30%] right-[-30%] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-y-1/2 -rotate-45"></div>
                </div>
            </motion.div>

            {/* Fauna removed as requested by user */}


            {/* 3. 3D WATER WAVES (Olas Realistas Fluídas) */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden z-20 mix-blend-overlay">

                {/* Layer 1: Deep Water (Cyan/Dark Blue) */}
                <motion.svg
                    variants={{
                        hidden: { opacity: 0, y: "120%", x: "0%" },
                        visible: { opacity: 0, y: "120%", x: "0%" },
                        hover: { opacity: 0.9, y: 0, x: ["-50%", "-25%", "0%", "-25%", "-50%"], scaleY: [1, 1.05, 1, 1.05, 1], transition: { opacity: { duration: 1 }, y: { duration: 1 }, x: { repeat: Infinity, duration: 8, ease: "linear" } } }
                    }}
                    viewBox="0 0 1000 300"
                    className="absolute bottom-0 w-[200%] h-full text-cyan-800 fill-current origin-bottom"
                    preserveAspectRatio="none"
                    style={{ willChange: 'transform, opacity' }}
                >
                    <path d="M0,150 C200,50 350,250 500,150 C650,50 800,250 1000,150 L1000,300 L0,300 Z" opacity="0.8" />
                </motion.svg>

                {/* Layer 2: Tropical Water (Cyan vibrant) */}
                <motion.svg
                    variants={{
                        hidden: { opacity: 0, y: "120%", x: "-50%" },
                        visible: { opacity: 0, y: "120%", x: "-50%" },
                        hover: { opacity: 0.9, y: 0, x: ["0%", "-25%", "-50%", "-25%", "0%"], scaleY: [1.1, 0.95, 1.1, 0.95, 1.1], transition: { opacity: { duration: 1 }, y: { duration: 1 }, x: { repeat: Infinity, duration: 6, ease: "linear" } } }
                    }}
                    viewBox="0 0 1000 300"
                    className="absolute bottom-[-10%] w-[200%] h-[90%] text-cyan-500 fill-current origin-bottom"
                    preserveAspectRatio="none"
                    style={{ willChange: 'transform, opacity' }}
                >
                    <path d="M0,120 C150,220 350,20 500,120 C650,220 850,20 1000,120 L1000,300 L0,300 Z" opacity="0.9" />
                </motion.svg>

                {/* Layer 3: Sun Glints on water (Blurred white spots) */}
                <motion.div
                    variants={{
                        hidden: { opacity: 0, x: "-50%" },
                        visible: { opacity: 0, x: "-50%" },
                        hover: { opacity: 1, x: ["0%", "-25%", "-50%", "-25%", "0%"], transition: { opacity: { duration: 1 }, x: { repeat: Infinity, duration: 6, ease: "linear" } } }
                    }}
                    className="absolute bottom-[5%] left-[20%] w-[150%] h-[20%] flex gap-12"
                    style={{ willChange: 'transform, opacity' }}
                >
                    <motion.div variants={{ hidden: { opacity: 0, scaleX: 0.8 }, visible: { opacity: 0, scaleX: 0.8 }, hover: { opacity: [0, 1, 0], scaleX: [0.8, 1.2, 0.8], transition: { repeat: Infinity, duration: 3 } } }} className="w-16 h-2 bg-white/60 blur-[3px] rounded-full"></motion.div>
                    <motion.div variants={{ hidden: { opacity: 0, scaleX: 0.8 }, visible: { opacity: 0, scaleX: 0.8 }, hover: { opacity: [0, 1, 0], scaleX: [0.8, 1.2, 0.8], transition: { repeat: Infinity, duration: 3, delay: 0.3 } } }} className="w-8 h-1 bg-white/70 blur-[2px] rounded-full mt-2"></motion.div>
                    <motion.div variants={{ hidden: { opacity: 0, scaleX: 0.8 }, visible: { opacity: 0, scaleX: 0.8 }, hover: { opacity: [0, 1, 0], scaleX: [0.8, 1.2, 0.8], transition: { repeat: Infinity, duration: 3, delay: 0.7 } } }} className="w-24 h-2 bg-white/50 blur-[4px] rounded-full mt-4"></motion.div>
                    <motion.div variants={{ hidden: { opacity: 0, scaleX: 0.8 }, visible: { opacity: 0, scaleX: 0.8 }, hover: { opacity: [0, 1, 0], scaleX: [0.8, 1.2, 0.8], transition: { repeat: Infinity, duration: 3, delay: 0.15 } } }} className="w-12 h-1 bg-white/80 blur-[2px] rounded-full"></motion.div>
                </motion.div>

                {/* Layer 4: Foam / Surface (White/Light Cyan) */}
                <motion.svg
                    variants={{
                        hidden: { opacity: 0, y: "120%", x: "0%" },
                        visible: { opacity: 0, y: "120%", x: "0%" },
                        hover: { opacity: 0.7, y: 0, x: ["-50%", "-25%", "0%", "-25%", "-50%"], scaleY: [0.95, 1.08, 0.95, 1.08, 0.95], transition: { opacity: { duration: 1 }, y: { duration: 1 }, x: { repeat: Infinity, duration: 4.5, ease: "linear" } } }
                    }}
                    viewBox="0 0 1000 300"
                    className="absolute bottom-[-20%] w-[200%] h-[80%] text-white fill-current origin-bottom"
                    preserveAspectRatio="none"
                    style={{ willChange: 'transform, opacity' }}
                >
                    <path d="M0,100 C250,0 400,200 600,120 C800,40 900,100 1000,50 L1000,300 L0,300 Z" opacity="0.7" />
                </motion.svg>
            </div>
        </div>
    );
};






