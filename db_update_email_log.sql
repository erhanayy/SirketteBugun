-- Email Log tablosu - Tüm email gönderimlerini loglamak için
CREATE TABLE IF NOT EXISTS email_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL,                        -- Email türü kodu (örn: 'sifre_gonderimi', 'davet', 'bildirim')
    sent_to TEXT NOT NULL,                     -- Alıcı email adresi
    sender TEXT NOT NULL,                      -- Gönderici email adresi
    subject TEXT,                              -- Email konusu
    screen TEXT,                               -- Hangi ekrandan tetiklendi (örn: 'forgot-password', 'invite-member')
    status TEXT NOT NULL DEFAULT 'logged',     -- Durum: 'logged' | 'sent' | 'failed'
    error_message TEXT,                        -- Hata mesajı (başarısız ise)
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for faster querying
CREATE INDEX IF NOT EXISTS idx_email_log_sent_to ON email_log(sent_to);
CREATE INDEX IF NOT EXISTS idx_email_log_code ON email_log(code);
CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON email_log(created_at DESC);
