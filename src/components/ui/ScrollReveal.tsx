'use client';
import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number; // Delay in ms
    threshold?: number; // 0 to 1
    onClick?: () => void;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    className = "",
    onClick
}) => {
    return (
        <div className={className} onClick={onClick}>
            {children}
        </div>
    );
};

export default ScrollReveal;






