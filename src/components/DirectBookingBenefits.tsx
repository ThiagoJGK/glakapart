'use client';
import React from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from './ui/ScrollReveal';
import Editable from './ui/Editable';

// Detailed SVG animations
const AnimatedShield = () => (
    <motion.svg
        width="100%" height="100%"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        className="w-8 h-8 md:w-10 md:h-10 text-[#10595a] group-hover:text-white transition-colors duration-300"
    >
        <motion.path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            initial={{ pathLength: 1 }}
            variants={{
                idle: { pathLength: 1 },
                hover: { pathLength: [0, 1], transition: { duration: 0.8, ease: "easeInOut" } }
            }}
        />
        <motion.path
            d="m9 12 2 2 4-4"
            initial={{ pathLength: 1, scale: 1, opacity: 1 }}
            variants={{
                idle: { pathLength: 1, scale: 1, opacity: 1 },
                hover: { 
                    pathLength: [0, 1], 
                    scale: [0, 1.2, 1],
                    opacity: [0, 1, 1],
                    transition: { duration: 0.5, delay: 0.4, type: "spring" } 
                }
            }}
        />
    </motion.svg>
);

const AnimatedClock = () => (
    <motion.svg
        width="100%" height="100%"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        className="w-8 h-8 md:w-10 md:h-10 text-[#10595a] group-hover:text-white transition-colors duration-300"
        variants={{
            idle: { rotate: 0 },
            hover: { rotate: [0, -10, 10, 0], transition: { duration: 0.6 } }
        }}
    >
        <circle cx="12" cy="12" r="10" />
        <motion.path
            d="M12 6v6l4 2"
            variants={{
                idle: { rotate: 0 },
                hover: { rotate: 360, transition: { duration: 1, ease: "linear" } }
            }}
            style={{ originX: "12px", originY: "12px" }}
        />
    </motion.svg>
);

const AnimatedGift = () => (
    <motion.svg
        width="100%" height="100%"
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
        className="w-8 h-8 md:w-10 md:h-10 text-[#10595a] group-hover:text-white transition-colors duration-300 overflow-visible"
    >
        <motion.rect
            x="3" y="8" width="18" height="4" rx="1"
            variants={{
                idle: { y: 0 },
                hover: { y: -3, transition: { type: "spring", stiffness: 300, damping: 10 } }
            }}
        />
        <motion.path d="M12 8v13" />
        <motion.path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <motion.path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
        
        {/* Confetti Particles */}
        <motion.circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"
            variants={{ idle: { scale: 0, y: 0, x: 0, opacity: 0 }, hover: { scale: [0, 1.5, 0], y: -15, x: -10, opacity: [0, 1, 0], transition: { duration: 0.8, ease: "easeOut" } } }} />
        <motion.circle cx="12" cy="8" r="1.5" fill="currentColor" stroke="none"
            variants={{ idle: { scale: 0, y: 0, x: 0, opacity: 0 }, hover: { scale: [0, 1, 0], y: -20, x: 5, opacity: [0, 1, 0], transition: { duration: 0.8, delay: 0.1, ease: "easeOut" } } }} />
        <motion.circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"
            variants={{ idle: { scale: 0, y: 0, x: 0, opacity: 0 }, hover: { scale: [0, 1.5, 0], y: -12, x: 15, opacity: [0, 1, 0], transition: { duration: 0.8, delay: 0.2, ease: "easeOut" } } }} />
    </motion.svg>
);

const benefits = [
    {
        icon: <AnimatedShield />,
        title: "Mejor Precio Garantizado",
        description: "Al reservar directamente en nuestra web, evitás comisiones de plataformas y accedés a la tarifa más baja disponible."
    },
    {
        icon: <AnimatedClock />,
        title: "Late Check-Out Flex",
        description: "Disfrutá más tu último día con nosotros. Flexibilidad de late check-out (sujeto a disponibilidad y solicitud previa)."
    },
    {
        icon: <AnimatedGift />,
        title: "Atención Personalizada",
        description: "Contacto directo y una cálida hospitalidad brindada por sus propios dueños."
    }
];

const DirectBookingBenefits: React.FC = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <ScrollReveal>
                        <Editable
                            id="home.benefits.title"
                            defaultValue="¿Por qué reservar aquí?"
                            className="font-script text-5xl md:text-6xl text-[#10595a] mb-6 block"
                            label="Título Beneficios"
                        />
                        <Editable
                            id="home.benefits.desc"
                            type="textarea"
                            defaultValue="Descubrí las ventajas exclusivas de reservar tu estadía a través de nuestra página oficial. Garantizando siempre la mejor experiencia desde el primer clic."
                            className="text-gray-600 font-light text-lg block"
                            label="Descripción Beneficios"
                        />
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {benefits.map((benefit, index) => (
                        <ScrollReveal key={index} delay={index * 150} className="h-full">
                            <motion.div 
                                initial="idle"
                                whileHover="hover"
                                whileTap="hover"
                                className="h-full group bg-zinc-50 rounded-3xl p-8 hover:bg-[#10595a] transition-all duration-500 shadow-sm hover:shadow-xl text-center flex flex-col items-center cursor-pointer"
                            >
                                <div className="bg-white p-4 rounded-full mb-6 shadow-sm group-hover:bg-[#10595a] transition-colors duration-500 border border-zinc-100 group-hover:border-white/20">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#10595a] group-hover:text-white mb-4 transition-colors duration-300">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 group-hover:text-white/80 font-light text-sm leading-relaxed transition-colors duration-300">
                                    {benefit.description}
                                </p>
                            </motion.div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DirectBookingBenefits;
