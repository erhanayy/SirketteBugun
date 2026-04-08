# ŞirketteBugün: Rol Sadeleştirme Planı (Role Simplification)

## Hedef (Goal)
`SirketteBugun` uygulamasının veritabanı ve kod mimarisindeki 3. ve 4. şahıs rolleri (Member, Manager) kaldırılarak sitemin sadece ve kusursuzca 2 ana katmada (B2B mimari) çalışması hedeflenmektedir:
1. `admin` (Şirket Yöneticisi)
2. `staff` (Şirket Çalışanı)

## Önerilen Değişiklikler (Proposed Changes)
### Database Schema
- [MODIFY] `lib/db/schema.ts`
  - `tenantUsers` tablosundaki `role` sütununun barındırdığı `['admin', 'manager', 'staff', 'member']` opsiyonlarından `manager` ve `member` tamamen kaldırılacaktır. (`enum: ['admin', 'staff']` yapılacak).
  - Varsayılan (Default) rol ataması `'member'` yerine `'staff'` (Şirket Çalışanı) olarak tanımlanacaktır.

### Arayüz ve Sunucu Mantığı (Application Logic & UI)
- [MODIFY] Sisteme çalışan eklerken (Invite Modals / Forms) listelenen yetki seçenekleri.
  - Sadece "Şirket Yöneticisi" ve "Şirket Çalışanı" seçenekleri görünecek.
  - Backend API uçlarında `role === 'member'` veya `role === 'manager'` kontrolleri tamamen temizlenip sadeleştirilecek.

## Doğrulama Planı (Verification Plan)
1. Kod tabanında TypeScript compile kontrolü (`npx tsc --noEmit`) edilerek "member" ve "manager" kelimesini bekleyen kırık sayfa kalmadığından emin olunacak.
2. `drizzle-kit push` tetiklenerek boş/yeni veritabanımızda sütun enum kısıtının PostgreSQL bazında daraltıldığı teyit edilecek.
3. Son test olarak sisteme tarayıcıdan deneme bir çalışan davet edilip sadece 2 rolün sunulduğu onaylanacak.
