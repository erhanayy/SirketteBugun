'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSposts, getSpostsRenderCount } from '@/lib/actions/spost';
import PostComposer from './post-composer';
import PostCard from './post-card';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FeedClient({ initialPosts, tenantData, isPremium }: { initialPosts: any[], tenantData: any, isPremium: boolean }) {
    const router = useRouter();
    const [posts, setPosts] = useState(initialPosts);
    const [loading, setLoading] = useState(false);
    // If we loaded exactly 'limit' size (usually 10), assume there might be more. 
    // Usually initialPosts is loaded with default limit. 
    // To be precise we could pass the actual limit from server, but checking length > 0 is fine for now.
    const [hasMore, setHasMore] = useState(initialPosts.length > 0);
    const [page, setPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);

    // Pull-to-Refresh constants
    const REFRESH_THRESHOLD = 80;
    const MAX_PULL = 120;

    // Sync initialPosts from server when router.refresh() triggers a re-render
    useEffect(() => {
        setPosts(initialPosts);
        setPage(1);
        setHasMore(initialPosts.length > 0);
        setIsRefreshing(false);
        setPullDistance(0);
    }, [initialPosts]);

    // Auto-refresh on window focus
    useEffect(() => {
        const handleFocus = () => {
            router.refresh();
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [router]);

    const handleTouchStart = (e: React.TouchEvent) => {
        const scrollPos = window.scrollY;
        if (scrollPos === 0) {
            setStartY(e.touches[0].pageY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY > 0) {
            const currentY = e.touches[0].pageY;
            const diff = currentY - startY;
            if (diff > 0) {
                // Apply tension
                const distance = Math.min(diff * 0.4, MAX_PULL);
                setPullDistance(distance);
                if (distance > 10) {
                    if (e.cancelable) e.preventDefault();
                }
            }
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance >= REFRESH_THRESHOLD) {
            setIsRefreshing(true);
            router.refresh(); // This triggers the useEffect sync above
        } else {
            setPullDistance(0);
        }
        setStartY(0);
    };

    const loadMore = async () => {
        setLoading(true);
        try {
            const limit = await getSpostsRenderCount();
            const nextPosts = await getSposts(page * limit, limit);

            if (nextPosts.length < limit) {
                setHasMore(false);
            }

            if (nextPosts.length > 0) {
                setPosts(prev => [...prev, ...nextPosts]);
                setPage(prev => prev + 1);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="space-y-6 transition-transform duration-200"
            style={{
                transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
                userSelect: pullDistance > 0 ? 'none' : 'auto'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Refresh Indicator */}
            <div
                className="absolute left-0 right-0 flex justify-center pointer-events-none"
                style={{
                    top: -40,
                    opacity: pullDistance / REFRESH_THRESHOLD,
                    transform: `rotate(${pullDistance * 3}deg)`
                }}
            >
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-md border border-gray-200 dark:border-zinc-700">
                    <Loader2 className={cn("w-5 h-5 text-blue-500", isRefreshing && "animate-spin")} />
                </div>
            </div>
            {/* Paylaşım Alanı */}
            <PostComposer
                tenantData={tenantData}
                isPremium={isPremium}
                onPostCreated={() => {
                    // Sunucudan guncel akisi almak icin next/navigation router kullaniyoruz
                    router.refresh();
                }}
            />

            {/* Gönderiler */}
            <div className="space-y-6">
                {!isPremium && posts.length > 0 && (
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center relative min-h-[120px]">
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/80 dark:bg-black/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            Sponsorlu
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-4">Reklam Alanı</p>
                        <button onClick={() => { (window as any).openPremiumUpsell?.() }} className="text-xs text-amber-600 hover:underline mt-2">Bu reklamları kaldırmak için premium'a geçin</button>
                    </div>
                )}

                {posts.length === 0 ? (
                    <div className="text-center py-10 bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700">
                        <p className="text-gray-500 dark:text-gray-400">Henüz bir paylaşım yok. İlk paylaşan sen ol!</p>
                    </div>
                ) : (
                    posts.map((post, index) => (
                        <div key={post.id} className="space-y-6">
                            <PostCard post={post} currentUser={tenantData} onUpdate={() => router.refresh()} />

                            {!isPremium && (index + 1) % 5 === 0 && (
                                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center relative min-h-[120px]">
                                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/80 dark:bg-black/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                        Sponsorlu
                                    </div>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-4">Reklam Alanı (Akış İçi)</p>
                                    <button onClick={() => { (window as any).openPremiumUpsell?.() }} className="text-xs text-amber-600 hover:underline mt-2">Bu reklamları kaldırmak için premium'a geçin</button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Daha Fazla Yükle */}
            {hasMore && posts.length > 0 && (
                <div className="text-center pb-8">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full sm:w-auto mt-4"
                    >
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {loading ? 'Yükleniyor...' : 'Daha Eski Gönderileri Yükle'}
                    </Button>
                </div>
            )}
        </div>
    );
}
