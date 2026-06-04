'use client';
import React, { useEffect } from 'react';
import { AdminProvider } from '@/context/AdminContext';
import { prefetchContent } from '@/services/content';

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        prefetchContent().catch(e => {
            console.warn('Prefetch error, continuing:', e);
        });
    }, []);

    return (
        <AdminProvider>
            {children}
        </AdminProvider>
    );
}
