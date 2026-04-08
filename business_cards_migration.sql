-- Business Cards (Kartvizitler) Tablosu
CREATE TABLE IF NOT EXISTS "business_cards" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "tenant_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "company_name" text NOT NULL,
    "work_status" text NOT NULL,
    "title" text NOT NULL,
    "education_doctorate" text,
    "education_master" text,
    "education_bachelor" text,
    "education_high_school" text,
    "birth_date" timestamp,
    "phone" text NOT NULL,
    "email" text NOT NULL,
    "profile_photo_url" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "business_cards_tenant_id_user_id_unique" UNIQUE("tenant_id", "user_id")
);

-- Foreign Key Constraints
DO $$ BEGIN
 ALTER TABLE "business_cards" ADD CONSTRAINT "business_cards_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "business_cards" ADD CONSTRAINT "business_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
