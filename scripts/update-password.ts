
import 'dotenv/config';
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Starting password update...");

    // 1. Get admin password hash
    const adminUser = await db.query.users.findFirst({
        where: eq(users.email, 'admin@sirkettebugun.com')
    });

    if (!adminUser) {
        console.error("❌ Admin user (admin@sirkettebugun.com) not found!");
        process.exit(1);
    }

    if (!adminUser.password) {
        console.error("❌ Admin user has no password set!");
        process.exit(1);
    }

    const targetEmail = 'erhanayyildiz@hotmail.com';
    const targetUser = await db.query.users.findFirst({
        where: eq(users.email, targetEmail)
    });

    if (!targetUser) {
        console.error(`❌ Target user (${targetEmail}) not found!`);
        // Optional: List all users to help debug
        // const allUsers = await db.select().from(users);
        // console.log("Available users:", allUsers.map(u => u.email));
        process.exit(1);
    }

    // 2. Update target user password
    await db.update(users)
        .set({
            password: adminUser.password,
            forcePasswordChange: false // Optional: Clear force change flg if you want them to just login
        })
        .where(eq(users.email, targetEmail));

    console.log(`✅ Password for ${targetEmail} updated successfully.`);
    console.log(`   (Hash copied from admin@sirkettebugun.com)`);
}

main().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
}).then(() => process.exit(0));
