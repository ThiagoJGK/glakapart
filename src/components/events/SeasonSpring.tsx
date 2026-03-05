'use client';
import React from 'react';
import { motion } from 'framer-motion';

export const SeasonSpring: React.FC = () => {
    // Generate fireflies / rising pollen
    const fireflies = Array.from({ length: 10 }).map((_, i) => ({
        id: `firefly-${i}`,
        left: `${Math.random() * 100}%`,
        bottom: `${-10 + Math.random() * 20}%`,
        delay: Math.random() * 0.4,
        duration: 2.5 + Math.random() * 1.5,
        size: Math.random() > 0.5 ? 'w-1.5 h-1.5' : 'w-2 h-2',
        color: ['bg-yellow-200', 'bg-lime-200', 'bg-white', 'bg-pink-200'][Math.floor(Math.random() * 4)],
    }));



    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">

            {/* 1. SPRING LIGHT: Warm pastel bloom overlay */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 1 } }
                }}
                className="absolute inset-0 bg-gradient-to-tr from-lime-300/20 via-rose-300/10 to-transparent mix-blend-overlay z-0"
            ></motion.div>

            {/* Morning Sun Glow */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 1 } }
                }}
                className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl z-0"
            ></motion.div>

            {/* 2. RISING POLLEN (Anti-gravity) */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 1, delay: 0.3 } }
                }}
                className="absolute inset-0 z-10"
            >
                {fireflies.map(f => (
                    <motion.div
                        key={f.id}
                        variants={{
                            hidden: { x: 0, y: "0vh", scale: 0.5, opacity: 0 },
                            visible: { x: 0, y: "0vh", scale: 0.5, opacity: 0 },
                            hover: {
                                x: [0, 15, -25, 10],
                                y: ["0vh", "-20vh", "-80vh", "-110vh"],
                                scale: [0.5, 1, 0.8, 0.5],
                                opacity: [0, 1, 0.8, 0],
                                transition: { duration: f.duration, repeat: Infinity, ease: "easeInOut", repeatDelay: Math.random() + 0.5 }
                            }
                        }}
                        className={`absolute ${f.size} ${f.color} rounded-full blur-[1px] shadow-[0_0_8px_rgba(255,255,255,0.8)]`}
                        style={{
                            left: f.left,
                            bottom: f.bottom,
                            willChange: 'transform, opacity'
                        }}
                    ></motion.div>
                ))}
            </motion.div>



        </div>
    );
};






