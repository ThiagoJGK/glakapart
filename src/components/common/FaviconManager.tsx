'use client';
import React, { useEffect, useState } from 'react';
import { getContent } from '@/services/content';

const FaviconManager: React.FC = () => {
    const [faviconUrl, setFaviconUrl] = useState<string>('');

    useEffect(() => {
        const loadFavicon = async () => {
            const data = await getContent('settings');
            if (data && data.faviconUrl) {
                setFaviconUrl(data.faviconUrl);
            }
        };

        loadFavicon();

        const updateHandler = () => { loadFavicon(); };
        window.addEventListener('GLAK_CONTENT_UPDATE', updateHandler);
        return () => window.removeEventListener('GLAK_CONTENT_UPDATE', updateHandler);
    }, []);

    useEffect(() => {
        if (faviconUrl) {
            const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (link) {
                link.href = faviconUrl;
            } else {
                const newLink = document.createElement('link');
                newLink.rel = 'icon';
                newLink.href = faviconUrl;
                document.head.appendChild(newLink);
            }
        }
    }, [faviconUrl]);

    return null;
};

export default FaviconManager;






