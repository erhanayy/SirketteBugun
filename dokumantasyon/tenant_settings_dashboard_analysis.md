# Analiz: Şirket Güncelleme Ekranı + Genel Bakış Dashboard

Bu doküman 2 yeni özelliğin analizini içerir.

---

## 1. Şirket Bilgileri Güncelleme Ekranı

### Erişim
- **Menü konumu:** hem MobileAvatarMenu hem de Masaüstü Sidebar'da (Yönetim başlığı altı) **"Şirket Bilgileri"** linki eklenir
- **Mobilde:** "Yönetim" başlık satırı mobile avatar menüde kaldırılır, linkler direkt listelenir
- **Webde:** Sol menüde "Yönetim" başlığı altında kalır
- **Sayfa yolu:** `/dashboard/tenant-settings`
- **Yetki:** admin ve staff rolleri tam yetkili, manager sadece görüntüleyebilir.

### Düzenlenebilir Alanlar

| Alan | Durum | Açıklama |
|------|-------|----------|
| Şirket Adı (`longName`) | ✏️ Düzenlenebilir | `tenants.long_name` güncellenir |
| Kısa Ad (`shortName`) | ✏️ Düzenlenebilir | `tenants.short_name` güncellenir |
| Statü (`isActive`) | 🔒 Salt okunur | `tenants.is_active` gösterilir ama değiştirilemez |
| Logo (`logoUrl`) | 📷 Değiştirilebilir | Link yapıştırma VEYA Bilgisayardan dosya seçme (Base64) ile güncellenir |

### Logo Gösterimi
- Header'deki ilk satırda **kısa addan önce** logo gösterilecek
- Yuvarlak/kare küçük logo (24-32px)

---

### Şirket Renk Kişiselleştirmesi (Personalization)

#### Yeni Tablo: `tenant_personalization`

```sql
CREATE TABLE tenant_personalization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) UNIQUE,
    menu_text_color TEXT DEFAULT '#FFFFFF',        -- Menü yazı rengi
    screen_text_color TEXT DEFAULT '#1F2937',      -- Ekran yazı rengi  
    background_color TEXT DEFAULT '#FFFFFF',       -- Arka fon rengi
    header_row1_color TEXT DEFAULT '#1E3A5F',      -- Üst menü 1. sAtır (header)
    header_row2_color TEXT DEFAULT '#2563EB',      -- Üst menü 2. satır (icon bar)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Renk Seçimi (Advanced Color Picker)
- **Hazır Temalar:** Tek tıkla uygulanabilen kurumsal renk setleri.
- **Advanced Picker:** 
    - **Palette (Petek):** 40 renkten oluşan hızlı seçim paleti.
    - **RGB / HEX:** Sayısal değer girişi ile tam hassasiyetli seçim.
- **Canlı Önizleme:** Seçilen renkler uygulama layout'una (CSS Variables) anında yansır.
- **Teknik Detay:** Hatalı link/emoji girişlerinde Next/Image çökmesini önlemek için standart `<img>` ve URL doğrulama mekanizması kullanılır.

---

## 2. Duyarlı (Responsive) Tasarım ve Breakpoint
- **Breakpoint:** Sidebar görünme sınırı `md` (768px) yerine `lg` (1024px) olarak güncellendi.
- **Davranış:** 
    - Telefonlar (yatay-dikey fark etmeksizin) her zaman "Mobil Header" ve "Alt Menü" düzeninde kalır.
    - Tabletler dikeyde mobil, yatayda masaüstü (Sidebar) moduna geçer.
- **Context Fix:** Sunucu aksiyonlarında (Server Actions) çerez bağımlılığını azaltmak için `tenantId` artık doğrudan parametre olarak iletilir.

---

## 2. Genel Bakış Dashboard (Yönetici/Çalışan)

**Yol:** `/dashboard` (mevcut page.tsx'in yerine)  
**Yetki:** admin, staff

### Üst Grup — Sabit İstatistik Kutuları

| Kutu | Veri Kaynağı |
|------|-------------|
| Üye Sayısı | `tenant_users WHERE role='member' AND is_active=true` |
| Şirket Çalışan Sayısı | `tenant_users WHERE role IN ('admin','staff') AND is_active=true` |
| Komiteler | `committees` + `committee_members` (Ad, Yönetici ve Çalışan Sayıları) |

### Alt Grup — Dönemsel İstatistikler

**Kriter alanları:** Yıl dropdown + Ay dropdown (varsayılan: mevcut yıl/ay)
**Güncelleme:** Client-side fetch ile anında.

| İstatistik | Veri Kaynağı |
|-----------|-------------|
| Sisteme Giriş Sayısı | `login_logs` tablosundan toplam |
| Unique Giriş Yapan Kişi | `login_logs` tablosundan `COUNT(DISTINCT user_id)` |
| Paylaşım Sayısı | `sposts` |
| Yorum Sayısı | `spost_comments` |
| Beğeni Sayısı | `spost_reactions` |
| Mesaj Sayısı | `messages` |
| Etkinlik Sayısı | `events` (bu dönemdeki etkinlikler) |
| Duyuru Sayısı | `posts` |

### Yeni Tablo: `login_logs`

```sql
CREATE TABLE login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    logged_in_at TIMESTAMP DEFAULT NOW()
);
```

Bu tablo, kullanıcı başarılı giriş yaptığında bir kayıt ekler. Bu sayede:
- **Toplam giriş sayısı:** `COUNT(*) WHERE logged_in_at BETWEEN ...`
- **Unique kişi sayısı:** `COUNT(DISTINCT user_id) WHERE logged_in_at BETWEEN ...`

---

## Özet: Yapılacaklar Listesi

### Veritabanı
1. `tenant_personalization` tablosu oluştur  
2. `login_logs` tablosu oluştur  
3. Schema'ya Drizzle tanımları ekle  

### Backend (Server Actions)
4. `updateTenantInfo` — Ad, kısa ad, logo güncelleme  
5. `upsertTenantPersonalization` — Renk kaydetme  
6. `getTenantPersonalization` — Renkleri okuma  
7. `getDashboardStats` — Üst grup istatistikleri  
8. `getDashboardPeriodStats` — Dönemsel istatistikler  
9. Login sırasında `login_logs`'a kayıt ekleme  

### Frontend
10. `/dashboard/tenant-settings` sayfası (form + color picker + logo upload)
11. Avatar menüde "Şirket Bilgileri" linki + mobilde "Yönetim" başlık kaldırma
12. Header'da logo gösterimi (kısa ad önüne)
13. Layout'ta CSS custom properties ile renk uygulama  
14. `/dashboard` sayfasını dashboard'a dönüştürme  
15. Yıl/Ay filtreli dönemsel istatistik bileşeni  
