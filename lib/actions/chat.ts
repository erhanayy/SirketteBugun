'use server';

import { db } from "@/lib/db";
import { chats, chatParticipants, messages, messageReactions, users, tenantUsers } from "@/lib/db/schema";
import { eq, and, desc, asc, inArray, sql, not } from "drizzle-orm";
import { getCurrentTenant } from "@/lib/data/tenant";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";
import { checkIsPremium, getSystemLimits } from "./premium";

// --- Chat Getters ---

export async function getChats() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    const { tenantId, userId } = tenantData;

    // Fetch chats where the user is a participant
    // Ordered by the last message created_at (or chat created_at if no messages)
    // This is a bit complex with Drizzle, so we might need a raw query or smart joins.
    // For MVP, we'll fetch chats user is in, and then sort by last activity in memory or separate query.

    // console.log("getChats - Tenant:", tenantId, "User:", userId);

    const userChats = await db.query.chatParticipants.findMany({
        where: and(
            eq(chatParticipants.userId, userId),
            eq(chatParticipants.isActive, true)
        ),
        with: {
            chat: {
                with: {
                    messages: {
                        orderBy: [desc(messages.createdAt)],
                        limit: 1,
                        where: eq(messages.isActive, true)
                    },
                    participants: {
                        where: eq(chatParticipants.isActive, true),
                        with: {
                            user: true
                        }
                    }
                }
            }
        }
    });

    // console.log("getChats - Raw User Chats Count:", userChats.length);
    // if (userChats.length > 0) {
    //    console.log("Sample Chat TenantId:", userChats[0].chat.tenantId);
    //    console.log("Current TenantId:", tenantId);
    //    console.log("Equality Check:", userChats[0].chat.tenantId === tenantId);
    // }

    // Filter by tenant (just in case, though chat creation should enforce it)
    const tenantChats = userChats
        .map(cp => cp.chat)
        .filter(chat => chat && chat.tenantId === tenantId && chat.isActive);

    // console.log("getChats - Final Filtered Count:", tenantChats.length);

    // Sort by last message time or chat creation time
    tenantChats.sort((a, b) => {
        const dateA = a.messages[0]?.createdAt || a.createdAt;
        const dateB = b.messages[0]?.createdAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    // Calculate unread counts
    // For MVP, we'll do this in memory or simple checks. 
    // Ideally, we'd use a count query.
    // For each chat, find the user's participant record to get lastReadAt
    const chatsWithUnread = tenantChats.map(chat => {
        const userParticipant = userChats.find(uc => uc.chatId === chat.id);
        const lastReadAt = userParticipant?.joinedAt || new Date(0); // Actually userParticipant.lastReadAt, schema updated?
        // Note: Drizzle object relations might not show the new field immediately if types aren't regenerated or we are using 'findMany' with relations.
        // It's safer to use raw values or ensure we are fetching what we need. 
        // Let's assume userParticipant has lastReadAt if we fetch it.
        // Wait, userChats comes from db.query.chatParticipants.findMany which is typed.
        // If I updated schema, I should restart TS server or just cast for now.
        const readTime = (userParticipant as any).lastReadAt || new Date(0);

        const unreadCount = chat.messages.filter(m => new Date(m.createdAt) > new Date(readTime) && m.senderId !== userId).length;

        return {
            ...chat,
            unreadCount
        };
    });

    return chatsWithUnread;
}

export async function getChat(chatId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    const chat = await db.query.chats.findFirst({
        where: and(
            eq(chats.id, chatId),
            eq(chats.tenantId, tenantData.tenantId),
            eq(chats.isActive, true)
        ),
        with: {
            participants: {
                where: eq(chatParticipants.isActive, true),
                with: {
                    user: true
                }
            }
        }
    });

    if (!chat) return null;

    // Verify user is participant or admin (if public channels implemented later)
    const isParticipant = chat.participants.some(p => p.userId === tenantData.userId);
    if (!isParticipant) return null; // Or handle permission error

    return chat;
}

export async function getMessages(chatId: string, limit = 50, offset = 0) {
    // Basic verification
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    return await db.query.messages.findMany({
        where: and(
            eq(messages.chatId, chatId),
            eq(messages.isActive, true)
        ),
        orderBy: [asc(messages.createdAt)],
        limit: limit,
        offset: offset,
        with: {
            sender: true,
            reactions: {
                with: {
                    user: true
                }
            }
        }
    });
}


// --- Chat Management ---

export async function createGroup(prevState: any, formData: FormData) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { message: "Oturum hatası.", success: false };

    const { tenantId, userId, userRole } = tenantData;

    // RBAC: Only Admin/Manager/Staff can create groups
    const allowedRoles = ['admin', 'manager', 'staff'];
    if (!allowedRoles.includes(userRole)) {
        return { message: "Grup oluşturma yetkiniz yok.", success: false };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const participantsJson = formData.get("participants") as string; // Expecting JSON array of userIds
    let participantIds: string[] = [];

    if (!name || name.length < 2) return { message: "Grup adı en az 2 karakter olmalıdır.", success: false };

    try {
        if (participantsJson) {
            participantIds = JSON.parse(participantsJson);
        }
    } catch (e) {
        console.error("Failed to parse participants", e);
    }

    // Include creator in participants
    if (userId && !participantIds.includes(userId)) {
        participantIds.push(userId);
    }

    // Filter out invalid IDs
    participantIds = participantIds.filter(id => id && typeof id === 'string' && id.length > 0);

    try {
        const [newChat] = await db.insert(chats).values({
            tenantId,
            name,
            description,
            createdBy: userId || null,
            isLocked: false,
        }).returning();

        // Add participants
        if (participantIds.length > 0) {
            const values = participantIds.map(pid => ({
                chatId: newChat.id,
                userId: pid
            }));
            await db.insert(chatParticipants).values(values);
        }

        revalidatePath("/dashboard/messages");
        return { message: "Grup oluşturuldu.", success: true, chatId: newChat.id };

    } catch (error: any) {
        console.error("Create Group Error:", error);
        return { message: `Grup oluşturulurken hata oluştu: ${error.message || error}`, success: false };
    }
}

export async function markChatAsRead(chatId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false };
    const { userId } = tenantData;

    try {
        await db.update(chatParticipants)
            .set({ lastReadAt: new Date() })
            .where(and(
                eq(chatParticipants.chatId, chatId),
                eq(chatParticipants.userId, userId)
            ));

        revalidatePath("/dashboard/messages");
        revalidatePath(`/dashboard/messages/${chatId}`);
        return { success: true };
    } catch (error) {
        console.error("Mark Read Error:", error);
        return { success: false };
    }
}

