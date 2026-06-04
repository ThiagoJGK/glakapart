'use client';
import React, { useState } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '@/services/images';
import { generateBlurredImage } from '@/utils/imageUtils';

interface SingleImageManagerProps {
    imageUrl: string;
    blurUrl?: string;
    onChange: (imageUrl: string, blurUrl?: string) => Promise<void> | void;
    label: string;
    withBlur?: boolean;
    aspectRatio?: string; // e.g. 'aspect-video', 'aspect-square', 'aspect-[16/10]'
}

export const SingleImageManager: React.FC<SingleImageManagerProps> = ({
    imageUrl,
    blurUrl,
    onChange,
    label,
    withBlur = false,
    aspectRatio = 'aspect-video',
}) => {
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState('');

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setLoading(true);
        setStatusText('Optimización...');

        try {
            // 1. Upload original image
            const originalUrl = await uploadImage(file, (status) => {
                setStatusText(status === 'optimizing' ? 'OPTIMIZANDO...' : 'SUBIENDO...');
            });

            let uploadedBlurUrl = '';

            // 2. Generate and upload blur image if enabled
            if (withBlur) {
                setStatusText('Generando fondo...');
                const blurredFile = await generateBlurredImage(file);
                uploadedBlurUrl = await uploadImage(blurredFile, (status) => {
                    setStatusText(status === 'optimizing' ? 'BLUR OPTIMIZANDO...' : 'BLUR SUBIENDO...');
                });
            }

            // 3. Callback
            await onChange(originalUrl, withBlur ? uploadedBlurUrl : undefined);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al procesar la imagen');
        } finally {
            setLoading(false);
            setStatusText('');
            if (e.target) e.target.value = ''; // clear input
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col h-full group">
            {/* Header label */}
            <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
                {loading && (
                    <span className="text-[9px] text-forest font-bold animate-pulse uppercase tracking-wider flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> {statusText}
                    </span>
                )}
            </div>

            {/* Preview Frame */}
            <div className={`relative bg-gray-50 rounded-lg overflow-hidden border border-gray-150 flex items-center justify-center ${aspectRatio}`}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={label}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300 gap-1.5 p-4 text-center">
                        <ImageIcon size={28} className="opacity-50" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">Sin asignar</span>
                    </div>
                )}

                {/* Upload Hover Overlay */}
                <div className="absolute inset-0 bg-forest/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px] z-10">
                    <label className="cursor-pointer bg-white hover:bg-gray-50 text-forest px-4 py-2.5 rounded-full text-[10px] font-bold tracking-widest shadow-xl flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Upload size={12} />
                        {loading ? 'PROCESANDO...' : imageUrl ? 'CAMBIAR FOTO' : 'SUBIR FOTO'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={loading}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {/* Blur Strip (if applicable) */}
            {withBlur && (
                <div className="mt-3 border-t border-gray-50 pt-3">
                    <span className="font-bold text-[9px] text-gray-400 uppercase tracking-widest block mb-2">Fondo Blur Desenfocado</span>
                    <div className="h-10 bg-gray-50 rounded overflow-hidden relative border border-gray-100 flex items-center justify-center">
                        {blurUrl ? (
                            <>
                                <img
                                    src={blurUrl}
                                    alt={`${label} blur`}
                                    className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                    <span className="text-[8px] text-gray-700 font-bold tracking-widest uppercase bg-white/80 px-2 py-0.5 rounded shadow-sm">VERSIÓN BLUR GENERADA</span>
                                </div>
                            </>
                        ) : (
                            <span className="text-[8px] text-gray-400 font-bold tracking-widest uppercase">Sin fondo blur</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleImageManager;
