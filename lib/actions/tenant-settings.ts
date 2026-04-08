'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tenants, tenantPersonalization, tenantUsers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateTenantInfoAction(data: {
    tenantId: string;
    longName: string;
    shortName: string;
    logoUrl?: string;
    websiteUrl?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const tenantId = data.tenantId;

    const membership = await db.query.tenantUsers.findFirst({
        where: and(
            eq(tenantUsers.userId, session.user.id),
            eq(tenantUsers.tenantId, tenantId)
        )
    });

    if (!membership || !['admin', 'staff'].includes(membership.role)) {
        throw new Error("Sadece yönetici ve çalışanlar bu ayarları değiştirebilir.");
    }

    await db.update(tenants)
        .set({
            longName: data.longName,
            shortName: data.shortName,
            logoUrl: data.logoUrl,
            websiteUrl: data.websiteUrl,
        })
        .where(eq(tenants.id, tenantId));

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tenant-settings");
    return { success: true };
}

export async function updatePersonalizationAction(data: {
    tenantId: string;
    menuTextColor?: string;
    screenTextColor?: string;
    backgroundColor?: string;
    headerRow1Color?: string;
    headerRow2Color?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const tenantId = data.tenantId;

    const membership = await db.query.tenantUsers.findFirst({
        where: and(
            eq(tenantUsers.userId, session.user.id),
            eq(tenantUsers.tenantId, tenantId)
        )
    });

    if (!membership || !['admin', 'staff'].includes(membership.role)) {
        throw new Error("Sadece yönetici ve çalışanlar bu ayarları değiştirebilir.");
    }

    // Prepare update data (excluding tenantId)
    const { tenantId: _, ...updateData } = data;

    // Upsert personalization
    const existing = await db.query.tenantPersonalization.findFirst({
        where: eq(tenantPersonalization.tenantId, tenantId)
    });

    if (existing) {
        await db.update(tenantPersonalization)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(eq(tenantPersonalization.tenantId, tenantId));
    } else {
        await db.insert(tenantPersonalization)
            .values({
                tenantId,
                ...updateData,
            });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tenant-settings");
    return { success: true };
}

export async function getTenantPersonalization(tenantId: string) {
    return await db.query.tenantPersonalization.findFirst({
        where: eq(tenantPersonalization.tenantId, tenantId)
    });
}
