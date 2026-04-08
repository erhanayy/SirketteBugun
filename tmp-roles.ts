import "dotenv/config";
import { db } from "./lib/db";
import { users, tenantUsers } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const allUsers = await db.select().from(users);
    console.log("Users:", allUsers.map(u => `${u.email} - ${u.id}`));

    const memberships = await db.select().from(tenantUsers);
    console.log("Memberships:", memberships.map(m => `${m.userId} is ${m.role} in ${m.tenantId}`));

    // Make erhan@codework.com admin
    const erhan = allUsers.find(u => u.email === "erhan@codework.com");
    if (erhan) {
        await db.update(tenantUsers)
            .set({ role: 'admin' })
            .where(eq(tenantUsers.userId, erhan.id));
        console.log("Erhan elevated to admin.");
    }
}

main().then(() => process.exit(0)).catch(console.error);
