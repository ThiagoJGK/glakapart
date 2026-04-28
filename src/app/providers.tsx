'use client';
import React, { useState, useEffect } from 'react';
import { AdminProvider } from '@/context/AdminContext';
import LoadingScreen from '@/components/common/LoadingScreen';
import { prefetchContent } from '@/services/content';

export function Providers({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                await prefetchContent();
            } catch (e) {
                console.warn('Prefetch error, continuing:', e);
            } finally {
                setTimeout(() => setIsLoading(false), 1200);
            }
        };
        init();
    }, []);

    return (
        <AdminProvider>
            <LoadingScreen isLoading={isLoading} />
            {children}
        </AdminProvider>
    );
}
