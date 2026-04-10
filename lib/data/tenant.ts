'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { tenants, tenantUsers, users } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
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

    let availableTenantsForUI = memberships.map(m => ({
        id: m.tenant.id,
        shortName: m.tenant.shortName,
        longName: m.tenant.longName
    }));
    if (session.user.isApplicationAdmin) {
        availableTenantsForUI = await db.select({
            id: tenants.id,
            shortName: tenants.shortName,
            longName: tenants.longName
        }).from(tenants)
            .where(eq(tenants.isActive, true))
            .orderBy(asc(tenants.longName));
    }

    let activeMembership = null;

    if (tenantIdFromCookie) {
        activeMembership = memberships.find(m => m.tenant.id === tenantIdFromCookie);
    }

    // Superadmin (App Admin) Impersonation Override
    if (!activeMembership && session.user.isApplicationAdmin) {
        let targetTenant = null;

        // 1. Try to load from cookie first
        if (tenantIdFromCookie) {
            targetTenant = await db.query.tenants.findFirst({ where: eq(tenants.id, tenantIdFromCookie) });
        }

        // 2. If cookie was invalid, deleted, or didn't exist, try the first active tenant from UI list
        if (!targetTenant && availableTenantsForUI.length > 0) {
            targetTenant = await db.query.tenants.findFirst({ where: eq(tenants.id, availableTenantsForUI[0].id) });
        }

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
                availableTenants: availableTenantsForUI,
                forcePasswordChange: false,
            };
        }

        // If NO companies exist at all in the database, return a completely virtual system tenant so they don't infinite loop
        return {
            tenantId: '00000000-0000-0000-0000-000000000000',
            userId: session.user.id,
            tenantName: 'Sistem Yönetimi (Şirket Yok)',
            tenantShortName: 'Admin',
            logoUrl: null,
            websiteUrl: null,
            userRole: 'admin',
            userName: session.user.name || "Süper Admin",
            availableTenants: availableTenantsForUI, // Pass it just in case
            forcePasswordChange: false,
        };
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
        availableTenants: availableTenantsForUI,
        forcePasswordChange: activeMembership.user.forcePasswordChange,
    };
}
