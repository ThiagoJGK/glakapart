'use client';
import React, { useState, useEffect } from 'react';
import { Logo } from '../layout/Logo';

interface LoadingScreenProps {
    isLoading: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading }) => {
    const [shouldRender, setShouldRender] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            // Start fade-out animation
            setFadeOut(true);
            // Remove from DOM after animation completes
            const timer = setTimeout(() => setShouldRender(false), 800);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
            style={{ backgroundColor: '#10595a' }}
        >
            {/* Ambient glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#90c69e]/20 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#90c69e]/15 rounded-full blur-2xl animate-pulse pointer-events-none" style={{ animationDelay: '0.5s' }}></div>

            {/* Logo - static SVG (no Firebase dependency) */}
            <div className="relative mb-12 animate-breathe">
                <Logo className="w-40 md:w-52 h-auto text-white mx-auto z-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
            </div>

            {/* Loading bar */}
            <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-[#90c69e] rounded-full animate-loading-bar"></div>
            </div>

            {/* Tagline */}
            <p className="mt-8 text-white/40 text-xs tracking-[0.3em] uppercase font-light animate-pulse">
                Cargando experiencia...
            </p>

            {/* Inline keyframes */}
            <style>{`
                @keyframes breathe {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.03); opacity: 0.9; }
                }
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }
                .animate-breathe {
                    animation: breathe 2.5s ease-in-out infinite;
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;







