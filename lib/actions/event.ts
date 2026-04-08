'use server';

import { db } from "../db";
import { events, eventParticipants, users } from "../db/schema";
import { eq, and, desc, gte, lte, gt, sql } from "drizzle-orm";
import { getCurrentTenant } from "../data/tenant";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNotification } from "./notification";
import { tenantUsers } from "../db/schema";

// --- Types ---
export type EventInput = {
    title: string;
    description: string;
    rules: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    lcvDeadline: Date;
    isPaid: boolean;
    price?: number;
    ibanId?: string;
    quota?: number;
    coverImageUrl?: string;
    isPublished: boolean;
};

// --- READ Actions ---

export async function getEvents() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return [];

    // Order by Start Date Descending
    return await db.query.events.findMany({
        where: eq(events.tenantId, tenantData.tenantId),
        orderBy: [desc(events.startDate)],
        with: {
            participants: {
                with: {
                    user: true
                }
            }
        }
    });
}

export async function getEventById(id: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return null;

    return await db.query.events.findFirst({
        where: and(
            eq(events.id, id),
            eq(events.tenantId, tenantData.tenantId)
        ),
        with: {
            participants: {
                with: {
                    user: true
                }
            },
            iban: true
        }
    });
}

// --- WRITE Actions ---

export async function createEvent(data: EventInput) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) throw new Error("Unauthorized");

    // Basic Validations
    if (data.isPaid && (!data.price || !data.ibanId)) {
        return { success: false, message: "Ücretli etkinlikler için tutar ve IBAN zorunludur." };
    }

    try {
        const [insertedEvent] = await db.insert(events).values({
            tenantId: tenantData.tenantId,
            ...data
        }).returning({ id: events.id });

        const members = await db.query.tenantUsers.findMany({
            where: and(eq(tenantUsers.tenantId, tenantData.tenantId), eq(tenantUsers.isActive, true)),
            columns: { userId: true }
        });
        const targetIds = members.map(m => m.userId).filter(id => id !== tenantData.userId);

        await createNotification(
            tenantData.tenantId,
            targetIds,
            'event',
            `Yeni Etkinlik: ${data.title}`,
            `Derneğimizde yeni bir etkinlik oluşturuldu.`,
            `/dashboard/events`
        );

        revalidatePath("/dashboard/events");
        return { success: true, message: "Etkinlik başarıyla oluşturuldu." };
    } catch (error) {
        console.error("Create Event Error:", error);
        return { success: false, message: `Etkinlik oluşturulurken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}` };
    }
}


export async function joinEvent(eventId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData?.userId) return { success: false, message: "Giriş yapmalısınız." };

    const event = await db.query.events.findFirst({
        where: eq(events.id, eventId)
    });

    if (!event) return { success: false, message: "Etkinlik bulunamadı." };

    // Check existing
    const existing = await db.query.eventParticipants.findFirst({
        where: and(
            eq(eventParticipants.eventId, eventId),
            eq(eventParticipants.userId, tenantData.userId)
        )
    });

    if (existing) {
        return { success: false, message: "Zaten katılımcı listesindesiniz." };
    }

    // Check Quota
    if (event.quota) {
        const count = await db.$count(eventParticipants, eq(eventParticipants.eventId, eventId));
        if (count >= event.quota) {
            return { success: false, message: "Etkinlik kontenjanı dolmuştur." };
        }
    }

    // Determine Status
    const status = event.isPaid ? 'pending_payment' : 'confirmed';

    await db.insert(eventParticipants).values({
        eventId,
        userId: tenantData.userId,
        status,
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath("/dashboard/events");

    return { success: true, message: event.isPaid ? "Kaydınız alındı, ödeme bekleniyor." : "Kaydınız onaylandı." };
}

export async function leaveEvent(eventId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData?.userId) return { success: false, message: "Giriş yapmalısınız." };

    await db.delete(eventParticipants).where(and(
        eq(eventParticipants.eventId, eventId),
        eq(eventParticipants.userId, tenantData.userId)
    ));

    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath("/dashboard/events");
    return { success: true, message: "Etkinlikten ayrıldınız." };
}

export async function approveParticipant(participantId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, message: "Yetkisiz işlem." };

    // TODO: Add Role Check (Admin/Manager only)

    await db.update(eventParticipants)
        .set({ status: 'confirmed', updatedAt: new Date() })
        .where(eq(eventParticipants.id, participantId));

    revalidatePath("/dashboard/events");
    return { success: true, message: "Katılımcı onaylandı." };
}

// --- Notification / Badge Getters ---

export async function getUnreadEventCount() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return 0;

    const { tenantId, userId } = tenantData;

    try {
        const tenantUser = await db.query.tenantUsers.findFirst({
            where: and(
                eq(tenantUsers.tenantId, tenantId),
                eq(tenantUsers.userId, userId)
            ),
            columns: { lastSeenEventsAt: true }
        });

        const countResult = await db.execute(sql`
            SELECT count(*) as unread_count 
            FROM events 
            WHERE tenant_id = ${tenantId} 
              AND created_at > ${(tenantUser?.lastSeenEventsAt || new Date(0)).toISOString()}
        `);

        return Number(countResult.rows[0].unread_count) || 0;
    } catch (error) {
        console.error("Get Unread Event Count Error:", error);
        return 0;
    }
}

export async function markEventsAsRead() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false };

    const { tenantId, userId } = tenantData;

    try {
        await db.update(tenantUsers)
            .set({ lastSeenEventsAt: new Date() })
            .where(and(
                eq(tenantUsers.tenantId, tenantId),
                eq(tenantUsers.userId, userId)
            ));

        return { success: true };
    } catch (error) {
        console.error("Mark Events Read Error:", error);
        return { success: false };
    }
}
