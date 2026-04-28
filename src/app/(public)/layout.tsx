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

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

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

    if (isMaintenance) {
        return (
            <div className="min-h-screen flex flex-col relative">
                <AdminDraftControls />
                <MaintenanceScreen />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
