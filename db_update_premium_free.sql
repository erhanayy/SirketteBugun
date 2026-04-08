-- 1. Create tenant_user_offer Table
CREATE TABLE IF NOT EXISTS tenant_user_offer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_tenant_offer BOOLEAN DEFAULT FALSE,
    is_tenant_user_offer BOOLEAN DEFAULT FALSE,
    year INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenant_user_offer_year ON tenant_user_offer(year);
CREATE INDEX IF NOT EXISTS idx_tenant_user_offer_is_active ON tenant_user_offer(is_active);

-- 2. Create tenant_user_offer_price Table
CREATE TABLE IF NOT EXISTS tenant_user_offer_price (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    tenant_user_id UUID,
    tenant_offer_id UUID NOT NULL,
    price_paid DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant
      FOREIGN KEY(tenant_id) 
	  REFERENCES tenants(id)
	  ON DELETE SET NULL,
    CONSTRAINT fk_tenant_user
      FOREIGN KEY(tenant_user_id) 
	  REFERENCES tenant_users(id)
	  ON DELETE SET NULL,
    CONSTRAINT fk_offer
      FOREIGN KEY(tenant_offer_id) 
	  REFERENCES tenant_user_offer(id)
	  ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_tu_offer_price_tenant ON tenant_user_offer_price(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tu_offer_price_user ON tenant_user_offer_price(tenant_user_id);
CREATE INDEX IF NOT EXISTS idx_tu_offer_price_dates ON tenant_user_offer_price(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tu_offer_price_active ON tenant_user_offer_price(is_active);

-- 3. Insert Parameters into parameters Table
INSERT INTO parameters (id, code, data_int) VALUES
    (gen_random_uuid(), 'PostDailyLimit', 3),
    (gen_random_uuid(), 'MesajDailyLimit', 3),
    (gen_random_uuid(), 'UploadVideoSize', 20),
    (gen_random_uuid(), 'UploadPhotoSize', 5),
    (gen_random_uuid(), 'PremiumUploadVideoSize', 500),
    (gen_random_uuid(), 'PremiumUploadPhotoSize', 20),
    (gen_random_uuid(), 'AdWaitSeconds', 5)
ON CONFLICT (code) DO UPDATE 
SET data_int = EXCLUDED.data_int;

-- String Parameters for UI IBAN details
INSERT INTO parameters (id, code, data_str) VALUES
    (gen_random_uuid(), 'SirketteBugunIBANAccountName', 'Şirkette Bugün Yazılım A.Ş.'),
    (gen_random_uuid(), 'SirketteBugunIBANBankName', 'Kuveyt Türk'),
    (gen_random_uuid(), 'SirketteBugunIBAN', 'TR00 0000 0000 0000 0000 0000 00')
ON CONFLICT (code) DO UPDATE 
SET data_str = EXCLUDED.data_str;

-- 4. Insert Premium Offers for 2026
-- Kurumsal (Şirket) Paketi: 100.000 TL
INSERT INTO tenant_user_offer (id, is_tenant_offer, is_tenant_user_offer, year, price, is_active) 
VALUES (gen_random_uuid(), true, false, 2026, 100000, true);

-- Bireysel (Üye) Paketi: 2.500 TL
INSERT INTO tenant_user_offer (id, is_tenant_offer, is_tenant_user_offer, year, price, is_active) 
VALUES (gen_random_uuid(), false, true, 2026, 2500, true);
