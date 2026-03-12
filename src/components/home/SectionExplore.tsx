'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Editable from '../ui/Editable';

const IconGastronomia = ({ className }: { className?: string }) => (
    <motion.svg viewBox="-4 -4 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <motion.g variants={{
            hidden: { y: 0, x: 0, rotate: 0 },
            visible: { y: [0, -5, 0], x: [0, -2, 0], rotate: [0, -10, 0], transition: { duration: 2, ease: "easeInOut" } },
            hover: { y: [0, -3, 0], x: [0, -1, 0], rotate: [0, -5, 0], transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" } }
        }}>
            <path d="M5 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
            <path d="M9 2v20" />
        </motion.g>
        <motion.g
            variants={{
                hidden: { y: 0, x: 0, rotate: 0 },
                visible: { y: [0, 6, -3, 6, 0], x: [0, 3, -2, 3, 0], rotate: [0, 25, -10, 25, 0], transition: { duration: 2, ease: "easeInOut" } },
                hover: { y: [0, 4, -2, 4, 0], x: [0, 2, -1, 2, 0], rotate: [0, 15, -5, 15, 0], transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" } }
            }}
            style={{ transformOrigin: "19px 22px" }}
        >
            <path d="M19 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
        </motion.g>
    </motion.svg>
);

const IconLugares = ({ className }: { className?: string }) => (
    <motion.svg viewBox="-4 -10 32 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <motion.g variants={{
            hidden: { y: 0 },
            visible: { y: [0, -12, 0, -6, 0], transition: { duration: 2, ease: "easeOut" } },
            hover: { y: [0, -8, 0], transition: { repeat: Infinity, duration: 1.2, ease: "easeOut" } }
        }}>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </motion.g>
        <motion.ellipse
            cx="12" cy="24" rx="4" ry="1.5"
            variants={{
                hidden: { opacity: 0.3, scale: 0.5 },
                visible: { opacity: [0.3, 1, 0.3, 0.8, 0.3], scale: [0.5, 1.5, 0.5, 1.2, 0.5], transition: { duration: 2, ease: "easeOut" } },
                hover: { opacity: [0.3, 0.8, 0.3], scale: [0.5, 1.2, 0.5], transition: { repeat: Infinity, duration: 1.2, ease: "easeOut" } }
            }}
        />
    </motion.svg>
);

const IconEventos = ({ className }: { className?: string }) => (
    <motion.svg viewBox="-4 -4 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <motion.g
            variants={{
                hidden: { rotate: 0 },
                visible: { rotate: [-5, 5, -3, 3, 0], transition: { duration: 2, ease: "easeInOut" } },
                hover: { rotate: [-3, 3, -3], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } }
            }}
            style={{ transformOrigin: "12px 12px" }}
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
            <g transform="translate(6, 9)">
                <motion.g
                    variants={{
                        hidden: { scale: 0.45, fill: "transparent", stroke: "currentColor" },
                        visible: {
                            scale: [0.45, 0.6, 0.45, 0.6, 0.45],
                            fill: ["transparent", "#ffb3b3", "transparent", "#ffb3b3", "transparent"],
                            stroke: ["currentColor", "#ffb3b3", "currentColor", "#ffb3b3", "currentColor"],
                            transition: { duration: 2 }
                        },
                        hover: {
                            scale: [0.45, 0.55, 0.45, 0.55, 0.45],
                            fill: ["transparent", "#ffb3b3", "transparent", "#ffb3b3", "transparent"],
                            stroke: ["currentColor", "#ffb3b3", "currentColor", "#ffb3b3", "currentColor"],
                            transition: { repeat: Infinity, duration: 1.5 }
                        }
                    }}
                    style={{ transformOrigin: "12px 12px" }}
                >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" strokeWidth="2" strokeLinejoin="round" />
                </motion.g>
            </g>
        </motion.g>
    </motion.svg>
);

const sections = [
    {
        to: '/gastronomia',
        icon: IconGastronomia,
        title: 'Gastronomía',
        desc: 'Sabores locales y experiencias culinarias únicas de nuestra tierra.',
        gradient: 'from-amber-600/80 to-orange-700/80',
    },
    {
        to: '/lugares',
        icon: IconLugares,
        title: 'Lugares',
        desc: 'Descubrí los rincones más lindos de la región y sus paisajes.',
        gradient: 'from-emerald-600/80 to-teal-700/80',
    },
    {
        to: '/eventos',
        icon: IconEventos,
        title: 'Eventos',
        desc: 'Actividades y experiencias que te esperan durante tu estadía.',
        gradient: 'from-indigo-600/80 to-violet-700/80',
    },
];

const SectionExplore: React.FC = () => {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-6 md:px-12">
                <div className="text-center mb-12">
                    <Editable
                        id="home.explore.badge"
                        defaultValue="MÁS POR DESCUBRIR"
                        className="font-ui text-[10px] md:text-xs tracking-[0.3em] uppercase bg-transparent border border-sage text-[#10595a] px-4 py-2 rounded-full inline-block mb-3"
                        label="Insignia Explorar"
                    />
                    <Editable
                        id="home.explore.title"
                        defaultValue="Explorá Más"
                        className="font-script text-4xl md:text-5xl text-forest block"
                        label="Título Explorar"
                    />
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: { staggerChildren: 2.0 }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                >
                    {sections.map((sec, i) => (
                        <motion.div
                            key={sec.to}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                            }}
                            whileHover="hover"
                            className="h-full"
                        >
                            <Link
                                href={sec.to}
                                className="group block relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 h-full"
                            >
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${sec.gradient} transition-all duration-500`}></div>

                                {/* Decorative circle */}
                                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full transition-transform duration-700 group-hover:scale-150"></div>

                                <div className="relative p-8 flex flex-col items-center text-center h-full justify-center min-h-[220px]">
                                    <sec.icon className="w-12 h-12 text-white/95 mb-6 transition-transform duration-500" />
                                    <h3 className="font-script text-3xl text-white mb-2">{sec.title}</h3>
                                    <p className="text-white/80 text-sm font-light leading-relaxed max-w-[200px]">{sec.desc}</p>

                                    {/* Arrow indicator */}
                                    <div className="mt-6 flex items-center gap-1 text-white/60 group-hover:text-white transition-all duration-300">
                                        <span className="text-[10px] font-ui tracking-widest uppercase">Explorar</span>
                                        <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default SectionExplore;






