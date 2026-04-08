# Notlar (Post-it) Özellik Analizi

## Giriş ve Amaç
Kullanıcıların kendi kendilerine kısa notlar (Post-it formatında) alabildiği, arayüz olarak renkli kağıtlar hissi veren ve içinde anlık metin araması yapılabilen bir modül geliştirilecektir. Kural 5 gereği, sadece bu aşamada yer alan analize onay verilmesinin ardından (açıkça onay cümlesi ileşilince) geliştirme süreci başlayacaktır.

## 1. Veritabanı (Database Schema)
`lib/db/schema.ts` dosyasına yeni bir `notes` tablosu eklenecektir.
- `id`: Benzersiz UUID.
- `tenantId`: İlgili şirketin ID'si.
- `userId`: Notu oluşturan kullanıcının kimliği (Herkes sadece kendi notlarını görecektir).
- `title`: Notun başlığı (opsiyonel veya kısa başlık).
- `content`: Notun detaylı içeriği.
- `color`: Post-it rengi (örn: sarı, yeşil, mavi, pembe vb.)
- `createdAt` ve `updatedAt`: Oluşturulma tarihi.

## 2. Arayüz ve Kullanıcı Deneyimi (Frontend)
- **Menü Eklentisi:** `Uygulama > İş` ana başlığı altındaki `Hatırlatma` bağlantısının hemen altına **Notlar** bağlantısı konulacaktır.
- **Ekran Tasarımı (`/dashboard/notes`):**
  - **Üst Bölüm:** Bir arama çubuğu (Search Bar) ve sağ tarafında "Yeni Not Ekle" (Add Note) butonu yer alacaktır. 
  - **Arama Kutusu Mantığı:** Kullanıcı arama kutusuna yazı yazdıkça (örn: "toplantı"), sayfa içerisindeki eşleşmeyen post-it'ler otomatik gizlenecektir (Anlık / Client-side filtreleme).
  - **Post-it Görünümü:** Izgara (Grid veya Masonry) sisteminde asimetrik dağınık (gerçekçi post-it hissiyatlı) veya düzenli yapışkan kağıtlar stiline sahip kare kartlar oluşturulacaktır. Kartların arka planları pastel "post-it" renklerinde olacak, kartların sağ üst köşesinde bir "Sil" (Çöp Kutusu) veya "x" ikonu bulunacaktır.

## 3. Erişim Kuralları
- Şirket sahibi, Yöneticiler (Admin) ve Çalışanlar (Staff) dâhil olmak üzere herkes yetki kısıtlaması olmaksızın sadece **KENDİ** oluşturduğu notları görebilir; başkasına atanma özelliği bu modülde bulunmayacaktır.
- Oluşturan kullanıcı istediği notu dilediği zaman silebilir.

## 4. Sorular / Netleştirilecek Konular
Bu analiz üzerine aşağıdaki soru(ları) cevaplamanızı ve ardından geliştirme onayı vermenizi rica ederim:
1. **Renk Seçimi:** Notları oluştururken kullanıcının arka plan rengini seçmesine imkân verelim mi, yoksa her yeni not eklendiğinde sistem rastgele pastel bir post-it rengi mi atasın? (Rastgele atanması post-it panosu görünümünü çok daha doğal kılar).
2. Sadece ekleme ve silme özellikleri olduğunu belirttiniz. Girilen bir notun içeriğini sonradan güncelleme/edit etme özelliği olsun mu, yoksa yazılan notu silip yerine yenisini eklemek yeterli midir?

---
> **DİKKAT (Kural 5):** Geliştirmeye geçilebilmesi için yazılı olarak sorulara cevabınızla birlikte **"Onaylıyorum, geliştirmeye başla"** (veya benzeri açık onay ihtiva eden) bir mesaj yazmanızı beklemekteyim.
