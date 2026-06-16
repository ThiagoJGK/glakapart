'use client';
import React, { useState, useEffect } from 'react';
import { CalendarCheck } from 'lucide-react';

import { trackEvent } from '@/services/analytics';

const FloatingBookingButton: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);


    const [isFooterVisible, setIsFooterVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Hide if we are within 400px of the bottom of the page
            const isNearBottom = documentHeight - (scrollPosition + windowHeight) < 400;
            
            if (scrollPosition > 300 && !isNearBottom) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        window.addEventListener('resize', toggleVisibility);
        toggleVisibility();
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
            window.removeEventListener('resize', toggleVisibility);
        };
    }, []);

    const [isBookingOrFooterVisible, setIsBookingOrFooterVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const isAnyIntersecting = entries.some(entry => entry.isIntersecting);
                setIsBookingOrFooterVisible(isAnyIntersecting);
            },
            { root: null, threshold: 0.1 }
        );

        const footer = document.querySelector('footer');
        const bookingSection = document.getElementById('reservas');
        if (footer) observer.observe(footer);
        if (bookingSection) observer.observe(bookingSection);

        return () => {
            if (footer) observer.unobserve(footer);
            if (bookingSection) observer.unobserve(bookingSection);
        };
    }, []);

    const scrollToBooking = () => {
        trackEvent('booking_cta_click', { location: 'floating_button' });
        const bookingSection = document.getElementById('reservas');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <button
            id="floating-booking-button"
            aria-label="Consultar disponibilidad de alojamiento"
            onClick={scrollToBooking}
            className={`fixed bottom-6 right-24 z-50 bg-[#10595a] text-white p-4 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-500 hover:scale-110 hover:bg-[#156e70] ${isVisible && !isBookingOrFooterVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
        >
            <CalendarCheck size={24} />
            <span className="text-xs font-bold tracking-widest hidden lg:inline-block pr-2">CONSULTAR</span>
        </button>
    );
};

export default FloatingBookingButton;






