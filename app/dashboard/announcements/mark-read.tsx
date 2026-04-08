'use client';

import { useEffect } from "react";
import { markAnnouncementsAsRead } from "@/lib/actions/announcement";

export function MarkAnnouncementsRead() {
    useEffect(() => {
        markAnnouncementsAsRead();
    }, []);

    return null; // Invisible component
}
