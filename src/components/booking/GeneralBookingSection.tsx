
import React from 'react';
import GeneralBookingForm from './GeneralBookingForm';
import ScrollReveal from '../ui/ScrollReveal';


interface GeneralBookingSectionProps {
    id?: string;
}

const GeneralBookingSection: React.FC<GeneralBookingSectionProps> = ({ id }) => {
    return (
        <section id={id} className="relative z-[40] py-16 bg-[#f4f1ea] overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent opacity-50"></div>

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col items-center text-center space-y-12">

                    {/* Top Side: Info & Titles */}
                    <div className="max-w-2xl mx-auto space-y-4">
                        <ScrollReveal>
                            <span className="font-ui tracking-[0.3em] uppercase text-gray-400 text-[10px] font-bold">Planifica tu escapada</span>
                            <h2 className="font-script text-5xl md:text-6xl text-forest mt-2 mb-4">Tu estadía comienza aquí</h2>
                            <p className="text-base text-gray-600 font-light leading-relaxed">
                                Disfrutá de Urdinarrain con la comodidad y calidez que mereces. Completá el formulario para consultar disponibilidad.
                            </p>
                        </ScrollReveal>
                    </div>

                    {/* Bottom Side: Form */}
                    <div className="w-full max-w-4xl">
                        <ScrollReveal delay={300}>
                            <GeneralBookingForm />
                        </ScrollReveal>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default GeneralBookingSection;






