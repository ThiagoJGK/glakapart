import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // Firebase-hosted images, no Next.js image optimization needed
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
  async redirects() {
    return [
      // Old site routes → new Next.js routes
      { source: '/home', destination: '/', permanent: true },
      { source: '/urdinarrain', destination: '/lugares', permanent: true },
      { source: '/proximamente', destination: '/', permanent: true },
      // Old WordPress routes with Search Console impressions
      { source: '/arenas-blancas', destination: '/lugares/arenas-blancas', permanent: true },
      { source: '/estancia-la-querencia-y-molino-forclaz', destination: '/lugares', permanent: true },
      { source: '/museo-regional-de-urdinarrain', destination: '/lugares', permanent: true },
      { source: '/parque-santa-candida', destination: '/lugares', permanent: true },
      { source: '/nacarado', destination: '/apartamentos/nacarado', permanent: true },
      { source: '/arrebol', destination: '/apartamentos/arrebol', permanent: true },
      { source: '/glak-apart', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
