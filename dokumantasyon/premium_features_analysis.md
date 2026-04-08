# SirketteBugun - Kullanım Ücreti ve Abonelik Modeli Analizi

Bu doküman, uygulamanın ücretli, ücretsiz ve sınırlı/reklamlı kullanım senaryolarını detaylandırmak ve geliştirme öncesinde netleştirmek üzere hazırlanmıştır.

## 1. Kullanım Seçenekleri
Sistemde temel olarak 3 kullanım seviyesi (tier) bulunmaktadır:

1. **Şirket Premium (Yıllık Kurumsal Alım):** Şirket kendi adına yıllık alım yapar. Bu durumda derneğe bağlı **tüm üyeler** veya belirlenen grup, uygulamayı reklamsız ve limitsiz kullanır.
2. **Üye Bireysel Premium (Bireysel Alım):** Şirket ücretsiz versiyonu kullanıyorsa, üye dilerse **kendi adına** satın alma yaparak kendi deneyimini reklamsız ve limitsiz hale getirebilir.
3. **Standart (Reklamlı & Sınırlı) Kullanım:** Hem derneğin hem de üyenin ücretli bir paketi yoksa, kullanıcı standart versiyonu kullanır. Bu versiyon reklam içerir ve günlük kullanım limitleri (kota) barındırır.

## 2. Ödeme Yönetimi (Manuel)
* Sistem üzerinde doğrudan bir sanal pos veya kredi kartı ödeme entegrasyonu **bulunmayacaktır**. 
* Ödemeler (havale/EFT/nakit vb.) dışarıdan şirket veya sistem yöneticisi hesaplarına yapılacak, paket tanımlamaları **Uygulama Admini (Superadmin)** tarafından manuel olarak sisteme işlenecektir.

## 3. Veritabanı Değişiklikleri & Yeni Tablolar

**Mevcut Durum Analizi:**
Sistemde paket (offer) tanımlarını ve ödeme (fatura/kayıt) geçmişini tutacağımız iki yeni tablo tasarlanacaktır.

### A. `tenant_user_offer` Tablosu
Uygulama Admini tarafından sisteme tanımlanan "Paket / Tarife" tanımlarının tutulduğu tablodur.

| Alan Adı | Tip | Zorunlu | Açıklama |
| :--- | :--- | :--- | :--- |
| `id` | uuid | Evet | PK (Birincil Anahtar) |
| `is_tenant_offer` | boolean | Hayır | Sadece Şirketler (Kurumsal) için mi geçerli? |
| `is_tenant_user_offer` | boolean | Hayır | Sadece Üyeler (Bireysel) için mi geçerli? |
| `year` | integer | Evet | Hangi yılın tarifesi olduğu (Örn: 2026) |
| `price` | decimal | Evet | Paket fiyatı |
| `is_active` | boolean | Evet | Bu paket şu an satışta mı / geçerli mi? |

* **Kural:** Bir kayıtta `is_tenant_offer` ve `is_tenant_user_offer` aynı anda TRUE olamaz. (Paket ya kurumsaldır ya bireyseldir).

### B. `tenant_user_offer_price` Tablosu
Satın alma işlemlerinin / Aktif aboneliklerin tutulduğu tablodur.

| Alan Adı | Tip | Zorunlu | Açıklama |
| :--- | :--- | :--- | :--- |
| `id` | uuid | Evet | PK (Birincil Anahtar) |
| `tenant_id` | uuid | Hayır | Eğer "Şirket Alımı (Kurumsal)" ise dolu olacak. (FK tenants) |
| `tenant_user_id` | uuid | Hayır | Eğer "Üye Bireysel Alımı" ise dolu olacak. (FK tenant_users) |
| `tenant_offer_id` | uuid | Evet | Satın alınan paketin ID'si. (FK tenant_user_offer) |
| `price_paid` | decimal | Evet | Ödenen Tutar (İndirim durumu vs. için fiyattan farklı olabilir) |
| `start_date` | timestamp | Evet | Abonelik Başlangıç Tarihi |
| `end_date` | timestamp | Evet | Abonelik Bitiş Tarihi |
| `is_active` | boolean | Evet | Abonelik şu an aktif mi? (İptal/İade vb. durumları için) |

* **Limitsiz/Reklamsız Erişim Kuralı:** O an oturum açmış kullanıcının, `start_date` ile `end_date` tarihleri arasında `is_active = true` olan kendine ait (`tenant_user_id`) veya üyesi olduğu derneğe ait (`tenant_id`) **herhangi bir kaydı varsa**, reklam gösterilmez ve limit uygulanmaz.

