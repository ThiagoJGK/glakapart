// Cloudinary Service
import { optimizeImageForWeb } from '@/utils/imageUtils';

const CLOUD_NAME = 'dpm4judv4'; // Extracted from your screenshot
const UPLOAD_PRESET = 'GlakApart'; // User provided

export type UploadProgressHandler = (status: 'optimizing' | 'uploading') => void;

export const uploadImage = async (file: File, onProgress?: UploadProgressHandler): Promise<string> => {
    try {
        // 1. Optimize image before upload
        if (onProgress) onProgress('optimizing');
        const optimizedFile = await optimizeImageForWeb(file);

        // 2. Upload to Cloudinary
        if (onProgress) onProgress('uploading');
        const formData = new FormData();
        formData.append('file', optimizedFile);
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary Error:', errorData);
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};


