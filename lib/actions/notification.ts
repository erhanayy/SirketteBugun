"use server";

import { db } from "@/lib/db";
import { notifications, userNotificationSettings } from "@/lib/db/schema";
import { eq, and, inArray, desc, count } from "drizzle-orm";
import webpush from 'web-push';
import { pushSubscriptions } from "@/lib/db/schema";

webpush.setVapidDetails(
    'mailto:info@sirkettebugun.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
);

export type NotificationType = 'post' | 'event' | 'announcement' | 'message' | 'project_task';

export async function createNotification(
    tenantId: string,
    userIds: string[],
    type: NotificationType,
    title: string,
    body: string,
    actionUrl?: string
) {
    if (!userIds || userIds.length === 0) return;

    // 1. Fetch settings to filter out users who opted out
    const settings = await db.select().from(userNotificationSettings)
        .where(
            and(
                eq(userNotificationSettings.tenantId, tenantId),
                inArray(userNotificationSettings.userId, userIds)
            )
        );

    const settingMap = new Map(settings.map(s => [s.userId, s]));

    // Filter array: User wants it if: no setting row found OR setting row for this type is true.
    const usersToNotify = userIds.filter(uid => {
        const s = settingMap.get(uid);
        if (!s) return true; // Default is true

        if (type === 'post') return s.notifyPost;
        if (type === 'event') return s.notifyEvent;
        if (type === 'announcement') return s.notifyAnnouncement;
        if (type === 'message') return s.notifyMessage;

        return true;
    });

    if (usersToNotify.length === 0) return;

    // 2. Insert into notifications
    const values = usersToNotify.map(uid => ({
        tenantId,
        userId: uid,
        type,
        title,
        body,
        actionUrl: actionUrl || null,
    }));

    try {
        await db.insert(notifications).values(values);

        // 3. Web Push Trigger Logic
        const subs = await db.query.pushSubscriptions.findMany({
            where: inArray(pushSubscriptions.userId, usersToNotify)
        });

        if (subs.length > 0) {
            const payload = JSON.stringify({
                title,
                body,
                url: actionUrl || '/dashboard'
            });

            await Promise.allSettled(subs.map(sub => {
                const pushConfig = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };
                return webpush.sendNotification(pushConfig, payload).catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        return db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
                    }
                    console.error("Web Push Error:", err);
                });
            }));
        }

    } catch (error) {
        console.error("Failed to insert notifications:", error);
    }
}

export async function getNotifications(tenantId: string, userId: string, limitCount = 20) {
    return await db.select()
        .from(notifications)
        .where(
            and(
                eq(notifications.tenantId, tenantId),
                eq(notifications.userId, userId)
            )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(limitCount);
}

export async function getUnreadNotificationCount(tenantId: string, userId: string) {
    const result = await db.select({ value: count() })
        .from(notifications)
        .where(
            and(
                eq(notifications.tenantId, tenantId),
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            )
        );
    return result[0].value;
}

export async function markNotificationAsRead(id: string) {
    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(tenantId: string, userId: string) {
    await db.update(notifications)
        .set({ isRead: true })
        .where(
            and(
                eq(notifications.tenantId, tenantId),
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            )
        );
}

export async function getUserNotificationSettings(tenantId: string, userId: string) {
    const res = await db.select()
        .from(userNotificationSettings)
        .where(
            and(
                eq(userNotificationSettings.tenantId, tenantId),
                eq(userNotificationSettings.userId, userId)
            )
        ).limit(1);

    if (res.length > 0) return res[0];

    return {
        notifyPost: true,
        notifyEvent: true,
        notifyAnnouncement: true,
        notifyMessage: true
    };
}

export async function saveUserNotificationSettings(
    tenantId: string,
    userId: string,
    settingsData: { notifyPost: boolean, notifyEvent: boolean, notifyAnnouncement: boolean, notifyMessage: boolean }
) {
    const existing = await db.select().from(userNotificationSettings)
        .where(
            and(
                eq(userNotificationSettings.tenantId, tenantId),
                eq(userNotificationSettings.userId, userId)
            )
        ).limit(1);

    if (existing.length > 0) {
        await db.update(userNotificationSettings)
            .set({
                ...settingsData,
                updatedAt: new Date()
            })
            .where(eq(userNotificationSettings.id, existing[0].id));
    } else {
        await db.insert(userNotificationSettings).values({
            tenantId,
            userId,
            ...settingsData
        });
    }
}
