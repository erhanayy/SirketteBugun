# ŞirketteBugün - Fonksiyonel Test Senaryoları

Bu doküman, sistemdeki **Uygulama Admin'i (Superadmin)**, **Şirket Yöneticisi (Admin)** ve **Şirket Çalışanı (Staff)** rollerine göre hazırlanmış kapsamlı test senaryolarını içermektedir.

*(Doküman analiz aşamasına göre kademeli olarak doldurulacaktır.)*

## 1. Kimlik Doğrulama ve Rol Yönetimi (Authentication & Roles)
**Tüm Roller İçin Geçerli Senaryolar (Superadmin, Admin, Staff):**
- [x] Z1: Kayıtlı bir e-posta ile başarılı şekilde giriş yapabiliyor.
- [x] Z2: Yanlış parola girildiğinde ilgili hata mesajını görüyor.
- [x] Z3: "Şifremi Unuttum" akışı başarıyla çalışıyor ve şifre sıfırlanabiliyor.
- [x] Z4: Kullanıcının oturumu "Çıkış Yap" butonuna basınca sorunsuz sonlanıyor.
- [x] Z5: Kullanıcı profili ayarlarından şifresini değiştirebiliyor.

## 2. Şirket ve Organizasyon Yönetimi (Tenants & Committees)
**Uygulama Admini (Superadmin):**
- [x] A1: Sisteme yeni bir Şirket (Tenant) ekleyebiliyor (Kısa ad, uzun ad, logo).
- [x] A2: Var olan bir Şirketi pasife alabiliyor veya silebiliyor.

**Şirket Yöneticisi (Admin):**
- [ ] M1: Kendi şirket profilini / logo vb. ayarlarını güncelleyebiliyor.
- [x] M2: Kurullar (Yönetim Kurulu, Disiplin vb.) oluşturabiliyor, kurullara rol bazlı çalışan atayabiliyor.
- [ ] M3: Komiteler sekmesinde açılan Projeleri (Projects) ve Görevleri (Executive Tasks) yönetebiliyor.

**Şirket Çalışanı (Staff):**
- [x] U1: Şirketin kurullarını görebiliyor (salt okunur yetkilerle) ancak değişiklik yapamıyor.

## 3. Çalışan Yönetimi (Employees/Staff)
**Uygulama Admini (Superadmin):**
- [x] A3: Herhangi bir şirkete veya kullanıcıya manuel olarak Premium/Paket aboneliği atayabiliyor.

**Şirket Yöneticisi (Admin):**
- [/] M4: Şirkete yeni bir çalışan kaydedebiliyor (E-posta, Tel, Rol belirterek).
- [/] M5: Mevcut çalışanların yetkilerini (Admin veya Staff) değiştirebiliyor.
- [x] M6: İşten ayrılma vb. durumlarda çalışanı pasife çekebiliyor.
- [x] M7: Tüm çalışan listesinde filtreleme/arama yapabiliyor.

**Şirket Çalışanı (Staff):**
- [x] U2: Diğer çalışanların genel profil bilgilerini / rehberi görebiliyor. (Düzenleme yapamaz).

## 4. Finans Yönetimi (IBANs)
**Şirket Yöneticisi (Admin):**
- [x] M8: Şirkete ait Banka Hesaplarını (IBAN records) tanımlayabiliyor veya güncelleyebiliyor.

**Şirket Çalışanı (Staff):**
- [x] U4: Şirket IBAN bilgilerini doğru şekilde görebilme.

## 5. Duyurular ve Etkinlikler (Announcements & Events)
**Şirket Yöneticisi (Admin):**
- [x] M11: Sisteme yeni bir Duyuru (Announcement/Post) ekleyebiliyor, resim veya belge ekleyebiliyor.
- [x] M12: Yeni bir Toplantı/Etkinlik (Event) planlayabiliyor (Tarih, LCV deadline).
- [x] M13: Gerekli durumlarda etkinliği silebilir veya en üste sabitleyebilir.
- [x] M14: Katılım durumlarını onaylayabiliyor.

**Şirket Çalışanı (Staff):**
- [x] U6: Ana sayfadaki (Social Posts / Duyurular) tüm haber akışını görebiliyor.
- [x] U7: Yaklaşan etkinlik ve toplantıları görebiliyor, katılım durumunu (LCV) bildirebiliyor.
- [x] U8: Duyurulara ve sosyal gönderilere Yorum (Comment) veya Reaksiyon (Emoji) bırakabiliyor.
- [x] U9: Duyurular ekranında 'Yeni Duyuru Ekle' butonunu ve silme/sabitleme yetkilerini göremez.

