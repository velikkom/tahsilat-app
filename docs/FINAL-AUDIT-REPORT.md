# FINAL AUDIT / GAP ANALYSIS REPORT

**Proje:** Tahsilat App  
**Tarih:** 2026-09-05  
**Kapsam:** Kaynak kod, Flyway migration, REST API, frontend route/guard, güvenlik, kağıt form eşlemesi  
**Yöntem:** Varsayım yok. Controller → Service → Repository → SQL ve Frontend → API akışları okundu.  
**Kod değişikliği:** Yok.

---

# EXECUTIVE SUMMARY

Bu uygulama **tek şirketli, tahsilat-merkezli bir MVP** seviyesindedir. Satış personelinin günlük işini (tahsilat + harcama + dönem formu + teslim/tesellüm + kalan nakit) karşılamaz.

Kodda gerçekten çalışan çekirdek:

- Login / register (admin onayı)
- JWT + single active session (kısmi)
- Role bazlı bazı endpoint korumaları (`ROLE_ADMIN`, `ROLE_SALESMAN`)
- Müşteri CRUD
- Tahsilat CRUD (5 ödeme türü)
- Duplicate kontrolü (uygulama katmanı)
- Excel dry-run + import
- Tahsilat dashboard (yıllık, aylık, ödeme tipi, top müşteri)

Kodda **yok** olduğu doğrulanan (daha önce “geliştirildi” denilenler dahil):

- Company / tenant modeli
- Profile, change password, password reset backend, company settings
- Harcama / araç / KM / onay / teslim alan
- Kağıt form üretimi, PDF, yazdırma, e-posta gönderimi
- Prim, AGİ, haftalık, fazla, kalan nakit hesapları
- Personel bazlı tahsilat izolasyonu
- Refresh token, rate limit, security headers

**Sonuç:** Production’a hazır değil. Özellikle finansal form, harcama ve tenant izolasyonu yokken canlıya çıkmak veri kaybı, yanlış tahsilat sınıflandırma ve yetkisiz erişim riski taşır.

---

# PROJECT MATURITY SCORE

| Kategori | Skor | Gerekçe |
|---|---:|---|
| Business Requirements | 28 | Tahsilat MVP var; harcama, form, hesap, teslim yok |
| Security | 38 | JWT/rol var; CORS `*`, Swagger açık, tenant yok, token XSS’e açık |
| Backend | 55 | Controller/service/repo ayrımı var; expense/pdf/mail yok |
| Frontend | 52 | Dashboard + CRUD UI var; rapor/form/profile yok |
| Database | 40 | Temel tablolar var; unique/index/tenant/expense yok |
| Reporting | 35 | Tahsilat dashboard var; harcama/personel/nakit yok |
| PDF / Printing | 0 | Hiçbir implementasyon yok |
| Email | 5 | Forgot-password UI stub; SMTP yok |
| Excel Import | 58 | Dry-run/duplicate var; tür eşlemesi hatalı, boyut limiti yok |
| Testing | 15 | 3 test; biri env-gated; tenant/IDOR/hesap testi yok |
| Performance | 40 | Dashboard aggregate iyi; listeler 500 kayıt client-side |
| Deployment | 35 | `ddl-auto=update`, public Swagger, debug log, health yok |
| Architecture | 50 | Modül ayrımı başlangıç; tenant/expense/form katmanı yok |
| UX | 45 | Responsive koleksiyon UI; sahte social login, stub forgot-password |
| **GENEL** | **34 / 100** | **Erken MVP. İş kapsamının ~1/3’ü.** |

---

# 1. CLAIMED vs ACTUAL

| İddia edilen özellik | Kod durumu | Kanıt |
|---|---|---|
| Authentication | EXISTS | `AuthController`, `AuthServiceImpl` |
| JWT | EXISTS | `JwtService` HS256, 24s |
| Role based authorization | PARTIAL | `@PreAuthorize` çoğu yerde; `GET /customers` yorum satırında; `ROLE_ACCOUNTING` kullanılmıyor |
| Company / tenant | **MISSING** | `company` entity/kolon/filter yok. “company” yalnızca müşteri ünvanı |
| User yönetimi | PARTIAL | Listele, aktif/pasif, rol. Create/edit/şifre/sil yok |
| Customer yönetimi | EXISTS | CRUD + search |
| Collection CRUD | EXISTS | Create/read/update/soft-delete |
| Dashboard | EXISTS | Sadece tahsilat metrikleri |
| Excel import | EXISTS | Dry-run + persist |
| Duplicate detection | EXISTS | App-level; DB unique yok |
| Dry-run import | EXISTS | `POST /collections/import/dry-run` |
| Tahsilat raporları | PARTIAL | Backend `/reports/*` var; frontend `reportService.js` kullanılmıyor |
| Aylık tahsilatlar | EXISTS | Dashboard + `/reports/monthly-summary` |
| Ödeme tipi raporları | PARTIAL | 5 generic tür; formdaki 8 tür yok |
| Responsive frontend | EXISTS | Bootstrap + `responsive.css` |
| Login / Register | EXISTS | |
| Forgot Password | **UI ONLY** | `ForgotPasswordPage.jsx`: “SMTP entegrasyonu yakında” |
| Password reset | **MISSING** | Endpoint yok |
| Profile | **MISSING** | Route yok |
| Change password | **MISSING** | Endpoint yok |
| Company settings | **MISSING** | |
| Single active session | PARTIAL | Login/filter çalışıyor; logout UI backend’i çağırmıyor; disable session temizlemiyor |
| Flyway | PARTIAL | 6 migration; `ddl-auto=update` ile çelişiyor |

---

# 2. BUSINESS REQUIREMENTS AUDIT

## BR-001 — Harcama modülü yok
- **Önem:** P0
- **Mevcut:** Expense entity/controller/table/UI yok.
- **Olması gereken:** Form 2’deki günlük harcama + araç + onay + teslim.
- **Çözüm:** Yeni `expenses` / `trips` / `vehicles` modeli ve CRUD. Önce business rule netleştir.

## BR-002 — Tahsilat dökümü (Form 1) yok
- **Önem:** P0
- **Mevcut:** Satır satır tahsilat listesi var; dönemsel döküm formu yok.
- **Olması gereken:** Personel + tarih seçilince kağıt formun elektronik karşılığı.
- **Çözüm:** Form şablonu + dönem sorgusu + PDF/print.

## BR-003 — Harcama dökümü (Form 2) yok
- **Önem:** P0
- **Mevcut:** Yok.
- **Olması gereken:** Araç/KM/günlük masraf + tahsilat özeti + finansal özet + teslim alan.
- **Çözüm:** Form 2 view model’i tahsilat + harcama + personel ödemelerinden üretilmeli.

## BR-004 — PDF üretimi yok
- **Önem:** P0
- **Mevcut:** pom.xml’de PDF kütüphanesi yok; frontend’de print/PDF yok.
- **Olması gereken:** Form 1/2 PDF.
- **Çözüm:** Backend PDF (iText/OpenPDF) veya onaylı HTML-to-PDF. Hesaplar backend’de.

## BR-005 — Yazdırma yok
- **Önem:** P1
- **Mevcut:** `window.print` / print CSS yok.
- **Olması gereken:** Form yazdırma.
- **Çözüm:** Print-ready layout + PDF.

## BR-006 — E-posta ile form gönderimi yok
- **Önem:** P1
- **Mevcut:** `spring-boot-starter-mail` yok. SMTP yok.
- **Olması gereken:** PDF ekli e-posta.
- **Çözüm:** SMTP + yetki + attachment + audit log.

