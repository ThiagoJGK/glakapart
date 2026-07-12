'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Logo } from '@/components/layout/Logo';
import Editable from '@/components/ui/Editable';
import { getContent } from '@/services/content';
import { getOptimizedCloudinaryUrl } from '@/utils/cloudinaryHelper';


const Header: React.FC = () => {
    const currentPath = usePathname() || '/';
    const router = useRouter();

    const [hoveredPath, setHoveredPath] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [headerSettings, setHeaderSettings] = useState<any>({
        headerBgUrl: "",
        headerBgBlurredUrl: ""
    });

    const [heroSlideBg, setHeroSlideBg] = useState<string>("");
    const [heroSlideBlur, setHeroSlideBlur] = useState<string>("");
    const [isSticky, setIsSticky] = useState(false);
    const [screenWidth, setScreenWidth] = useState(390);

    useEffect(() => {
        // Load settings and listen for updates
        const loadHeaderSettings = async () => {
            const data = await getContent('settings');
            if (data) {
                // Load all settings including new per-section keys
                const settings: any = {
                    headerBgUrl: data.headerBgUrl || "", // Admin-uploaded image required
                    headerBgBlurredUrl: data.headerBgBlurredUrl || ""
                };

                ['home', 'gastronomia', 'lugares', 'eventos', 'apartamentos'].forEach(sec => {
                    settings[`header_${sec}_bg`] = data[`header_${sec}_bg`];
                    settings[`header_${sec}_blur`] = data[`header_${sec}_blur`];
                });

                // Fallback for home if specific one not set
                if (!settings[`header_home_bg`]) settings[`header_home_bg`] = settings.headerBgUrl;
                if (!settings[`header_home_blur`]) settings[`header_home_blur`] = settings.headerBgBlurredUrl;

                setHeaderSettings(settings);
            }
        };

        loadHeaderSettings();

        const updateHandler = () => { loadHeaderSettings(); };
        window.addEventListener('GLAK_CONTENT_UPDATE', updateHandler);

        // Listen for Hero Slide Changes
        const slideHandler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail) {
                if (detail.image) setHeroSlideBg(detail.image);
                if (detail.blur) setHeroSlideBlur(detail.blur);
                else setHeroSlideBlur(""); // Clear blur if none provided
            }
        };
        window.addEventListener('HERO_SLIDE_CHANGE', slideHandler);

        const handleScroll = () => {
            if (window.scrollY > 200) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('GLAK_CONTENT_UPDATE', updateHandler);
            window.removeEventListener('HERO_SLIDE_CHANGE', slideHandler);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Helper to determine current section
    const getCurrentSection = () => {
        if (currentPath.includes('gastronomia')) return 'gastronomia';
        if (currentPath.includes('lugares')) return 'lugares';
        if (currentPath.includes('eventos')) return 'eventos';
        if (currentPath.includes('apartamentos')) return 'apartamentos';
        return 'home';
    };

    const currentSection = getCurrentSection();

    // Logic: 
    // 1. If Section (not home) -> use Section Settings
    // 2. If Home -> use Dynamic Hero Slide State (priority) -> fallback to Home Settings

    let currentBgUrl = headerSettings[`header_${currentSection}_bg`];
    let currentBlurUrl = headerSettings[`header_${currentSection}_blur`];

    if (currentSection === 'home') {
        if (heroSlideBg) currentBgUrl = heroSlideBg;
        // If we have a dynamic blur from hero, use it. Otherwise fallback to home setting.
        if (heroSlideBlur) currentBlurUrl = heroSlideBlur;
        else currentBlurUrl = headerSettings[`header_home_blur`] || headerSettings.headerBgBlurredUrl;
    }

    // Final Safe Fallbacks
    if (!currentBgUrl) currentBgUrl = headerSettings.headerBgUrl;

    // Helper to get BG style for frosted elements
    const getFrostedStyle = () => currentBlurUrl ? {
        backgroundImage: `url('${getOptimizedCloudinaryUrl(currentBlurUrl, 300)}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
    } : { backgroundColor: 'rgba(16, 89, 90, 0.6)' }; // Fallback to semi-transparent green if no blurred image

    // Header styling
    const headerClasses = 'absolute top-0 left-0 w-full';
    const mainPaths = ['/', '/gastronomia', '/lugares', '/eventos', '/apartamentos', '/lugares/arenas-blancas'];
    const useCustomHeader = mainPaths.includes(currentPath) || currentPath.startsWith('/apartamentos/');

    const scrollToReservas = () => {
        setIsMobileMenuOpen(false);
        const section = document.getElementById('reservas');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        } else {
            router.push('/#reservas');
            setTimeout(() => {
                document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    const NavLink = ({ to, label, onClick }: { to?: string; label: string; onClick?: () => void }) => {
        const isActive = to ? currentPath === to : false;

        // Apply frosted style to ALL buttons (active and inactive)
        const frostedStyle = getFrostedStyle();

        const content = (
            <span className={`relative z-10 transition-colors duration-1000 ${isActive ? 'text-white' : 'text-[#093334] group-hover:text-white'} font-medium`}>
                {label}
            </span>
        );

        const className = `relative px-6 py-2 text-xs tracking-[0.15em] uppercase rounded-full transition-all duration-300 group overflow-hidden ${isActive
            ? 'shadow-lg border border-white/10'
            : 'shadow-md border border-white/20'
            }`;

        const inner = (
            <>
                {/* Overlay Layers */}
                {isActive ? (
                    <div className="absolute inset-0 bg-[#10595a]/80 z-0 transition-all duration-500"></div>
                ) : (
                    <>
                        {/* Inactive Base: White translucent */}
                        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-0 transition-all duration-500"></div>

                        {/* Hover Effect: Expanding Circle ("Sticky" Animation) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#10595a] rounded-full scale-0 group-hover:scale-100 z-0 transition-transform duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] will-change-transform"></div>
                    </>
                )}
                {content}
            </>
        );

        if (onClick) {
            return (
                <button
                    onClick={onClick}
                    className={className}
                    style={{ ...frostedStyle, WebkitTapHighlightColor: 'transparent' }}
                    onMouseEnter={() => setHoveredPath(label)}
                    onMouseLeave={() => setHoveredPath(null)}
                >
                    {inner}
                </button>
            );
        }
        return (
            <Link href={to!} className={className} style={frostedStyle} onMouseEnter={() => setHoveredPath(to!)} onMouseLeave={() => setHoveredPath(null)}>
                <div className="w-full h-full flex items-center justify-center">
                    {inner}
                </div>
            </Link>
        );
    };

    const MobileNavLink = ({ to, label, onClick }: { to?: string; label: string; onClick?: () => void }) => {
        const isActive = to ? currentPath === to : false;
        return (
            <div className="overflow-hidden">
                {onClick ? (
                    <button onClick={onClick} className={`block text-5xl font-script text-[#10595a] py-6 w-full text-center transition-transform hover:scale-105 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                        {label}
                    </button>
                ) : (
                    <Link href={to!} onClick={() => setIsMobileMenuOpen(false)} className={`block text-5xl font-script text-[#10595a] py-6 w-full text-center transition-transform hover:scale-105 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                        {label}
                    </Link>
                )}
            </div>
        );
    };

    const StickyNavLink = ({ to, label, onClick }: { to?: string; label: string; onClick?: () => void }) => {
        const isActive = to ? currentPath === to : false;

        return (
            <Link
                href={to!}
                onClick={onClick}
                className={`relative px-4 py-2 text-xs tracking-[0.15em] uppercase rounded-full transition-all duration-300 text-[#10595a] font-medium hover:bg-[#10595a]/10 flex items-center justify-center ${
                    isActive ? 'bg-[#10595a]/10 font-bold' : ''
                }`}
            >
                {label}
            </Link>
        );
    };

    const isHome = currentPath === '/';

    const headerContainerStyle = useCustomHeader ? {
        backgroundColor: 'transparent',
        backgroundImage: `url('${currentBgUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Parallax
        paddingBottom: isHome ? '36rem' : '20rem',
        clipPath: 'url(#curve-gastronomia)',
        WebkitClipPath: 'url(#curve-gastronomia)',
    } : {
        backgroundColor: 'transparent',
        paddingBottom: '1rem'
    };

    const leftWidth = screenWidth / 2 - 80;
    const rightWidth = screenWidth / 2 + 80;
    const pathString = `M 32 64 L ${leftWidth} 64 C ${leftWidth + 25} 64, ${leftWidth + 45.3} 66.7, ${leftWidth + 55.3} 74 A 42 42 0 0 0 ${leftWidth + 104.7} 74 C ${leftWidth + 114.7} 66.7, ${leftWidth + 135} 64, ${rightWidth} 64 L ${screenWidth - 32} 64 A 32 32 0 0 0 ${screenWidth} 32 L ${screenWidth} 0 L 0 0 L 0 32 A 32 32 0 0 0 32 64 Z`;

    return (
        <header className={headerClasses}>
            {currentBgUrl && (
                <link rel="preload" as="image" href={getOptimizedCloudinaryUrl(currentBgUrl, 1600)} fetchPriority="high" />
            )}
            {/* SVG Definitions for Clip Paths (Invisible) */}
            <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                <defs>
                    <clipPath id="curve-gastronomia" clipPathUnits="objectBoundingBox">
                        <path d="M 0 0 H 1 V 1 Q 0.5 0.70 0 1 Z" />
                    </clipPath>
                    <clipPath id="curve-lugares" clipPathUnits="objectBoundingBox">
                        <path d="M 0 0 H 1 V 0.85 Q 0.5 1 0 0.85 Z" />
                    </clipPath>
                    <clipPath id="header-notch-clip" clipPathUnits="userSpaceOnUse">
                        <path d="M 0 64 L 0 0 L 160 0 L 160 64 C 135 64, 114.7 66.7, 104.7 74 A 42 42 0 0 1 55.3 74 C 45.3 66.7, 25 64, 0 64 Z" />
                    </clipPath>
                </defs>
            </svg>

            <div
                className={`absolute top-0 left-0 w-full overflow-hidden pointer-events-none header-curved-bg transition-all duration-[1500ms] ease-in-out ${isHome ? 'z-0 extended' : 'z-20'}`}
                style={useCustomHeader ? {
                    backgroundImage: `url('${getOptimizedCloudinaryUrl(currentBgUrl, 1600)}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                } : { backgroundColor: 'transparent' }}
            >
                {useCustomHeader && (
                    <>
                        {/* Overlay for readability if needed, or gradient */}
                        <div className="absolute inset-0 bg-black/10"></div>

                        {/* Title Badges */}
                        {currentPath.includes('gastronomia') && (
                            <div className="absolute bottom-28 md:bottom-32 left-0 w-full text-center z-30 hidden md:block">
                                <span className="font-ui tracking-[0.4em] text-[10px] md:text-xs text-white drop-shadow-md">SABORES DE NUESTRA TIERRA</span>
                            </div>
                        )}
                        {currentPath.includes('lugares') && (
                            <div className="absolute bottom-28 md:bottom-32 left-0 w-full text-center z-30 hidden md:block">
                                <span className="font-ui tracking-[0.4em] text-[10px] md:text-xs text-white drop-shadow-md">DESCUBRÍ LA REGIÓN</span>
                            </div>
                        )}
                        {currentPath.includes('eventos') && (
                            <div className="absolute bottom-28 md:bottom-32 left-0 w-full text-center z-30 hidden md:block">
                                <span className="font-ui tracking-[0.4em] text-[10px] md:text-xs text-white drop-shadow-md">PRÓXIMOS EVENTOS</span>
                            </div>
                        )}
                        {currentPath.includes('apartamentos') && (
                            <div className="absolute bottom-28 md:bottom-32 left-0 w-full text-center z-30 hidden md:block">
                                <span className="font-ui tracking-[0.4em] text-[10px] md:text-xs text-white drop-shadow-md">NUESTROS APARTAMENTOS</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Navbar Layer (Content) */}
            {/* Navbar Layer (Content) */}
            <div className="container mx-auto px-6 md:px-10 pt-12 pb-4 md:py-6 flex items-center justify-between relative z-[45] pointer-events-none">

                {/* Mobile Gradient Overlay for Status Bar/Menu Integration */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/60 via-black/30 to-transparent lg:hidden -z-10 pointer-events-none"></div>

                {/* Mobile Empty Div for Spacing (to push Logo center) */}
                <div className="lg:hidden w-8"></div>

                {/* Logo Section - Uses Blurred BG Image for Frost Effect */}
                <Link href="/" aria-label="Ir al inicio" className={`flex flex-col items-center cursor-pointer group hover:opacity-90 transition-opacity duration-300 relative pointer-events-auto z-[46] ${isMobileMenuOpen ? 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto' : 'opacity-100'}`}>
                    <div
                        className="rounded-full p-1 md:p-2 shadow-2xl flex items-center justify-center overflow-hidden border border-white/10 relative"
                    >
                        {/* Blurred background image - desaturated separately from the logo */}
                        <div
                            className="absolute inset-0 z-0"
                            style={{ ...getFrostedStyle(), filter: 'grayscale(100%)' }}
                        />
                        {/* Green overlay on top of the desaturated bg */}
                        <div className="absolute inset-0 bg-[#10595a]/60 z-[1]"></div>
                        {/* Logo in full color above everything */}
                        <Logo className="w-32 md:w-52 h-auto text-white relative z-10" />
                    </div>
                </Link>

                {/* Desktop Menu */}
                <nav className="flex-1 hidden lg:flex items-center justify-around ml-12 pointer-events-auto">
                    <NavLink to="/" label="Inicio" />
                    <NavLink to="/gastronomia" label="Gastronomía" />
                    <NavLink to="/lugares" label="Lugares" />
                    <NavLink to="/eventos" label="Eventos" />
                </nav>

                {/* Mobile Hamburger Button */}
                <button
                    className="lg:hidden text-white relative focus:outline-none pointer-events-auto z-[80]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle Menu"
                >
                    <div className="w-8 h-8 flex flex-col justify-center items-center gap-[6px]">
                        <span className={`block h-[3px] rounded-full transition-all duration-400 ease-in-out origin-center ${isMobileMenuOpen ? 'w-7 rotate-45 translate-y-[9px] bg-[#10595a]' : 'w-8 bg-white'}`}></span>
                        <span className={`block h-[3px] rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'w-0 opacity-0' : 'w-6 bg-white'}`}></span>
                        <span className={`block h-[3px] rounded-full transition-all duration-400 ease-in-out origin-center ${isMobileMenuOpen ? 'w-7 -rotate-45 -translate-y-[9px] bg-[#10595a]' : 'w-5 bg-white'}`}></span>
                    </div>
                </button>
            </div>

            {/* Mobile Menu Overlay - Glassmorphism */}
            <div className={`fixed inset-0 bg-white/30 backdrop-blur-md z-[60] transition-all duration-500 ease-in-out lg:hidden flex flex-col justify-center items-center ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                {/* Gradient Orb for Depth */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#90c69e]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#10595a]/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <nav className="flex flex-col gap-6 relative z-10 w-full px-12 text-center">
                    <MobileNavLink to="/" label="Inicio" />
                    <div className="h-px bg-[#10595a]/20 w-24 mx-auto"></div>
                    <MobileNavLink to="/gastronomia" label="Gastronomía" />
                    <div className="h-px bg-[#10595a]/20 w-24 mx-auto"></div>
                    <MobileNavLink to="/lugares" label="Lugares" />
                    <div className="h-px bg-[#10595a]/20 w-24 mx-auto"></div>
                    <MobileNavLink to="/eventos" label="Eventos" />
                </nav>
                <div className="absolute bottom-12 text-[#10595a]/50 text-xs font-ui tracking-widest text-center">
                    <p>GLAK APART</p>
                </div>
            </div>

            {/* Curved Sticky Header */}
            <motion.div
                initial={{ top: '-80px' }}
                animate={{ top: isSticky ? '0px' : '-80px' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`fixed left-0 w-full z-[70] h-16 md:h-20 flex items-center transition-all ${isSticky ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
            >
                {/* Desktop Background */}
                <div className="hidden lg:block absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/20 rounded-b-[2rem] shadow-lg shadow-black/5 -z-10" />
                
                {/* Mobile Background */}
                <div className="lg:hidden absolute inset-0 -z-10 pointer-events-none">
                    {/* Header Main Bar + Notch (Single element with single blur to prevent desynchronization) */}
                    <div 
                        className="absolute top-0 left-0 w-full h-[84px] bg-white/70 backdrop-blur-xl"
                        style={{
                            clipPath: `path("${pathString}")`,
                            WebkitClipPath: `path("${pathString}")`
                        }}
                    />
                    
                    {/* Masked Border (Hidden in the center 160px notch region) */}
                    <div 
                        className="absolute inset-0 border-b border-white/20 rounded-b-[2rem]"
                        style={{
                            maskImage: 'linear-gradient(to right, white 0%, white calc(50% - 80px), transparent calc(50% - 80px), transparent calc(50% + 80px), white calc(50% + 80px), white 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, white 0%, white calc(50% - 80px), transparent calc(50% - 80px), transparent calc(50% + 80px), white calc(50% + 80px), white 100%)'
                        }}
                    />

                    {/* Masked Shadow (Hidden in the center 160px notch region) */}
                    <div 
                        className="absolute inset-0 shadow-lg shadow-black/5 rounded-b-[2rem] -z-20"
                        style={{
                            maskImage: 'linear-gradient(to right, white 0%, white calc(50% - 80px), transparent calc(50% - 80px), transparent calc(50% + 80px), white calc(50% + 80px), white 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, white 0%, white calc(50% - 80px), transparent calc(50% - 80px), transparent calc(50% + 80px), white calc(50% + 80px), white 100%)'
                        }}
                    />

                    {/* Center Notch Shadow (Circular behind logo) */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[84px] h-[82px] bg-black/[0.04] rounded-full filter blur-[4px] -z-20" />
                </div>

                {/* Mobile/Tablet Sticky Header Layout */}
                <div className="lg:hidden flex items-center justify-between w-full px-6">
                    <div className="w-8"></div>
                    <Link href="/" aria-label="Ir al inicio" className="flex items-center cursor-pointer translate-y-2 relative">
                        {/* Logo Container */}
                        <div className="rounded-full bg-[#165959] p-1 flex items-center justify-center relative z-20">
                            <Logo className="w-16 h-auto" />
                        </div>
                    </Link>
                    <button
                        className="text-[#10595a] relative focus:outline-none pointer-events-auto z-[80]"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        <div className="w-8 h-8 flex flex-col justify-center items-center gap-[6px]">
                            <span className={`block h-[3px] rounded-full transition-all duration-400 ease-in-out origin-center ${isMobileMenuOpen ? 'w-7 rotate-45 translate-y-[9px]' : 'w-8'} bg-[#10595a]`}></span>
                            <span className={`block h-[3px] rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'w-0 opacity-0' : 'w-6'} bg-[#10595a]`}></span>
                            <span className={`block h-[3px] rounded-full transition-all duration-400 ease-in-out origin-center ${isMobileMenuOpen ? 'w-7 -rotate-45 -translate-y-[9px]' : 'w-5'} bg-[#10595a]`}></span>
                        </div>
                    </button>
                </div>

                {/* Desktop Sticky Header Layout */}
                <div className="hidden lg:flex items-center justify-between w-full px-10">
                    <Link href="/" aria-label="Ir al inicio" className="flex items-center cursor-pointer">
                        <div className="rounded-full bg-[#165959] p-1.5 flex items-center justify-center shadow-md">
                            <Logo className="w-14 h-auto" />
                        </div>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <StickyNavLink to="/" label="Inicio" />
                        <StickyNavLink to="/gastronomia" label="Gastronomía" />
                        <StickyNavLink to="/lugares" label="Lugares" />
                        <StickyNavLink to="/eventos" label="Eventos" />
                    </nav>

                    <div>
                        <button
                            onClick={scrollToReservas}
                            className="px-6 py-2.5 bg-[#10595a] hover:bg-[#093334] text-white text-xs font-semibold tracking-[0.15em] uppercase rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                            Reservar
                        </button>
                    </div>
                </div>
            </motion.div>
        </header>
    );
};

export default Header;
