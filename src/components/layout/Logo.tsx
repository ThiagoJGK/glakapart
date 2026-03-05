'use client';
import React, { useEffect, useState } from 'react';
import { getContent } from '@/services/content';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-32" }) => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            const data = await getContent('settings');
            setSettings(data);
        };
        load();

        const handleUpdate = () => load();
        window.addEventListener('GLAK_CONTENT_UPDATE', handleUpdate);
        return () => window.removeEventListener('GLAK_CONTENT_UPDATE', handleUpdate);
    }, []);

    // Render Dynamic Content if available
    if (settings) {
        if (settings.logoType === 'image' && settings.logoUrl) {
            return <img width={800} height={600} src={settings.logoUrl} alt="Logo" className={`${className} object-contain`} />;
        }

        if (settings.logoType === 'svg' && settings.logoSvg) {
            // Render raw SVG if provided
            return (
                <div
                    className={`${className} flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-full`}
                    dangerouslySetInnerHTML={{ __html: settings.logoSvg }}
                />
            );
        }
    }

    // Default Fallback Logo (static SVG from public/)
    return (
        <img width={800} height={600}
            src="/logo.svg"
            alt="Glak Apart"
            className={`${className} object-contain`}
        />
    );
};








