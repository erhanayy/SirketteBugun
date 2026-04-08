'use client';

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ForcePasswordCheckProps {
    forcePasswordChange?: boolean;
}

export function ForcePasswordCheck({ forcePasswordChange }: ForcePasswordCheckProps) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (forcePasswordChange) {
            // If user MUST change password, strictly keep them on the change-password page
            if (pathname !== '/dashboard/change-password') {
                router.push('/dashboard/change-password');
            }
        }
    }, [forcePasswordChange, pathname, router]);

    return null;
}
