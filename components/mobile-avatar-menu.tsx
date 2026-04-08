'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, LogOut, LayoutDashboard, CreditCard, Building } from 'lucide-react';

interface MobileAvatarMenuProps {
    userName: string;           // "Erhan Ayyıldız" → initials "EA"
    userRole: string;           // 'admin' | 'staff' | 'manager' | 'member'
    isApplicationAdmin?: boolean;
    logoUrl?: string | null;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function MobileAvatarMenu({ userName, userRole, isApplicationAdmin, logoUrl }: MobileAvatarMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const initials = getInitials(userName || 'A');
    const isManager = userRole === 'admin' || userRole === 'staff' || userRole === 'manager';

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        <div ref={ref} className="relative md:hidden">
            {/* Avatar button */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm"
                aria-label="Profil menüsü"
            >
                {initials}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-10 w-52 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-700 z-50 overflow-hidden">

                    {/* Yönetim Bölümü */}
                    {(isManager || isApplicationAdmin) && (
                        <>
                            {isManager && (
                                <>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Genel Bakış
                                    </Link>
                                    <Link
                                        href="/dashboard/tenant-settings"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                                    >
                                        <Building className="w-4 h-4" />
                                        Şirket Bilgileri
                                    </Link>
                                    <Link
                                        href="/dashboard/ibans"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Banka Hesapları
                                    </Link>
                                </>
                            )}
                            {isApplicationAdmin && (
                                <>
                                    <Link
                                        href="/dashboard/admin/tenants"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                                    >
                                        <Building className="w-4 h-4" />
                                        Şirket Yönetimi
                                    </Link>
                                    <Link
                                        href="/dashboard/admin/payment-entry"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Ödeme Girişi
                                    </Link>
                                </>
                            )}

                            {/* Divider */}
                            <div className="border-t border-gray-100 dark:border-zinc-700 my-1" />
                        </>
                    )}

                    {/* Ayarlar */}
                    <Link
                        href="/dashboard/settings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                    >
                        <Settings className="w-4 h-4" />
                        Ayarlar
                    </Link>

                    {/* Divider */}
                    <div className="border-t border-gray-100 dark:border-zinc-700 my-1" />

                    {/* Çıkış */}
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition"
                    >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                    </button>
                </div>
            )}
        </div>
    );
}
