import { db } from './lib/db';
import { users } from './lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function main() {
    console.log("==> Test PWD Reset Started...");

    // We want to force the auth pass to be 123456 for testing
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const testEmails = [
        'admin@sirkettebugun.com',
        'testdernekuyesi1@test.com',
        'testdernekyoneticisi1@test.com'
    ];

    for (const email of testEmails) {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (user) {
            await db.update(users).set({ password: hashedPassword }).where(eq(users.id, user.id));
            console.log(`[OK] Updated password to '123456' for ${email}`);
        } else {
            console.log(`[WARN] User not found: ${email}`);
        }
    }

    console.log("==> Finished password overrides.");
    process.exit(0);
}

main().catch(console.error);
