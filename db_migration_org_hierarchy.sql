-- SirketteBugun — Organizasyon & Proje Ayrıştırma Migration
-- Tarih: 2026-04-08
-- Açıklama: committees tablosuna hiyerarşik ağaç yapısı için parent_committee_id ekleniyor.
--           projects tablosundaki committee_id zaten nullable, ek değişiklik gerekmez.

-- 1. Add parent_committee_id to committees table (self-referencing nullable FK)
ALTER TABLE committees
    ADD COLUMN IF NOT EXISTS parent_committee_id UUID REFERENCES committees(id);

-- 2. Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'committees'
  AND column_name = 'parent_committee_id';
