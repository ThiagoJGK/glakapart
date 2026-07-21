'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    Globe, 
    ChevronDown, 
    ChevronUp, 
    ExternalLink
} from 'lucide-react';
import GeneralBookingForm from '@/components/booking/GeneralBookingForm';
import { trackEvent } from '@/services/analytics';
import { Logo } from '@/components/layout/Logo';
import { getContent } from '@/services/content';

const WHATSAPP_NUMBER = '5491169675050';
const WHATSAPP_DEFAULT_MSG = '¡Hola Glak Apart! 👋 Me contacto desde la sección de enlaces para consultar información y disponibilidad.';

const WhatsAppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 22, className = '' }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className}
    >
        <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.3-.775.978-.952 1.179-.176.2-.351.225-.651.075-.3-.15-1.266-.467-2.41-1.487-.893-.796-1.496-1.78-1.672-2.08-.176-.3-.019-.462.13-.61.136-.135.301-.351.451-.526.15-.175.201-.3.301-.5.1-.2.05-.376-.025-.526-.075-.15-.678-1.632-.929-2.234-.244-.585-.494-.505-.678-.515-.176-.008-.376-.01-.576-.01-.2 0-.526.075-.802.376-.276.3-1.053 1.028-1.053 2.508 0 1.48 1.078 2.908 1.228 3.109.15.2 2.122 3.24 5.141 4.542.717.31 1.277.495 1.713.633.72.228 1.375.201 1.892.12.576-.09 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.128-.276-.201-.577-.351z"/>
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.174L2 22l4.954-1.39A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.634 0-3.144-.45-4.437-1.231l-.318-.192-2.94.825.84-2.868-.21-.334A7.95 7.95 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
    </svg>
);

