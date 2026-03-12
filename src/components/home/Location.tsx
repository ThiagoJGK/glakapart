'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Editable from '../ui/Editable';

import { track } from '@vercel/analytics/react';
import { trackEvent } from '@/services/analytics';

const Location: React.FC = () => {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            {/* Background Blob - Large soft sage shape */}
            <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-sage/5 rounded-full filter blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 md:px-10 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Text Content */}
                    <div
                        className="w-full lg:w-5/12 text-center lg:text-left space-y-8"
                    >
                        <div>
                            <Editable
                                id="home.location.badge"
                                defaultValue="Ubicación"
                                className="font-ui text-[10px] md:text-xs tracking-[0.25em] bg-transparent border border-sage text-[#10595a] px-4 py-2 rounded-full w-fit uppercase font-bold mb-4 block mx-auto lg:mx-0"
                                label="Insignia Ubicación"
                            />
                            <Editable
                                id="home.location.title"
                                defaultValue="Encuéntranos"
                                className="font-script text-5xl md:text-7xl text-forest mb-6 block text-center lg:text-left"
                                label="Título Ubicación"
                            />
                            <div className="w-16 h-px bg-sage/30 mx-auto lg:mx-0 mb-6"></div>
                            <Editable
                                id="home.location.desc"
                                type="textarea"
                                defaultValue="Estamos ubicados en el corazón de <strong>Urdinarrain</strong>, una zona tranquila ideal para descansar. A pasos de todo lo que necesitás, pero con la privacidad y el silencio que buscás para tu estadía."
                                className="font-light text-gray-600 text-lg leading-relaxed block text-center lg:text-left"
                                label="Descripción Ubicación"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-4 text-gray-500 font-light text-center lg:text-left">
                                <span className="p-3 bg-sage/10 rounded-full text-sage text-xl">📍</span>
                                <div>
                                    <p className="uppercase text-[10px] md:text-xs tracking-widest font-bold text-[#10595a]">Dirección</p>
                                    <p className="text-lg">Salta 435, Urdinarrain</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center lg:justify-start">
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=Glak+Apart+Urdinarrain"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => { track('View Location', { location: 'Location Map Button' }); trackEvent('location_click'); }}
                            >
                                {/* Note: Ideally specific Google Maps link, using generic search link fallback in iframe for now */}
                                <button className="px-8 py-4 border bg-[#10595a] text-white hover:bg-forest transition-all duration-300 rounded-full font-ui text-xs font-bold tracking-widest uppercase">
                                    CÓMO LLEGAR
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* Map Card */}
                    <div
                        className="w-full lg:w-7/12 relative"
                    >
                        {/* Decorative 'Polaroid' Style Container */}
                        <div className="relative bg-white p-3 md:p-4 shadow-2xl rounded-2xl md:rounded-[2rem] transform transition-transform duration-500 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)]">
                            <div className="relative w-full aspect-[4/3] md:aspect-video overflow-hidden rounded-xl md:rounded-[1.5rem] border border-gray-100">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3357.621449384342!2d-58.88635179999999!3d-32.69611049999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b045000e3e5bcf%3A0xf49d11b20d215623!2sGlak%20Apart!5e0!3m2!1ses!2sar!4v1766867919706!5m2!1ses!2sar"
                                    className="absolute top-0 left-0 w-full h-full border-0 filter grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Ubicación Glak Apart"
                                ></iframe>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -left-6 bg-forest text-white py-4 px-8 rounded-tr-3xl rounded-bl-3xl shadow-lg shadow-forest/20 hidden md:block">
                                <p className="font-ui text-xs tracking-[0.2em] uppercase font-bold">Entre Ríos</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Location;