## BR-007 — Kalan nakit hesabı yok
- **Önem:** P0
- **Mevcut:** Hiçbir serviste `kalanNakit`, `agi`, `haftalik`, `prim` yok.
- **Olması gereken:** Form 2 sağ tablo.
- **Çözüm:** **BUSINESS RULE CLARIFICATION REQUIRED.** Formül kodlanmamalı.

## BR-008 — Prim / AGİ / haftalık / fazla alınan yok
- **Önem:** P0
- **Mevcut:** User’da finansal alan yok.
- **Olması gereken:** Dönemsel personel ödeme/avans kayıtları.
- **Çözüm:** Ayrı `salesperson_settlements` (veya eşdeğeri). Rule netleşmeden tahmin etme.

## BR-009 — Ödeme türleri kağıt formla uyumsuz
- **Önem:** P0
- **Mevcut:** `CASH, BANK_TRANSFER, CREDIT_CARD, CHECK, PROMISSORY_NOTE`
- **Olması gereken:** Nakit, Senet, Çek, Mailorder/Karland, Mailorder/Otokoç, POS YKB, POS TEB, Havale
- **Çözüm:** Enum genişletme + banka/sağlayıcı alanları. Mevcut `CREDIT_CARD` tek havuz; YKB/TEB/Karland/Otokoç kaybolur.

## BR-010 — Tek satır = tek ödeme türü (form modeli yanlış)
- **Önem:** P1
- **Mevcut:** Bir collection tek `paymentType` + tek `amount`.
- **Olması gereken:** Form 1’de aynı müşteri satırında birden fazla kolon (nakit + senet + çek + …).
- **Çözüm:** Ya satır=ziyaret (çok kolon) ya da satır=ödeme (mevcut) + formda gruplama. **NEEDS BUSINESS RULE.**

## BR-011 — Makbuz no / Mikro kayıt no yok
- **Önem:** P1
- **Mevcut:** Yok.
- **Olması gereken:** `TAHSİLAT MAKBUZ NO`, `MİKRO KAY.NO SR/NO`
- **Çözüm:** Alan ekle; Mikro entegrasyonu ayrı faz.

## BR-012 — Banka adı yok
- **Önem:** P1
- **Mevcut:** Çek/havale için banka alanı yok.
- **Olması gereken:** Çek ve havale bankası.
- **Çözüm:** `bankName` + türe göre zorunluluk.

## BR-013 — Satış personeli tahsilata bağlı değil
- **Önem:** P0
- **Mevcut:** `collections` tablosunda `user_id` yok.
- **Olması gereken:** Her tahsilat bir personele ait.
- **Çözüm:** `collected_by` FK. Salesman yalnızca kendi kayıtlarını görür/düzenler (kural netleştir).

## BR-014 — Tenant / şirket yok
- **Önem:** P0
- **Mevcut:** `users`, `customers`, `collections` global.
- **Olması gereken:** İddia edilen multi-tenant.
- **Çözüm:** `companies` + tüm tablolarda `company_id` + query filter. Tek şirket kalacaksa bunu resmi karar olarak yaz.

## BR-015 — Onay mekanizması yok
- **Önem:** P1
- **Mevcut:** Form 2 `ONAY` alanı yok. Collection status her zaman `PAID`.
- **Olması gereken:** Yönetici onayı / dönem kilidi.
- **Çözüm:** Status workflow. **NEEDS BUSINESS RULE.**

## BR-016 — Teslim / tesellüm yok
- **Önem:** P1
- **Mevcut:** `TAHSİLATI TESLİM ALAN` yok.
- **Olması gereken:** Teslim alan adı, imza, tarih.
- **Çözüm:** Settlement/handover entity.

## BR-017 — Audit trail yetersiz
- **Önem:** P1
- **Mevcut:** `createdAt`/`updatedAt` (updatedAt güncellenmiyor). `createdBy`/`updatedBy` yok. User’da audit yok.
- **Olması gereken:** Kim, ne zaman, ne değiştirdi.
- **Çözüm:** `@PrePersist/@PreUpdate` + actor + change log (finansal kayıtlar için).

## BR-018 — Dönem mantığı yok
- **Önem:** P1
- **Mevcut:** Dashboard yıl filtresi var. Haftalık/günlük personel dönemi yok.
- **Olması gereken:** Formlar belirli tarih aralığına göre.
- **Çözüm:** Period (gün/hafta/özel aralık) kavramı.

## BR-019 — Araç / KM yok
- **Önem:** P0 (Form 2)
- **Mevcut:** Yok.
- **Olması gereken:** Plaka, çıkış/giriş KM, yakıt, otel KM.
- **Çözüm:** Vehicle + trip log.

## BR-020 — Dashboard iş ihtiyacını karşılamıyor
- **Önem:** P1
- **Mevcut:** Global tahsilat analitikleri.
- **Olması gereken:** Personel, harcama, net nakit, form durumu.
- **Çözüm:** Yeni metrikler; mevcut dashboard yalnızca tahsilat özeti.

## BR-021 — Gereksiz / erken UI
- **Önem:** P3
- **Mevcut:** Google/Facebook/GitHub butonları “Coming soon”. Forgot-password sahte başarı mesajı.
- **Olması gereken:** Çalışmayan özellik göstermemek.
- **Çözüm:** Kaldır veya disable et.

---

# 3. TAHSİLAT MODÜLÜ AUDIT

## 3.1 CRUD

| İşlem | Backend | Frontend | Not |
|---|---|---|---|
| Create | EXISTS | EXISTS | Status zorla `PAID` |
| Read list | EXISTS | EXISTS | İlk 500 kayıt, client-side filter |
| Read by id | EXISTS | Drawer | Tenant/owner check yok |
| Update | EXISTS | EXISTS | Salesman her kaydı güncelleyebilir |
| Delete | Soft delete (`active=false`) | EXISTS | Salesman her kaydı silebilir |

## 3.2 Validation

| Kural | Durum |
|---|---|
| Amount `@Positive` `@NotNull` | EXISTS. 0 ve negatif reddedilir |
| Collection date zorunlu | EXISTS |
| Payment type zorunlu | EXISTS |
| Nakit/havale/KK için vade yasak | EXISTS (`validateMaturityDate`) |
| Çek/senet için vade zorunlu | EXISTS |
| Description `@Size` | MISSING. DB `VARCHAR(500)` — uzun metin SQL hatası |
| Amount max / `@Digits` | MISSING |
| Currency | MISSING (UI TRY formatlar, DB’de currency yok) |
| Banka (çek/havale) | MISSING |
| Makbuz no | MISSING |
| Notes | PARTIAL (`description`) |
| Status kullanıcıdan | MISSING. Create’te her zaman PAID. Update status değiştirmiyor |
| Salesperson | MISSING |
| Company | MISSING |

## 3.3 Duplicate

Anahtar: `customerId + amount(2 hane) + collectionDate + paymentType + maturityDate(çek/senet)`.

Doğrulanan davranışlar:

1. Aynı müşteri/tarih/tutar/tür + aynı vade → duplicate. **EXISTS**
2. Çek/senette farklı vade → farklı kayıt. **EXISTS** (bilinçli)
3. Nakit/havale/KK’de vade key’e girmez. **EXISTS**
4. `30000` vs `30000.00` normalize. **EXISTS**
5. Soft-deleted kayıt duplicate sayılmaz → aynı kayıt tekrar girilebilir. **PARTIAL / risk**
6. DB unique constraint yok → race condition ile çift kayıt. **P1**
7. Türkçe normalizasyon duplicate key’de yok (customerId kullanıldığı için doğru). İsim eşlemesi sadece Excel’de. **EXISTS (Excel)**
8. Create `@Transactional` değil. Check + save atomik değil. **P1**

