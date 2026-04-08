"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "@/lib/actions/notification";

export function NotificationBell({ tenantId, userId }: { tenantId: string, userId: string }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const [notifs, count] = await Promise.all([
                getNotifications(tenantId, userId, 10),
                getUnreadNotificationCount(tenantId, userId)
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (e) {
            console.error("Failed fetching notifications", e);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 secs only if visible and online
        const interval = setInterval(() => {
            if (document.visibilityState === 'visible' && navigator.onLine) {
                fetchNotifications();
            }
        }, 60000);
        return () => clearInterval(interval);
    }, [tenantId, userId]);

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (notif: any) => {
        setIsOpen(false);
        if (!notif.isRead) {
            await markNotificationAsRead(notif.id);
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        if (notif.actionUrl) {
            router.push(notif.actionUrl);
        }
    };

    const handleMarkAllRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await markAllNotificationsAsRead(tenantId, userId);
        setUnreadCount(0);
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 relative focus:outline-none"
            >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-zinc-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed sm:absolute inset-x-4 top-20 sm:inset-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[80vh] flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Bildirimler</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors"
                            >
                                <Check className="w-3 h-3" />
                                Tümünü Okundu İşaretle
                            </button>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-6 py-10 text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                                    <Bell className="w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Bildirim Yok</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Henüz yeni bir bildirim almadınız.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {notifications.map((notif) => (
                                    <li key={notif.id}>
                                        <button
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors flex gap-3 ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                        >
                                            <div className="mt-1 flex-shrink-0">
                                                {!notif.isRead ? (
                                                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500"></div>
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full border border-gray-300 dark:border-zinc-600"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-200'} truncate`}>
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                                    {notif.body}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                                                    {new Date(notif.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {notif.actionUrl && (
                                                <div className="flex items-center justify-center text-gray-400 px-1 hover:text-blue-500">
                                                    <ExternalLink className="w-4 h-4" />
                                                </div>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
