# MINI ONAY AKIŞI MODÜLÜ – ANALİZ DOKÜMANI (LEAN VERSION)

## 1. Amaç
Uygulama içerisinde, kullanıcıların basit talepler oluşturup yönetici hiyerarşisi üzerinden onay alabilecekleri hafif bir onay mekanizması geliştirilmesidir.

## 2. Kapsam
- **Dâhil Olanlar:** Talep oluşturma, hiyerarşik onay süreci, basit akış tanımı, durum takibi.
- **Kapsam DIŞI (Faz 1):** Delegation (vekil), paralel onay, SLA / timeout, revize (geri gönderme), loglama / audit, raporlama, gelişmiş BPM özellikleri.

## 3. Kullanıcı Rolleri & Tanımlamalar

### 3.1 Şirket Yöneticisi (Admin)
- Menü: `Yönetim -> Akış Tanımlama` ekranından ulaşılan "Akış Tanımlama" ekranı.
- **Akış Tanımı (Flow Definition):**
  - **Akış adı:** (Örn: İzin Talebi, Masraf Formu)
  - **Onay Seviyesi:** 
    - Sadece 1. yönetici
    - X yöneticiye kadar
    - En üst yöneticiye kadar
- **Alan Tanımı (Dynamic Fields):**
  - Her akış için dinamik alanlar (Form oluşturucu).
  - Özellikler: Alan adı, Alan Tipi (Text, Number, Date), Zorunluluk durumu.

### 3.2 Şirket Yöneticisi / Çalışanı (Talep Sahibi)
- Menü: `İş -> Akışlar` altındaki "Akış Listesi".
- Ekrandaki sağ üstten "Akış Başlat" denilerek yeni talep oluşturulur.
- İlgili akışın "Ek Alanları" dinamik olarak ekrana render edilir.
- Dosya (attachment) yüklenebilir. Tablo listesinde kişi kendi oluşturduğu taleplerin son durumunu takip eder.

### 3.3 Onaycı (Yöneticiler)
- Organizasyon şeması (Hiyerarşi) üzerinden ilgili talep kendisine otomatik düşer.
- Yöneticiler gelen talebi inceler ve Onaylar/Reddeder.

## 4. Talep Oluşturma Süreci
1. Yeni Talep oluşturulur.
2. Önceden Admin'in oluşturduğu Akış Tanımları (Flows) listesinden biri seçilir.
3. Tipine göre render olan form doldurulur.
4. Dosya eklenip gönderilir.

## 5. Onay Süreci (Hiyerarşik İşleyiş)
- İlgili kullanıcının sistemdeki direkt yöneticisi bulunur.
- Akış tanımındaki "Onay Seviyesi" kadar yukarı çıkılarak onay zinciri (chain) sequential (sırayla) işletilir. Önce 1. yönetici, o onaylayınca 2. yönetici vb.
- Zincirde hiyerarşik yönetici bulunamaz ise (veya en üste gelinmişse) akış tanımında seçime göre otomatik onay yollarına idare edilebilir (Aşağıdaki sorularda detayı var).

## 6. Durumlar (Status)
- **Pending (Onay Bekliyor)**
- **Approved (Onaylandı)**
- **Rejected (Reddedildi)**

## 7. Veritabanı Yapısı (Taslak)
Modül tamamen asimetrik alanlardan oluştuğu için JSON objeleriyle çalışmak MVP için en "Lean (Hafif)" çözümdür:
1. `approval_flows` Tablosu: (id, tenantId, name, approvalLevel, fields (JSONB formatlı alan listesi)).
2. `approval_requests` Tablosu: (id, flowId, requesterId, currentApproverId, status, fieldData (JSONB içerik), attachmentUrl, levelIndex).
3. `approval_steps` (JSON bazlı tutulabilir veya Opsiyonel tablo).

---

## 8. Kararlar (Kullanıcı Onayı)
Kullanıcının değerlendirmeleri sonucunda şu kararlar alınmıştır:
1. **Hiyerarşi Belirleme:** `committees` (Organizasyon) ağaç yapısı dikkate alınacaktır. Bir kişinin bağlı olduğu birden fazla zinciri varsa, kayıtlı olunan kurullara göre ilk tespit edilen veya en belirgin üst kurula/yöneticiye göre ilerlenecektir.
2. **Hiyerarşide Kimse Yoksa:** Kullanıcı yeni bir talep açmaya çalıştığında, arka planda üst onaycısı olmadığı tespit edilir ise; ekranda **"Hiyerarşi bulunamadığı için akış başlatamazsınız."** uyarısı çıkacak ve butonlar gizlenecek/kilitlenecektir.
3. **Ek (Attachment) Yükleme:** Uygulamadaki mevcut duyuru/post doküman ekleme algoritması kullanılacaktır. Gönderilen onay dosyalarının ana dizinde karışmaması için `/uploads/approvals` gibi kendine has bir alt klasör içinde depolanması sağlanacaktır.

---
> **Not:** Kural 5 gereği bu dosyalar güncellenmiş ve tasarımı anlatılmıştır. Son "Onaylıyorum" mesajı beklenmektedir.