## 3.4 Payment type uyumu

| Form türü | Sistem | Durum |
|---|---|---|
| Nakit | `CASH` | EXISTS |
| Havale | `BANK_TRANSFER` | PARTIAL (banka yok) |
| Çek | `CHECK` | PARTIAL (banka yok) |
| Senet | `PROMISSORY_NOTE` | PARTIAL |
| Mailorder/Karland | yok | MISSING |
| Mailorder/Otokoç | yok | MISSING |
| POS YKB | `CREDIT_CARD` içinde kaybolur | WRONG / MISSING |
| POS TEB | `CREDIT_CARD` içinde kaybolur | WRONG / MISSING |

Excel `mapPaymentType` bilinmeyen türü `CREDIT_CARD` yapar. Karland/Otokoç/YKB/TEB/POS hepsi kredi kartı olur. **WRONG — P0 veri kalitesi.**

## 3.5 Business rules (istenen 12 madde)

1. Nakit için vade olmamalı — **EXISTS**
2. Havale için banka — **MISSING**
3. Çek banka+vade+tutar — vade+tutar **EXISTS**, banka **MISSING**
4. Senet vade+tutar — **EXISTS**
5. POS banka ayrımı — **MISSING / WRONG**
6. Çift giriş engeli — **PARTIAL** (app-level)
7. Aynı müşteri+tarih+tutar duplicate mi — türe ve vadeye bağlı; aynı tutar farklı tür serbest. **NEEDS BUSINESS RULE** (formda aynı satırda çok tür olabilir)
8. Farklı vade duplicate’i bozmaz — **EXISTS**
9. Turkish normalization — Excel müşteri eşlemesinde **EXISTS**; CRUD duplicate’de gerekmez
10. Money precision — DB `NUMERIC(19,2)`; entity `@Column(precision)` yok; duplicate scale normalize var
11. Negatif/sıfır — `@Positive` reddeder. Excel `<=0` invalid
12. Yetkisiz başka şirket/personel — **tenant yok; salesman tüm tahsilatı GET/PUT/DELETE edebilir. P0**

## 3.6 Status

`PENDING`, `PAID`, `CANCELLED` enum’da. V5 tüm PENDING’i PAID yaptı. Create her zaman PAID. Overdue endpoint `PENDING + vade geçmiş` arar → pratikte boş. Frontend `OVERDUE` status’u backend’de yok.

---

# 4. HARCAMA MODÜLÜ AUDIT

**Modül yok.** Java package, tablo, route, menü yok.

| Kategori | Durum |
|---|---|
| Yemek | MISSING |
| Otel | MISSING |
| Yakıt / yakıt faturaları | MISSING |
| Diğer | MISSING |
| Araç giderleri | MISSING |
| Seyahat | MISSING |
| Plaka | MISSING |
| Çıkış/giriş KM | MISSING |
| Toplam KM | MISSING |
| Yakıt tutarı | MISSING |
| Onay | MISSING |
| Personel bağı | MISSING |

Hesaplamalar:

- `TOPLAM KM = Denizli giriş KM - Denizli çıkış KM` — **MISSING**
- `TOPLAM HARCAMA = Yemek + Otel + Yakıt + Diğer` — **MISSING**
- KM negatif / bitiş < başlangıç — kontrol yok (veri yok)
- Aynı araç tutarsız KM — yok
- Duplicate harcama — yok

**CRITICAL GAP.**

---

# 5. TAHSİLAT + HARCAMA ENTEGRASYONU

Kayıtlar entegrasyonu yok; harcama yok.

| Hesap | Durum |
|---|---|
| Toplam tahsilat | PARTIAL (dashboard/report, personelsiz) |
| Toplam harcama | MISSING |
| Nakit tahsilat | PARTIAL (`CASH` sum) |
| Nakit dışı | MISSING (türetilmez) |
| Haftalık | MISSING |
| Prim | MISSING |
| Fazladan aldığı | MISSING |
| AGİ | MISSING |
| **Kalan nakit** | **MISSING — CRITICAL GAP** |

## KALAN NAKİT — BUSINESS RULE CLARIFICATION REQUIRED

Kağıt form sağ tablo sırası:

1. Nakit tahsilat toplamı  
2. Masraf toplamı  
3. Aldığı haftalık  
4. Aldığı prim  
5. Fazladan aldığı  
6. Aldığı AGİ  
7. Kalan nakit  

Kodda formül yok. Tahmin edilerek yazılmamalı.

Ayrıca netleştirilmeli:

- Haftalık/prim/AGİ nakit tahsilattan düşülür mü, şirketten alınan avans mıdır?
- Prim hakediş = toplam tahsilat × %1 mi, yalnızca nakit mi?
- `%1 aldığı prim` hakedişten ayrı mıdır?
- Senet/çek kalan nakite girer mi? (formda nakit ayrı satır)

**Kodlama yasağı:** Bu formül netleşmeden implement edilmemeli.

---

# 6. RAPORLAMA AUDIT

## Mevcut (kodda var)

| Rapor | Backend | Frontend |
|---|---|---|
| Yıllık / aylık tahsilat tutarı | Dashboard | EXISTS |
| Ödeme tipi dağılımı | Dashboard | EXISTS |
| Ay kırılımı | Dashboard | EXISTS |
| Top müşteriler | Dashboard | EXISTS |
| Son tahsilatlar | Dashboard | EXISTS |
| Insights (en çok tür, en yüksek müşteri/ay) | Dashboard | EXISTS |
| Dashboard summary (total/pending/paid/cash/check) | `/reports/dashboard-summary` | **Kullanılmıyor** |
| Payment type list | `/reports/by-payment-type` | Yok |
| Müşteri finansal özet (cash+check only) | `/reports/customer-summary/{id}` | Yok |
| Aylık özet (cash+check only) | `/reports/monthly-summary` | Yok |

## Eksik

Günlük/haftalık tahsilat, personel bazlı, şirket bazlı, tüm harcama raporları, araç/yakıt/KM, tahsilat-harcama karşılaştırma, net nakit, en yüksek harcama yapan personel, harcama trendi, form/teslim durumu.

Dashboard iş ihtiyacını **kısmen** karşılar: yönetim tahsilat analitikleri için yeterli; saha kapanışı için yetersiz.

---

# 7. KAĞIT FORM → WEB EŞLEŞTİRME

Durum: EXISTS | PARTIAL | MISSING | WRONG | NEEDS BUSINESS RULE

## FORM 1 — TAHSİLAT DÖKÜMÜDÜR

