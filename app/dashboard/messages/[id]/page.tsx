import { getChat, getMessages } from "@/lib/actions/chat";
import { getCurrentTenant } from "@/lib/data/tenant";
import ChatWindow from "./chat-window";
import { redirect } from "next/navigation";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const tenantData = await getCurrentTenant();

    if (!tenantData) return <div>Yetkisiz erişim.</div>;

    const chat = await getChat(id);
    if (!chat) redirect('/dashboard/messages');

    const messages = await getMessages(id);

    // Sort logic for display (if not done in action)
    // messages are getting fetched ASC usually or DESC then reverse.
    // Let's assume action returns them in correct order for display (oldest top, newest bottom)

    return (
        <ChatWindow
            chat={chat}
            messages={messages}
            currentUserId={tenantData.userId}
            currentUserRole={tenantData.userRole}
        />
    );
}
