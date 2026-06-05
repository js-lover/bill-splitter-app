# Proje Gereksinimleri (Requirements)

Bu belge, Ortak Hesap / Harcama Bölüştürme Uygulaması'nın tüm işlevsel ve işlevsel olmayan gereksinimlerini detaylandırmaktadır. Proje 3 faza ayrılmıştır.

## Faz 1: Minimum Viable Product (MVP) - Temel Özellikler

### 1. Kullanıcı Yönetimi
*   **Kayıt ve Giriş:** Kullanıcılar telefon numarası (SMS onayı ile) veya sosyal medya hesapları (Google, Apple) ile uygulamaya kayıt olabilmeli ve giriş yapabilmelidir.
*   **Profil Yönetimi:** Kullanıcılar isim, soyisim, profil fotoğrafı gibi temel bilgilerini güncelleyebilmelidir.

### 2. Grup Yönetimi
*   **Grup Oluşturma:** Kullanıcılar belirli bir amaç için (Örn: "Antalya Tatili", "Ev Arkadaşları") yeni gruplar oluşturabilmelidir.
*   **Üye Ekleme:** Grup kurucusu veya yöneticisi, telefon rehberi entegrasyonu veya davet linki aracılığıyla diğer kullanıcıları gruba ekleyebilmelidir.
*   **Grup Özeti:** Grup içerisindeki toplam harcama, kişisel borç/alacak durumu ana ekranda özet olarak görünmelidir.

### 3. Harcama Yönetimi
*   **Masraf Ekleme:** Kullanıcılar tutar, açıklama, tarih ve kategori belirterek yeni bir harcama ekleyebilmelidir.
*   **Ödeyen ve Faydalananlar:** Harcamayı kimin yaptığı ve bu harcamadan kimlerin (hangi grup üyelerinin) faydalandığı seçilebilmelidir.
*   **Çoklu Para Birimi:** Harcamalar farklı para birimlerinde girilebilmeli, uygulama güncel kurlar üzerinden ana para birimine çevrim yapabilmelidir.

### 4. Bölüştürme Modelleri
*   **Eşit Bölüştürme:** Toplam harcama, seçilen faydalananlar arasında eşit olarak bölünür.
*   **Oransal/Yüzdelik Bölüştürme:** Harcama, belirlenen yüzdelere göre bölünür.
*   **Spesifik Tutar:** Her bir faydalanan için manuel olarak farklı tutarlar girilebilir.

### 5. Borç Sadeleştirme (Debt Simplification)
*   **Optimizasyon:** Grup içi para transferi sayısını en aza indiren algoritma çalışmalıdır. (Örn: A -> B'ye 50, B -> C'ye 50 borçlu ise; sistem A -> C'ye 50 ödemesini önerir).

---

## Faz 2: İleri Seviye Özellikler

### 1. Akıllı Fiş Tarama (OCR)
*   **Kamera Entegrasyonu:** Kullanıcılar uygulama içinden fiş/fatura fotoğrafı çekebilmelidir.
*   **OCR İşlemi:** Yapay zeka destekli altyapı (Google Cloud Vision/AWS Textract) ile fiş üzerindeki ürün kalemleri ve fiyatlar okunmalıdır.
*   **Kalem Bazlı Bölüştürme (Itemized Split):** Fişteki kalemler liste halinde sunulmalı, her kullanıcı kendi yediği/içtiği kalemi seçerek hesabına ekleyebilmelidir.

### 2. Ödeme Entegrasyonları
*   **Banka ve Cüzdan Bilgileri:** Kullanıcılar profillerine IBAN veya Kolay Adres (Telefon/TCKN) ekleyebilmelidir.
*   **Hızlı Ödeme (Deep-link):** Borç ödeme aşamasında alıcının IBAN bilgisi kopyalanabilmeli veya bankacılık uygulamasına deep-link ile yönlendirme yapılabilmelidir.
*   **TR Karekod:** Ödeme için standartlara uygun TR Karekod üretilebilmelidir.

### 3. Bildirimler
*   **Anlık Bildirimler (Push Notifications):** Yeni harcama eklendiğinde veya borç ödendiğinde ilgili kişilere bildirim gitmelidir.
*   **Hatırlatıcılar (Nudges):** Geciken borçlar için tek tıkla hatırlatma bildirimleri gönderilebilmelidir.

---

## Faz 3: Yenilikçi Özellikler

### 1. Oyunlaştırma (Gamification)
*   **Rozetler ve Başarılar:** Düzenli ödeme yapanlara veya grupta en çok hesap ödeyenlere özel rozetler verilmelidir.
*   **İstatistikler:** Kullanıcıların harcama alışkanlıklarına dair eğlenceli ve bilgilendirici infografikler sunulmalıdır.

### 2. Lokasyon Bazlı Bildirimler
*   **Mekan Algılama:** Restoran veya kafeden ayrılırken "Hesabı bölüştürmeyi unuttunuz mu?" şeklinde proaktif hatırlatmalar yapılmalıdır.

---

## İşlevsel Olmayan Gereksinimler (Non-Functional Requirements)
*   **Performans:** Uygulama açılış hızı 2 saniyenin altında olmalı, OCR işlemleri 5 saniye içinde tamamlanmalıdır.
*   **Güvenlik:** Kullanıcı verileri ve finansal bilgiler şifrelenerek saklanmalıdır (GDPR/KVKK uyumluluğu).
*   **Erişilebilirlik:** Uygulama iOS ve Android platformlarında sorunsuz ve tutarlı bir UI/UX ile çalışmalıdır.