| Kağıt Form Alanı | DB | Backend | Frontend | Hesaplama | Durum |
|---|---|---|---|---|---|
| Satış personeli adı/soyadı | users.first/last_name (global) | UserResponse | Navbar | — | PARTIAL (forma bağlanmamış) |
| Form tarihi | yok | yok | yok | — | MISSING |
| Sıra No | yok | yok | yok | satır no | MISSING (üretilebilir) |
| Tahsilat Makbuz No | yok | yok | yok | — | MISSING |
| Mikro Kay.No SR | yok | yok | yok | — | MISSING |
| Mikro Kay.No NO | yok | yok | yok | — | MISSING |
| Ünvan | customers.company_name | Customer/Collection | müşteri seçimi | — | PARTIAL |
| Müşteri kodu | yok | yok | yok | — | MISSING |
| İlgili personel | yok | yok | yok | — | MISSING |
| Tarih (satır) | collections.collection_date | EXISTS | EXISTS | — | EXISTS |
| Nakit tutarı | amount + CASH | EXISTS | EXISTS | sum CASH | PARTIAL (ayrı kolon değil) |
| Senet vade | maturity_date | çek/senet | çek/senet | — | PARTIAL |
| Senet tutarı | amount + PROMISSORY_NOTE | EXISTS | EXISTS | — | PARTIAL |
| Banka adı | yok | yok | yok | — | MISSING |
| Çek vade | maturity_date | EXISTS | EXISTS | — | PARTIAL |
| Çek tutarı | amount + CHECK | EXISTS | EXISTS | — | PARTIAL |
| Mailorder Karland | yok | yok | yok | — | MISSING |
| Mailorder Otokoç | yok | yok | yok | — | MISSING |
| Havale banka | yok | yok | yok | — | MISSING |
| Havale tutarı | amount + BANK_TRANSFER | EXISTS | EXISTS | — | PARTIAL |
| POS YKB | CREDIT_CARD | WRONG | “Kredi Kartı” | — | WRONG |
| POS TEB | CREDIT_CARD | WRONG | “Kredi Kartı” | — | WRONG |
| Satır genel toplam | amount (tek tür) | — | — | — | NEEDS BUSINESS RULE |
| Sayfa genel toplam | aggregate queries | dashboard/report | dashboard | SUM(amount) | PARTIAL |
| İmza | yok | yok | yok | — | MISSING |

## FORM 2 — SATIŞ PERSONELİ HARCAMA DÖKÜMÜ

| Kağıt Form Alanı | DB | Backend | Frontend | Hesaplama | Durum |
|---|---|---|---|---|---|
| Araç plakası | yok | yok | yok | — | MISSING |
| Denizli çıkış KM | yok | yok | yok | — | MISSING |
| Çıkış yakıt tutarı | yok | yok | yok | — | MISSING |
| Seyahat alınan yakıt | yok | yok | yok | — | MISSING |
| Denizli giriş KM | yok | yok | yok | — | MISSING |
| Toplam KM | yok | yok | yok | giriş-çıkış | MISSING |
| Toplam yakıt tutarı | yok | yok | yok | — | MISSING |
| Onay | yok | yok | yok | — | MISSING |
| Tarih (gün kolonları) | yok | yok | yok | — | MISSING |
| Yemek bedeli | yok | yok | yok | — | MISSING |
| Otel harcaması | yok | yok | yok | — | MISSING |
| Yakıt faturaları | yok | yok | yok | — | MISSING |
| Diğer harcamalar | yok | yok | yok | — | MISSING |
| Akşam otele giriş KM | yok | yok | yok | — | MISSING |
| Günlük toplam | yok | yok | yok | yemek+otel+yakıt+diğer | MISSING |
| Satış personeli | users | kısmi | navbar | — | PARTIAL |
| Nakit tahsilat toplamı | collections CASH | report/dashboard | kısmi | SUM CASH | PARTIAL (personel/dönem yok) |
| Senet tahsilat toplamı | PROMISSORY_NOTE | yok (ayrı rapor) | yok | SUM | PARTIAL |
| Çek tahsilat toplamı | CHECK | report cash/check | yok | SUM | PARTIAL |
| Mailorder Karland top. | yok | yok | yok | — | MISSING |
| Mailorder Otokoç top. | yok | yok | yok | — | MISSING |
| KK YKB top. | yok | yok | yok | — | MISSING |
| KK TEB top. | yok | yok | yok | — | MISSING |
| Havale tahsilat top. | BANK_TRANSFER | yok ayrı | yok | SUM | PARTIAL |
| Genel toplam | SUM all | dashboard | dashboard | SUM | PARTIAL |
| Prim hakediş | yok | yok | yok | **CLARIFY** | MISSING / NEEDS BUSINESS RULE |
| %1 aldığı prim | yok | yok | yok | **CLARIFY** | MISSING / NEEDS BUSINESS RULE |
| Masraf toplamı | yok | yok | yok | — | MISSING |
| Aldığı haftalık | yok | yok | yok | — | MISSING |
| Aldığı prim | yok | yok | yok | — | MISSING |
| Fazladan aldığı | yok | yok | yok | — | MISSING |
| Aldığı AGİ | yok | yok | yok | — | MISSING |
| Kalan nakit | yok | yok | yok | **CLARIFY** | MISSING / NEEDS BUSINESS RULE |
| Personel imzası | yok | yok | yok | — | MISSING |
| Teslim alan ad/soyad | yok | yok | yok | — | MISSING |
| Teslim alan imza | yok | yok | yok | — | MISSING |
| Teslim tarihi | yok | yok | yok | — | MISSING |

---

# 8. PDF / PRINT AUDIT

**Karşılama: %0**

- PDF dependency yok
- Print stylesheet / `window.print` yok
- Form şablonu yok
- Personel+dönem seçici yok
- İmza / teslim alan render yok

Beklenen akış (personel + dönem → Form 1 + Form 2 → otomatik doldur → hesapla → PDF → yazdır) tamamen eksik.

---

# 9. EMAIL AUDIT

| Kontrol | Durum |
|---|---|
| SMTP config | MISSING |
| spring-mail | MISSING |
| Sender | MISSING |
| Recipient validation | Yok (gönderim yok) |
| PDF attachment | MISSING |
| Retry | MISSING |
| Mail logging | MISSING |
| Password reset mail | UI stub |
| Form mail | MISSING |

Forgot-password kullanıcıya “gönderilecek” der; API çağrısı yok. Güvenlik + UX hatası (sahte başarı).

Form PDF e-posta: **yok**.

---

# 10. SECURITY AUDIT (OWASP)

## 10.1 Broken Access Control / IDOR — P0

Tenant yok. Owner yok.

```
GET/PUT/DELETE /api/v1/collections/{id}
```

`findByIdAndActiveTrue(id)` — company/user filtresi yok.

```
GET /api/v1/customers/{id}
GET /api/v1/reports/customer-summary/{customerId}
```

Aynı. Herhangi bir salesman herhangi bir kaydı okur/değiştirir/siler.

`GET /api/v1/customers` üzerinde `@PreAuthorize` **yorum satırında**. Authenticated herhangi bir rol (ACCOUNTING dahil) tüm müşterileri (pasifler dahil, `findAll`) listeler.

Frontend admin sayfasını gizler; backend korunmayan yerler kalır.

## 10.2 Multi-tenant

**Yok.** Company A / Company B senaryosu veri modelinde imkânsız; tüm kayıtlar tek havuz. İleride ikinci şirket eklenirse mevcut kod izolasyon sağlayamaz.

## 10.3 JWT

| Madde | Durum |
|---|---|
| Algoritma | HS256 |
| Secret | `${JWT_SECRET}` Base64 |
| Expiration | 86400000 ms (24s) |
| Refresh token | MISSING |
| sessionId claim | EXISTS |
| Disabled user check in filter | **YOK** — `isTokenValid` yalnızca username + expiry |
| Token storage | localStorage + JS cookie (`token=...; path=/`) |
| Cookie HttpOnly/Secure/SameSite | **YOK** |

XSS ile token çalınır. Cookie middleware için; HttpOnly değil.

## 10.4 Single active session

Çalışan:

- Login yeni `current_session_id` yazar, eski JWT filter’da `SESSION_TERMINATED`
- Her request DB’den session okur (maliyet: her API + 15sn frontend poll)
- sessionId null → reject

Eksik / hatalı:

- Frontend `logout()` yalnızca local storage temizler; `POST /auth/logout` **çağrılmaz**. Token 24s geçerli kalır.
- `deactivateUser` `current_session_id` temizlemez. Filter `isEnabled` bakmaz → **pasif kullanıcı token ile devam eder** (P0)
- Rol değişince token’daki role claim eski kalır (P1)
- Password change yok; invalidate senaryosu yok
- Company disable yok
- Concurrent login: last-write-wins; transaction var ama lock yok. Kısa race mümkün
- Browser + mobile: ikinci login birincisini düşürür (tasarım). Eski token reject edilir — bu kısım doğru

