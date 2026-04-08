import "dotenv/config";
import { db } from "./lib/db";
import { businessCards, users, tenantUsers } from "./lib/db/schema";
import { eq, inArray } from "drizzle-orm";

async function main() {
    const defaultTenantId = "cfc5efa4-bedc-4fd4-a5de-aac63c379adf"; // Demo tenant used mostly

    const allUsers = await db.select().from(users);

    // Check if testdernekuyesi1 already has a card
    const existingCountFn = await db.select().from(businessCards);

    console.log(`Currently there are ${existingCountFn.length} business cards.`);

    const dummyData = [
        { email: 'testdernekyoneticisi2@test.com', companyName: 'Vektorel Bilisim', title: 'IT Manager', workStatus: 'owner' },
        { email: 'testdernekcalisani1@test.com', companyName: 'Acme Corp', title: 'HR Specialist', workStatus: 'employee' },
        { email: 'testdernekuyesi2@test.com', companyName: 'Tech Innovators', title: 'Software Engineer', workStatus: 'employee' },
    ] as const;

    for (const data of dummyData) {
        const u = allUsers.find(u => u.email === data.email);
        if (u) {
            // Check if card exists
            const existing = existingCountFn.find(c => c.userId === u.id);
            if (!existing) {
                await db.insert(businessCards).values({
                    tenantId: defaultTenantId,
                    userId: u.id,
                    companyName: data.companyName,
                    title: data.title,
                    workStatus: data.workStatus,
                    phone: "5551239999",
                    email: data.email
                });
                console.log(`Created dummy card for ${data.email}`);
            } else {
                console.log(`Card exists for ${data.email}`);
            }
        }
    }
}

main().then(() => process.exit(0)).catch(console.error);
