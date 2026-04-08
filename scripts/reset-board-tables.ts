
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
    console.log("Dropping Executive Board tables if they exist...");
    try {
        // Order matters due to foreign keys
        await db.execute(sql`DROP TABLE IF EXISTS "executive_tasks" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "projects" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "committee_members" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "committees" CASCADE`);
        console.log("Tables dropped. Ready for new migration. 🚀");
    } catch (e) {
        console.error("Error dropping tables:", e);
    } finally {
        await client.end();
    }
    process.exit(0);
}

main();
