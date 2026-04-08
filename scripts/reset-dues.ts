
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function resetDues() {
    console.log("Dropping due_payments and dues tables...");
    try {
        await db.execute(sql`DROP TABLE IF EXISTS "due_payments" CASCADE;`);
        await db.execute(sql`DROP TABLE IF EXISTS "dues" CASCADE;`);
        console.log("Tables dropped successfully.");
    } catch (e) {
        console.error("Error dropping tables:", e);
    }
    process.exit(0);
}

resetDues();