// --- Messaging ---

export async function sendMessage(chatId: string, content: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: "Unauthorized" };

    const { userId, userRole } = tenantData;

    if (!content || !content.trim()) return { success: false, error: "Empty message" };

    try {
        // 1. Check Chat Lock Status & Permissions
        const chat = await db.query.chats.findFirst({
            where: eq(chats.id, chatId),
            columns: { isLocked: true, tenantId: true, name: true }
        });

        if (!chat) return { success: false, error: "Chat not found" };

        const isPremium = await checkIsPremium();
        if (!isPremium) {
            const limits = await getSystemLimits();
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const countResult = await db.execute(sql`
                SELECT count(*) as msg_count 
                FROM messages 
                WHERE sender_id = ${userId}
                  AND created_at >= ${startOfDay.toISOString()}
            `);
            const currentCount = Number(countResult.rows[0].msg_count) || 0;

            if (currentCount >= limits.messageDailyLimit) {
                return { success: false, error: "Günlük mesaj limitinizi doldurdunuz. Sınırsız mesajlaşma için Premium'a geçin." };
            }
        }

        if (chat.isLocked) {
            const allowedRoles = ['admin', 'manager', 'staff'];
            if (!allowedRoles.includes(userRole)) {
                return { success: false, error: "Bu grup kilitli. Sadece yöneticiler mesaj gönderebilir." };
            }
        }

        // 2. Insert Message
        await db.insert(messages).values({
            chatId,
            senderId: userId,
            content: content.trim()
        });

        // Notify other participants
        const participants = await db.query.chatParticipants.findMany({
            where: and(eq(chatParticipants.chatId, chatId), eq(chatParticipants.isActive, true)),
            columns: { userId: true }
        });
        const targetIds = participants.map(p => p.userId).filter(id => id !== userId);

        if (targetIds.length > 0) {
            const chatName = chat.name ? ` (${chat.name})` : '';
            await createNotification(
                tenantData.tenantId,
                targetIds,
                'message',
                `Yeni Mesaj${chatName}`,
                content.trim().substring(0, 50) + '...',
                `/dashboard/messages/${chatId}`
            );
        }

        // Auto-mark as read for sender (optional but good UX)
        // await markChatAsRead(chatId); // Maybe not needed as own message

        revalidatePath(`/dashboard/messages/${chatId}`);
        revalidatePath(`/dashboard/messages`);
        return { success: true };

    } catch (error: any) {
        console.error("Send Message Error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteMessage(messageId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false };
    const { userId, userRole } = tenantData;

    try {
        const msg = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
            columns: { senderId: true, chatId: true } // Need ChatId to revalidate?
        });

        if (!msg) return { success: false, error: "Not found" };

        // Allow deletion if: User is Sender OR User is Admin/Manager/Staff
        const isSender = msg.senderId === userId;
        const isAdmin = ['admin', 'manager', 'staff'].includes(userRole);

        if (!isSender && !isAdmin) {
            return { success: false, error: "Yetkisiz işlem." };
        }

        await db.update(messages)
            .set({ isActive: false }) // Soft delete
            .where(eq(messages.id, messageId));

        revalidatePath(`/dashboard/messages`);
        // If we modify query above we can get chatId. done.

        return { success: true };

    } catch (error) {
        return { success: false };
    }
}

