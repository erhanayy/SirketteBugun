# Super Admin (Uygulama Admini) Ekranları Analiz Dokümanı

## 1. Genel Bakış
Sistemi genel çerçevede yönetecek, yeni şirketler (Tenant) oluşturacak ve manuel ödeme bildirimlerini girebilecek en yetkili kullanıcı rolü (Super Admin) için gerekli altyapı ve arayüzler geliştirilecektir.

## 2. Veritabanı ve Güvenlik Değişiklikleri
- **`users` Tablosu:**
  - `is_application_admin` (boolean, default: false) kolonu eklenecek.
  - Bu alan uygulama üzerinden değiştirilemeyecek, sadece veritabanından manuel olarak `true` yapılarak o kişinin Global (Super) Admin olması sağlanacak.
- **Route / Yetki Koruması:** Geliştirilecek ekranlara sadece `is_application_admin = true` olanlar erişebilecek. `false` veya `null` olan kullanıcıların sol menüsünde bu bölüm (Uygulama) kesinlikle gözükmeyecek ve route koruması ile yetkisiz girişler engellenecek.

## 3. Sidebar (Sol Menü) Değişiklikleri
- Sadece `is_application_admin === true` olan kullanıcılar giriş yaptığında sol menüde yeni bir alan belirecek.
- **Başlık Satırı:** "UYGULAMA" (Mavi renkli, mevcut "YÖNETİM" başlığı ile benzer tasarım dilinde).
- **Menü Alt Elemanları:**
  1. Şirket Yönetimi (Şirket Listesi)
  2. Manuel Ödeme / Abonelik Girişi

## 4. Şirket Yönetimi (Tenant Management) Sayfası
- **Listeleme:** Organizasyon sayfasına benzer veya tablo yapısında sistemdeki tüm şirketler (`tenants` tablosu) listelenecek.
- **Sıralama:** Şirket ismine göre (A -> Z) sıralı.
- **Arama:** İsim bazlı canlı arama.
- **Yeni Şirket Ekle:** Sağ üstte "+ Yeni Şirket" butonu, sistem üzerinde kısa ad, uzun ad, domain (varsa) ve logo ile şirket açabilme. 

## 5. Ödeme Giriş Ekranı (Manuel Abonelik / Offer Tanımlama)
- IBAN/EFT/Elden gibi yollarla yapılan ödemeleri sisteme manuel işlemek (Admin tarafından yetki/premium atamak) için kullanılacak arayüz.
- Ekran direkt olarak `tenant_user_offer_price` tablosuna kayıt atacaktır.
- **Hedef Seçimi:**
  - "Şirket (Tenant) İçin" veya "Kullanıcı (User) İçin" şeklinde tablar arası seçim yapılacak. Aynı anda sadece biri seçilebilecek.
  - **Şirket Seçilirse:** Seçim kutusunda aktif şirket isimleri listelenecek, seçilenin `tenant_id` si veritabanına basılacak.
  - **Kullanıcı Seçilirse:** Seçim kutusunda aktif kullanıcı isimleri (email ile birlikte) listelenecek, `user_id` si veritabanına basılacak.
- **Paket (Offer) Seçimi:**
  - Veritabanında (`tenant_user_offers` tablosunda) yer alan güncel ve aktif paketler (Örn: "Özel Teklif - 1000TL") bir dropdown (seçim) kutusu aracılığıyla getirilecek.
  - Admin buradan ilgili paketi seçtiğinde, `tenant_user_offer_price` tablosuna seçili paketin referans ID'si, başlangıç ve bitiş tarihi bilgisi ile beraber manuel satın alım statüsü atılacak. 
