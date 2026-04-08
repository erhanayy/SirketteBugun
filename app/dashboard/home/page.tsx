import { getSposts, markSpostsAsRead } from "@/lib/actions/spost";
import { getCurrentTenant } from "@/lib/data/tenant";
import FeedClient from "./feed-client";

import { checkIsPremium } from "@/lib/actions/premium";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    // Premium Features
    const isPremium = await checkIsPremium();

    // Her ana sayfaya girişinde okunmamış bildirimleri sıfırla
    await markSpostsAsRead();

    // İlk gönderileri yükle
    const initialPosts = await getSposts(0);

    return (
        <div className="max-w-2xl mx-auto py-4 space-y-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Ana Sayfa
            </h1>

            <FeedClient
                initialPosts={initialPosts}
                tenantData={tenantData}
                isPremium={isPremium}
            />
        </div>
    );
}
