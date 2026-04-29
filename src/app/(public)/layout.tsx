'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AdminDraftControls from '@/components/admin/AdminDraftControls';
import GeneralBookingSection from '@/components/booking/GeneralBookingSection';
import FloatingBookingButton from '@/components/events/FloatingBookingButton';
import { trackEvent } from '@/services/analytics';
import { getContent } from '@/services/content';
import MaintenanceScreen from '@/components/common/MaintenanceScreen';
import { useAdmin } from '@/context/AdminContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const { isAdmin } = useAdmin();

    useEffect(() => {
        const checkMaintenance = async () => {
            const settings = await getContent('settings');
            if (settings?.maintenanceEnabled) {
                setIsMaintenance(true);
            } else {
                setIsMaintenance(false);
            }
            setIsChecking(false);
        };
        checkMaintenance();

        const updateHandler = () => { checkMaintenance(); };
        window.addEventListener('GLAK_CONTENT_UPDATE', updateHandler);

        return () => {
            window.removeEventListener('GLAK_CONTENT_UPDATE', updateHandler);
        };
    }, []);

    useEffect(() => {
        // Instant scroll to top on route change
        const originalStyle = window.getComputedStyle(document.documentElement).scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        setTimeout(() => {
            document.documentElement.style.scrollBehavior = originalStyle;
        }, 0);

        trackEvent('page_view', { path: pathname });
    }, [pathname]);

    // If maintenance is active, AND the user is not an admin, show maintenance screen.
    if (isMaintenance && !isAdmin) {
        return (
            <div className="min-h-screen flex flex-col relative">
                <AdminDraftControls />
                <MaintenanceScreen />
            </div>
        );
    }

    // If maintenance is active but user IS admin, render normally with a warning banner.
    return (
        <div className="min-h-screen flex flex-col relative opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {isMaintenance && isAdmin && (
                <div className="bg-red-500 text-white text-xs font-bold text-center py-1 tracking-widest z-50 fixed top-0 w-full animate-pulse">
                    SITIO EN MANTENIMIENTO (VISIBLE SOLO PARA ADMIN)
                </div>
            )}
            <Header />
            <AdminDraftControls />
            {children}
            <GeneralBookingSection id="reservas" />
            <FloatingBookingButton />
            <Footer />
            <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        html { scroll-behavior: smooth; }
      `}</style>
        </div>
    );
}
