'use client';
import React, { useState, useEffect } from 'react';
import { uploadImage } from '@/services/images';
import { generateBlurredImage } from '@/utils/imageUtils';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (value: string, secondaryValue?: string) => Promise<void>;
    initialValue: string;
    type: 'text' | 'textarea' | 'image';
    label: string;
    withBlur?: boolean; // New prop to enable blur generation
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialValue, type, label, withBlur }) => {
    const [value, setValue] = useState(initialValue);
    const [blurUrl, setBlurUrl] = useState(''); // Store the uploaded blur URL
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(''); // Details about upload progress
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        setValue(initialValue);
        if (type === 'image') {
            setPreviewUrl(initialValue);
            setBlurUrl(''); // Reset local blur state on open
        }
    }, [initialValue, isOpen, type]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(value, withBlur ? blurUrl : undefined); // Pass both URLs if needed
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error al guardar');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLoading(true);
            const file = e.target.files[0];
            try {
                // 1. Upload Original
                const url = await uploadImage(file, (status) => {
                    setUploadStatus(status === 'optimizing' ? 'OPTIMIZANDO IMAGEN...' : 'SUBIENDO A SERVIDOR...');
                });
                setValue(url);
                setPreviewUrl(url);

                // 2. Generate and Upload Blur (if enabled)
                if (withBlur) {
                    setUploadStatus('GENERANDO FONDO...');
                    const blurredFile = await generateBlurredImage(file);
                    const blurredUrl = await uploadImage(blurredFile, (status) => {
                        setUploadStatus(status === 'optimizing' ? 'OPTIMIZANDO FONDO...' : 'SUBIENDO FONDO...');
                    });
                    setBlurUrl(blurredUrl);
                    console.log("Blurred image uploaded:", blurredUrl);
                }

            } catch (error) {
                console.error(error);
                alert('Error al subir imagen');
            } finally {
                setLoading(false);
                setUploadStatus('');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100">
                <div className="bg-forest p-6 flex justify-between items-center text-white">
                    <h3 className="font-ui tracking-widest text-sm font-bold">EDITAR CONTENIDO</h3>
                    <button onClick={onClose} className="hover:text-sage text-2xl">&times;</button>
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>

                        {type === 'text' && (
                            <input
                                type="text"
                                className="w-full border-b-2 border-gray-200 focus:border-forest outline-none py-2 text-lg font-light text-gray-800 transition-colors"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                autoFocus
                            />
                        )}

                        {type === 'textarea' && (
                            <textarea
                                className="w-full border-2 border-gray-200 focus:border-forest outline-none p-4 rounded-lg text-base font-light text-gray-800 h-40 transition-colors resize-none"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        )}

                        {type === 'image' && (
                            <div className="space-y-4">
                                <div className="h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300 relative group">
                                    {previewUrl ? (
                                        <img width={800} height={600} src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400">Sin imagen</span>
                                    )}

                                    {/* Uploading Status Overlay */}
                                    {loading && uploadStatus && (
                                        <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center">
                                            <div className="w-8 h-8 border-4 border-sage border-t-forest rounded-full animate-spin mb-4"></div>
                                            <p className="text-xs text-forest font-bold tracking-widest animate-pulse">{uploadStatus}</p>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs font-bold tracking-widest">CAMBIAR IMAGEN</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={loading}
                                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-wait"
                                    />
                                </div>
                                <p className="text-xs text-center text-gray-400">Click o arrastra para subir nueva imagen {withBlur && "(Se generará versión desenfocada automáticamente)"}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-xs font-bold text-gray-500 hover:text-black tracking-widest transition-colors"
                        >
                            CANCELAR
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`px-8 py-2 bg-forest text-white text-xs font-bold tracking-widest rounded-full hover:bg-black transition-all shadow-lg ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditModal;








