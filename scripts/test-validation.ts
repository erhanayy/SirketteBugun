import { db } from './lib/db';
import { users, tenantUsers, tenants } from './lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

async function main() {
    console.log("==> Veritabanı Test Verileri Getiriliyor...");

    // 1. Check Tenants (SuperAdmin control)
    const allTenants = await db.select().from(tenants);
    console.log("\n[Tenant] Mevcut Şirketler:", allTenants.length > 0 ? allTenants.map(t => t.shortName).join(", ") : "Yok");

    // 2. Check Users
    const allUsers = await db.select().from(users);
    console.log(`\n[User] Sistemde toplam ${allUsers.length} kullanıcı var.`);

    // 3. Find roles
    const allTenantUsers = await db.select({
        email: users.email,
        role: tenantUsers.role,
        tenant: tenants.shortName
    })
        .from(tenantUsers)
        .innerJoin(users, eq(users.id, tenantUsers.userId))
        .innerJoin(tenants, eq(tenants.id, tenantUsers.tenantId));

    console.log("\n[Roles] Kullanıcı Rolleri Dağılımı:");
    allTenantUsers.forEach(tu => {
        console.log(` - ${tu.email} (${tu.role}) -> ${tu.tenant}`);
    });

    if (allUsers.length === 0) {
        console.log("\nUYARI: Veritabanı tamamen BOŞ! Log-in/Auth testlerini başlatabilmemiz için önce seed data (test verisi) atılması gerekiyor.");
    }

    process.exit(0);
}

main().catch(console.error);
