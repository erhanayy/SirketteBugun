# Proje ve Görev (Task) Yönetimi Analizi

## 1. Kavramlar ve Yetkilendirme (Roller)

Mevcut sistemdeki ana rollerin (Admin, Manager, Staff, Member) yanı sıra Organizasyonlar (Komiteler) içindeki üyelik durumlarına göre iki yeni kavramsal rol işletilecektir:

*   **Komite Yöneticisi:** Öğesi olduğu komitenin `committee_members` tablosundaki `role` karşılığı `president` (Başkan) olan kişi. Sistemde başka bir yönetici rolü (başkan yardımcısı vb.) bulunmamaktadır. (Şirket Yöneticisi/Çalışanı da doğal yöneticidir.)
*   **Komite Üyesi:** Komitenin `committee_members` listesindeki salt üyeler.

## 2. Proje İkonu Görünürlüğü ve Erişim

**Organizasyon (Komiteler) Listeleme Ekranı:**
*   Organizasyon kartlarında mevcut "Üyeler" ikonunun soluna yeni bir **Proje** ikonu eklenecektir.
*   **Kapasite Kontrolü:** 
    *   Şirket Yöneticisi / Çalışanı her zaman projelere erişim ikonunu görür.
    *   Şirket Üyesi ise, **sadece** atandığı, yani komite yöneticisi ya da komite üyesi olduğu spesifik organizasyonların kartlarında bu "Proje" ikonunu görecektir. 

## 3. Projeler Listeleme Ekranı

Proje ikonuna tıklandığında, o komiteye bağlı projelerin kart yapısında listelendiği ekrana geçilir.
*   **Ekleme Yetkisi:** Ekranın sağ üst köşesinde sadece yetkili **Komite Yöneticilerine** (ve doğal olarak Şirket yöneticisine/çalışanına) açık bir "+ Yeni Proje Ekle" butonu bulunur.
*   **Sıralama:** 
    1.  Açık projeler (Planlanan, Devam Eden) en üstte: Kendi içlerinde Start Date değerine göre bugünden geçmişe.
    2.  Kapalı projeler (Tamamlanan, İptal Edilen) altta: Kendi içlerinde yine Start Date değerine göre sıralanır.
*   **Proje Kartı Bilgileri:** Komite Adı, Proje Adı, Proje Yöneticisi (Sahibi), Açıklama, Proje Statüsü, Başlangıç ve Bitiş Tarihleri.
*   **Task İlerlemesi:** Eğer projeye bağlı tasklar var ise `<Tamamlanan Task Sayısı> / <Toplam Task Sayısı>` formatında metrik gösterilecektir.
*   **Renk Kodlaması (Badge/Bant Görünümü):**
    *   Planlandı (Planned) -> Sarı
    *   Devam Ediyor (In Progress/Active) -> Mavi
    *   Tamamlandı (Completed) -> Yeşil
    *   İptal Edildi (Cancelled) -> Kırmızı

## 4. Proje ve Task Detay Ekranı

Bu ekran, projeye tıklanıldığında açılır ve herkes tarafından görüntülenebilir (yetkiye göre düzenlenebilirlik fark eder). Ekran belirgin iki dikey bölüme ayrılır.

### 4.1 Proje Bilgileri Bölümü (Üst Kısım)
*   **Görüntüleme:** Herkes proje adını, tanımını, tarihlerini görebilir.
*   **Düzenleme:** Komite Yöneticisi (ve Şirket Yöneticisi) bir "Güncelle" butonu veya aktif girdi alanları ile proje bilgisini (durum, tarih değiştirme vb.) güncelleyebilir. Komite üyesi için bu alan salt-okunurdur (read-only).

### 4.2 Task (Görev) Yönetimi Bölümü (Alt Kısım)
*   **Grid (Tablo) Yapısı:** Excel/List benzeri alt alta satırlardan oluşur.
*   **Veri Giriş Satırı:** Listenin en altında veya en üstünde her zaman yeni bir girdi eklemek adına boş/hazır bir "Hızlı Ekleme (Inline Insert)" satırı yer alır. Yeni task eklendikçe anında listeye bir üst satır olarak düşer ve boş giriş satırı beklemeye devam eder.
*   **Yetkilendirme:**
    *   **Komite Üyesi / Task Sahibi:** Yalnızca kendi üzerine atanan taskların statüsünü (Örn: Devam Ediyor -> Tamamlandı) ve bitiş tarihlerini güncelleyebilir. Aynı zamanda listeye yeni task tanımlayabilir.
    *   **Komite Yöneticisi:** Hem task statülerini güncelleyebilir hem de task sahibini (başka bir komite üyesi/yöneticine) değiştirebilir.
*   **Bildirim Sistemi:** Yeni bir task kaydedildiğinde ve başka bir üyeye atandığında sistem, o üyeye uygulama içi uyarı (Notification) ve (kabul edildiyse) anlık push gönderir.

## 5. Veritabanı Beklentileri (Yeni Tablo)

`project_tasks` adında yeni bir veritabanı tablosu planlanmaktadır.

**Alanlar:**
*   `id` (uuid)
*   `project_id` (uuid, related to projects)
*   `task` (text, title or description short)
*   `task_status` (enum: planned, in_progress, completed, cancelled)
*   `expected_end_date` (timestamp)
*   `end_date` (timestamp) -> Gerçekleşen bitiş tarihi
*   `task_owner_id` (uuid, related to users, filtered to committee members usually)
*   `is_active` (boolean, soft-delete için)
*   `created_at`, `updated_at` (timestamps)

*(Not: DB tarafında İngilizce `planned, in_progress, completed, cancelled` tutulup, ekranda `Planlandı`, `Devam Ediyor` vb. Türkçe yansıtılacaktır).*

## 6. Aktif Görev (Task) İkonu İşlevi

*   **Uyarı Bölgesi:** Üye hesabına girdiğinde, sağ üst Header çubuğundaki bildirim (çan) ikonunun hemen soluna bir "Görevlerim" (Clipboard/Check) ikonu gelecektir.
*   **Görünürlük:** Bu ikon, kullanıcının `task_status` değeri *Tamamlandı* veya *İptal* olmayan **bekleyen** taskları (üzerine atanmış) olduğunda aktif hale gelir. Aynı zamanda üyenin üzerine task atanmamış olsa bile **Proje Yöneticisi** olduğu açık projeler varsa, ikon görünür ve toplam sayı (bekleyen tasklar + yönettiği açık projeler) belirtilir.
*   **Yönlendirme & Dropdown:** İkona tıklandığında hemen altında bir açılır pencere (dropdown) listesi çıkar. Bu listede, kullanıcının açık tasklarının bulunduğu (veya bizzat yönettiği) **Proje Adları** yer alır. Herhangi bir proje adına tıklandığında doğrudan o projenin detay/güncelleme ekranına yönlendirilir.