## 10.5 Password

- BCrypt: EXISTS
- Backend register: yalnızca `@NotBlank` — 1 karakter kabul (P1)
- Frontend min 6 — bypass edilebilir
- Complexity yok
- Change password yok
- Reset yok

## 10.6 Account enumeration / brute force

- Register: “Bu email adresi zaten kayıtlı.”
- Login: bad credentials vs “hesap aktif değil” ayrımı
- Rate limit yok
- Account lockout yok

**P1**

## 10.7 CORS / CSRF

- CORS: `allowedOriginPatterns(*)` + `allowCredentials(true)` + tüm method/header. **P0**
- CSRF disabled (stateless JWT için yaygın). Token cookie’de olduğu için CSRF vektörü zayıf da olsa mevcut (SameSite yok)

## 10.8 XSS

React default escape. `dangerouslySetInnerHTML` görülmedi. Token localStorage’da → XSS = hesap ele geçirme. Swagger public.

## 10.9 Injection

- JPA parameterized queries: SQL injection düşük
- Keyword search concatenation yok
- Excel hücreleri string olarak işleniyor; export olmadığı için classic formula-injection (CSV) sınırlı
- Email injection: mail yok

## 10.10 Mass assignment

Create/Update DTO’larda `companyId`/`userId` yok (alan zaten yok). Status client’tan set edilmiyor. Risk düşük.

## 10.11 File upload / Excel

- Uzantı `.xlsx` — content-type/magic bytes yok
- Boyut limiti yok (`spring.servlet.multipart` tanımsız)
- XSSFWorkbook tüm dosyayı belleğe alır — zip bomb / OOM (Railway) **P1**
- Satır limiti yok
- Bilinmeyen ödeme türü → CREDIT_CARD **P0 veri**
- Salesman import yetkisi var — tüm müşteri havuzuna yazar
- Dry-run + persist ayrı; persist transaction var
- Startup importer: `CollectionExcelImporter` kapalı (`app.collection-import.startup-enabled=false`)
- `CustomerExcelImporter` **her boot’ta** çalışır; `customers` boşsa classpath `data/firmalar.xlsx` yükler (feature flag yok) — production’da boş DB otomatik seed **P1**
- Create vs Update müşteri validasyonu asimetrik: create’te yalnızca `companyName` zorunlu; update’te `authorizedPerson` + `phone` de `@NotBlank` — boş yetkili/telefonlu müşteri güncellenemez
- Geçersiz/expired JWT: filter auth set etmez, 401 yazmaz → Spring **403** dönebilir (`JwtAuthenticationFilter` skip path)

## 10.12 Secrets / config

- DB ve JWT env var: iyi
- `spring.jpa.hibernate.ddl-auto=update` production **P0**
- `server.error.include-message=always` + `include-binding-errors=always` **P1**
- `logging.level.com.veli.tahsilat.security=DEBUG` — email + sessionId log **P1**
- Login `sessionId` INFO log
- Swagger production URL hardcoded, `permitAll` **P0**
- Actuator dependency yok — debug actuator yok (iyi)
- docker-compose `POSTGRES_PASSWORD=123456` local only
- Health check / error monitoring yok
- Backup/recovery belgesi yok

## 10.13 HTTP headers

Security headers (`X-Frame-Options`, CSP, HSTS, `X-Content-Type-Options`) yok.

## 10.14 PII / finansal log

Session ve e-posta loglanıyor. Financial payload log’u sınırlı. Error message client’a açık.

## 10.15 Exception handling

`GlobalExceptionHandler` generic `Exception` yakalamıyor. Spring default + `include-message=always` sızıntı yapabilir.

İki `UserDetailsService`: `CustomUserDetailsService` (disabled flag) ve `CustomUserDetailsServiceImpl` (flag yok). Bean belirsizliği **P2**.

---

# 11. JWT / SESSION DETAY

| Senaryo | Sonuç |
|---|---|
| Yeni login | Yeni sessionId, eski token geçersiz |
| Logout UI | Backend çağrılmaz; token geçerli |
| Expired token | Filter auth set etmez → 401 |
| Revoked (session mismatch) | 401 SESSION_TERMINATED |
| Password change | Özellik yok |
| User disable | Token yaşamaya devam eder |
| Her request DB | Evet — Railway’de maliyet |
| Frontend poll | 15 saniye `/auth/session` |

---

# 12. DATABASE AUDIT

## Tablolar (Flyway)

- `users` — id, name, email unique, password, role, active; V4 `new_user`; V6 `current_session_id`
- `customers` — company, person, phone, tax_number **GLOBAL UNIQUE**, address, active, timestamps
- `collections` — customer FK, amount NUMERIC(19,2), dates, payment_type, status, active, timestamps

## Yok

- companies, expenses, vehicles, trips, settlements, handover, audit_log
- collections.user_id / company_id
- created_by / updated_by
- Check constraint (enum, amount > 0)
- Duplicate unique index
- Index: `customer_id`, `collection_date`, `payment_type`, `active` (FK dışında)

## Diğer

- Soft delete: `active` (User’da da var ama User BaseEntity değil)
- Timezone: `TIMESTAMP` without TZ; `LocalDateTime.now()` JVM TZ
- `updatedAt` hiç güncellenmiyor (`@PreUpdate` yok)
- `ddl-auto=update` Flyway’i bypass edebilir
- tax_number global unique → multi-tenant kırılır
- N+1: Collection.customer LAZY; mapper companyName okur; OSIV default açık
- Monthly report tüm ayı memory’e çeker
- Excel duplicate key tüm aktif collection’ları yükler
- Customer name duplicate: vergi nosuz tüm müşterileri memory’de karşılaştırır
- Transaction: import/login evet; collection create hayır

---

# 13. API AUDIT

