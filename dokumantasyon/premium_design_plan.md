# Premium/Free UI ve Akış Tasarımı (Design Plan)

Bu doküman, yeni premium üyelik ve reklam gösterim modelinin uygulama arayüzünde (UI) nasıl davranacağını görselleştirmek ve ortak bir dille planlamak için hazırlanmıştır. 

## 1. Tam Sayfa Ara Geçiş Reklamı (Interstitial Ad) Modeli
Kullanıcı sol menüden farklı bir sekmeye geçtiğinde (`Mesajlar`, `Etkinlikler`, `Rehber` vb.), içerik yüklenmeden önce ekranı tamamen kaplayan bir reklam veya yer tutucu bileşen gösterilecektir.

**Akış ve Görünüm:**
* **Arka Plan:** Tam sayfa, koyu renkli veya blur efektli yarı saydam arka plan (Overlay).
* **Ortada:** Google reklamı scripti yerleşene kadar görünecek olan **`500x500` veya `100% width` sahte reklam görseli (Placeholder).**
* **Sağ Üst Köşe:** İçinde geri sayım olan bir sayaç (Örn: `5... 4...`). `AdWaitSeconds` parametresinden aldığı saniye sıfırlanınca bu sayaç ikonik bir kapatma çarpısına (`X`) dönüşecek.
* **En Alt Kısım (Upsell Aksiyonu):** Parlak renklerle (Örn: Altın rengi veya Mavi) belirginleştirilmiş bir metin/buton: *"Reklamsız, limitsiz premium deneyime geçmek için tıklayın"*. Bu butona basıldığında **Uyarı / Tarife (Upsell Modal)** penceresi açılır.

## 2. Akış İçi (In-Feed) Reklam Modeli
Ana sayfa (Social Posts feed) üzerinde gösterilecek olan reklamlardır.

**Görünüm:**
* İlk post'tan hemen önce (en üstte) 1 adet yatay reklam bloğu.
* Her 5 gönderide bir tekrar eden yatay reklam bloğu.
* **Banner İçeriği:** Kenarları yuvarlatılmış (rounded), üzerinde "Sponsorlu" (Ad / Sponsored) ibaresi bulunan, şimdilik yer tutucu resim olan bir kutu.
* **Upsell Aksiyonu:** Kutu altında veya köşesinde daha ince bir fontla *"Bu reklamları kaldırmak için premium'a geçin"* linki.

## 3. Limitsiz Premium'a Yükseltme Ekranı (Upsell Modal)
Kullanıcı "Premium'a Geç" butonuna bastığında karşısına çıkacak şık tasarımlı açılır penceredir (Dialog/Modal).

**Mockup Yapısı:**
```text
+-------------------------------------------------------------+
|                                                             |
|                 DernekteBugün Premium ⭐                    |
|                                                             |
|  [Limitsiz Mesajlaşma]  [Reklamsız Deneyim]  [Büyük Dosya]  |
|                                                             |
| ----------------------------------------------------------- |
| Eğer "Manager/Staff" ise:                                   |
|   ----- Kurumsal (Şirket) Paketleri ----- (Ayraç tasarımı)  |
|   [ Kart 1: 2026 Kurumsal Paket - 5000 TL ]                 |
|                                                             |
|   ----- Bireysel (Üye) Paketleri ----- (Ayraç tasarımı)     |
|   [ Kart 2: 2026 Bireysel Paket - 750 TL ]                  |
|                                                             |
| Eğer "Member" ise:                                          |
|   ----- Premium Paketler ----- (Ayraç tasarımı)             |
|   [ Kart 2: 2026 Bireysel Paket - 750 TL ]                  |
|                                                             |
| ----------------------------------------------------------- |
| Bilgi: Ödemenizi şirket hesabımıza havale/EFT ile ileterek  |
| hesabınızı anında Premium'a yükseltebilirsiniz.             |
|                                                             |
| [Banka]: Ziraat Bankası                                     |
| [Alıcı]: Şirkette Bugün Yazılım A.Ş.                        |
| [IBAN]:  TR00 0000 0000 0000 0000 0000 00  [KOPYALA BUTONU] |
|                                                             |
| [ Kapat ]                                                   |
+-------------------------------------------------------------+
```
**Davranış Kuralları:**
* Modal açıldığında, kullanıcının rolü kontrol edilir (`tenant.userRole`).
* `Member` (Sıradan Üye) ise sadece veritabanındaki `is_tenant_user_offer = true` ve `is_active = true` olan tarifeler listelenir ve üstünde sol menü ayracı stilinde bir başlık ayırıcı konur.
* `Manager/Admin` (Şirket Yöneticisi) ise Kurumsal ve Bireysel teklifler ayrı ayraçlar (separator) altında alt alta listelenir.
* Sistem parametrelerinden çekilen IBAN ve Banka bilgileri kopyalama ikonuyla sunulur.

## 4. Limit Aşımı Uyarısı Modeli
Kullanıcı parametrelerdeki günlük mesaj veya gönderi limitine (Örn: `PostDailyLimit: 3`) ulaştığında yeni bir işlem yapmak isterse çıkacak olan engelleyici penceredir.

**Görünüm:**
* Açılır Modal (Dialog): *"Günlük Gönderi Limitiniz Doldu"*
* *"Bugün için ücretsiz kullanım hakkınızı doldurdunuz. Daha fazla paylaşım yapmak için premium üyeliğe geçin."*
* Harekete Geçirici Buton: **[Premium Tarifeleri İncele]** (Tıklanınca Upsell Modal öğesini tetikler).

## Teyit
Bu tasarım kurgusu beklentilerinizi ve ihtiyaçlarınızı karşılıyor mu? 
Onayınız sonrasında sırasıyla:
1. `schema.ts` güncellemek
2. `Upsell Modal` bileşenini koda eklemek
3. Sistem genelinde (layout veya pages) reklam `Placeholder` ve `Sayaç` kurgularını koymak işlemlerine başlayacağım.
