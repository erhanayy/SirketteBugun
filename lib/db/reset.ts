import { config } from "dotenv";
config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from "drizzle-orm";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function resetDb() {
    console.log("Wiping database...");
    await db.execute(sql`TRUNCATE TABLE "messages" CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE "chats" CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE "due_payments" CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE "dues" CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE "event_participants" CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE "events" CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE "comments" CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE "posts" CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE "tenant_users" CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE "users" CASCADE;`);
    await db.execute(sql`TRUNCATE TABLE "tenants" CASCADE;`);
    console.log("Database wiped successfully.");
    await pool.end();
    process.exit(0);
}

resetDb().catch((err) => {
    console.error("Failed to wipe database:", err);
    process.exit(1);
});
