import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://glakapart.com.ar';
    const apartments = ['nacarado', 'arrebol', 'arje'];

    return [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
        { url: `${baseUrl}/gastronomia`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/lugares`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/eventos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        ...apartments.map(id => ({
            url: `${baseUrl}/apartamentos/${id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        })),
    ];
}
