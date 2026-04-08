'use client';

import ChatList from './chat-list';
import { usePathname } from 'next/navigation';

/**
 * MessagesLayoutClient — Mobile WhatsApp style:
 * - /dashboard/messages          → show chat list only (mobile), both (desktop)
 * - /dashboard/messages/[id]     → show chat window only (mobile), both (desktop)
 */
export default function MessagesLayoutClient({
    children,
    chats,
    currentUserId,
    currentUserRole,
}: {
    children: React.ReactNode;
    chats: any[];
    currentUserId?: string;
    currentUserRole?: string;
}) {
    const pathname = usePathname();
    const isChatOpen = pathname !== '/dashboard/messages' && pathname !== '/dashboard/messages/new';

    return (
        <div className="flex h-[calc(100vh-7rem)] md:h-[calc(100vh-4rem)] -m-4 md:-m-6">
            {/* Chat List: hidden on mobile when a chat is open */}
            <div className={`${isChatOpen ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-shrink-0`}>
                <ChatList chats={chats} currentUserId={currentUserId} currentUserRole={currentUserRole} />
            </div>

            {/* Chat Window: hidden on mobile when no chat is selected */}
            <div className={`${isChatOpen ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0 bg-gray-50 dark:bg-zinc-950`}>
                {children}
            </div>
        </div>
    );
}
