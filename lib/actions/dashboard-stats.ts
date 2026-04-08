'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
    tenantUsers,
    committees,
    committeeMembers,
    loginLogs,
    sposts,
    spostComments,
    spostReactions,
    messages,
    events,
    posts,
    chats,
    chatParticipants
} from "@/lib/db/schema";
import { eq, and, gte, lte, count, sql, countDistinct } from "drizzle-orm";

export async function getDashboardStaticStats(tenantId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Çalışan count (tüm aktif kullanıcılar)
    const memberCountRes = await db.select({ count: count() })
        .from(tenantUsers)
        .where(and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.isActive, true),
            eq(tenantUsers.status, 'active')
        ));

    // Admin count
    const staffCountRes = await db.select({ count: count() })
        .from(tenantUsers)
        .where(and(
            eq(tenantUsers.tenantId, tenantId),
            sql`${tenantUsers.role} IN ('admin', 'staff')`,
            eq(tenantUsers.isActive, true)
        ));

    // Committees info — using db.select to avoid relational ORM issues
    const committeesData = await db
        .select({
            id: committees.id,
            name: committees.name,
            memberRole: committeeMembers.role,
            memberIsActive: committeeMembers.isActive,
        })
        .from(committees)
        .leftJoin(committeeMembers, and(
            eq(committeeMembers.committeeId, committees.id),
            eq(committeeMembers.isActive, true)
        ))
        .where(and(
            eq(committees.tenantId, tenantId),
            eq(committees.isActive, true)
        ));

    // Group by committee
    const committeeMap = new Map<string, { id: string; name: string; managerCount: number; staffCount: number }>();
    for (const row of committeesData) {
        if (!committeeMap.has(row.id)) {
            committeeMap.set(row.id, { id: row.id, name: row.name, managerCount: 0, staffCount: 0 });
        }
        if (row.memberIsActive && row.memberRole) {
            const entry = committeeMap.get(row.id)!;
            if (['president', 'vice_president', 'secretary'].includes(row.memberRole)) {
                entry.managerCount++;
            } else {
                entry.staffCount++;
            }
        }
    }
    const formattedCommittees = Array.from(committeeMap.values());

    return {
        memberCount: memberCountRes[0].count,
        staffCount: staffCountRes[0].count,
        committees: formattedCommittees
    };
}

export async function getDashboardPeriodStats(tenantId: string, year: number, month: number) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Login counts
    const loginCountRes = await db.select({
        total: count(),
        unique: countDistinct(loginLogs.userId)
    })
        .from(loginLogs)
        .where(and(
            eq(loginLogs.tenantId, tenantId),
            gte(loginLogs.loggedInAt, startDate),
            lte(loginLogs.loggedInAt, endDate)
        ));

    // Sposts (Ana Sayfa Gönderileri)
    const spostCountRes = await db.select({ count: count() })
        .from(sposts)
        .where(and(
            eq(sposts.tenantId, tenantId),
            gte(sposts.createdAt, startDate),
            lte(sposts.createdAt, endDate)
        ));

    // Spost Comments
    const commentCountRes = await db.select({ count: count() })
        .from(spostComments)
        .innerJoin(sposts, eq(spostComments.spostId, sposts.id))
        .where(and(
            eq(sposts.tenantId, tenantId),
            gte(spostComments.createdAt, startDate),
            lte(spostComments.createdAt, endDate)
        ));

    // Spost Reactions
    const reactionCountRes = await db.select({ count: count() })
        .from(spostReactions)
        .innerJoin(sposts, eq(spostReactions.spostId, sposts.id))
        .where(and(
            eq(sposts.tenantId, tenantId),
            gte(spostReactions.createdAt, startDate),
            lte(spostReactions.createdAt, endDate)
        ));

    // Messages
    // Note: To filter by tenant, we need to join with chats or chatParticipants
    const messageCountRes = await db.select({ count: count() })
        .from(messages)
        .innerJoin(chats, eq(messages.chatId, chats.id))
        .where(and(
            eq(chats.tenantId, tenantId),
            gte(messages.createdAt, startDate),
            lte(messages.createdAt, endDate)
        ));

    // Events
    const eventCountRes = await db.select({ count: count() })
        .from(events)
        .where(and(
            eq(events.tenantId, tenantId),
            gte(events.createdAt, startDate),
            lte(events.createdAt, endDate)
        ));

    // Posts (Duyurular)
    const postCountRes = await db.select({ count: count() })
        .from(posts)
        .where(and(
            eq(posts.tenantId, tenantId),
            gte(posts.createdAt, startDate),
            lte(posts.createdAt, endDate)
        ));

    return {
        loginCount: loginCountRes[0].total,
        uniqueLoginCount: loginCountRes[0].unique,
        spostCount: spostCountRes[0].count,
        commentCount: commentCountRes[0].count,
        reactionCount: reactionCountRes[0].count,
        messageCount: messageCountRes[0].count,
        eventCount: eventCountRes[0].count,
        announcementCount: postCountRes[0].count
    };
}

export async function logActivityAction(tenantId: string) {
    const session = await auth();
    if (!session?.user?.id) return;

    // Log the access to this tenant's context
    // We could add a throttle to not log every single page view, 
    // but the user just said "log oluşturalım".
    // I'll log once per day per user per tenant to keep it sane if desired, 
    // or just log every time. Let's do once per 12 hours.

    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    const recentLog = await db.query.loginLogs.findFirst({
        where: and(
            eq(loginLogs.tenantId, tenantId),
            eq(loginLogs.userId, session.user.id),
            gte(loginLogs.loggedInAt, twelveHoursAgo)
        ),
        columns: { id: true }
    });

    if (!recentLog) {
        await db.insert(loginLogs).values({
            tenantId,
            userId: session.user.id
        });
    }
}
