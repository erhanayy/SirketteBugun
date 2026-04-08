# Manuel Zamanlanmış Görev (Cron Trigger) Analizi

## Giriş ve Amaç
Kullanıcının maliyetleri düşük tutmak amacıyla, Google Cloud veya benzeri ücretli harici servislerin Cron (Zamanlanmış Görev) hizmetini kullanmak yerine, Super Admin yetkisine sahip hesapların sistemi manuel tetikleyebileceği bir arayüz geliştirilmesi hedeflenmektedir. Bu sayede, yönetici sisteme girip özel bir sayfayı açtığında veya butona bastığında arka planda bekleyen tüm cron scriptleri (`isNotified: false` olan hatırlatmalar vb.) tetiklenecektir.

## 1. Yetkilendirme ve Konum
- **Ekranın Konumu:** Yalnızca Super Admin (Uygulama Yöneticisi) seviyesinde görülebilen özel bir menü öğesi olacaktır. Örnek: `Menü -> Uygulama -> Zamanlanmış Görevler (Scheduler)` (/dashboard/admin/scheduler).
- **Yetki Kontrolü:** Sayfayı sadece `isApplicationAdmin === true` veya sistemdeki en üst yetkiye sahip hesaplar görüntüleyebilecektir.

## 2. Sayfa Tasarımı (UI/UX)
- Ekran açıldığında sistemdeki tüm otomatik görevlerin bir dökümü listelenecektir. Örneğin:
  - **Hatırlatmalar (Reminders)**
  - *(Gelecekte eklenecek diğer email/bildirim görevleri)*
- Her görevin yanında sistemin ne durumda olduğunu gösteren bilgiler (kaç adet bekleyen bildirim var vb.) ve **"Şimdi Tetikle" (Run Now)** butonu bulunacak.
- Başarılı tetikleme sonrasında ekranda "X adet görev çalıştırıldı ve bildirimler gönderildi." şeklinde yeşil bir geri bildirim mesajı görünecek.

## 3. Çalışma Mantığı (Backend)
- Şu an aktif olan `/api/cron/reminders` endpoint'i, ön yüzdeki butona tıklandığında Super Admin tarafından manuel olarak çağrılacak. 
- API güvenliği `x-cron-secret` veya mevcutta bulunan admin oturum token'ı üzerinden doğrulanacak, dışarıdan zararlı erişimler engellenecek.
- "Sayfayı açınca otomatik çalışsın" mantığı, yönetici yanlışlıkla sayfayı açtığında da çalışacağı için kontrolsüzlüğe yol açabilir. Bu sebeple sayfada kocaman bir **"Tüm Bekleyen Görevleri Çalıştır"** butonu olması, yöneticinin süreci daha bilinçli yönetmesini sağlayacaktır. (Yine de istenirse sayfaya girer girmez de tetiklenebilir).

## Kararlar (Kullanıcı Tarafından Onaylananlar)
Kullanıcının tercihleri doğrultusunda şu kurallar proje geliştirirken uygulanacaktır:
1. **Çalışma Şekli (Butonlar):** Sayfa açıldığında görevler otomatik çalışmaz. Her bir görev tipinin (Örn: Hatırlatmalar) yanında özel bir "Çalıştır" butonu bulunur. Ayrıca sayfanın en üst kısmında hepsini birden tetikleyen bir "Tümünü Çalıştır (Run All)" butonu yer alacaktır.
2. **Menü Yeri:** Yalnızca Super Admin kullanıcısının görebildiği `Uygulama` başlığı altında "Sistem Görevleri" adıyla konumlandırılacaktır.
3. **Erişim Yetkisi:** Bu ekran şirket yöneticileri (admin) tarafından ASLA GÖRÜLEMEZ. Sadece `isApplicationAdmin === true` olan sistem yöneticileri görebilir ve çalıştırabilir.

---
> **Not:** Kural 5 gereği, yazılı olarak "Onaylıyorum, geliştirmeye başla" demediğiniz sürece kodlarda hiçbir değişiklik yapılmayacaktır. Analiz tamamlanmıştır.
