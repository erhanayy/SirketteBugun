import { getChats } from '@/lib/actions/chat';
import { getCurrentTenant } from '@/lib/data/tenant';
import MessagesLayoutClient from './messages-layout-client';

export default async function MessagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const chats = await getChats();
    const tenant = await getCurrentTenant();

    return (
        <MessagesLayoutClient
            chats={chats}
            currentUserId={tenant?.userId}
            currentUserRole={tenant?.userRole}
        >
            {children}
        </MessagesLayoutClient>
    );
}
