import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { MapPin, Instagram } from 'lucide-react';
import { trackEvent } from '@/services/analytics';

const BEHOLD_URL = "https://feeds.behold.so/jy5tPEeLoFWFo1xciiyA";

interface InstagramPost {
    id: string;
    mediaUrl: string;
    permalink: string;
    caption?: string;
    mediaInput?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
}

const Footer: React.FC = () => {
    const [posts, setPosts] = useState<InstagramPost[]>([]);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await fetch(BEHOLD_URL);
                if (!response.ok) throw new Error('Failed to fetch instagram feed');
                const data = await response.json();
                const feedItems = data.posts || [];
                const mappedPosts = feedItems.slice(0, 6).map((post: any) => ({
                    id: post.id,
                    mediaUrl: (post.mediaType === 'VIDEO' || post.mediaType === 'REEL') && post.thumbnailUrl
                        ? post.thumbnailUrl
                        : post.mediaUrl,
                    permalink: post.permalink,
                    caption: post.prunedCaption || post.caption || ""
                }));
                setPosts(mappedPosts);
            } catch (error) {
                console.warn("Error fetching Behold.so feed.", error);
            }
        };

        fetchFeed();
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="relative mt-auto w-full z-40 bg-[#f4f1ea]">
            
            {/* Pre-footer Instagram Strip */}
            <div className="w-full pt-12 pb-24 px-4 md:px-10">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="font-script text-4xl text-[#10595a]">Seguinos en Instagram</h3>
                        <a
                            href="https://instagram.com/glak_apart"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-2 px-5 py-2 bg-white hover:bg-[#10595a] hover:text-white text-[#10595a] rounded-full transition-all duration-300 shadow-sm border border-[#10595a]/10"
                        >
                            <Instagram className="w-4 h-4" />
                            <span className="text-xs tracking-wider uppercase font-bold">@glak_apart</span>
                        </a>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
                        {posts.map((post) => (
                            <a
                                key={post.id}
                                href={post.permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                            >
                                <img width={400} height={400}
                                    src={post.mediaUrl}
                                    alt={post.caption || "Instagram Post"}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2 text-center">
                                    <Instagram className="w-6 h-6 text-white mb-2 opacity-90" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Wave SVG - Sits on top of the green footer */}
            <div className="relative w-full overflow-hidden leading-[0] z-10">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block h-[60px] md:h-[100px] w-full fill-[#10595a]">
                    <path d="M0,60 C400,150 800,10 1200,60 V120 H0 Z" stroke="none"></path>
                </svg>
            </div>

            {/* Main Footer Content - Forest Background */}
            <div className="w-full bg-[#10595a] text-white relative overflow-hidden mt-[-1px]">
                 
                <button
                    onClick={scrollToTop}
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-[#10595a] hover:bg-[#90c69e] hover:text-[#10595a] w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors duration-300 z-50 border-4 border-[#10595a]"
                    aria-label="Volver arriba"
                >
                    <span className="text-xl font-bold">↑</span>
                </button>

                <div className="container mx-auto px-6 md:px-10 relative z-10 pt-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-center md:text-left">
                        {/* Brand Column */}
                        <div className="space-y-6 flex flex-col items-center md:items-start">
                            <Logo className="w-24 h-auto text-white/90" />
                            <p className="text-white/70 text-sm leading-7 font-light pt-2">
                                Tu refugio natural en Urdinarrain. Diseñado para desconectar del mundo y reconectar con lo esencial.
                            </p>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex flex-col items-center md:items-start">
                            <h4 className="font-ui text-[10px] md:text-xs font-bold tracking-[0.2em] text-white mb-8 uppercase text-center md:text-left">Explorar</h4>
                            <ul className="space-y-4 text-sm font-light text-white/70 flex flex-col items-center md:items-start">
                                <li><Link href="/" className="hover:text-white hover:translate-x-1 transition-all inline-block">Inicio</Link></li>
                                <li><Link href="/gastronomia" className="hover:text-white hover:translate-x-1 transition-all inline-block">Gastronomía</Link></li>
                                <li><Link href="/lugares" className="hover:text-white hover:translate-x-1 transition-all inline-block">Lugares</Link></li>
                                <li><Link href="/eventos" className="hover:text-white hover:translate-x-1 transition-all inline-block">Eventos</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-col items-center md:items-start">
                            <h4 className="font-ui text-[10px] md:text-xs font-bold tracking-[0.2em] text-white mb-8 uppercase text-center md:text-left">Contacto</h4>
                            <ul className="space-y-6 text-sm font-light text-white/70 flex flex-col items-center md:items-start">
                                <li className="flex items-start gap-4">
                                    <MapPin className="w-5 h-5 text-white/70 flex-shrink-0 mt-1" />
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
                                        onClick={() => { trackEvent('whatsapp_click', { location: 'footer' }); }}
                                    >
                                        <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
                                        <span>+54-11-69675050</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="https://instagram.com/glak_apart" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:translate-x-1 transition-transform group">
                                        <Instagram className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                                        <span>@glak_apart</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Encontranos */}
                        <div className="flex flex-col items-center md:items-start">
                            <h4 className="font-ui text-[10px] md:text-xs font-bold tracking-[0.2em] text-white mb-8 uppercase text-center md:text-left">Encontranos</h4>
                            <div className="w-full max-w-[280px]">
                                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10 mb-4 shadow-inner">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3357.621449384342!2d-58.88635179999999!3d-32.69611049999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b045000e3e5bcf%3A0xf49d11b20d215623!2sGlak%20Apart!5e0!3m2!1ses!2sar!4v1766867919706!5m2!1ses!2sar"
                                        className="w-full h-full border-0 filter grayscale-[0.3] hover:grayscale-0 transition-all duration-500"
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Ubicación Glak Apart"
                                    ></iframe>
                                </div>
                                <a
                                    href="https://www.google.com/maps/search/?api=1&query=Glak+Apart+Urdinarrain"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => { trackEvent('location_click', { location: 'footer' }); }}
                                    className="w-full"
                                >
                                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-ui text-[10px] font-bold tracking-widest uppercase transition-colors">
                                        Cómo Llegar
                                    </button>
                                </a>
                            </div>
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
