'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function BadgePoller() {
    const router = useRouter();

    useEffect(() => {
        // Poll every 60 seconds to refresh badge counts via server actions in layout
        const interval = setInterval(() => {
            // Only poll if the app is currently visible and the device is online
            if (
                router &&
                typeof router.refresh === 'function' &&
                document.visibilityState === 'visible' &&
                navigator.onLine
            ) {
                router.refresh();
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [router]);

    return null;
}
