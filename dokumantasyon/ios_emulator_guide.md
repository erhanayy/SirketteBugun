# Rehber: Uygulamayı iOS Simülatöründe Çalıştırma

Bu doküman, geliştirdiğimiz sistemi Apple iOS Simülatörü (Emulator) üzerinde nasıl test edebileceğinizi adım adım açıklar.

---

## 1. Gerekli Araçların Kurulumu (Prerequisites)

iOS simülatörü için Mac bilgisayarınızda şu araçların yüklü olması gerekir:

1. **Xcode:** Apple'ın resmi geliştirme aracı. [App Store'dan](https://apps.apple.com/tr/app/xcode/id497799835) ücretsiz indirebilirsiniz. (Birkaç GB boyutu olduğu için zaman alabilir).
2. **Xcode Command Line Tools:** Xcode yüklendikten sonra terminale şu komutu yazın:
   ```bash
   xcode-select --install
   ```
3. **CocoaPods:** iOS kütüphanelerini yönetmek için gereklidir. Terminale yazın:
   ```bash
   sudo gem install cocoapods
   ```
   *(Eğer hata alırsanız `brew install cocoapods` deneyebilirsiniz).*

---

## 2. Projeyi iOS İçin Hazırlama

Sistemimizi mobil uyumlu hale getirmek için şu adımları izlemeliyiz:

### Adım 1: Next.js Projesini Build Etme
Capacitor, Next.js'in statik çıktılarını kullanır.
```bash
npm run build
```

### Adım 2: Capacitor ile Senkronizasyon
Build aldığımız kodları native iOS projesine aktarırız.
```bash
npx cap sync ios
```

---

## 3. Simülatörü Başlatma

İki ana yöntemimiz var:

### Yöntem A: Terminal Üzerinden (Hızlı)
```bash
npx cap run ios
```
*Bu komut size hangi simülatörü (iPhone 15, iPad vb.) açmak istediğinizi soracaktır.*

### Yöntem B: Xcode Arayüzü ile (Önerilen)
Xcode amblemini ve hata çıktılarını görmek için bu yöntem iyidir.
1. Projeyi Xcode'da açın:
   ```bash
   npx cap open ios
   ```
2. Xcode açıldığında sol üstteki butondan bir iPhone modeli seçin.
3. **"Play" (Oynat)** butonuna basın.

---

## 4. İpucu: Hot-Reload (Canlı Geliştirme)
Eğer kodda yaptığınız her değişikliğin simülatörde anında görünmesini isterseniz (next dev gibi):
1. Bilgisayarınızın yerel IP adresini bulun (Örn: `192.168.1.x`).
2. `capacitor.config.ts` dosyasındaki server kısmını güncelleyin:
```typescript
const config: CapacitorConfig = {
  // ...
  server: {
    url: 'http://192.168.1.x:3000', // Buraya kendi IP'niz
    cleartext: true
  }
};
```
*Bu sayede her seferinde build/sync almanıza gerek kalmaz.*

---

> [!NOTE]  
> **Dosya Yükleme Testi:** Simülatörün içine bilgisayarınızdan bir fotoğrafı sürükleyip bırakırsanız, simülatörün galerisine eklenir. Böylece yaptığımız "İzin İste" mekanizmalarını gerçekçi bir şekilde test edebilirsiniz.
