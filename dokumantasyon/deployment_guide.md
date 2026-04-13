# Google Cloud Run Deployment Analiz ve Tasarım Dokümanı

Bu doküman, **ŞirketteBugün** ve **DernekteBugün** projelerinin Google Cloud Run (Serverless) altyapısında standart ve güvenli bir şekilde nasıl canlıya (production) alındığını, versiyon yönetiminin nasıl yapıldığını, mimari tasarım kurallarını detaylandırır. Yeni veya güncel bir deployment yapılmadan önce **kesinlikle** bu standartlara bakılmalıdır.

## 1. Mimari Tasarım (Deployment Architecture)

İki proje de herhangi bir geleneksel Sanal Makineye (Virtual Machine / EC2 / Compute Engine) ihtiyaç **duymadan**, Google'ın **Cloud Run** servisleri üzerinden "Container-as-a-Service" yapısıyla serverless (sunucusuz) olarak koşturulur. 

Avantajları:
- **Zero-downtime Deployments:** Yeni versiyon hazır olana kadar eskisi trafik almaya devam eder.
- **Otomatik Ölçeklendirme (Auto-scaling):** Kullanıcı trafiği arttıkça anında yeni container'lar kopyalanır. Trafik yokken sıfıra inip (scale-to-zero) maliyetleri bitirir.
- **Güvenlik ve İzolasyon:** Her tenant izole bir Next.js runtime üzerinde tam performanslı çalışır.

### Alan Adı ve SSL Yönlendirmeleri
Google Cloud Run üzerinden proje dış dünyaya bir CNAME kaydına bağlanılarak yansıtılır.
- **ŞirketteBugün:** `sirkette.bugunai.com` => CNAME `ghs.googlehosted.com`
- **DernekteBugün:** `dernekte.bugunai.com` => CNAME `ghs.googlehosted.com`

---

## 2. Ortam Değişkenleri (Environment Variables) Güvenliği

Google Cloud Run platformunda `.env.local` veya `.env` dosyaları projeyle GİT üzerinden veya manuel olarak YÜKLENMEZ. Güvenlik ve best-practice gereği enviroment (ortam değişkeni) verileri doğrudan deployment (`gcloud run deploy`) komutuna flag (`--set-env-vars`) olarak sağlanır.

Bunun getirdiği sorumluluk, her iki proje için de deployment yapmadan önce doğru veritabanına hedeflendiğinden emin olunmasıdır.

### DernekteBugün .env Çekirdek Yapısı (Örnek)
- `DATABASE_URL`: postgresql://postgres:Sifre@IPAdresi:5432/dernekte-bugun
- `AUTH_SECRET`: super_secret_generated_key_for_local_dev
- `EMAIL_SENDER`: admin@bugunai.com
- `RESEND_API_KEY`: re_*****

### ŞirketteBugün .env Çekirdek Yapısı (Örnek)
- `DATABASE_URL`: postgresql://postgres:Sifre@IPAdresi:5432/sirkette-bugun
- `AUTH_SECRET`: super_secret_generated_key_for_local_dev
- `NEXT_PUBLIC_APP_URL`: https://sirkette.bugunai.com

---

## 3. Canlıya Alma (Deployment) Süreci ve Komutları

Deployment lokal bilgisayar üzerinden (veya gelecekte Google Cloud Build CI üzerinden) kaynak kod ile yapılır (`--source .`). Bu sayede arka planda kod Next.js projesi olarak derlenip (buildpacks aracılığıyla) konteyner haline gelir.

### DernekteBugün Deployment Komutu
```bash
gcloud run deploy dernekte-bugun \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=...,AUTH_SECRET=...,EMAIL_SENDER=...,RESEND_API_KEY=..."
```

### ŞirketteBugün Deployment Komutu
```bash
gcloud run deploy sirkette-bugun \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=postgresql://postgres:***dB2026***@34.38.207.47:5432/sirkette-bugun,AUTH_SECRET=super_secret_generated_key_for_local_dev,EMAIL_SENDER=admin@bugunai.com,RESEND_API_KEY=re_N3hGjuZN_ApQrh6SXzMH9vDYbkaMWaHke,NEXT_PUBLIC_APP_URL=https://sirkette.bugunai.com"
```

*Not:* Eklenen yeni API key'leri, Token'lar (Örn: VAPID_KEY vb.) sisteme entegre edildikçe bu komutlardaki `--set-env-vars=""` argüman listesine virgülle ayrılıp sırasıyla eklenmek **zorundadır**.

---

## 4. Gelecekte Dikkat Edilmesi Gereken Riskler & Kontroller

1. **Paket Senkronizasyonu Kontrolü (Build Check):** Deployment öncesi projenin lokalde `npm run build` testinden başarıyla geçtiğinden %100 emin olunmalıdır. Hatalı tip (type mismatch) veya bozuk importlar içeren bir proje Google Cloud Build üzerinde "Failed to build" (İnşa edilemedi) hatasına neden olacaktır.
2. **Next.js Caching Mekanizmaları:** Yeni kurduğumuz `.js` mimarilerinde veya resim kullanımlarında bir CSS/Scale değişikliği yapılırsa, tarayıcıların bunu yakalaması için önbellek kıran url argümanları (örneğin logo-v4.png veya ?v=2) gibi yaklaşımlara dikkat edilmelidir.
3. **Database URL Değişimi:** Farklı projelerin (Dernek vs Şirket) database'leri production (canlı ortam) verileri olduğundan, birbiriyle çaprazlanmamasına / taşırken kopyala-yapıştır hatası yapılmamasına azami özen gösterilmelidir. Oluşan en ufak url hatası tüm sistemi çökertebilir.
4. **Zorunlu Versiyon Göstergesi (Version Sync):** En güncel kod alındığında deployment komutunu girmeden hemen önce otomatik `node scripts/generate-version.js` ile About sayfasında görünecek versiyon numaralarının güncellenip GitHub'a push edilmesi bir proje standartı olarak korunmalıdır.

Sürüm ve Dağıtım Yönetimi: **Antigravity AI Assistant & Erhan Ayyıldız**
