'use client';
import React, { useEffect, useRef, useState } from 'react';

interface GlakBotAvatarProps {
    className?: string;
    size?: number;
    isThinking?: boolean;
    onClick?: () => void;
}

export const GlakBotAvatar: React.FC<GlakBotAvatarProps> = ({
    className = '',
    size = 40,
    isThinking = false,
    onClick
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
    const [isMouseTracking, setIsMouseTracking] = useState(false);
    const [isDizzy, setIsDizzy] = useState(false);
    const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Mouse eye tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current || isThinking || isDizzy) return;
            
            const rect = containerRef.current.getBoundingClientRect();
            const avatarX = rect.left + rect.width / 2;
            const avatarY = rect.top + rect.height / 2;

            const dx = e.clientX - avatarX;
            const dy = e.clientY - avatarY;
            const distance = Math.hypot(dx, dy);

            if (distance > 0) {
                const maxOffset = 3.0;
                const factor = Math.min(distance / 180, 1);
                const x = (dx / distance) * factor * maxOffset;
                const y = (dy / distance) * factor * maxOffset;

                setPupilOffset({ x, y });
                setIsMouseTracking(true);

                if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
                idleTimeoutRef.current = setTimeout(() => {
                    setIsMouseTracking(false);
                }, 3000);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        };
    }, [isThinking, isDizzy]);

    // Reset dizzy state automatically after 1.5 seconds
    useEffect(() => {
        if (!isDizzy) return;
        const timer = setTimeout(() => {
            setIsDizzy(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, [isDizzy]);

    // Handle interactive click / touch tap
    const handleAvatarClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDizzy(true);
        onClick?.();
    };

    return (
        <div 
            ref={containerRef}
            onClick={handleAvatarClick}
            className={`relative inline-flex items-center justify-center shrink-0 select-none cursor-pointer transform-gpu transition-transform active:scale-95 ${className}`}
            style={{ width: size, height: size }}
            title="¡Tócame!"
        >
            <style jsx>{`
                @keyframes glakFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-3px); }
                }
                @keyframes glakBlink {
                    0%, 94%, 98%, 100% { transform: scaleY(1); }
                    96% { transform: scaleY(0.1); }
                }
                @keyframes glakIdleLook {
                    0%, 35%, 100% { transform: translate(0px, 0px); }
                    40%, 60% { transform: translate(-1.8px, 0.5px); }
                    65%, 85% { transform: translate(1.8px, -0.5px); }
                }
                @keyframes glakPulse {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.4); }
                }
                @keyframes glakQuestionPulse {
                    0%, 100% { transform: translateY(0px) scale(1); filter: drop-shadow(0 0 4px #FFD700); }
                    50% { transform: translateY(-2px) scale(1.15); filter: drop-shadow(0 0 8px #FFD700); }
                }
                @keyframes glakDizzyShake {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-6deg); }
                    75% { transform: rotate(6deg); }
                }
                .glak-bot-body {
                    animation: ${isDizzy ? 'glakDizzyShake 0.3s ease-in-out infinite' : 'glakFloat 3.5s ease-in-out infinite'};
                    transform-origin: center bottom;
                    will-change: transform;
                }
                .glak-eye {
                    transform-origin: center;
                    animation: ${isDizzy ? 'none' : 'glakBlink 4.2s ease-in-out infinite'};
                }
                .glak-pupil-idle {
                    animation: ${isThinking || isDizzy ? 'none' : 'glakIdleLook 7s ease-in-out infinite'};
                }
                .glak-antenna-light {
                    animation: glakPulse 2s ease-in-out infinite;
                    transform-origin: 36px 8px;
                }
                .glak-antenna-question {
                    animation: glakQuestionPulse 0.8s ease-in-out infinite;
                    transform-origin: 36px 7px;
                }
            `}</style>

            <svg
                width={size}
                height={size}
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="glak-bot-body overflow-visible filter drop-shadow-sm"
            >
                {/* Antenna Stick */}
                <rect x="34.5" y="11" width="3" height="8" rx="1.5" fill="#10595a" />

                {/* Antenna Head: Normal Bulb vs Thinking Question Mark '?' */}
                {isThinking ? (
                    <g className="glak-antenna-question">
                        {/* Question Mark Path '?' */}
                        <path 
                            d="M 33 5.5 C 33 3, 39 3, 39 5.5 C 39 7.5, 36 8, 36 9.5" 
                            stroke="#FFD700" 
                            strokeWidth="2.2" 
                            strokeLinecap="round" 
                            fill="none" 
                        />
                        <circle cx="36" cy="11.5" r="1.1" fill="#FFD700" />
                    </g>
                ) : (
                    <g className="glak-antenna-light">
                        <circle cx="36" cy="8" r="4.5" fill="#9dd1a6" />
                        <circle cx="36" cy="8" r="2.5" fill="#ffffff" opacity="0.8" />
                    </g>
                )}

                {/* Side Ears / Bolts */}
                <rect x="10" y="29" width="4" height="10" rx="2" fill="#10595a" />
                <rect x="58" y="29" width="4" height="10" rx="2" fill="#10595a" />

                {/* Head Main Shape */}
                <rect 
                    x="13" 
                    y="18" 
                    width="46" 
                    height="36" 
                    rx="14" 
                    fill="url(#headGradient)" 
                    stroke="#10595a" 
                    strokeWidth="2.5"
                />

                {/* Visor Area */}
                <rect 
                    x="17" 
                    y="22" 
                    width="38" 
                    height="28" 
                    rx="10" 
                    fill="#0d3c3d"
                />

                {/* EYES LAYER */}
                {isDizzy ? (
                    /* DIZZY / CLICK REACTION: CROSS EYES (X X) */
                    <g>
                        {/* Left Eye Cross X */}
                        <path d="M 23.5 28.5 L 30.5 35.5 M 30.5 28.5 L 23.5 35.5" stroke="#9dd1a6" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Right Eye Cross X */}
                        <path d="M 41.5 28.5 L 48.5 35.5 M 48.5 28.5 L 41.5 35.5" stroke="#9dd1a6" strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                ) : (
                    /* NORMAL EYES WITH PUPIL MOUSE TRACKING */
                    <g className="glak-eye">
                        <circle cx="27" cy="32" r="7.5" fill="#ffffff" />
                        <circle cx="45" cy="32" r="7.5" fill="#ffffff" />

                        <g 
                            className={isMouseTracking || isThinking ? '' : 'glak-pupil-idle'}
                            style={{
                                transform: (isMouseTracking && !isThinking) ? `translate(${pupilOffset.x}px, ${pupilOffset.y}px)` : undefined,
                                transition: isMouseTracking ? 'transform 0.08s cubic-bezier(0.1, 0.9, 0.2, 1)' : 'transform 0.4s ease-out'
                            }}
                        >
                            <circle cx="27" cy="32" r="4.5" fill="#10595a" />
                            <circle cx="25.5" cy="30.5" r="1.6" fill="#ffffff" />

                            <circle cx="45" cy="32" r="4.5" fill="#10595a" />
                            <circle cx="43.5" cy="30.5" r="1.6" fill="#ffffff" />
                        </g>
                    </g>
                )}

                {/* Cute Cheeks (Blush) */}
                <ellipse cx="21" cy="41" rx="2.5" ry="1.2" fill="#ff9999" opacity="0.6" />
                <ellipse cx="51" cy="41" rx="2.5" ry="1.2" fill="#ff9999" opacity="0.6" />

                {/* MOUTH EXPRESSIONS */}
                {isDizzy ? (
                    /* Dizzy Wavy Mouth */
                    <path 
                        d="M 28 42 Q 32 39 36 42 Q 40 45 44 42" 
                        stroke="#9dd1a6" 
                        strokeWidth="2.2" 
                        strokeLinecap="round" 
                        fill="none" 
                    />
                ) : isThinking ? (
                    /* Surprised / Curious "O" Mouth */
                    <ellipse 
                        cx="36" 
                        cy="42.5" 
                        rx="3.2" 
                        ry="4" 
                        stroke="#9dd1a6" 
                        strokeWidth="2.2" 
                        fill="#0d3c3d" 
                    />
                ) : (
                    /* Normal Happy Smile */
                    <path 
                        d="M 28 41 Q 36 47 44 41" 
                        stroke="#9dd1a6" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        fill="none" 
                    />
                )}

                {/* Gradients */}
                <defs>
                    <linearGradient id="headGradient" x1="13" y1="18" x2="59" y2="54" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#ffffff" />
                        <stop offset="1" stopColor="#e2f3e6" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default GlakBotAvatar;
