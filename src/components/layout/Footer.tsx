import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { MapPin } from 'lucide-react';

import { track } from '@vercel/analytics/react';
import { trackEvent } from '@/services/analytics';

const Footer: React.FC = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="relative mt-auto w-full z-40">
            {/* Wave SVG - Sits on top of the footer */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform -translate-y-full z-10">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-[60px] md:h-[100px] w-full fill-[#10595a]">
                    {/* Cubic Bezier Wave: Down-Up-FlatBottom */}
                    <path d="M0,60 C400,150 800,10 1200,60 V120 H0 Z" stroke="none"></path>
                </svg>
            </div>

            {/* Scroll to Top Button - Positioned to overlap wave and content */}
            <button
                onClick={scrollToTop}
                className="absolute top-2 md:top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-[#10595a] hover:bg-sage hover:text-white w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors duration-300 z-50 border-4 border-white"
                aria-label="Volver arriba"
            >
                <span className="text-xl font-bold">↑</span>
            </button>

            {/* Main Footer Content - Forest Background (Hardcoded Hex to guarantee opacity) */}
            <div className="w-full bg-[#10595a] text-white relative overflow-hidden mt-[-1px]">

                <div className="container mx-auto px-10 relative z-10 pt-10">
                    <div className="grid md:grid-cols-3 gap-12 lg:gap-20 mb-16 text-center md:text-left">
                        {/* Brand Column */}
                        <div className="col-span-1 md:col-span-1 space-y-6 flex flex-col items-center md:items-start">
                            {/* Small Logo from Component */}
                            <Logo className="w-24 h-auto text-white/90" />

                            <p className="text-white/70 text-sm leading-7 font-light pt-2">
                                Tu refugio natural en Urdinarrain. Diseñado para desconectar del mundo y reconectar con lo esencial.
                            </p>
                        </div>

                        {/* Navigation Links */}
                        <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start">
                            <h4 className="font-ui text-[10px] md:text-xs font-bold tracking-[0.2em] text-white mb-8 uppercase text-center md:text-left">Explorar</h4>
                            <ul className="space-y-4 text-sm font-light text-white/70 flex flex-col items-center md:items-start">
                                <li><Link href="/" className="hover:text-white hover:translate-x-1 transition-all inline-block">Inicio</Link></li>
                                <li><Link href="/gastronomia" className="hover:text-white hover:translate-x-1 transition-all inline-block">Gastronomía</Link></li>
                                <li><Link href="/lugares" className="hover:text-white hover:translate-x-1 transition-all inline-block">Lugares</Link></li>
                                <li><Link href="/eventos" className="hover:text-white hover:translate-x-1 transition-all inline-block">Eventos</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="col-span-1 md:col-span-1 flex flex-col items-center md:items-start">
                            <h4 className="font-ui text-[10px] md:text-xs font-bold tracking-[0.2em] text-white mb-8 uppercase text-center md:text-left">Contacto</h4>
                            <ul className="space-y-6 text-sm font-light text-white/70 flex flex-col items-center md:items-start">
                                <li className="flex items-start gap-4">
                                    <MapPin className="w-6 h-6 text-white/70" />
                                    <div className="text-center md:text-left">
                                        <p className="text-white">Urdinarrain, Entre Ríos, Argentina</p>
                                    </div>
                                </li>
                                <li>
                                    <a
                                        href="https://wa.me/5491169675050"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 hover:translate-x-1 transition-transform group"
                                        onClick={() => { track('WhatsApp Contact', { location: 'Footer' }); trackEvent('whatsapp_click', { location: 'footer' }); }}
                                    >
                                        <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                                        <span>+54-11-69675050</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="https://instagram.com/glak_apart" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:translate-x-1 transition-transform group">
                                        <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                        <span>@glak_apart</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col justify-center items-center gap-4 text-xs text-white/40 font-light pb-10">
                        <p className="text-center">&copy; {new Date().getFullYear()} Glak Apart. Todos los derechos reservados.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;





