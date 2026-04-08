import 'dotenv/config';
import { db } from '../lib/db';
import { users, tenantUsers, tenants } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('Seeding admin user...');

    const email = 'admin@sirkettebugun.com';
    const password = 'admin'; // Default password
    const hashedPassword = await bcrypt.hash(password, 10);
    const phoneNumber = '5551234567';

    try {
        // Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (existingUser) {
            console.log('User already exists. Updating password...');
            await db.update(users)
                .set({ password: hashedPassword, forcePasswordChange: true })
                .where(eq(users.id, existingUser.id));
        } else {
            console.log('Creating new admin user...');
            const [newUser] = await db.insert(users).values({
                fullName: 'Sistem Yöneticisi',
                email,
                phoneNumber,
                password: hashedPassword,
                forcePasswordChange: true,
            }).returning();

            // Check if tenant exists, if not create one
            let tenant = await db.query.tenants.findFirst();
            if (!tenant) {
                [tenant] = await db.insert(tenants).values({
                    shortName: 'DEMO',
                    longName: 'Demo Şirket',
                }).returning();
            }

            // Assign as admin
            await db.insert(tenantUsers).values({
                tenantId: tenant.id,
                userId: newUser.id,
                role: 'admin',
                status: 'active'
            });
        }

        console.log('Admin user seeded successfully.');
        console.log('Email:', email);
        console.log('Password:', password);
    } catch (error) {
        console.error('Error seeding admin:', error);
    }

    process.exit(0);
}

main();
