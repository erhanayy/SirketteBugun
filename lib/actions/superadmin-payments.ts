'use server';

import { verifySuperAdmin } from "./superadmin";
import { db } from "@/lib/db";
import { tenantUserOfferPrices, tenantUserOffers, tenants, tenantUsers, users } from "@/lib/db/schema";
import { eq, or, ilike, desc, getTableColumns, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getManualPayments(query: string = '', page: number = 1, limit: number = 20) {
    await verifySuperAdmin();

    // Calculate offset
    const offset = (page - 1) * limit;

    let dbQuery = db.select({
        id: tenantUserOfferPrices.id,
        pricePaid: tenantUserOfferPrices.pricePaid,
        startDate: tenantUserOfferPrices.startDate,
        endDate: tenantUserOfferPrices.endDate,
        createdAt: tenantUserOfferPrices.createdAt,
        isActive: tenantUserOfferPrices.isActive,
        offerId: tenantUserOffers.id,
        offerPriceBase: tenantUserOffers.price,
        tenantName: tenants.longName,
        tenantShortName: tenants.shortName,
        userName: users.fullName,
        userEmail: users.email,
        userTenantName: tenants.shortName, // Note: For User offers, this might conflict with the tenant offer join. Let's fix that.
    })
        .from(tenantUserOfferPrices)
        .innerJoin(tenantUserOffers, eq(tenantUserOffers.id, tenantUserOfferPrices.tenantOfferId))
        .leftJoin(tenants, eq(tenants.id, tenantUserOfferPrices.tenantId)) // Alias not strictly needed if we just read it
        .leftJoin(tenantUsers, eq(tenantUsers.id, tenantUserOfferPrices.tenantUserId))
        .leftJoin(users, eq(users.id, tenantUsers.userId));

    // For searching
    if (query) {
        dbQuery = dbQuery.where(
            and(
                eq(tenantUserOfferPrices.isActive, true),
                or(
                    ilike(tenants.longName, `%${query}%`),
                    ilike(tenants.shortName, `%${query}%`),
                    ilike(users.fullName, `%${query}%`),
                    ilike(users.email, `%${query}%`)
                )
            )
        ) as any;
    } else {
        dbQuery = dbQuery.where(eq(tenantUserOfferPrices.isActive, true)) as any;
    }

    // Execute with pagination
    const data = await dbQuery
        .orderBy(desc(tenantUserOfferPrices.createdAt))
        .limit(limit)
        .offset(offset);

    // Get total count for pagination metadata
    // We can do a separate count query or just infer if there's more based on length
    // For simplicity, we'll just return raw data and use length checks in UI for "load more"

    return data;
}

export async function deleteManualPayment(paymentId: string) {
    await verifySuperAdmin();
    await db.update(tenantUserOfferPrices)
        .set({ isActive: false })
        .where(eq(tenantUserOfferPrices.id, paymentId));

    revalidatePath("/dashboard/admin/payment-entry");
    return true;
}
