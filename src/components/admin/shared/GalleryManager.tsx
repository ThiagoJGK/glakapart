'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Trash2, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '@/services/images';

interface GalleryManagerProps {
    images: string[];
    onChange: (images: string[]) => Promise<void> | void;
    coverImage?: string;
    onCoverChange?: (url: string) => Promise<void> | void;
    title?: string;
    description?: string;
    maxImages?: number;
    showCoverIndicator?: boolean;
    isVertical?: boolean; // If true, sets portrait layout config, otherwise landscape
}

export const GalleryManager: React.FC<GalleryManagerProps> = ({
    images = [],
    onChange,
    coverImage,
    onCoverChange,
    title,
    description,
    maxImages,
    showCoverIndicator = false,
    isVertical = false,
}) => {
    const [localImages, setLocalImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isOrderChanged, setIsOrderChanged] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Synchronize local images with external prop
    useEffect(() => {
        setLocalImages(images.filter((url) => typeof url === 'string' && url.trim() !== ''));
    }, [images]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const url = await uploadImage(file);
                if (url) uploadedUrls.push(url);
            }

            const updated = [...localImages, ...uploadedUrls];
            setLocalImages(updated);
            await onChange(updated);

            // Automatically set first cover image if none exists
            if (onCoverChange && !coverImage && updated.length > 0) {
                await onCoverChange(updated[0]);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Error al subir imágenes');
        } finally {
            setUploading(false);
            if (e.target) e.target.value = ''; // Clear input
        }
    };

    const handleDelete = async (index: number) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta imagen?')) return;
        const deletedUrl = localImages[index];
        const updated = localImages.filter((_, i) => i !== index);
        setLocalImages(updated);
        await onChange(updated);

        // Adjust cover image if deleted
        if (coverImage === deletedUrl && onCoverChange) {
            const newCover = updated.length > 0 ? updated[0] : '';
            await onCoverChange(newCover);
        }
    };

    // --- DRAG & DROP LOGIC (MOUSE) ---
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
        setIsOrderChanged(false);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const updated = [...localImages];
        const temp = updated[draggedIndex];
        updated[draggedIndex] = updated[index];
        updated[index] = temp;

        setLocalImages(updated);
        setDraggedIndex(index);
        setIsOrderChanged(true);
    };

    const handleDragEnd = async () => {
        setDraggedIndex(null);
        if (isOrderChanged) {
            await onChange(localImages);
            setIsOrderChanged(false);
        }
    };

    // --- DRAG & DROP LOGIC (TOUCH) ---
    const handleTouchStart = (index: number) => {
        setDraggedIndex(index);
        setIsOrderChanged(false);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (draggedIndex === null) return;
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!element) return;

        const card = element.closest('[data-drag-index]');
        if (!card) return;

        const targetIndex = parseInt(card.getAttribute('data-drag-index') || '', 10);
        if (isNaN(targetIndex) || targetIndex === draggedIndex) return;

        const updated = [...localImages];
        const temp = updated[draggedIndex];
        updated[draggedIndex] = updated[targetIndex];
        updated[targetIndex] = temp;

        setLocalImages(updated);
        setDraggedIndex(targetIndex);
        setIsOrderChanged(true);
    };

    const handleTouchEnd = async () => {
        setDraggedIndex(null);
        if (isOrderChanged) {
            await onChange(localImages);
            setIsOrderChanged(false);
        }
    };

    // Layout styles based on orientation (portrait vs landscape)
    // Mobile: 3 columns for portrait, 2 columns for landscape
    // Desktop: 4 or 5 columns
    const gridClassName = isVertical
        ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3'
        : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';

    const cardAspectClass = isVertical ? 'aspect-[3/4]' : 'aspect-video';

    return (
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
            {title && (
                <div className="mb-4">
                    <h4 className="font-bold text-gray-700 uppercase tracking-widest text-xs">{title}</h4>
                    {description && <p className="text-gray-400 text-[10px] mt-1">{description}</p>}
                </div>
            )}

            <div className={gridClassName} ref={containerRef}>
                {/* Upload Card */}
                {(!maxImages || localImages.length < maxImages) && (
                    <div className={`border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-forest transition-colors relative group ${cardAspectClass}`}>
                        {uploading ? (
                            <div className="flex flex-col items-center justify-center p-2 text-center">
                                <Loader2 className="w-8 h-8 text-forest animate-spin mb-2" />
                                <span className="text-[10px] font-bold tracking-widest text-gray-400 animate-pulse">CARGANDO...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                                <Plus size={32} className="text-gray-400 group-hover:text-forest transition-colors mb-1" />
                                <span className="text-[10px] font-bold tracking-widest text-gray-500 group-hover:text-forest uppercase">AGREGAR FOTOS</span>
                            </div>
                        )}
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-wait"
                        />
                    </div>
                )}

                {/* Images List */}
                {localImages.map((url, index) => {
                    const isCover = coverImage === url || (showCoverIndicator && index === 0);
                    const isDragging = draggedIndex === index;

                    return (
                        <motion.div
                            key={`${url}-${index}`}
                            layout
                            data-drag-index={index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            onTouchStart={() => handleTouchStart(index)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            className={`relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing select-none transition-shadow ${cardAspectClass} ${isDragging ? 'opacity-40 shadow-inner' : 'hover:shadow-md'}`}
                        >
                            <img
                                src={url}
                                alt={`Gallery item ${index}`}
                                className="w-full h-full object-cover pointer-events-none"
                                loading="lazy"
                            />

                            {/* Badge */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                                {isCover && (
                                    <span className="bg-[#10595a] text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm shadow-sm uppercase">
                                        {showCoverIndicator ? 'Principal' : 'Portada'}
                                    </span>
                                )}
                                {!isCover && showCoverIndicator && (
                                    <span className="bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        #{index + 1}
                                    </span>
                                )}
                            </div>

                            {/* Overlays / Action Menu */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                {/* Set Cover Option */}
                                {onCoverChange && (
                                    <button
                                        type="button"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await onCoverChange(url);
                                        }}
                                        className={`p-2 rounded-full transition-all hover:scale-110 shadow ${isCover ? 'bg-forest text-white' : 'bg-white text-gray-500 hover:text-forest'}`}
                                        title="Marcar como portada"
                                    >
                                        <Star size={16} fill={isCover ? 'currentColor' : 'none'} />
                                    </button>
                                )}

                                {/* Delete Option */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(index);
                                    }}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all hover:scale-110 shadow"
                                    title="Eliminar imagen"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {localImages.length === 0 && !uploading && (
                <div className="text-center py-8 text-gray-400 text-xs border border-dashed border-gray-150 rounded-xl mt-4 bg-gray-50/50">
                    No hay imágenes cargadas. Haz clic en "AGREGAR FOTOS" para comenzar.
                </div>
            )}
        </div>
    );
};

export default GalleryManager;
