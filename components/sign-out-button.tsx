'use client';

import { LogOut } from "lucide-react"

export function SignOutButton() {
    const handleSignOut = async () => {
        try {
            const csrfRes = await fetch('/api/auth/csrf');
            const { csrfToken } = await csrfRes.json();
            await fetch('/api/auth/signout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `csrfToken=${csrfToken}`,
            });
        } catch (e) { /* ignore */ }
        window.location.href = '/login';
    };

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 w-full transition-colors"
        >
            <LogOut className="w-5 h-5" />
            Çıkış Yap
        </button>
    )
}
