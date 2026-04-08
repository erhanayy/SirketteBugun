-- SirketteBugun: Super Admin (Global Application Admin) Veritabanı Güncellemesi

-- `users` tablosuna `is_application_admin` kolonu ekleniyor.
-- Default olarak false olacak. Superadmin yetkisi vermek için bu alan manuel olarak (örn. Supabase UI'dan) true yapılmalıdır.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_application_admin BOOLEAN DEFAULT false NOT NULL;

-- İstenirse `admin@sirkettebugun.com` kullanıcısı için bu alanı hemen true yapalım (Eğer demo aşamasındaysa)
UPDATE users SET is_application_admin = true WHERE email = 'admin@sirkettebugun.com';