## 6. Rehber ve Kartvizit (Business Cards)
**Tüm Roller İçin Geçerli Senaryolar (Admin, Staff):**
- [x] Z6: "Kartvizitim" kısmında Kullanıcı; Dijital kartvizitini oluşturabiliyor.
- [x] Z7: Kullanıcı mevcut kartvizit bilgilerini güncelleyebiliyor.
- [x] Z8: "Rehber" ekranında şirketteki diğer çalışanların unvanlarını ve iletişimini görebiliyor.
- [x] Z15: Kartvizitler liste ekranı başlığı "Çalışan İletişim Bilgileri" olarak görünür.
- [x] Z16: Yeni Kartvizit formunda "Firma Adı" alanı kullanıcının kayıtlı olduğu şirketten otomatik çekilir ve salt okunurdur (değiştirilemez).

## 7. Ayarlar ve Bildirimler (Settings & Notifications)
**Tüm Roller İçin Geçerli Senaryolar:**
- [x] Z9: Kullanıcı bildirim tercihlerini güncelleyebiliyor.
- [x] Z10: Bildirimleri web push ile okundu yapabiliyor.
- [x] Z11: Kullanıcıya atanan Şirket İçi Sözleşmeleri okuyup onaylayabiliyor.

## 8. Mesajlaşma (Sohbet Odaları / Gruplar)
**Şirket Yöneticisi (Admin):**
- [x] M15: Yönetici olarak yeni bir departman/grup kanalı oluşturabiliyor.
- [x] M16: Odayı "Sadece yöneticiler yazabilir" kısıtlamasına getirebiliyor.

**Tüm Roller İçin Geçerli Senaryolar:**
- [x] Z12: Çalışanlar departman gruplarına dahil olup yazışabiliyor.
- [x] Z14: Gönderilen mesajlara emoji ile reaksiyon bırakılabiliyor.

**Şirket Çalışanı (Staff):**
- [x] U10: Mesajlar ekranında 'Yeni Grup Oluştur' butonunu göremez; yalnızca eklendiği gruplarda mesaj paylaşabilir.
- [x] U11: Grup sohbet penceresinde Kilitle, Katılımcı Düzenle ve Sohbeti Sil butonlarını göremez.

## 9. Görevler ve Hatırlatmalar (Reminders)
**Tüm Roller İçin Geçerli Senaryolar (Admin, Staff):**
- [ ] Z17: Kullanıcı kendisine tekil veya tekrarlı hatırlatma oluşturabiliyor.
- [ ] Z18: Görev listesinde sadece kendi oluşturduğu veya kendisine atanmış hatırlatmaları doğru renk kodlarıyla görebiliyor.
- [ ] Z19: Hatırlatma tamamlandığında liste üzerinde güncelleniyor, eğer tekrarlı ise sıradaki kopya otomatik oluşuyor.

**Şirket Yöneticisi (Admin/M):**
- [ ] M17: Yönetici personel listesinden başka bir çalışanı seçerek ona hatırlatma atayabiliyor.

## 10. Sistem Görevleri (Scheduler)
**Uygulama Admini (Superadmin):**
- [ ] A4: Yalnızca Superadmin erişebildiği `/dashboard/admin/scheduler` sayfasını görebiliyor.
- [ ] A5: Admin veya Staff yetkilileri bu sayfaya girmeye çalıştığında ana sayfaya yönlendiriliyor.
- [ ] A6: Scheduler sayfasındaki butonları kullanarak bekleyen görevleri manuel tetikleyebiliyor.

## 11. Notlar (Post-it)
**Tüm Roller İçin Geçerli Senaryolar (Admin, Staff, Superadmin):**
- [ ] Z20: Kullanıcı "Yeni Not" butonuyla zemin rengi seçerek kişisel not ekleyebiliyor.
- [ ] Z21: Kullanıcı eklediği notları "Notlarım" ekranında Post-it düzeninde görebiliyor.
- [ ] Z22: Arama çubuğuna metin yazılarak yalnızca eşleşen Post-it notlarının görülmesi sağlanıyor.
- [ ] Z23: Kullanıcı girdiği notu üzerine tıklayarak düzenleyebiliyor (Edit) veya silebiliyor.
- [ ] Z24: Kullanıcı yalnızca KENDİ oluşturduğu notları görüyor, diğer kişilerin notları listesinde listelenmiyor.

## 12. Mini Onay Akışı (Approval Flow)
**Tüm Roller İçin Geçerli Senaryolar (Admin, Staff):**
- [ ] Z25: Kullanıcı "Akış Başlat" diyerek dinamik formları hatasız görüntüleyebiliyor.
- [ ] Z26: Kullanıcının hiyerarşide yöneticisi yoksa sistem form oluşturmasına engel oluyor.
- [ ] Z27: İlgili yönetici, "Onay Bekleyenler" sekmesinde kendisine gelen talepleri onaylayıp veya reddedebiliyor.

**Şirket Yöneticisi (Admin/M):**
- [ ] M18: Yönetici, Yönetim sayfasından yeni "Akış" ekleyip silebilir ve form alanlarını dinamik belirleyebilir.