| Method | Endpoint | Auth | Role | Tenant | Validation | Risk | Status |
|---|---|---|---|---|---|---|---|
| POST | /api/v1/auth/register | Public | — | — | Email/not blank | Enumeration, zayıf şifre | RISK |
| POST | /api/v1/auth/login | Public | — | — | Email/password | Brute force | RISK |
| POST | /api/v1/auth/logout | JWT | any | — | — | Frontend çağırmaz | PARTIAL |
| GET | /api/v1/auth/session | JWT | any | — | — | Poll maliyeti | OK |
| GET | /api/v1/users/me | JWT | any | — | — | | OK |
| GET | /api/v1/users | JWT | ADMIN | yok | — | Tüm kullanıcılar | OK (tek tenant) |
| GET | /api/v1/users/pending | JWT | ADMIN | yok | — | | OK |
| GET | /api/v1/users/pending/count | JWT | ADMIN | yok | — | | OK |
| GET | /api/v1/users/roles | JWT | ADMIN | — | — | | OK |
| PATCH | /api/v1/users/{id}/activate | JWT | ADMIN | yok | — | Session clear yok | RISK |
| PATCH | /api/v1/users/{id}/deactivate | JWT | ADMIN | yok | Self-disable kontrolü yok | RISK |
| PATCH | /api/v1/users/{id}/role | JWT | ADMIN | yok | Enum parse | Token role stale | RISK |
| POST | /api/v1/customers | JWT | ADMIN | yok | name | | OK |
| GET | /api/v1/customers | JWT | **YOK** | yok | — | Role bypass | **P0** |
| GET | /api/v1/customers/{id} | JWT | ADMIN/SALESMAN | yok | — | Inactive de döner | RISK |
| PUT | /api/v1/customers/{id} | JWT | ADMIN | yok | name | | OK |
| GET | /api/v1/customers/active | JWT | ADMIN/SALESMAN | yok | — | | OK |
| DELETE | /api/v1/customers/{id} | JWT | ADMIN | yok | — | Soft | OK |
| GET | /api/v1/customers/search | JWT | ADMIN/SALESMAN | yok | keyword | | OK |
| POST | /api/v1/collections | JWT | ADMIN/SALESMAN | yok | amount/date/type | Owner yok | RISK |
| GET | /api/v1/collections | JWT | ADMIN/SALESMAN | yok | page | Tüm veri | RISK |
| GET | /api/v1/collections/customer/{id} | JWT | ADMIN/SALESMAN | yok | — | | RISK |
| GET | /api/v1/collections/overdue | JWT | ADMIN/SALESMAN | yok | — | Pratikte boş | DEAD |
| GET | /api/v1/collections/{id} | JWT | ADMIN/SALESMAN | yok | — | IDOR | **P0** |
| PUT | /api/v1/collections/{id} | JWT | ADMIN/SALESMAN | yok | — | IDOR write | **P0** |
| DELETE | /api/v1/collections/{id} | JWT | ADMIN/SALESMAN | yok | — | IDOR delete | **P0** |
| POST | /api/v1/collections/import/dry-run | JWT | ADMIN/SALESMAN | yok | file | OOM | RISK |
| POST | /api/v1/collections/import | JWT | ADMIN/SALESMAN | yok | file | OOM, wrong type | RISK |
| GET | /api/v1/dashboard/* (8) | JWT | ADMIN/SALESMAN | yok | year/month | Global data | RISK |
| GET | /api/v1/reports/* (4) | JWT | ADMIN/SALESMAN | yok | — | UI kullanılmıyor | PARTIAL |
| GET | /swagger-ui/**, /v3/api-docs/** | **Public** | — | — | — | API keşif | **P0** |
| Expense/PDF/Mail/Reset/Profile | — | — | — | — | — | MISSING | MISSING |

Public olması gereken: login, register (isteğe bağlı kapatılmalı).  
Public olmaması gereken: Swagger, register (production’da), tüm business API.

Actuator: yok.

---

# 14. FRONTEND SECURITY

| Madde | Durum |
|---|---|
| Token | localStorage + non-HttpOnly cookie |
| Middleware | Cookie varlığı; imza/rol doğrulamaz |
| Admin route | Client redirect; middleware rol bakmaz |
| API errors | message gösterilir |
| NEXT_PUBLIC_API_URL | Public (beklenen) |
| next.config | Boş; source map / header ayarı yok |
| Server/client | Çoğu `"use client"` |
| Authorization | UI gizleme; asıl koruma backend (eksik yerler var) |
| Tests | 0 |
| XSS | Orta (token storage) |

Frontend guard ≠ güvenlik.

---

# 15. EXCEL IMPORT SECURITY

| Kontrol | Durum |
|---|---|
| Malicious xlsx / zip bomb | Korumasız |
| File size | Limit yok |
| File type | Sadece `.xlsx` uzantı |
| Content validation | Satır bazlı amount/date/type |
| Duplicate | EXISTS |
| Memory | Tüm sheet + tüm duplicate key |
| Transaction | Import `@Transactional` |
| Partial import | Invalid atlanır, valid yazılır (kısmi başarı) |
| Auth | ADMIN veya SALESMAN |
| Tenant | Yok |
| Type mapping | Unknown → CREDIT_CARD **WRONG** |
| Formula cells | Ayrı handle yok |

---

# 16. PRODUCTION / DEPLOYMENT

| Madde | Durum |
|---|---|
| Frontend Vercel | next.config güvenlik header yok |
| Backend Railway | properties env tabanlı |
| Hikari | max 5 — küçük instance için makul |
| Health | Özel endpoint yok |
| Flyway + ddl-auto=update | **Production’da olmamalı** |
| Swagger public | **Olmamalı** |
| SQL/security DEBUG | Kısmen açık |
| Backup | Kod/dokümanda yok |
| Restart | Startup import kapalı (iyi) |
| docker-compose | Zayıf local parola |

Production’da kesinlikle kaldırılmalı: `ddl-auto=update`, public Swagger, `include-message=always`, security DEBUG, CORS `*`.

---

# 17. PERFORMANCE

- Dashboard: SQL aggregate — iyi; insights tekrar sorgu yapar
- Collection list: page API var, UI 500 çekip filtreler — 500+ kayıt kaybı
- Customer list: 500
- N+1 customer lazy
- Monthly report in-memory filter
- Excel full workbook
- Session DB her request + 15s poll
- Index eksik
- PDF/mail memory: özellik yok

Railway OOM riski: büyük Excel, `findActiveCollectionDuplicateKeys()`, OSIV N+1.

---

# 18. CODE QUALITY / ARCHITECTURE

**Backend:** paketler (auth, user, customer, collection, dashboard, report, security) net. DTO + MapStruct var. Entity doğrudan expose edilmiyor. Exception handler kısmi. Duplicate validator iyi. Dead/çift: iki UserDetailsService, kullanılmayan `calculateTotal` dışı report UI, startup importer kopyası, overdue endpoint, `ROLE_ACCOUNTING`. `updatedAt` bug. Collection create transactional değil.

**Frontend:** views/components/hooks/services ayrımı var. CustomersContext global 500. Validation karışık (yup auth, native form collection). reportService ölü. Social login sahte. i18n karışık (TR/EN). A11y kısmi (`aria-label` var, tutarsız). Responsive CSS var.

---

# 19. TEST AUDIT

Mevcut:

1. `JwtServiceSessionIdTest` — claim
2. `JwtAuthenticationFilterSessionTest` — mock session reject
3. `CollectionDuplicateQueryTest` — `DUPLICATE_QUERY_TEST=true` + lokal Postgres

Yok: unit/integration controller, security/IDOR/tenant, excel, calculation, PDF, email, frontend.

Eksik zorunlu senaryolar: Company A≠B, user başka user collection, expense izolasyonu, duplicate reject, vade farkı, payment validation, expense calc, remaining cash, PDF calc.

---

# 20. BUSINESS LOGIC TEST MATRIX (önerilen)

## Collection — her tür için

Türler: Nakit, Havale, Çek, Senet, Mailorder Karland, Mailorder Otokoç, POS YKB, POS TEB.

| Senaryo | Nakit | Havale | Çek | Senet | Karland | Otokoç | YKB | TEB |
|---|---|---|---|---|---|---|---|---|
| Required: customer, date, amount>0, type | Y | Y | Y | Y | Y | Y | Y | Y |
| Vade yasak | Y | Y | N | N | Y* | Y* | Y* | Y* |
| Vade zorunlu | N | N | Y | Y | * | * | * | * |
| Banka zorunlu | N | Y* | Y | N* | N | N | N | N |
| Sağlayıcı/POS ayrımı | N | N | N | N | Y | Y | Y | Y |
| Duplicate same key | reject | reject | reject | reject | reject | reject | reject | reject |
| Farklı vade | n/a | n/a | allow | allow | n/a | n/a | n/a | n/a |
| Update own | * | * | * | * | * | * | * | * |
| Update other’s | deny* | deny* | deny* | deny* | deny* | deny* | deny* | deny* |
| Delete | role* | role* | role* | role* | role* | role* | role* | role* |
| Cross-company | deny | deny | deny | deny | deny | deny | deny | deny |

`*` = BUSINESS RULE CLARIFICATION REQUIRED

## Expense (hepsi henüz yok)

yemek, otel, yakıt, diğer, araç KM: create/update/delete/auth + `giriş>=çıkış`, toplam KM, toplam harcama, duplicate, onay.

---

# CRITICAL FINDINGS (P0)

1. **Harcama + Form 2 + kalan nakit yok** — ana iş akışı yok.
2. **Form 1 PDF/print yok** — kağıt süreç kapanmıyor.
3. **Ödeme türleri yanlış/eksik** — YKB/TEB/Karland/Otokoç `CREDIT_CARD` veya hiç yok; Excel unknown→KK.
4. **Tahsilatta personel yok** — personel dökümü üretilemez.
5. **Tenant yok; salesman tüm tahsilatı değiştirir/siler** — IDOR / data isolation.
6. **User deactivate session öldürmez** — yasaklı hesap çalışır.
7. **CORS `*` + credentials + public Swagger** — production saldırı yüzeyi.
8. **`ddl-auto=update` production** — şema drift / data risk.
9. **JWT localStorage + cookie SameSite/Secure yok** — XSS = hesap.
10. **GET /customers PreAuthorize kapalı** — rol bypass.

---

# HIGH PRIORITY FINDINGS (P1)

1. Logout UI backend’i çağırmıyor.
2. Password reset/change/profile yok; forgot-password yalan söylüyor.
3. Register zayıf şifre + enumeration + rate limit yok.
4. Duplicate DB unique + create transaction yok.
5. Banka, makbuz, mikro no yok.
6. Onay / teslim alan yok.
7. Excel boyut/tip/OOM koruması yok.
8. Audit (`updatedAt`, createdBy) bozuk/yok.
9. Report backend var, UI yok; report yalnızca cash/check.
10. Error details production’da açık; security DEBUG.
11. 24s token, refresh yok.
12. Soft-delete sonrası aynı tahsilat tekrar girilir.
13. Status modeli (PENDING/overdue) ölü.
14. İndex eksik.

---

# MEDIUM PRIORITY FINDINGS (P2)

1. `ROLE_ACCOUNTING` ölü.
2. Çift UserDetailsService.
3. Overdue endpoint ölü.
4. reportService.js ölü.
5. Client-side 500 kayıt limiti.
6. N+1 / OSIV.
7. Startup importer ile runtime parser duplikasyonu.
8. Social login sahte.
9. Mixed TR/EN UI.
10. Description length validation yok.
11. Admin self-deactivate/role koruması yok.
12. `CustomerExcelImporter` feature flag’siz: boş DB’de `data/firmalar.xlsx` seed eder.
13. Geçersiz JWT’de 401 yerine 403.
14. UpdateCustomer, CreateCustomer’dan daha katı (telefon/yetkili zorunlu).

---

# LOW PRIORITY FINDINGS (P3)

1. Navbar “Financial Management System” / “Welcome”.
2. Emoji insights.
3. Register username→lastName “User” fallback.
4. Remember-me token süresini değiştirmez.
5. docker-compose zayıf parola (local).

---

# MISSING FEATURES

Harcama CRUD, araç/KM, personel-tahsilat bağı, 8 ödeme türü, banka, makbuz, form 1/2, PDF, print, e-posta, prim/AGİ/haftalık/fazla, kalan nakit, teslim/tesellüm, onay, dönem, tenant, profile, change/reset password, company settings, rate limit, security headers, refresh token, audit log, yedekleme, frontend/backend güvenlik-hesap testleri.

---

# SECURITY VULNERABILITIES

### SV-01 CORS wildcard + credentials
- **Location:** `CorsConfig.java`
- **Risk:** P0
- **Attack:** Kötü origin, kullanıcının JWT’si ile API çağrısı (browser).
- **Impact:** Tam hesap / finansal veri.
- **Fix:** Allowlist (Vercel domain). Credentials ile `*` yasak.

### SV-02 Public Swagger (production URL gömülü)
- **Location:** `SecurityConfig`, `SwaggerConfig`
- **Risk:** P0
- **Attack:** Endpoint keşif, login dene.
- **Impact:** Saldırı yüzeyi.
- **Fix:** Prod’da kapat veya admin + basic auth.

### SV-03 Collection IDOR
- **Location:** `CollectionServiceImpl` findById
- **Risk:** P0
- **Attack:** Başka personelin UUID’si ile GET/PUT/DELETE.
- **Impact:** Tahsilat manipülasyonu.
- **Fix:** collected_by + role; admin hariç sahiplik.

### SV-04 Disabled user token geçerli
- **Location:** `UserServiceImpl.deactivateUser`, `JwtAuthenticationFilter`
- **Risk:** P0
- **Attack:** Disable sonrası mevcut JWT.
- **Impact:** Yetkisiz erişim.
- **Fix:** Session null + filter `isEnabled`.

### SV-05 Token XSS
- **Location:** `tokenStorage.js`
- **Risk:** P0
- **Attack:** XSS ile localStorage/cookie oku.
- **Impact:** Session çalma.
- **Fix:** HttpOnly Secure SameSite cookie; JS’den token kaldırma.

### SV-06 ddl-auto=update
- **Location:** `application.properties`
- **Risk:** P0
- **Attack/Accident:** Hibernate şema değiştirir.
- **Impact:** Data loss / drift.
- **Fix:** `validate` veya `none`; yalnızca Flyway.

### SV-07 GET /customers role yok
- **Location:** `CustomerController` satır 57 yorum
- **Risk:** P1/P0
- **Attack:** ACCOUNTING veya gelecek roller tüm müşteri PII.
- **Fix:** PreAuthorize geri al; salesman’e active-only.

### SV-08 Logout incomplete
- **Location:** `authService.js` logout
- **Risk:** P1
- **Attack:** Çalınan token logout sonrası yaşar.
- **Fix:** `POST /auth/logout` çağır.

### SV-09 No rate limit
- **Location:** login/register
- **Risk:** P1
- **Attack:** Brute force / user spam.
- **Fix:** IP+email limit, lockout.

### SV-10 Weak password (API)
- **Location:** `RegisterRequest`
- **Risk:** P1
- **Attack:** `a` şifresi.
- **Fix:** Backend complexity.

### SV-11 Excel OOM / type spoof
- **Location:** `CollectionExcelParser`
- **Risk:** P1
- **Attack:** Dev xlsx / uzantı spoof.
- **Fix:** Max size, magic bytes, row cap, SAX.

### SV-12 Error leakage
- **Location:** application.properties
- **Risk:** P1
- **Attack:** Validation/internal message.
- **Fix:** Prod’da generic error.

### SV-13 Session/email DEBUG logs
- **Location:** Jwt filter, AuthServiceImpl
- **Risk:** P2
- **Impact:** Log’da PII/session.
- **Fix:** INFO altı kapat; sessionId loglama.

---

# BUSINESS LOGIC GAPS

1. Tek satır çok ödeme vs tek tür.
2. Kalan nakit formülü yok.
3. Prim %1 tanımı yok.
4. Tüm tahsilat create’te PAID — çek/senet tahsilatı takip edilmiyor (kod TODO).
5. Excel unknown → CREDIT_CARD.
6. Duplicate soft-delete sonrası serbest.
7. Aynı tutar farklı tür duplicate değil.
8. Overdue ölü.
9. Salesman kapsamı tanımsız (tüm müşteriler/tahsilatlar).

---

# PAPER FORM GAP ANALYSIS

Form 1: ~%25. Temel tahsilat satırı var; döküm, makbuz, mikro, banka, 4 POS/mailorder, personel başlığı, toplam satırı, yazdırma yok.

Form 2: ~%5. Yalnızca kullanıcı adı ve global nakit/çek toplamına dolaylı yaklaşılır. Harcama, araç, finansal kapanış, teslim %0.

---

# CALCULATION GAP ANALYSIS

Var: tutar toplamları (global/yıl/ay/tür/müşteri), yüzde dağılım, top N.

Yok / hatalı: kalan nakit, masraf toplamı, KM, yakıt toplamı, prim, AGİ, nakit dışı, personel net, form satır genel toplam (çok tür), overdue.

**Hiçbir finansal formül uydurulmamalı.**

---

# REPORTING / PDF / EMAIL / DATABASE / API / TEST GAP

Yukarıdaki bölümlerle aynı: harcama/personel/nakit raporları yok; PDF/print/mail yok; company/expense/unique/index/audit yok; expense/pdf/mail/reset endpoint yok; Swagger/customers/collection IDOR riskli; test neredeyse yok.

---

# PRODUCTION READINESS

## NO

Neden:

1. İşin yarısı (harcama + form + kapanış) yok.
2. Ödeme türleri yanlış sınıflanıyor.
3. Tenant/owner yok.
4. Disable/logout/CORS/Swagger/ddl-auto production hijyeni yok.
5. Test ve backup yok.

Tek şirket, yalnızca iç tahsilat kaydı için “kontrollü beta” olabilir; saha formu yerine geçemez.

---

# TECHNICAL DEBT

- Flyway vs `ddl-auto=update`
- İki UserDetailsService
- İki Excel parser
- Overdue + PENDING ölü
- Report vs Dashboard örtüşmesi
- Frontend 500-cap
- `updatedAt` donmuş
- ROLE_ACCOUNTING
- Sahte social/forgot-password
- TR/EN karışımı
- OSIV + N+1
- Session her request DB

---

# RECOMMENDED ROADMAP

## PHASE 0 — Critical Security
**Yapılacaklar:** CORS allowlist; Swagger kapat; `ddl-auto=none/validate`; customers PreAuthorize; deactivate+logout session clear; filter `isEnabled`; frontend logout API; error leakage kapat; debug log kapat.  
**Neden:** Canlı veri sızıntısı/hesap ele geçirme.  
**Bağımlılık:** Yok.  
**Complexity:** M.  
**AC:** Prod’da swagger 401/404; disable user 401; CORS yalnızca frontend origin; salesman hala (şimdilik) tek havuzu görür ama role bypass yok.

## PHASE 1 — Data Model + Business Rules Workshop
**Yapılacaklar:** Tek tenant mı multi mi resmi karar. Form satır modeli (ziyaret vs ödeme). Kalan nakit, prim, onay, salesman kapsamı yazılı kural. Sonra migration: `company` (gerekirse), `collected_by`, payment subtype/bank, makbuz, expense/vehicle/settlement taslağı. Unique duplicate index. Audit fields.  
**Neden:** Yanlış modele feature yazmak daha pahalı.  
**Bağımlılık:** Phase 0.  
**Complexity:** L.  
**AC:** Onaylı kural dokümanı + şema PR. Formül yoksa kod yok.

## PHASE 2 — Collection düzeltme
**Yapılacaklar:** 8 tür; banka validasyonu; personel bağlama; owner authorization; transaction + unique; Excel mapping düzelt; CREDIT_CARD default kaldır.  
**Neden:** Mevcut veri kalitesi ve Form 1.  
**Bağımlılık:** Phase 1.  
**Complexity:** L.  
**AC:** Tür test matrisi geçer; salesman başkasının kaydını (karara göre) göremez/değiştiremez.

## PHASE 3 — Expense
**Yapılacaklar:** Form 2 üst grid: plaka, KM, yemek, otel, yakıt, diğer, onay. KM/tutar validasyonu.  
**Neden:** İkinci ana iş.  
**Bağımlılık:** Phase 1.  
**Complexity:** L.  
**AC:** CRUD + KM negatif reddi + günlük toplam.

## PHASE 4 — Calculations
**Yapılacaklar:** Onaylı formüller: toplam KM, masraf, tür toplamları, prim, kalan nakit. Settlement alanları.  
**Neden:** Form 2 sağ tablo.  
**Bağımlılık:** Phase 1–3 + yazılı kural.  
**Complexity:** M.  
**AC:** Golden-file hesap testleri.

## PHASE 5 — Reporting
**Yapılacaklar:** Personel/gün/hafta, harcama, nakit vs masraf, mevcut report UI bağlama.  
**Bağımlılık:** Phase 2–4.  
**Complexity:** M.  
**AC:** Yönetici personel+dönem kırılımı görür.

## PHASE 6 — PDF / Forms
**Yapılacaklar:** Form 1/2 şablon, otomatik doldur, print, PDF.  
**Bağımlılık:** Phase 4.  
**Complexity:** L.  
**AC:** Seçilen personel+dönem kağıt formla alan-eşleşir.

## PHASE 7 — Email
**Yapılacaklar:** SMTP, reset, PDF gönder, retry, yetki, log (PII minimize).  
**Bağımlılık:** Phase 0, 6.  
**Complexity:** M.  
**AC:** Yetkili kullanıcı forma PDF mail atar; reset gerçek çalışır.

## PHASE 8 — Testing
**Yapılacaklar:** IDOR, session, payment matrix, expense calc, PDF totals, excel, import security.  
**Bağımlılık:** İlgili fazlar.  
**Complexity:** L.  
**AC:** CI’da tenant/IDOR ve hesap testleri kırmızı kırar.

## PHASE 9 — Production Hardening
**Yapılacaklar:** Headers, rate limit, HttpOnly cookie, refresh, multipart limit, index, health, backup, Hikari, monitoring.  
**Bağımlılık:** Phase 0.  
**Complexity:** M.  
**AC:** Checklist yeşil.

## PHASE 10 — Final QA
**Yapılacaklar:** Kağıt form paralel kullanım, saha senaryosu, disable/login/import/print/mail.  
**Complexity:** M.  
**AC:** Denoto saha formu elektronik kapanır.

---

# ÖNCE BUNLARI DÜZELTMELİYİZ, SONRA ŞUNLARI YAPMALIYIZ

**ÖNCE (Phase 0–1):**  
Production hijyeni (CORS, Swagger, ddl-auto, session kill, customers auth) + **iş kuralları toplantısı** (tenant, kalan nakit, prim, form satır modeli, salesman yetkisi). Kural yoksa hesap/PDF yazılmayacak.

**SONRA (Phase 2–4):**  
Tahsilat türleri + personel bağlama + harcama/KM + onaylı hesaplar.

**EN SONRA (Phase 5–10):**  
Rapor, Form 1/2 PDF, e-posta, test, sıkılaştırma, saha QA.

---

# EK: KANIT NOTLARI (dosya)

- Tenant yok: `User.java`, `Customer.java`, `Collection.java`, V1–V3
- PaymentType 5 değer: `PaymentType.java`
- Excel default KK: `CollectionExcelParseSupport.mapPaymentType`
- Customers PreAuthorize yorum: `CustomerController.java` ~57
- Deactivate session yok: `UserServiceImpl.deactivateUser`
- Filter enabled bakmaz: `JwtService.isTokenValid`
- Frontend logout local-only: `authService.js`
- Token cookie: `tokenStorage.js`
- CORS `*`: `CorsConfig.java`
- Swagger permitAll + Railway URL: `SecurityConfig`, `SwaggerConfig`
- ddl-auto=update: `application.properties`
- Forgot-password stub: `ForgotPasswordPage.jsx`
- Expense/PDF/mail: repo taraması sıfır implementasyon
- Tests: 3 dosya
- Collection create status PAID + TODO: `CollectionServiceImpl`