### C. `parameters` Tablosu Güncellemesi
Sınırlı (ücretsiz) kullanıcılar için günlük limitlerin tutulacağı global parametre tablosuna şu kayıtlar ön tanımlı (SQL scripti ile) eklenecektir:
- `PostDailyLimit` (Örn: 3) -> Kişinin bir günde atabileceği maksimum Social Post (Gönderi) sayısı.
- `MesajDailyLimit` (Örn: 3) -> Kişinin bir günde atabileceği maksimum **tekil mesaj gönderim** sayısı.
- `UploadVideoSize` (Örn: 20) -> Ücretsiz kullanımda yüklenebilecek maksimum video boyutu (MB).
- `UploadPhotoSize` (Örn: 5) -> Ücretsiz kullanımda yüklenebilecek maksimum fotoğraf boyutu (MB).
- `PremiumUploadVideoSize` (Örn: 500) -> Premium kullanımda yüklenebilecek maksimum video boyutu (MB) - Projenin çökmesini engellemek için.
- `PremiumUploadPhotoSize` (Örn: 20) -> Premium kullanımda yüklenebilecek maksimum fotoğraf boyutu (MB).
- `AdWaitSeconds` (Örn: 5) -> Tam sayfa reklamların sağ üstte "X" butonu çıkmadan önce ekranda kalma süresi (Saniye). (Eğer Google kendi kapatma butonunu sunmuyorsa ve biz tasarlıyorsak kullanılacak.)
- `SirketteBugunIBANAccountName` -> "Şirkette Bugün Yazılım A.Ş." (IBAN Hesap Adı)
- `SirketteBugunIBANBankName` -> "Ziraat Bankası" (Banka Adı)
- `SirketteBugunIBAN` -> "TR00 0000 0000 0000 0000 0000 00" (Para transferi yapılacak IBAN Numarası)

## 4. Reklam Modülü (UI Davranışı)

Premium **olmayan** (Stanart) kullanıcılar için aşağıdaki reklam gösterim kuralları uygulanacaktır:

1. **Ana Sayfa Akış (Feed) Reklamları:**
   - Sayfa yüklendiğinde en üstte bir reklam alanı.
   - Her 5 gönderi (post) sonrasında akış arasına bir reklam alanı yerleştirilecek.
2. **Ara Geçiş (Interstitial) Reklamları:**
   - Sol menüden herhangi bir başka ekrana (örneğin Rehber, Etkinlikler vb.) tıklandığında öncelikle **tam sayfa** bir reklam gösterilecek.
   - Bu reklam `AdWaitSeconds` parametresi kadar saniye beklendikten sonra sağ üstteki "X" (kapat) butonuyla kapatılabilecek. (Not: Tam sayfa reklamlar için Google AdSense bağlantısı yapılana kadar "Yer Tutucu/Placeholder" bir React bileşeni kullanılacaktır.)
3. **Reklamsız Kullanıma Geçiş Hedeflemesi (Upsell):**
   - Gösterilen reklam alanlarının hemen altında veya belirgin bir noktasında: *"Reklamsız ve limitsiz kullanım için yükseltin"* butonu/linki yer alacak.
   - Bu butona tıklandığında, kullanıcının rolüne göre sistemde aktif olan `tenant_user_offer` (Tarife) bilgileri gösterilecek. Geliştirme; ileride her rol için birden fazla paket olabileceği düşünülerek **çoklu listelemeyi** destekleyecek yapıda olacaktır.
     - **Sıradan Üyeler (Member):** Ekranda sadece `is_tenant_user_offer` (Bireysel) paketlerini görecek.
     - **Şirket Yöneticisi/Çalışanı (Manager/Staff):** Ekranda hem kurumsal hem bireysel tarifeleri ayrı ayrı veya listelenmiş şekilde görebilecek.


## 5. Uygulama Adımları (Next Steps)

Kullanıcı onaylarıyla birlikte aşağıdaki aksiyonlar alınacaktır:
1. `db_update_premium_free.sql` betiği üzerinden veritabanı tabloları Uygulama Geliştiricisi/Kullanıcı tarafından manuel oluşturulacaktır.
2. Drizzle şema (`schema.ts`) ilgili yeni DB tablolarıyla güncellenecektir.
3. Yönetim paneli "Offer Ekleme" ekranları son aşamaya bırakılmış olup, test verileri manuel olarak DB'ye girilecektir.
4. Hem tam sayfa hem de post-içi reklam UI placeholder'ları kodlanacaktır.
5. `Upsell` (Paket Yükseltme) ekranının frontend entegrasyonu tamamlanıp logic eklenecektir.
