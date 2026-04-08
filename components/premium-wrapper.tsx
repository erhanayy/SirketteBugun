'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { PremiumUpsellModal } from "./premium-upsell-modal";
import { X, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface PremiumWrapperProps {
    children: React.ReactNode;
    isPremium: boolean;
    adWaitSeconds: number;
    userRole: string;
}

export function PremiumWrapper({ children, isPremium, adWaitSeconds, userRole }: PremiumWrapperProps) {
    const pathname = usePathname();
    const [upsellOpen, setUpsellOpen] = useState(false);

    // Interstitial Ad Logic
    const [showInterstitial, setShowInterstitial] = useState(false);
    const [countdown, setCountdown] = useState(adWaitSeconds);
    const [lastPath, setLastPath] = useState(pathname);

    useEffect(() => {
        // Trigger Interstitial on route change, but only if not premium
        if (!isPremium && pathname !== lastPath && !pathname.includes('home')) {
            setShowInterstitial(true);
            setCountdown(adWaitSeconds);
            setLastPath(pathname);
        } else {
            setLastPath(pathname);
        }
    }, [pathname, isPremium, adWaitSeconds, lastPath]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showInterstitial && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [showInterstitial, countdown]);

    // Expose openUpsell function to window to trigger from anywhere safely
    useEffect(() => {
        // @ts-ignore
        window.openPremiumUpsell = () => setUpsellOpen(true);
        return () => {
            // @ts-ignore
            delete window.openPremiumUpsell;
        }
    }, []);

    return (
        <>
            {showInterstitial ? (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col relative">
                        {/* Fake Google Ad Div */}
                        <div className="bg-zinc-100 dark:bg-zinc-800 w-full aspect-video flex flex-col items-center justify-center relative p-8 text-center pattern-isometric pattern-zinc-200 dark:pattern-zinc-900 pattern-bg-white dark:pattern-bg-black pattern-size-4 pattern-opacity-40">
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/80 dark:bg-black/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                Sponsorlu <ExternalLink className="w-3 h-3" />
                            </div>

                            <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                                <div className="w-16 h-16 bg-blue-500 rounded-full animate-pulse"></div>
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-锌-100 mb-2">Google AdSense Yer Tutucu</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm">
                                Reklam alanı buraya entegre edilecektir. Şu an test modundasınız.
                            </p>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 shrink-0 flex items-center justify-between">
                            <button
                                onClick={() => { setShowInterstitial(false); setUpsellOpen(true); }}
                                className="text-sm font-semibold text-amber-600 dark:text-amber-500 hover:text-amber-700 hover:underline transition-colors"
                            >
                                Reklamları Kaldır (Premium)
                            </button>

                            {countdown > 0 ? (
                                <div className="text-sm font-bold text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-4 py-2 rounded-full tabular-nums">
                                    Reklamı geçmek için {countdown}
                                </div>
                            ) : (
                                <Button
                                    onClick={() => setShowInterstitial(false)}
                                    variant="default"
                                    className="bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-full px-6 transition-all duration-300 transform scale-100 hover:scale-105"
                                >
                                    Reklamı Geç <X className="ml-2 w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                children
            )}

            <PremiumUpsellModal
                open={upsellOpen}
                onOpenChange={setUpsellOpen}
                userRole={userRole}
            />
        </>
    );
}
