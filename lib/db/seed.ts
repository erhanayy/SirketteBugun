import { config } from "dotenv";
config();

import { db } from "./index";
import { tenants, users, tenantUsers } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Seeding database...");

    // 1. Create a Demo Tenant
    const [tenant] = await db.insert(tenants).values({
        shortName: "DD",
        longName: "Demo Şirket",
    }).returning();

    console.log("Created Tenant:", tenant);

    // 2. Create a Demo User
    const [user] = await db.insert(users).values({
        fullName: "Demo Admin",
        phoneNumber: "5551234567",
        email: "admin@kyd.org",
    }).returning();

    console.log("Created User:", user);

    // 3. Assign User to Tenant as Admin
    await db.insert(tenantUsers).values({
        tenantId: tenant.id,
        userId: user.id,
        role: "admin",
        status: "active",
    });

    console.log("Assigned User to Tenant.");
    console.log("\n!!! USE THESE IDS IN YOUR CODE !!!");
    console.log(`const DEMO_TENANT_ID = "${tenant.id}";`);
    console.log(`const DEMO_USER_ID = "${user.id}";`);
}

main()
    .then(() => {
        console.log("Seeding complete.");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Seeding failed:", err);
        process.exit(1);
    });
