/**
 * Helper utility to optimize Cloudinary delivery URLs dynamically.
 * It inserts format and quality auto transformations along with dimensions sizing.
 *
 * Example URL:
 * https://res.cloudinary.com/dpm4judv4/image/upload/v1717004123/kcwf8npshn6hz5wdc9gu.webp
 *
 * Becomes (with width=800):
 * https://res.cloudinary.com/dpm4judv4/image/upload/f_auto,q_auto,w_800,c_limit/v1717004123/kcwf8npshn6hz5wdc9gu.webp
 */
export const getOptimizedCloudinaryUrl = (url: string | null | undefined, width?: number, height?: number): string => {
    if (!url) return '';
    
    // Check if it is a Cloudinary URL
    if (!url.includes('res.cloudinary.com')) return url;
    
    // If it already has optimization transforms, do not duplicate them
    if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto')) return url;
    
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return url;
    
    const prefix = url.substring(0, uploadIndex + 8); // 'https://res.cloudinary.com/.../upload/'
    const suffix = url.substring(uploadIndex + 8);
    
    const transforms = ['f_auto', 'q_auto'];
    
    if (width) {
        transforms.push(`w_${width}`);
    }
    if (height) {
        transforms.push(`h_${height}`);
    }
    
    // Choose appropriate crop mode
    if (width && height) {
        transforms.push('c_fill'); // Crop to fill specified dimensions
    } else if (width) {
        transforms.push('c_limit'); // Prevent upscaling beyond source size
    }
    
    return `${prefix}${transforms.join(',')}/${suffix}`;
};
