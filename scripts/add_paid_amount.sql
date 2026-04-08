-- Add paid_amount and is_exempt to 'due_payments' table
-- Since the table has data, we need defaults.
ALTER TABLE "due_payments" ADD COLUMN IF NOT EXISTS "paid_amount" integer DEFAULT 0 NOT NULL;
ALTER TABLE "due_payments" ADD COLUMN IF NOT EXISTS "is_exempt" boolean DEFAULT false NOT NULL;
