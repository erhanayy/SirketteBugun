# Analiz: Mobil İzin Yönetimi (Kamera, Galeri, Dosyalar)

Bu doküman, uygulamanın Android ve iOS platformlarında cihaz özelliklerine erişimi için gereken izin süreçlerini ve teknik gereksinimleri kapsar.

---

## 1. Gerekli İzinler ve Amaçları

| İzin | Amaç | Kullanım Alanı |
|------|------|----------------|
| **Kamera** | Fotoğraf çekme | Profil resmi, Duyuru/Paylaşım görselleri, Logo yükleme |
| **Fotoğraf Galerisi** | Mevcut fotoğrafları seçme | Logo güncelleme, Paylaşım ekleme, Profil resmi |
| **Dosya Erişimi** | Doküman seçme/kaydetme | Aidat makbuzları, Belgeler, Formlar |

---

## 2. Teknik Strateji: Capacitor Hook

Uygulama bir Next.js Web App olduğu ve Capacitor ile paketleneceği için, izinleri yönetmek için **Capacitor Plugin**'lerini kullanacağız.

### Kullanılacak Pluginler:
1. `@capacitor/camera`: Kamera ve Galeri erişimi için.
2. `@capacitor/filesystem`: Dosya sistemi erişimi için (Belgeler vb.).
3. `@capacitor-community/permissions-queries`: İzin durumlarını önceden kontrol etmek için (İsteğe bağlı).

---

## 3. İzin İsteme Stratejisi (Hybrid UX)

Kullanıcının isteği üzerine üç aşamalı bir yapı kurulacaktır:

### A. İlk Açılış / Onboarding Ekranı
Uygulama ilk kurulduğunda veya yetkili bir kullanıcı ilk giriş yaptığında bir bilgilendirme ekranı çıkar:
- **İçerik:** Kameraya neden ihtiyaç var? Dosyalara (aidat makbuzu vb.) neden ihtiyaç var?
- **Seçenek 1:** "Hepsine İzin Ver" (Toplu Onay).
- **Seçenek 2:** "İhtiyaç Halinde Karar Vereceğim" (Geçici Atla).

### B. Gerektiğinde İstemek (Just-in-Time)
Eğer kullanıcı Onboarding aşamasında "Daha sonra" dediyse:
- **Süreç:** Kullanıcı "Logo Yükle" veya "Dosya Seç" butonuna bastığı anda Capacitor Plugin'i üzerinden sistem diyalogu otomatik tetiklenir.

### C. Ayarlar Üzerinden Yönetim
- **Konum:** `/dashboard/settings` veya yeni bir `/dashboard/settings/permissions` sayfası.
- **Fonksiyon:** Kullanıcı mevcut izin durumlarını görür. Eğer bir izni kalıcı olarak reddettiyse (denied), onu tekrar açabilmesi için sistem ayarlarına yönlendiren bir buton sunulur.

---

## 4. Platform Bazlı Konfigürasyonlar (Native)

Dosyalar üzerinde yapılacak değişiklikler (Geliştirme aşamasında):

### Android (`AndroidManifest.xml`)
```xml
<!-- Kamera -->
<uses-permission android:name="android.permission.CAMERA" />
<!-- Galeri/Dosya (Android 10 ve altı) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### iOS (`Info.plist`)
Lokalizasyonlu açıklama metinleri zorunludur (Apple bu metinleri inceler):
- `NSCameraUsageDescription`: "Uygulama üzerinden fotoğraf paylaşabilmeniz için kamera izni gerekiyor."
- `NSPhotoLibraryUsageDescription`: "Galerinizdeki fotoğrafları seçebilmeniz için galeri izni gerekiyor."
- `NSPhotoLibraryAddUsageDescription`: "Fotoğrafları kaydetmek için galeri izni gerekiyor."

---

## 5. Uygulama Planı (Faz 4)

1. **Plugin Kurulumu:** Gerekli Capacitor kütüphanelerinin projeye eklenmesi.
2. **Permission Hook Yazılması:** `usePermissions` adında bir React Hook oluşturarak izin durumlarını (`prompt`, `granted`, `denied`) merkezi yönetmek.
3. **UI Entegrasyonu:** Şirket ayarları ve diğer dosya/resim yükleme alanlarında bu hook'un kullanılması.
4. **Native Güncelleme:** Android ve iOS klasörlerindeki manifest/plist dosyalarının güncellenmesi.

> [!IMPORTANT]
> **Soru:** İzinlerin sadece "gerektiğinde" istenmesi (B şıkkı) sizin için uygun mu? Yoksa uygulama ilk açıldığında hepsini tek seferde sormasını mı istersiniz?
