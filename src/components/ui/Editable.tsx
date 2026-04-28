'use client';
import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { getContent, updateContent } from '@/services/content';
import EditModal from '../admin/EditModal';

interface EditableProps {
    id: string; // Unique ID for Firestore document/field (e.g. "home.heroTitle")
    defaultValue: string;
    type?: 'text' | 'textarea' | 'image' | 'backgroundImage';
    className?: string; // Class for the wrapper or element
    children?: React.ReactNode; // Optional: render children if no dynamic content yet (shim)
    label?: string; // Label for the modal
    withBlur?: boolean; // Enable blur generation for images
}

// Helper to parse "collection.document.field" or "section.field"
// For simplicity, we'll assume the schema is: collection="content", docId=section, field=key
// Example id="home.heroTitle" -> collection="content" (hardcoded in service), doc="home", field="heroTitle"
const parseId = (id: string) => {
    const parts = id.split('.');
    if (parts.length === 2) return { section: parts[0], field: parts[1] };
    return { section: 'general', field: id };
};

import MissingImagePlaceholder from './MissingImagePlaceholder';

const Editable: React.FC<EditableProps> = ({ id, defaultValue, type = 'text', className = '', label = 'Editar Contenido', withBlur }) => {
    const { isAdminMode } = useAdmin();
    const [content, setContent] = useState(defaultValue);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { section, field } = parseId(id);

    // Initial Fetch
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await getContent(section);
                if (data && data[field]) {
                    setContent(data[field]);
                } else {
                    // Start with default if nothing in DB
                    setContent(defaultValue);
                }
            } catch (error) {
                console.warn(`Could not fetch content for ${id}`, error);
            }
        };
        fetchContent();

        // Listen for updates (global event)
        const handleUpdate = () => fetchContent();
        window.addEventListener('GLAK_CONTENT_UPDATE', handleUpdate);
        return () => window.removeEventListener('GLAK_CONTENT_UPDATE', handleUpdate);
    }, [id, section, field, defaultValue]);

    const handleSave = async (newValue: string, secondaryValue?: string) => {
        await updateContent(section, field, newValue);
        setContent(newValue);

        if (secondaryValue && withBlur) {
            await updateContent(section, `${field}_blur`, secondaryValue); // Save blurred version
        }

        window.dispatchEvent(new Event('GLAK_CONTENT_UPDATE')); // Notify others
    };

    if (type === 'image' || type === 'backgroundImage') {
        const isBackground = type === 'backgroundImage';
        return (
            <div
                className={`relative group ${isAdminMode ? 'cursor-pointer' : ''} ${className}`}
                onClick={isAdminMode ? (e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(true); } : undefined}
            >
                {isBackground ? (
                    content ? (
                        <div
                            className="w-full h-full bg-cover bg-center bg-fixed absolute inset-0 transition-opacity duration-500"
                            style={{ backgroundImage: `url(${content})`, backgroundColor: '#10595a' }}
                        ></div>
                    ) : (
                        <MissingImagePlaceholder id={id} label={label} className="absolute inset-0" />
                    )
                ) : (
                    content ? (
                        <img width={800} height={600} src={content} alt={label} className="w-full h-full object-cover" />
                    ) : (
                        <MissingImagePlaceholder id={id} label={label} />
                    )
                )}

                {isAdminMode && (
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className="absolute inset-0 bg-forest/50 border-4 border-sage flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 z-[9999]"
                    >
                        <div className="bg-white w-16 h-16 flex items-center justify-center rounded-full shadow-xl transition-transform hover:scale-110">
                            <span className="text-2xl">✏️</span>
                        </div>
                    </div>
                )}

                <EditModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialValue={content}
                    type="image" // Use 'image' modal for both
                    label={label}
                    withBlur={withBlur}
                />
            </div>
        );
    }

    return (
        <>
            <div
                className={`relative ${isAdminMode ? 'cursor-pointer group' : ''} ${className}`}
                onClick={isAdminMode ? (e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(true); } : undefined}
                title={isAdminMode ? 'Click para editar' : ''}
            >
                {/* Visual Indicator in Admin Mode */}
                {isAdminMode && (
                    <div className="absolute -top-4 -right-4 z-[9999] opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black w-8 h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full shadow-lg border border-forest/20 cursor-pointer hover:scale-110">
                        <span className="text-sm block transform-none">✏️</span>
                    </div>
                )}

                {/* Content Render */}
                {type === 'text' ? (
                    <span dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                )}

                {/* Highlight box on hover */}
                {isAdminMode && (
                    <div className="absolute inset-0 border-2 border-sage/50 rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[9999]"></div>
                )}
            </div>

            <EditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialValue={content}
                type={type}
                label={label}
                withBlur={withBlur}
            />
        </>
    );
};

export default Editable;









