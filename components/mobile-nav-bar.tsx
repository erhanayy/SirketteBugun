'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Calendar,
    Bell,
    MessageCircle,
    Briefcase,
    CreditCard,
    Building,
    Users,
} from 'lucide-react';

interface MobileNavBarProps {
    unreadAnnouncements?: number;
    unreadMessages?: number;
    unreadSposts?: number;
    unreadEvents?: number;
}

const NAV_ITEMS = [
    { href: '/dashboard/home', icon: Home, badgeKey: 'unreadSposts' as const },
    { href: '/dashboard/events', icon: Calendar, badgeKey: 'unreadEvents' as const },
    { href: '/dashboard/announcements', icon: Bell, badgeKey: 'unreadAnnouncements' as const },
    { href: '/dashboard/messages', icon: MessageCircle, badgeKey: 'unreadMessages' as const },
    { href: '/dashboard/business-cards', icon: Briefcase },
    { href: '/dashboard/dues', icon: CreditCard },
    { href: '/dashboard/organization', icon: Building },
    { href: '/dashboard/members', icon: Users },
];

export function MobileNavBar({
    unreadAnnouncements = 0,
    unreadMessages = 0,
    unreadSposts = 0,
    unreadEvents = 0,
}: MobileNavBarProps) {
    const pathname = usePathname();

    const badges: Record<string, number> = {
        unreadSposts,
        unreadEvents,
        unreadAnnouncements,
        unreadMessages,
    };

    return (
        <nav className="lg:hidden flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-1 flex-shrink-0">
            {NAV_ITEMS.map(({ href, icon: Icon, badgeKey }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');
                const badgeCount = badgeKey ? badges[badgeKey] : 0;

                return (
                    <Link
                        key={href}
                        href={href}
                        className={`relative flex flex-col items-center justify-center flex-1 py-1.5 rounded-lg transition-colors ${isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
                        {badgeCount > 0 && (
                            <span className="absolute top-0 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm">
                                {badgeCount > 9 ? '9+' : badgeCount}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
