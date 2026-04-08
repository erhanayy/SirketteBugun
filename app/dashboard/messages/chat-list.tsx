'use client';

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { User, Users, Lock } from 'lucide-react';

interface ChatListProps {
    chats: any[];
    currentUserId?: string;
    currentUserRole?: string;
}

export default function ChatList({ chats, currentUserId, currentUserRole }: ChatListProps) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 w-full md:w-80 lg:w-96 flex-shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                <h1 className="text-xl font-bold">Mesajlar</h1>
                {currentUserRole === 'admin' && (
                    <Link
                        href="/dashboard/messages/new"
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                        <Users className="w-5 h-5" />
                    </Link>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        Henüz hiç sohbet yok.
                    </div>
                ) : (
                    chats.map((chat) => {
                        const isActive = pathname === `/dashboard/messages/${chat.id}`;
                        const lastMessage = chat.messages?.[0];

                        return (
                            <Link
                                key={chat.id}
                                href={`/dashboard/messages/${chat.id}`}
                                className={cn(
                                    "flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-gray-100 dark:border-zinc-800/50",
                                    isActive && "bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500"
                                )}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500">
                                        {chat.imageUrl ? (
                                            <img src={chat.imageUrl} alt={chat.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <Users className="w-6 h-6" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={cn("font-medium truncate", isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-gray-100")}>
                                            {chat.name || chat.participants?.filter((p: any) => p.userId !== currentUserId).map((p: any) => p.user?.fullName).join(', ') || "İsimsiz Grup"}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            {lastMessage && (
                                                <span className="text-xs text-gray-500 flex-shrink-0">
                                                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false, locale: tr }).replace('yaklaşık ', '')}
                                                </span>
                                            )}
                                            {chat.unreadCount > 0 && (
                                                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                                    {chat.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500 truncate pr-2">
                                            {lastMessage ? (
                                                <>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">
                                                        {lastMessage.senderId === currentUserId ? 'Sen:' : ''}
                                                    </span>
                                                    {lastMessage.content}
                                                </>
                                            ) : (
                                                <span className="italic">Henüz mesaj yok</span>
                                            )}
                                        </p>
                                        {chat.isLocked && <Lock className="w-3 h-3 text-gray-400" />}
                                    </div>
                                </div>
                            </Link>);
                    })
                )}
            </div>
        </div>
    );
}
