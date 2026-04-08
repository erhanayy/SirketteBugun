# Güvenlik Denetim ve Sızma Testi Raporu (Security Audit)

Bu doküman, DernekteBugün uygulamasının üretim (production) öncesi güvenlik tarama ve test sonuçlarını içerir.

## 🚨 Kritik Güvenlik Kontrol Listesi (OWASP Top 10 Odaklı)

| Kategori | Durum | Açıklama |
| :--- | :---: | :--- |
| **A1: Broken Access Control** | 🔴 | **KRİTİK:** Server Action'ların çoğunda server-side yetki kontrolü eksik. |
| **A2: Cryptographic Failures** | ✅ | Şifreler Argon2/BCrypt ile hash'leniyor. |
| **A3: Injection (SQL/XSS)** | ✅ | Drizzle ORM kullanıldığı için SQL Injection riski minimize edildi. |
| **A4: Insecure Design** | 🟡 | Mantıksal akışlar (premium limitleri vb.) inceleniyor. |
| **A5: Security Misconfiguration** | 🔴 | `npm audit`: minimatch ve nodemailer'da yüksek riskli açıklar bulundu. |
| **A7: Identification & Auth** | ✅ | NextAuth.js v5 (Auth.js) kullanılıyor. |

## 🔍 Gerçekleştirilecek Testler

### 1. Multi-Tenancy İzolasyonu
- **Senaryo:** "Şirket A" üyesi bir kullanıcı, URL veya manuel request ile "Şirket B"nin verilerine (üyeler, mesajlar) erişebilir mi?
- **Yöntem:** Server Action'larda `tenantId` doğrulaması manuel olarak atlatılmaya çalışılacak.

### 2. Yetki Yükseltme (Privilege Escalation)
- **Senaryo:** `member` rolündeki bir kullanıcı, Manager yetkisi gerektiren bir Server Action'ı (örn: `updateTenantInfoAction`) tetikleyebilir mi?
- **Yöntem:** Role checks (`userRole` validation) her action için tek tek denetlenecek.

### 3. SQL Injection & Veri Sızıntısı
- **Senaryo:** Filtreleme veya arama alanlarına özel karakterler girilerek DB sızdırılabilir mi?
- **Yöntem:** Drizzle'ın `sql` template literal kullanımı ve filtrelere "tainted" veri girişi testi.

### 4. Hassas Veri İfşası
- **Senaryo:** Frontend'e (Client Side) dönen objelerde kullanıcıların şifre hash'leri veya gereksiz telefon numaraları gibi veriler var mı?
- **Yöntem:** API/Server Action dönüş tipleri incelenecek.

---

## 🛠 Bulgular ve Aksiyonlar

### 🔴 Kritik Bulgu: Eksik Sunucu Tarafı Yetkilendirme (Bypassing RBAC)
**Analiz:** `organization.ts`, `iban.ts` gibi dosyalardaki Server Action'lar, istemciden gelen `tenantId` değerine güveniyor. Giriş yapmış herhangi bir kullanıcı, parametreleri manuel değiştirerek başka şirketlerin verilerini görebilir veya silebilir.
**Aksiyon:** Tüm action'lara `getCurrentTenant()` kontrolü eklenecek ve `userRole` doğrulaması yapılacak.

### 🟠 Orta Bulgu: Güvenlik Açığı Olan Paketler
**Analiz:** `minimatch` ve `next-auth` (nodemailer bağımlılığı) paketlerinde DoS ve email sızıntısı riskleri mevcut.
**Aksiyon:** `npm update` ve riskli paketlerin yamalanması.
