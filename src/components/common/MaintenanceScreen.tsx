'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getContent } from '@/services/content';
import { Logo } from '@/components/layout/Logo';

export default function MaintenanceScreen() {
    const [whatsapp, setWhatsapp] = useState('');
    const [bgUrl, setBgUrl] = useState('');
    const [logoSvg, setLogoSvg] = useState('');
    const [logoType, setLogoType] = useState('svg');
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        document.body.classList.add('maintenance-mode');
        return () => document.body.classList.remove('maintenance-mode');
    }, []);

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getContent('settings');
            const home = await getContent('home');
            
            if (settings) {
                setWhatsapp(settings.whatsappNumber || '');
                setLogoSvg(settings.logoSvg || '');
                setLogoType(settings.logoType || 'svg');
                setLogoUrl(settings.logoUrl || '');
            }
            
            // Prioritize the actual home hero image
            let bg = '';
            if (home && home['heroImage.0']) {
                bg = home['heroImage.0'];
            } else if (settings?.header_home_bg) {
                bg = settings.header_home_bg;
            } else if (settings?.headerBgUrl) {
                bg = settings.headerBgUrl;
            }
            setBgUrl(bg);
        };
        fetchSettings();
    }, []);

    const whatsappLink = whatsapp || "https://wa.me/5491169675050";

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#0a2e2f]">
            {/* Background Image with Parallax & Blur */}
            <div 
                className="absolute inset-0 z-0 scale-105"
                style={{
                    backgroundImage: bgUrl ? `url('${bgUrl}')` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(8px) brightness(0.4)',
                }}
            />

            {/* Glowing Orbs for dynamic effect */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-[#10595a]/40 blur-[100px] z-0"
            />
            <motion.div 
                animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] rounded-full bg-[#90c69e]/30 blur-[100px] z-0"
            />

            {/* Content Glassmorphism Card */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center text-center p-8 md:px-24 md:py-12 mx-4 w-[90%] max-w-4xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]"
            >
                {/* Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mb-6"
                >
                    {logoType === 'image' && logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-28 md:w-36 object-contain mx-auto brightness-0 invert opacity-90" />
                    ) : (
                        <div className="w-28 md:w-36 text-white/90 [&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: logoSvg }} />
                    )}
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="font-script text-7xl md:text-9xl text-white mb-4"
                >
                    Volvemos Pronto
                </motion.h1>

                <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="w-16 h-[2px] bg-sage mb-8 rounded-full"
                />

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-sm md:text-base text-gray-200 font-light tracking-wide leading-relaxed mb-8 max-w-sm"
                >
                    Estamos realizando mejoras en nuestra plataforma para ofrecerte una mejor experiencia. El sitio volverá a estar disponible muy pronto.
                </motion.p>

                <motion.a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="group relative px-8 py-4 bg-white hover:bg-gray-100 rounded-full text-forest font-ui text-[10px] md:text-xs font-bold tracking-widest uppercase flex items-center gap-3 overflow-hidden transition-all shadow-lg hover:shadow-xl"
                >
                    <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                    <span>Contactar por WhatsApp</span>
                </motion.a>
            </motion.div>
        </div>
    );
}
