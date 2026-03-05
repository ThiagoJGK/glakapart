'use client';
import React, { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';

const BEHOLD_URL = "https://feeds.behold.so/jy5tPEeLoFWFo1xciiyA";

interface InstagramPost {
    id: string;
    mediaUrl: string;
    permalink: string;
    caption?: string;
    mediaInput?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
}

const MOCK_POSTS = [
    { id: '1', mediaUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80', permalink: '#' },
    { id: '2', mediaUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80', permalink: '#' },
    { id: '3', mediaUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80', permalink: '#' },
    { id: '4', mediaUrl: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&q=80', permalink: '#' }
];

const InstagramFeed: React.FC = () => {
    const [posts, setPosts] = useState<InstagramPost[]>([]);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await fetch(BEHOLD_URL);
                if (!response.ok) throw new Error('Failed to fetch instagram feed');
                const data = await response.json();

                // Fix: Behold returns { posts: [...] }, not an array directly
                const feedItems = data.posts || [];

                const mappedPosts = feedItems.slice(0, 6).map((post: any) => ({
                    id: post.id,
                    // Use thumbnailUrl for Videos to ensure a static image is shown
                    mediaUrl: (post.mediaType === 'VIDEO' || post.mediaType === 'REEL') && post.thumbnailUrl
                        ? post.thumbnailUrl
                        : post.mediaUrl,
                    permalink: post.permalink,
                    caption: post.prunedCaption || post.caption || ""
                }));

                setPosts(mappedPosts);
            } catch (error) {
                console.warn("Error fetching Behold.so feed.", error);
            }
        };

        fetchFeed();
    }, []);

    return (
        <section className="py-12 bg-white border-t border-forest/5">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h2 className="font-script text-4xl text-forest">Seguinos en Instagram</h2>
                    </div>
                    <a
                        href="https://instagram.com/glakapart"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 px-5 py-2 bg-gray-100 text-forest rounded-full hover:bg-forest hover:text-white transition-all duration-300"
                    >
                        <Instagram className="w-4 h-4" />
                        <span className="text-xs tracking-wider uppercase font-medium">@glakapart</span>
                    </a>
                </div>

                {/* Single Row of 6 items */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {posts.map((post) => (
                        <a
                            key={post.id}
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer"
                        >
                            <img width={800} height={600}
                                src={post.mediaUrl}
                                alt={post.caption || "Instagram Post"}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2 text-center">
                                <Instagram className="w-5 h-5 text-white mb-1 opacity-80" />
                                <p className="text-[10px] text-white/90 font-ui line-clamp-3 leading-tight">
                                    {post.caption}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default InstagramFeed;








