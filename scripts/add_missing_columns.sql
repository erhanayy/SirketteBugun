-- Add target audience flags to 'dues' table
ALTER TABLE "dues" ADD COLUMN "is_enabled_for_tenants_manager" boolean DEFAULT false NOT NULL;
ALTER TABLE "dues" ADD COLUMN "is_enabled_for_tenants_worker" boolean DEFAULT false NOT NULL;
ALTER TABLE "dues" ADD COLUMN "is_enabled_for_tenants_members" boolean DEFAULT true NOT NULL;

-- Add payment_amount to 'due_payments' table
-- Note: We set a default of 0 for existing rows, but for new rows it will be required.
ALTER TABLE "due_payments" ADD COLUMN "payment_amount" integer DEFAULT 0 NOT NULL;
