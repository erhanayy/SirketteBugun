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
    ClipboardList,
    StickyNote,
    Workflow
} from 'lucide-react';

interface MobileNavBarProps {
    unreadAnnouncements?: number;
    unreadMessages?: number;
    unreadSposts?: number;
    unreadEvents?: number;
}

const WORK_NAV_ITEMS = [
    { href: '/dashboard/members', icon: Users },
    { href: '/dashboard/organization', icon: Building },
    { href: '/dashboard/projects', icon: ClipboardList },
    { href: '/dashboard/reminders', icon: Bell },
    { href: '/dashboard/notes', icon: StickyNote },
    { href: '/dashboard/flows', icon: Workflow },
];

export function MobileWorkNavBar() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden flex items-center justify-around border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-2 flex-shrink-0 shadow-sm z-10 relative">
            {WORK_NAV_ITEMS.map(({ href, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');

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
                    </Link>
                );
            })}
        </nav>
    );
}

const SOCIAL_NAV_ITEMS = [
    { href: '/dashboard/home', icon: Home, badgeKey: 'unreadSposts' as const },
    { href: '/dashboard/events', icon: Calendar, badgeKey: 'unreadEvents' as const },
    { href: '/dashboard/announcements', icon: Bell, badgeKey: 'unreadAnnouncements' as const },
    { href: '/dashboard/messages', icon: MessageCircle, badgeKey: 'unreadMessages' as const },
];

export function MobileSocialNavBar({
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
        <nav className="lg:hidden flex items-center justify-between border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 pt-3 flex-shrink-0 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] z-10 relative mt-auto">
            {SOCIAL_NAV_ITEMS.map(({ href, icon: Icon, badgeKey }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');
                const badgeCount = badgeKey ? badges[badgeKey] : 0;

                return (
                    <Link
                        key={href}
                        href={href}
                        className={`relative flex flex-col items-center justify-center flex-1 rounded-lg transition-colors ${isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        <Icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 1.8} />
                        {badgeCount > 0 && (
                            <span className="absolute -top-1 right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm">
                                {badgeCount > 9 ? '9+' : badgeCount}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