export async function toggleReaction(messageId: string, emoji: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false };
    const { userId } = tenantData;

    try {
        // Get message to find chatId for revalidation
        const message = await db.query.messages.findFirst({
            where: eq(messages.id, messageId),
            columns: { chatId: true }
        });

        const existingReaction = await db.query.messageReactions.findFirst({
            where: and(
                eq(messageReactions.messageId, messageId),
                eq(messageReactions.userId, userId)
            )
        });

        if (existingReaction) {
            if (existingReaction.emoji === emoji) {
                // Remove reaction (toggle off)
                await db.delete(messageReactions).where(eq(messageReactions.id, existingReaction.id));
            } else {
                // Change reaction
                await db.update(messageReactions)
                    .set({ emoji })
                    .where(eq(messageReactions.id, existingReaction.id));
            }
        } else {
            // Add new reaction
            await db.insert(messageReactions).values({
                messageId,
                userId,
                emoji
            });
        }

        revalidatePath('/dashboard/messages'); // Broad revalidate
        if (message) {
            revalidatePath(`/dashboard/messages/${message.chatId}`);
        }
        return { success: true };
    } catch (error) {
        console.error("Reaction Error:", error);
        return { success: false };
    }
}

export async function toggleChatLock(chatId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false };
    const { userRole } = tenantData;

    if (!['admin', 'manager', 'staff'].includes(userRole)) return { success: false, error: "Yetkisiz." };

    const chat = await db.query.chats.findFirst({ where: eq(chats.id, chatId), columns: { isLocked: true } });
    if (!chat) return { success: false };

    await db.update(chats)
        .set({ isLocked: !chat.isLocked })
        .where(eq(chats.id, chatId));

    revalidatePath(`/dashboard/messages/${chatId}`);
    return { success: true, isLocked: !chat.isLocked };
}

export async function addParticipant(chatId: string, userId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: "Unauthorized" };
    const { userRole } = tenantData;

    // Only Admin/Manager/Staff can manage participants
    const allowedRoles = ['admin', 'manager', 'staff'];
    if (!allowedRoles.includes(userRole)) {
        return { success: false, error: "Yetkisiz işlem." };
    }

    try {
        // Check if already in group
        const existing = await db.query.chatParticipants.findFirst({
            where: and(
                eq(chatParticipants.chatId, chatId),
                eq(chatParticipants.userId, userId)
            )
        });

        if (existing) {
            // Re-activate if was removed
            if (!existing.isActive) {
                await db.update(chatParticipants)
                    .set({ isActive: true, joinedAt: new Date() })
                    .where(eq(chatParticipants.id, existing.id));
            }
        } else {
            await db.insert(chatParticipants).values({
                chatId,
                userId,
                isActive: true
            });
        }

        revalidatePath(`/dashboard/messages/${chatId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Add Participant Error:", error);
        return { success: false, error: error.message };
    }
}

export async function removeParticipant(chatId: string, userId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: "Unauthorized" };
    const { userRole } = tenantData;

    // Only Admin/Manager/Staff can manage participants
    const allowedRoles = ['admin', 'manager', 'staff'];
    if (!allowedRoles.includes(userRole)) {
        return { success: false, error: "Yetkisiz işlem." };
    }

    try {
        await db.update(chatParticipants)
            .set({ isActive: false })
            .where(and(
                eq(chatParticipants.chatId, chatId),
                eq(chatParticipants.userId, userId)
            ));

        revalidatePath(`/dashboard/messages/${chatId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Remove Participant Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createOrGetDirectMessage(targetUserId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: "Unauthorized" };
    const { tenantId, userId } = tenantData;

    try {
        // Find existing DM: chat with no name, where exactly these two users are participants.
        // For simplicity, find all chats where current user is in, and check if it's a DM with target.
        const userChats = await db.query.chatParticipants.findMany({
            where: and(eq(chatParticipants.userId, userId), eq(chatParticipants.isActive, true)),
            with: { chat: { with: { participants: true } } }
        });

        const existingDM = userChats.find(uc =>
            !uc.chat.name && // DMs have no name
            uc.chat.participants.length === 2 &&
            uc.chat.participants.some(p => p.userId === targetUserId)
        );

        if (existingDM) {
            return { success: true, chatId: existingDM.chatId };
        }

        // Create new DM
        const [newChat] = await db.insert(chats).values({
            tenantId,
            name: null, // No name for DM
            isLocked: false,
            createdBy: userId
        }).returning();

        await db.insert(chatParticipants).values([
            { chatId: newChat.id, userId: userId },
            { chatId: newChat.id, userId: targetUserId }
        ]);

        revalidatePath("/dashboard/messages");
        return { success: true, chatId: newChat.id };
    } catch (error: any) {
        console.error("DM Error:", error);
        return { success: false, error: error.message };
    }
}

