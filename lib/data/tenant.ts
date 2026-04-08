'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tenants, tenantUsers, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";

export async function getCurrentTenant() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const cookieStore = await cookies();
    const tenantIdFromCookie = cookieStore.get('dernekte_tenant_id')?.value;

    // Fetch all memberships for the user
    // This allows us to:
    // 1. Validate the cookie ID (is user actually a member?)
    // 2. Fallback to the first membership if cookie is invalid/missing
    // 3. Provide a list of available tenants for the switcher UI
    const memberships = await db.select({
        role: tenantUsers.role,
        tenant: tenants,
        user: users
    })
        .from(tenantUsers)
        .innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
        .innerJoin(users, eq(tenantUsers.userId, users.id))
        .where(eq(tenantUsers.userId, session.user.id));

    let activeMembership = null;

    if (tenantIdFromCookie) {
        activeMembership = memberships.find(m => m.tenant.id === tenantIdFromCookie);
    }

    // Superadmin (App Admin) Impersonation Override
    if (!activeMembership && session.user.isApplicationAdmin && tenantIdFromCookie) {
        const targetTenant = await db.query.tenants.findFirst({ where: eq(tenants.id, tenantIdFromCookie) });
        if (targetTenant) {
            return {
                tenantId: targetTenant.id,
                userId: session.user.id,
                tenantName: targetTenant.longName,
                tenantShortName: targetTenant.shortName,
                logoUrl: targetTenant.logoUrl,
                websiteUrl: targetTenant.websiteUrl,
                userRole: 'admin', // Grant highest tenant role 
                userName: session.user.name || "Süper Admin",
                availableTenants: memberships.map(m => m.tenant),
                forcePasswordChange: false,
            };
        }
    }

    // Fallback: If no cookie or cookie is invalid (user not member of that tenant), use the first one
    if (!activeMembership) {
        if (memberships.length === 0) return null;
        activeMembership = memberships[0];
    }

    return {
        tenantId: activeMembership.tenant.id,
        userId: session.user.id,
        tenantName: activeMembership.tenant.longName,
        tenantShortName: activeMembership.tenant.shortName,
        logoUrl: activeMembership.tenant.logoUrl,
        websiteUrl: activeMembership.tenant.websiteUrl,
        userRole: activeMembership.role,
        userName: activeMembership.user.fullName || session.user.name || "Kullanıcı",
        availableTenants: memberships.map(m => m.tenant),
        forcePasswordChange: activeMembership.user.forcePasswordChange,
    };
}
