
import React from 'react';
import GeneralBookingForm from './GeneralBookingForm';
import ScrollReveal from '../ui/ScrollReveal';
import Reviews from '../home/Reviews';

interface GeneralBookingSectionProps {
    id?: string;
}

const GeneralBookingSection: React.FC<GeneralBookingSectionProps> = ({ id }) => {
    return (
        <section id={id} className="relative z-20 py-16 bg-[#f4f1ea] overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent opacity-50"></div>

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row gap-10 items-center">

                    {/* Left Side: Info & Titles */}
                    <div className="lg:w-1/2 text-center lg:text-left space-y-6">
                        <ScrollReveal>
                            <span className="font-ui tracking-[0.3em] uppercase text-gray-400 text-[10px] font-bold">Planifica tu escapada</span>
                            <h2 className="font-script text-5xl md:text-6xl text-forest mt-2 mb-4">Tu estadía comienza aquí</h2>
                            <p className="text-base text-gray-600 font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
                                Disfrutá de Urdinarrain con la comodidad y calidez que mereces. Completá el formulario para iniciar tu reserva.
                            </p>
                        </ScrollReveal>


                    </div>

                    {/* Right Side: Form */}
                    <div className="lg:w-1/2 w-full">
                        <ScrollReveal delay={300}>
                            <GeneralBookingForm />
                        </ScrollReveal>
                    </div>

                </div>

                {/* Integrated Reviews Carousel */}
                <div className="mt-12 border-t border-gray-200/50 pt-8">
                    <div className="text-center mb-6">
                        <span className="font-ui text-sage text-[10px] tracking-[0.2em] uppercase font-bold">Experiencias</span>
                        <h3 className="font-script text-3xl text-forest">Nuestros Huéspedes</h3>
                    </div>
                    <Reviews embedded />
                </div>
            </div>
        </section>
    );
};

export default GeneralBookingSection;






