'use client';
import React from 'react';
import { motion } from 'framer-motion';

export const SeasonWinter: React.FC = () => {
    // Generate arrays for wind trails and mist clouds
    const windTrails = Array.from({ length: 15 }).map((_, i) => ({
        id: `wind-${i}`,
        top: `${10 + Math.random() * 80}%`,
        // Generates from 10% to 90% down the card. 
        // If not showing, I will check the styling of the container to make sure overflow isn't cutting it or its z-index is too low
        height: Math.random() > 0.5 ? 'h-[2px]' : 'h-[3px]',
        width: `${40 + Math.random() * 40}%`,
        delay: Math.random() * 0.5,
        duration: 0.3 + Math.random() * 0.6,
        opacity: 0.5 + Math.random() * 0.5,
    }));

    const mistClouds = Array.from({ length: 4 }).map((_, i) => ({
        id: `mist-${i}`,
        left: `${-20 + Math.random() * 100}%`,
        bottom: `${-10 + Math.random() * 20}%`,
        width: `${40 + Math.random() * 60}%`,
        delay: Math.random() * 0.3,
        duration: 2.0 + Math.random() * 0.5,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">

            {/* 1. THERMAL DROP: Light Nordic Blue Tint */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 0.7, ease: "easeIn" } }
                }}
                className="absolute inset-0 bg-blue-900/40 mix-blend-overlay z-0"
            ></motion.div>

            {/* 2. FROZEN VIGNETTE: Glass freezing strictly from the edges (Subtle) */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 1.5 } }
                }}
                className="absolute inset-0 shadow-[inset_0_0_60px_10px_rgba(224,242,254,0.15)] z-10"
            ></motion.div>
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 1, delay: 0.1 } }
                }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(186,230,253,0.15)_120%)] z-10"
            ></motion.div>

            {/* 3. DENSE LOW MIST: Breathing/fog effect settling at the bottom (Subtle) */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 1, delay: 0.3 } }
                }}
                className="absolute inset-x-0 bottom-0 h-1/2 z-20"
            >
                {mistClouds.map(mist => (
                    <motion.div
                        key={mist.id}
                        variants={{
                            hidden: { x: 0, scale: 1, opacity: 0 },
                            visible: { x: 0, scale: 1, opacity: 0 },
                            hover: {
                                x: ["0%", "20%", "0%"],
                                scale: [1, 1.1, 1],
                                opacity: [0, 0.6, 0.3],
                                transition: { duration: mist.duration, repeat: Infinity, ease: "easeInOut" }
                            }
                        }}
                        className="absolute bg-sky-100/10 rounded-full blur-2xl"
                        style={{
                            left: mist.left,
                            bottom: mist.bottom,
                            height: '60%',
                            willChange: 'transform, opacity'
                        }}
                    ></motion.div>
                ))}
            </motion.div>

            {/* 4. BITING WIND TRAILS: Sharp, horizontal, fast lines cutting through */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 0.3 } }
                }}
                className="absolute inset-0 z-30"
            >
                {windTrails.map(trail => (
                    <motion.div
                        key={trail.id}
                        variants={{
                            hidden: { x: "100vw", opacity: 0 },
                            visible: { x: "100vw", opacity: 0 },
                            hover: {
                                x: ["100vw", "-150vw"],
                                opacity: [0, trail.opacity, trail.opacity, 0],
                                transition: { duration: trail.duration, repeat: Infinity, times: [0, 0.1, 0.9, 1], ease: [0.1, 0.7, 1.0, 0.1], repeatDelay: Math.random() + 0.5 }
                            }
                        }}
                        className={`absolute bg-white/70 blur-[1px] rounded-full ${trail.height}`}
                        style={{
                            top: trail.top,
                            width: trail.width,
                            willChange: 'transform, opacity'
                        }}
                    ></motion.div>
                ))}
            </motion.div>
        </div>
    );
};






