# Versiyonlama ve 'Hakkında' Ekranı Analizi

## 1. Versiyonlama Sistemi Tasarımı (Auto-Increment)
Uygulamanın versiyon numarasının manuel olarak değiştirilmesi unutulabileceği için her deployment (canlıya çıkma) işleminde otomatik olarak artan bir sistem tasarlanmıştır.

- **Özel Pre-Build Hook:** Projenin içerisine `scripts/generate-version.js` Node.js betiği eklendi.
- Bu script, `vYY.MM.DD-[BuildNumber]` şeklinde (Örn: `v26.04.10-5`) dinamik bir etiket üreterek bunu kök dizindeki / erişilebilir `version.json` isimli bir konfigürasyona kaydeder.
- `package.json` içerisindeki `build` komutunun önüne `"prebuild": "node scripts/generate-version.js"` kancası eklendi.
- Böylelikle uygulamanın canlıya alındığı veya derlendiği (build komutunun tetiklendiği) her milisaniyede sürüm numarası +1 otomatik olarak üretilerek koda dahil olur.

## 2. Ayarlar "Hakkında" Ekranı
- `/dashboard/settings/about` yolu oluşturuldu.
- Sol menüdeki "Ayarlar" sekmesinin içerisine **Hakkında** bağlantısı en üste eklendi.
- İçerisinde kurumsal logo, şirket bildirimleri ve dinamik olarak arka planda basılan **Versiyon numarası** tasarımı konumlandırıldı. Müşteriler veya test grupları hata raporlarken doğrudan bu ekrandan versiyonu teyit edebilecek.
