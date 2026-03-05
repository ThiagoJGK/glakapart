'use client';
import React from 'react';
import { motion } from 'framer-motion';

export const SeasonAutumn: React.FC = () => {
    // Generate arrays for different types of leaves and particles

    // 1. Large foreground leaves (maple-ish) - fast, blurred, heavy
    const largeLeaves = Array.from({ length: 4 }).map((_, i) => ({
        id: `large-${i}`,
        left: `${10 + Math.random() * 80}%`,
        delay: Math.random() * 0.5,
        duration: 3.0 + Math.random() * 1.5,
        scale: 1.2 + Math.random() * 0.5,
        rotationStart: Math.random() * 90,
        color: ['text-[#7f1d1d]', 'text-[#9a3412]', 'text-[#b45309]'][Math.floor(Math.random() * 3)],
    }));

    // 2. Medium midground leaves (oak-ish) - sharp, medium speed, zigzag
    const mediumLeaves = Array.from({ length: 6 }).map((_, i) => ({
        id: `med-${i}`,
        left: `${5 + Math.random() * 90}%`,
        delay: Math.random() * 0.6,
        duration: 3.5 + Math.random() * 1.0,
        scale: 0.7 + Math.random() * 0.3,
        rotationStart: Math.random() * 180,
        color: ['text-[#d97736]', 'text-[#ca8a04]', 'text-[#ea580c]'][Math.floor(Math.random() * 3)],
    }));

    // 3. Small background leaves (generic) - slow, small, spiraling
    const smallLeaves = Array.from({ length: 4 }).map((_, i) => ({
        id: `small-${i}`,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 0.8,
        duration: 4.0 + Math.random() * 1.5,
        scale: 0.3 + Math.random() * 0.2,
        rotationStart: Math.random() * 360,
        color: ['text-[#eab308]', 'text-[#f59e0b]', 'text-[#d97736]'][Math.floor(Math.random() * 3)],
    }));

    // 4. Wind pollen particles
    const pollen = Array.from({ length: 8 }).map((_, i) => ({
        id: `pollen-${i}`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 0.4,
        duration: 2.5 + Math.random() * 1.5,
        size: Math.random() > 0.5 ? 'w-1 h-1' : 'w-2 h-2',
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">

            {/* 1. ATMOSPHERE: Golden Sunset Overlay */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 1 } }
                }}
                className="absolute inset-0 bg-gradient-to-tr from-[#9a3412]/60 via-[#d97736]/30 to-transparent mix-blend-color-burn z-0 pointer-events-none"
            ></motion.div>
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 1 } }
                }}
                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-0 pointer-events-none"
            ></motion.div>

            {/* 2. WIND POLLEN */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 0.7, delay: 0.3 } }
                }}
                className="absolute inset-0 z-10"
            >
                {pollen.map(p => (
                    <motion.div
                        key={p.id}
                        variants={{
                            hidden: { x: 0, y: 0, scale: 0.5, opacity: 0 },
                            visible: { x: 0, y: 0, scale: 0.5, opacity: 0 },
                            hover: {
                                x: ["0vw", "30vw", "90vw", "120vw"],
                                y: [0, -10, -20, 10],
                                scale: [0.5, 1, 0.8, 0.5],
                                opacity: [0, 1, 1, 0],
                                transition: { duration: p.duration, repeat: Infinity, ease: "easeInOut", repeatDelay: Math.random() + 0.5 }
                            }
                        }}
                        className={`absolute ${p.size} bg-yellow-500/80 rounded-full blur-[1px]`}
                        style={{ top: p.top, left: '-10%', willChange: 'transform, opacity' }}
                    ></motion.div>
                ))}
            </motion.div>

            {/* 3. LEAVES CONTAINER */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 0 },
                    hover: { opacity: 1, transition: { duration: 0.5 } }
                }}
                className="absolute inset-0 z-20"
            >

                {/* Background Small Leaves */}
                {smallLeaves.map((leaf) => (
                    <motion.div
                        key={leaf.id}
                        variants={{
                            hidden: { y: -20, rotate: leaf.rotationStart, x: 0, opacity: 0 },
                            visible: { y: -20, rotate: leaf.rotationStart, x: 0, opacity: 0 },
                            hover: {
                                y: [-20, 120, 300],
                                rotate: [leaf.rotationStart, leaf.rotationStart + 180, leaf.rotationStart + 360],
                                x: [0, -40, 30],
                                opacity: [0, 0.6, 0.6, 0],
                                transition: { duration: leaf.duration, repeat: Infinity, ease: "linear", repeatDelay: Math.random() + 0.5 }
                            }
                        }}
                        className={`absolute -top-10 ${leaf.color} fill-current opacity-60 blur-[0.5px]`}
                        style={{ left: leaf.left, scale: leaf.scale, willChange: 'transform, opacity' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M12,2C10.5,2 7,4.5 7,9C7,11.5 8.5,13.5 10,15C10.5,15.5 11,16 11,16.5C11,17 10.5,18.5 10.5,18.5C10.5,18.5 11.5,19 12,19C12.5,19 13.5,18.5 13.5,18.5C13.5,18.5 13,17 13,16.5C13,16 13.5,15.5 14,15C15.5,13.5 17,11.5 17,9C17,4.5 13.5,2 12,2Z" />
                        </svg>
                    </motion.div>
                ))}

                {/* Midground Medium Leaves (Oak style) */}
                {mediumLeaves.map((leaf) => (
                    <motion.div
                        key={leaf.id}
                        variants={{
                            hidden: { y: -30, rotate: leaf.rotationStart, x: 0, opacity: 0 },
                            visible: { y: -30, rotate: leaf.rotationStart, x: 0, opacity: 0 },
                            hover: {
                                y: [-30, 70, 160, 270, 400],
                                rotate: [leaf.rotationStart, leaf.rotationStart + 45, leaf.rotationStart + 0, leaf.rotationStart - 45, leaf.rotationStart + 90],
                                x: [0, 30, -20, 40, -10],
                                opacity: [0, 1, 1, 1, 0],
                                transition: { duration: leaf.duration, repeat: Infinity, ease: "easeInOut", repeatDelay: Math.random() + 0.5 }
                            }
                        }}
                        className={`absolute -top-10 ${leaf.color} fill-current opacity-90 drop-shadow-sm`}
                        style={{ left: leaf.left, scale: leaf.scale, willChange: 'transform, opacity' }}
                    >
                        {/* More jagged "oak" leaf shape */}
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path d="M17,8C17,8 19,8 20,10.5C21,13 18,14 18,14C18,14 19,16 17,18C15.5,19.5 13,19 13,19 L13,22 L11,22 L11,19C11,19 8.5,19.5 7,18C5,16 6,14 6,14C6,14 3,13 4,10.5C5,8 7,8 7,8C7,8 6,5 8.5,4C11,3 12,5 12,5C12,5 13,3 15.5,4C18,5 17,8 17,8Z" />
                        </svg>
                    </motion.div>
                ))}

                {/* Foreground Large Leaves (Maple style) */}
                {largeLeaves.map((leaf) => (
                    <motion.div
                        key={leaf.id}
                        variants={{
                            hidden: { y: -50, rotateX: 0, x: 0, opacity: 0 },
                            visible: { y: -50, rotateX: 0, x: 0, opacity: 0 },
                            hover: {
                                y: [-50, 150, 450],
                                rotateX: [0, 180, 360],
                                x: [0, 10, -15],
                                opacity: [0, 1, 1, 0],
                                transition: { duration: leaf.duration, repeat: Infinity, ease: "easeIn", repeatDelay: Math.random() + 0.5 }
                            }
                        }}
                        className={`absolute -top-16 ${leaf.color} fill-current drop-shadow-md blur-[1px]`}
                        style={{ left: leaf.left, scale: leaf.scale, rotate: `${leaf.rotationStart}deg`, willChange: 'transform, opacity' }}
                    >
                        {/* Maple leaf shape */}
                        <svg width="32" height="32" viewBox="0 0 24 24">
                            <path d="M12,2L15,8L22,9L17,14L18,21L12,17L6,21L7,14L2,9L9,8L12,2Z" strokeLinejoin="miter" />
                        </svg>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};






