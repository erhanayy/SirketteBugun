-- Build SQL Script for Notification Modules (Log, Settings, Push Subscriptions)

-- 1. Bildirim Logları Tablosu
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" text NOT NULL, -- Enum mantığı: 'post', 'event', 'announcement', 'message'
    "title" text NOT NULL,
    "body" text NOT NULL,
    "action_url" text,
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 2. Kullanıcı Bildirim Ayarları (Tercihleri) Tablosu
-- Şirket bazında kullanıcının hangi bildirimleri açık/kapalı tuttuğunu saklar.
CREATE TABLE IF NOT EXISTS "user_notification_settings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "notify_post" boolean DEFAULT true NOT NULL,
    "notify_event" boolean DEFAULT true NOT NULL,
    "notify_announcement" boolean DEFAULT true NOT NULL,
    "notify_message" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    UNIQUE("tenant_id", "user_id") -- Bir kullanıcının bir dernekte tek bir ayar profili olmalıdır
);

-- 3. Web Push Servis Kayıtları (Tarayıcı/OS Cihaz Bilgileri) Tablosu
-- Bir kullanıcının birden fazla cihazı olabileceği için unique değil, 1-N ilişkilidir.
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "endpoint" text NOT NULL,
    "p256dh" text NOT NULL,
    "auth" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
