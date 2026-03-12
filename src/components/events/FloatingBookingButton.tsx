'use client';
import React, { useState, useEffect } from 'react';
import { CalendarCheck } from 'lucide-react';


import { track } from '@vercel/analytics/react';
import { trackEvent } from '@/services/analytics';

const FloatingBookingButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);


    const [isFooterVisible, setIsFooterVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFooterVisible(entry.isIntersecting);
            },
            { root: null, threshold: 0.1 }
        );

        const footer = document.querySelector('footer');
        if (footer) observer.observe(footer);

        return () => {
            if (footer) observer.unobserve(footer);
        };
    }, []);

    const scrollToBooking = () => {
        track('Click Reserve', { location: 'Floating Button' });
        trackEvent('booking_cta_click', { location: 'floating_button' });
        const bookingSection = document.getElementById('reservas');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <button
            id="floating-booking-button"
            onClick={scrollToBooking}
            className={`fixed bottom-6 right-24 z-50 bg-[#10595a] text-white p-4 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-500 hover:scale-110 hover:bg-[#156e70] ${isVisible && !isFooterVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
        >
            <CalendarCheck size={24} />
            <span className="text-xs font-bold tracking-widest hidden lg:inline-block pr-2">RESERVAR</span>
        </button>
    );
};

export default FloatingBookingButton;






