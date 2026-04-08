'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { eq, ilike, or, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Utility to verify super admin access
export async function verifySuperAdmin() {
    const session = await auth();
    if (!session?.user?.isApplicationAdmin) {
        redirect("/dashboard");
    }
}

export async function getTenants(query?: string) {
    await verifySuperAdmin();

    let dbQuery = db.select().from(tenants).orderBy(asc(tenants.longName));

    if (query) {
        dbQuery = dbQuery.where(
            or(
                ilike(tenants.longName, `%${query}%`),
                ilike(tenants.shortName, `%${query}%`)
            )
        ) as any;
    }

    const data = await dbQuery;
    return data;
}

export async function getTenantById(tenantId: string) {
    await verifySuperAdmin();
    const data = await db.query.tenants.findFirst({
        where: eq(tenants.id, tenantId)
    });
    return data;
}

export async function createTenant(formData: FormData) {
    await verifySuperAdmin();

    const longName = formData.get("longName") as string;
    const shortName = formData.get("shortName") as string;
    const logoUrl = formData.get("logoUrl") as string | null;

    if (!longName || !shortName) {
        throw new Error("Kısa ve Uzun ad zorunludur.");
    }

    const [newTenant] = await db.insert(tenants).values({
        longName,
        shortName,
        logoUrl: logoUrl || null
    }).returning();

    return newTenant;
}

export async function updateTenant(tenantId: string, formData: FormData) {
    await verifySuperAdmin();

    const longName = formData.get("longName") as string;
    const shortName = formData.get("shortName") as string;
    const logoUrl = formData.get("logoUrl") as string | null;
    const isActive = formData.get("isActive") === 'true';

    if (!longName || !shortName) {
        throw new Error("Kısa ve Uzun ad zorunludur.");
    }

    const [updated] = await db.update(tenants).set({
        longName,
        shortName,
        logoUrl: logoUrl || null,
        isActive
    }).where(eq(tenants.id, tenantId)).returning();

    return updated;
}

// Payment / Offer Assignments
import { tenantUserOffers, tenantUserOfferPrices, tenantUsers, users } from "@/lib/db/schema";

export async function getActiveOffersForAdmin() {
    await verifySuperAdmin();
    // Return all active offers
    return await db.select().from(tenantUserOffers).where(eq(tenantUserOffers.isActive, true));
}

// Fetch memberships to assign individual plans: Returns "User Name (Tenant Name)" concept
export async function searchTenantUsers(query: string) {
    await verifySuperAdmin();
    if (!query || query.length < 2) return [];

    const data = await db.select({
        tenantUserId: tenantUsers.id,
        userName: users.fullName,
        userEmail: users.email,
        tenantName: tenants.shortName,
    })
        .from(tenantUsers)
        .innerJoin(users, eq(users.id, tenantUsers.userId))
        .innerJoin(tenants, eq(tenants.id, tenantUsers.tenantId))
        .where(
            or(
                ilike(users.fullName, `%${query}%`),
                ilike(users.email, `%${query}%`)
            )
        )
        .limit(50);

    return data;
}

export async function createManualPayment(formData: FormData) {
    await verifySuperAdmin();

    const targetType = formData.get("targetType") as string; // 'tenant' | 'user'
    const targetId = formData.get("targetId") as string; // tenant.id or tenantUsers.id
    const offerId = formData.get("offerId") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    if (!targetId || !offerId || !startDateStr || !endDateStr) {
        throw new Error("Tüm zorunlu alanları doldurun.");
    }

    // Get offer details for price
    const [offer] = await db.select().from(tenantUserOffers).where(eq(tenantUserOffers.id, offerId));
    if (!offer) throw new Error("Paket bulunamadı.");

    const pricePaid = offer.price;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    let insertData: any = {
        tenantOfferId: offerId,
        pricePaid,
        startDate,
        endDate,
        isActive: true
    };

    if (targetType === 'tenant') {
        insertData.tenantId = targetId;
    } else if (targetType === 'user') {
        insertData.tenantUserId = targetId;
    } else {
        throw new Error("Geçersiz hedef türü.");
    }

    const [newPriceRecord] = await db.insert(tenantUserOfferPrices).values(insertData).returning();
    return newPriceRecord;
}

export async function impersonateTenantAndAddUser(formData: FormData) {
    await verifySuperAdmin();
    const tenantId = formData.get("tenantId") as string;
    const cookieStore = await cookies();
    cookieStore.set('dernekte_tenant_id', tenantId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        sameSite: 'lax'
    });
    redirect("/dashboard/members");
}
