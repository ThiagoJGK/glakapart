import React from 'react';
import ScrollReveal from './ui/ScrollReveal';
import Editable from './ui/Editable';
import { Star, Clock, Gift, ShieldCheck } from 'lucide-react';

const benefits = [
    {
        icon: <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-[#10595a] group-hover:text-white transition-colors duration-300" />,
        title: "Mejor Precio Garantizado",
        description: "Al reservar directamente en nuestra web, evitás comisiones de plataformas y accedés a la tarifa más baja disponible."
    },
    {
        icon: <Clock className="w-8 h-8 md:w-10 md:h-10 text-[#10595a] group-hover:text-white transition-colors duration-300" />,
        title: "Late Check-Out Flex",
        description: "Disfrutá más tu último día con nosotros. Flexibilidad de late check-out (sujeto a disponibilidad y solicitud previa)."
    },
    {
        icon: <Gift className="w-8 h-8 md:w-10 md:h-10 text-[#10595a] group-hover:text-white transition-colors duration-300" />,
        title: "Atención Personalizada",
        description: "Contacto directo y una cálida hospitalidad brindada por sus propios dueños."
    }
];

const DirectBookingBenefits: React.FC = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
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
                            <div className="h-full group bg-zinc-50 rounded-3xl p-8 hover:bg-[#10595a] transition-all duration-500 shadow-sm hover:shadow-xl text-center flex flex-col items-center">
                                <div className="bg-white p-4 rounded-full mb-6 shadow-sm group-hover:bg-[#10595a] transition-colors duration-500 border border-zinc-100 group-hover:border-white/20">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#10595a] group-hover:text-white mb-4 transition-colors duration-300">
                                    {benefit.title}
                                </h3>
                                <p className="text-gray-600 group-hover:text-white/80 font-light text-sm leading-relaxed transition-colors duration-300">
                                    {benefit.description}
                                </p>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DirectBookingBenefits;
