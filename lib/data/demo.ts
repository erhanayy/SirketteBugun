import { db } from "@/lib/db";
import { tenants, users, tenantUsers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function getDemoData() {
    // 1. Get or Create Tenant
    // Using standard select instead of query API to avoid potential schema mapping issues during dev
    const existingTenants = await db.select().from(tenants).limit(1);
    let tenant = existingTenants[0];

    if (!tenant) {
        const [newTenant] = await db.insert(tenants).values({
            shortName: "DEMO",
            longName: "Demo Şirket",
        }).returning();
        tenant = newTenant;
    }

    // 2. Get or Create User
    const existingUsers = await db.select().from(users).limit(1);
    let user = existingUsers[0];

    if (!user) {
        const [newUser] = await db.insert(users).values({
            fullName: "Demo Yöneticisi",
            phoneNumber: "5550000000",
            email: "demo@şirket.com",
        }).returning();
        user = newUser;
    }

    // 3. Get or Create Membership (Role)
    // We need to fetch the role for RBAC checks
    const existingMembership = await db.select()
        .from(tenantUsers)
        .where(
            and(
                eq(tenantUsers.tenantId, tenant.id),
                eq(tenantUsers.userId, user.id)
            )
        )
        .limit(1);

    let role = existingMembership[0]?.role;

    if (!role) {
        // Create as Admin for demo purposes if no role exists
        await db.insert(tenantUsers).values({
            tenantId: tenant.id,
            userId: user.id,
            role: 'admin',
            status: 'active'
        });
        role = 'admin';
    }

    return {
        tenantId: tenant.id,
        userId: user.id,
        userRole: role
    };
}
