# Super Admin Modülü Geliştirme Planı

Bu plan, `is_application_admin` yetkisine sahip Global Admin (Super Admin) rolünün Şirket listeleme ve Ödeme girişi ekranlarının tasarımlarını, yetki engellerini ve sunucu işleyişini açıklar.

## User Review Required
- [db_update_superadmin.sql](file:///Users/erhanayyildiz/Desktop/Work/SirketteBugun/db_update_superadmin.sql) kodunun Supabase veritabanında çalıştırılması gerekmektedir. Böylece `admin@sirkettebugun.com` kullanıcısı Global Admin olacaktır.

## Proposed Changes

---
### 1. Veritabanı ve Şema Güncellemeleri
`users` tablosuna `is_application_admin` yetkisini (boolean) ekleyeceğiz ve `db` üzerinde Drizzle ile tanılayacağız.
#### [MODIFY] [schema.ts](file:///Users/erhanayyildiz/Desktop/Work/SirketteBugun/lib/db/schema.ts)
- `users` tablosuna `isApplicationAdmin` isimli (default false olan) kolonu ekleyeceğiz.

---
### 2. Sidebar Menü ve Yetkilendirme
Sol menü (Sidebar) sadece "Uygulama Yöneticisi" olan kullanıcıya özel bir "Uygulama" bölümü açacak.
#### [MODIFY] [sidebar.tsx](file:///Users/erhanayyildiz/Desktop/Work/SirketteBugun/components/sidebar.tsx) veya ilgili menü bileşeni
- Oturumdan (Session) gelen kullanıcının `isApplicationAdmin` değeri okunacak. Eğer `true` ise alt alta "Şirket Yönetimi" ve "Ödeme Girişi" linklerini barındıran "UYGULAMA" isimli mavi bir başlık (YÖNETİM ile benzer estetikte) belirecek.

---
### 3. Şirket Yönetimi Sayfaları (Tenant List/Create/Update)
Sistemdeki tüm derneklerin okunduğu ve listelendiği paneller (Super Admin).
#### [NEW] [app/dashboard/admin/tenants/page.tsx](file:///Users/erhanayyildiz/Desktop/Work/SirketteBugun/app/dashboard/admin/tenants/page.tsx)
- Tüm dernekleri (tenants) A'dan Z'ye sıralı biçimde getiren ve isim ile arama (Search) yapabileceğimiz listeleme. Sağ üstte `+ Yeni Şirket` butonu.
#### [NEW] [app/dashboard/admin/tenants/[tenantId]/page.tsx](file:///Users/erhanayyildiz/Desktop/Work/SirketteBugun/app/dashboard/admin/tenants/[tenantId]/page.tsx)
- Şirket detay, güncelleme ve oluşturma formu. Ad, Kısa Ad, Logo gibi alanların güncellenebildiği UI.

---
### 4. Manuel Ödeme Giriş Ekranı
Yöneticinin elden, havale veya diğer ikili yollarla gelen ödemeleri/paket aboneliklerini veritabanına yazdığı arayüz.
#### [NEW] [app/dashboard/admin/payment-entry/page.tsx](file:///Users/erhanayyildiz/Desktop/Work/SirketteBugun/app/dashboard/admin/payment-entry/page.tsx)
- **Hedef Seçimi (Tab):** Arayüzde "Şirket İçin (Tenant)" ve "Kullanıcı İçin (User)" iki ayrı sekme bulunacak. Kullanıcı aynı anda sadece bir tarafa ödeme bilgisi girebilecek.
- **Dinamik Dropdown:** Seçili sekme türüne göre ya Aktif Şirketler listesi ya da Aktif Üyeler listesi veri tabanından asenkron olarak (select ile) aranarak çekilecek.
- **Paket (Offer) Seçimi:** DB (`tenant_user_offers` tablosu) üzerinden sistemde satışı açık olan güncel paketlerin listesi dropdown'dan seçilecek.
- Başlangıç ve bitiş (veya ödeme) tarihleri girilip onaylanınca `tenant_user_offer_price` tablosuna kayıt oluşturulacak. Ekranda kullanıcıya onay/hata uyarıları düşecek.

---
### 5. Backend Sunucu Fonksiyonları (Server Actions)
İlgili işleri yönetecek backend endpointleri oluşturulacak.
#### [NEW] [lib/actions/superadmin.ts](file:///Users/erhanayyildiz/Desktop/Work/SirketteBugun/lib/actions/superadmin.ts)
- `getTenants`, `createTenant`, `updateTenant` fonksiyonları yazılacak.
- `createManualPayment` fonksiyonu oluşturulup, formdan gelen "User ID" veya "Tenant ID"nin hangisi doluysa sadece ona `offer` kaydı atılmasını sağlayacak mantık kurulacak.

---

## Verification Plan

### Test Edilecek Akışlar:
1. **Güvenlik Doğrulaması:** Yetkisi olmayan bir hesapla adres çubuğundan `/dashboard/admin...` sekmelerine manuel girildiğinde sayfa yerine hata (veya anasayfaya yönlendirme) ile karşılaşması.
2. **Kariyer Menüsü (Sidebar) Kontrolü:** Sadece adminlerin `is_application_admin` tag'i var iken sidebar menüsünü görebildiği teyit edilecek.
3. **Manuel Ödeme Doğrulama:** Formda hem Tenant hem User seçilebileceği/seçilemeyeceği arayüzün kilitli dinamikleri ("Şirket Seçilirse Kullanıcı iptal olur") form üzerinde test edilecektir. Ödeme verildikten sonra kullanıcının reklamı sıfırlanmalıdır.