export default function LinksView() {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [bannerBgUrl, setBannerBgUrl] = useState<string>('');

    useEffect(() => {
        const loadSettings = async () => {
            const data = await getContent('settings');
            if (data) {
                setBannerBgUrl(data.header_links_bg || data.headerBgUrl || data.header_home_bg || '');
            }
        };
        loadSettings();
    }, []);

    const handleWhatsAppClick = () => {
        trackEvent('links_whatsapp_click', { channel: 'cta_direct' });
        const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(WHATSAPP_DEFAULT_MSG)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
    };

    const handleSiteClick = () => {
        trackEvent('links_site_click', { channel: 'cta_direct' });
    };

    const handleToggleCalendar = () => {
        const nextState = !isCalendarOpen;
        setIsCalendarOpen(nextState);
        trackEvent('links_calendar_toggle', { state: nextState ? 'open' : 'closed' });
        if (nextState) {
            setTimeout(() => {
                const el = document.getElementById('links-calendar-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 200);
        }
    };

    return (
        <main className="min-h-screen bg-[#f4f1ea] relative overflow-hidden pt-4 md:pt-10 pb-16 px-4 md:px-8">
            {/* Soft Ambient Background Gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-[#10595a]/10 via-[#10595a]/5 to-transparent rounded-b-full pointer-events-none -z-0" />
            
            <div className="container mx-auto max-w-xl relative z-10">

                {/* Banner Rectangle Header behind Logo */}
                <div className="relative mb-14 md:mb-16">
                    {/* Banner Rectangle */}
                    <div className="w-full h-36 md:h-48 rounded-[2.5rem] overflow-hidden relative shadow-lg border border-white/30 bg-gradient-to-br from-[#0c4445] via-[#10595a] to-[#146c6e]">
                        {bannerBgUrl ? (
                            <div 
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url('${bannerBgUrl}')` }}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0c4445] via-[#10595a] to-[#15797b]" />
                        )}
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#10595a]/80 via-black/30 to-transparent" />

                        {/* Cursive Italic Location text on top of image */}
                        <div className="absolute top-3.5 left-0 w-full text-center z-10 px-4">
                            <span className="font-script italic text-white text-lg md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] tracking-wide">
                                Urdinarrain, Entre Ríos
                            </span>
                        </div>
                    </div>

                    {/* Logo sitting on banner cleanly without outline rings */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#10595a] p-2 shadow-xl flex items-center justify-center border border-white/20">
                            <Logo className="w-20 h-20 md:w-28 md:h-28 text-white" />
                        </div>
                    </div>
                </div>

                {/* Tagline Subtitle Badge */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex justify-center mb-6"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/90 border border-[#10595a]/15 text-[#10595a] text-[11px] md:text-xs font-bold tracking-[0.2em] uppercase shadow-xs">
                        Acceso Directo & Reservas
                    </span>
                </motion.div>

                {/* 3 Main CTA Cards - Perfect Homogeneity in Height & Action Pill Width */}
                <div className="flex flex-col gap-3.5 mb-6">
                    
                    {/* CARD 1: Contacto WhatsApp */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                    >
                        <button
                            onClick={handleWhatsAppClick}
                            className="w-full h-[88px] px-4 md:px-5 rounded-[2.5rem] bg-gradient-to-r from-[#25D366] via-[#1ebd5d] to-[#128C7E] text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-between text-left group border border-white/25"
                        >
                            <div className="flex items-center gap-3 pl-1">
                                <div className="p-2.5 bg-white/20 backdrop-blur-md text-white rounded-2xl shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                                    <WhatsAppIcon size={22} />
                                </div>
                                <div>
                                    <h2 className="text-sm md:text-base font-bold text-white font-ui tracking-wide leading-tight">
                                        Contacto WhatsApp
                                    </h2>
                                    <p className="text-[11px] md:text-xs text-white/90 font-light leading-tight">
                                        Respuesta inmediata y atención directa
                                    </p>
                                </div>
                            </div>

                            <div className="shrink-0 ml-2 pr-1">
                                <span className="w-[108px] h-[34px] flex items-center justify-center gap-1 rounded-full bg-white/20 backdrop-blur-md text-[10.5px] font-bold tracking-wider uppercase text-white shadow-xs group-hover:bg-white group-hover:text-[#128C7E] transition-colors">
                                    Chat <ExternalLink className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </button>
                    </motion.div>

                    {/* CARD 2: Visitá Nuestra Página (Institutional Light Green Background #9dd1a6) */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Link
                            href="/"
                            onClick={handleSiteClick}
                            className="w-full h-[88px] px-4 md:px-5 rounded-[2.5rem] bg-gradient-to-r from-[#9dd1a6] via-[#a3d5ad] to-[#88c592] text-[#10595a] shadow-lg hover:shadow-2xl hover:opacity-95 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-between text-left group border border-[#10595a]/20"
                        >
                            <div className="flex items-center gap-3 pl-1">
                                <div className="p-2.5 bg-[#10595a] text-white rounded-2xl shrink-0 group-hover:scale-105 transition-all shadow-sm">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm md:text-base font-bold font-ui tracking-wide text-[#10595a] leading-tight">
                                        Visitá Nuestra Página
                                    </h2>
                                    <p className="text-[11px] md:text-xs text-[#10595a]/80 font-medium leading-tight">
                                        Apartamentos, parque, piscina y paseos
                                    </p>
                                </div>
                            </div>

                            <div className="shrink-0 ml-2 pr-1">
                                <span className="w-[108px] h-[34px] flex items-center justify-center gap-1 rounded-full bg-[#10595a] text-white text-[10.5px] font-bold tracking-wider uppercase shadow-sm group-hover:bg-[#0c4445] transition-colors">
                                    Ir al Sitio <ExternalLink className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </Link>
                    </motion.div>

                    {/* CARD 3: Consultar Disponibilidad (Desplegable) */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                    >
                        <button
                            onClick={handleToggleCalendar}
                            className={`w-full h-[88px] px-4 md:px-5 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-between text-left group border ${
                                isCalendarOpen 
                                    ? 'bg-[#0c4445] text-white shadow-2xl ring-2 ring-[#c5a880] border-[#c5a880]' 
                                    : 'bg-[#10595a] text-white shadow-lg hover:shadow-2xl border-[#c5a880]/40'
                            }`}
                        >
                            <div className="flex items-center gap-3 pl-1">
                                <div className="p-2.5 bg-[#c5a880]/20 text-[#c5a880] border border-[#c5a880]/40 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-sm md:text-base font-bold text-white font-ui tracking-wide leading-tight">
                                        Consultar Disponibilidad
                                    </h2>
                                    <p className="text-[11px] md:text-xs text-white/80 font-light leading-tight">
                                        Elegir fechas en el calendario
                                    </p>
                                </div>
                            </div>

                            <div className="shrink-0 ml-2 pr-1">
                                <span className="w-[108px] h-[34px] flex items-center justify-center gap-1 rounded-full bg-white/15 text-[10.5px] font-bold tracking-wider uppercase text-white">
                                    {isCalendarOpen ? 'Cerrar' : 'Ver Fechas'}
                                    {isCalendarOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </span>
                            </div>
                        </button>
                    </motion.div>

                </div>

                {/* EXPANDABLE SECTION: GeneralBookingForm is ITS OWN CARD directly! */}
                <AnimatePresence>
                    {isCalendarOpen && (
                        <motion.div
                            id="links-calendar-section"
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="mb-6 pt-1 pb-2"
                        >
                            {/* GeneralBookingForm IS ITS OWN CARD */}
                            <GeneralBookingForm />
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </main>
    );
}
