import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log('Starting DB Sync...');

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "login_logs" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
                "user_id" uuid NOT NULL REFERENCES "users"("id"),
                "logged_in_at" timestamp DEFAULT now() NOT NULL
            );
        `);

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "tenant_personalization" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "tenant_id" uuid NOT NULL UNIQUE REFERENCES "tenants"("id"),
                "menu_text_color" text DEFAULT '#FFFFFF',
                "screen_text_color" text DEFAULT '#1F2937',
                "background_color" text DEFAULT '#FFFFFF',
                "header_row1_color" text DEFAULT '#1E3A5F',
                "header_row2_color" text DEFAULT '#2563EB',
                "created_at" timestamp DEFAULT now() NOT NULL,
                "updated_at" timestamp DEFAULT now() NOT NULL
            );
        `);

        try {
            await db.execute(sql`ALTER TABLE "spost_reactions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;`);
        } catch (e: any) {
            console.log('spost_reactions column might exist:', e.message);
        }

        // Reset password for test user to be sure
        const bcrypt = require('bcryptjs');
        const hashed = await bcrypt.hash('1234', 10);

        const userResult = await db.execute(sql`SELECT id FROM "users" WHERE "email" = 'erhan@yy.com'`);
        if (userResult.rowCount === 0) {
            return NextResponse.json({ success: true, message: "Tables created but user erhan@yy.com NOT FOUND" });
        }

        await db.execute(sql`UPDATE "users" SET "password" = ${hashed} WHERE "email" = 'erhan@yy.com'`);

        return NextResponse.json({ success: true, message: "Tables created and password reset for erhan@yy.com" });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
