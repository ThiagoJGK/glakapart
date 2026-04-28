/**
 * Generates a blurred version of an image file using HTML5 Canvas.
 * @param file The original image file.
 * @param blurAmount The blur amount in pixels (default: 10).
 * @returns A Promise resolving to the blurred File object.
 */
export const generateBlurredImage = (file: File, blurAmount: number = 20): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Set canvas size (keep it reasonable to save size)
            // We can downscale significantly for the blurred version to save bandwidth
            const scale = 0.2; // 20% size is usually enough for a blurred background
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            // Draw and blur
            ctx.filter = `blur(${blurAmount * scale}px)`;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);
                if (blob) {
                    const blurredFile = new File([blob], `blurred_${file.name}`, {
                        type: file.type,
                        lastModified: Date.now(),
                    });
                    resolve(blurredFile);
                } else {
                    reject(new Error('Canvas to Blob failed'));
                }
            }, file.type, 0.85); // 0.85 quality
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Image load failed'));
        };

        img.src = url; // ← línea que faltaba: sin esto img.onload nunca se dispara
    });
};

/**
 * Optimizes an image for web by resizing it if it's too large and converting it to WebP.
 * @param file The original image file.
 * @param maxWidth The maximum width allowed (default: 1920).
 * @param quality The WebP compression quality (0 to 1, default: 0.8).
 * @returns A Promise resolving to the optimized File object.
 */
export const optimizeImageForWeb = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
        // Skip non-images or SVGs/GIFs which might lose animation or get unnecessarily rasterized
        if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
            resolve(file);
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                URL.revokeObjectURL(url);
                resolve(file); // Fallback to original if canvas fails
                return;
            }

            // Calculate new dimensions
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = height * ratio;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Export to WebP
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(url);
                if (blob) {
                    // Create new file preserving the name but changing extension
                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                    const optimizedFile = new File([blob], newFileName, {
                        type: 'image/webp',
                        lastModified: Date.now(),
                    });

                    // If the optimized file is somehow larger (rare, but possible with very small jpegs),
                    // or if it failed to compress significantly, we could fallback to original.
                    // But generally we just return the optimized one.
                    resolve(optimizedFile);
                } else {
                    resolve(file); // Fallback
                }
            }, 'image/webp', quality);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(file); // Fallback to original if it fails to load as image
        };

        img.src = url;
    });
};


