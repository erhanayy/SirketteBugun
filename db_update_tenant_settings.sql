-- DernekteBugün SQL Migration: Tenant Settings & Dashboard

-- 1. Create login_logs table
CREATE TABLE IF NOT EXISTS "login_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "logged_in_at" timestamp DEFAULT now() NOT NULL
);

-- 2. Create tenant_personalization table
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

-- 3. Update spost_reactions table to include created_at for statistics
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='spost_reactions' AND column_name='created_at') THEN
        ALTER TABLE "spost_reactions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;
    END IF;
END $$;
