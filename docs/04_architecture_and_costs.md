# Teknoloji Yığını ve Maliyet Analizi (Tech Stack & Cost Report)

Bu belge, projenin kesinleşen teknoloji yığınını (Tech Stack) ve bu doğrultuda öngörülen geliştirme ve işletme maliyetlerini sunmaktadır.

## 1. Kesinleşen Teknoloji Yığını (Tech Stack)

Uygulamanın hem hızlı (MVP) pazara çıkabilmesi hem de modern bir mimariye sahip olması amacıyla aşağıdaki teknolojiler seçilmiştir:

*   **Mobil Uygulama (Frontend):** React Native (Expo)
    *   *Neden:* Tek kod tabanı ile iOS ve Android desteği, hızlı prototipleme, geniş topluluk ve zengin UI kütüphanesi desteği.
*   **Backend & Veritabanı:** Supabase (BaaS - Backend as a Service)
    *   *Veritabanı:* PostgreSQL (Güçlü, ilişkisel ve finansal veriler için en güvenilir seçenek).
    *   *Kimlik Doğrulama:* Supabase Auth (Telefon no ile SMS onayı veya Google/Apple entegrasyonu).
    *   *Gerçek Zamanlı Veri:* Supabase Realtime (Harcama eklendiğinde anında diğer cihazlarda görünmesi için).
    *   *İş Mantığı (Business Logic):* Supabase Edge Functions (Deno/TypeScript) - Borç sadeleştirme algoritması ve OCR API çağrıları burada koşacaktır.
*   **Yapay Zeka / OCR (Faz 2):** Google Cloud Vision API veya AWS Textract

---

## 2. Neden Supabase Seçildi?

Ortak Hesap / Harcama Bölüştürme uygulaması için .NET gibi özel sunucu (custom backend) çözümleri yerine Supabase tercih edilmesinin başlıca sebepleri şunlardır:

1.  **Pazara Hızlı Çıkış (Time-to-Market):** Supabase, veritabanı şemasını oluşturduğunuz anda size RESTful ve GraphQL API'leri otomatik olarak sağlar. Auth ve Storage (fiş fotoğrafları için) hazır gelir.
2.  **Sıfır Sunucu Yönetimi (Serverless):** Sunucu kiralama, işletim sistemi güncelleme veya load balancer kurma derdi yoktur.
3.  **Düşük Maliyet:** Projenin başlangıç aşamasında (MVP) altyapı maliyetini neredeyse sıfıra indirir.

---

## 3. Tahmini Proje İşletme Maliyetleri (Aylık - MVP Aşaması)

Aşağıdaki tablo, uygulamayı ilk 1000 aktif kullanıcıya ulaştırana kadar geçecek MVP sürecindeki tahmini aylık Supabase altyapı maliyetlerini göstermektedir.

| Hizmet Kalemi | Maliyet (Aylık) | Açıklama |
| :--- | :--- | :--- |
| **Supabase Altyapısı (DB, Auth, API, Edge Functions)** | $0 - $25 | Ücretsiz katman (Free Tier) ile başlanır, limitler aşılınca Pro Plana ($25) geçilir. |
| **SMS Doğrulama Sağlayıcısı (Twilio vb.)** | ~$10 - $20 | Supabase Auth üzerinden SMS göndermek için (Kullanım bazlıdır). |
| **OCR / Vision API (Faz 2)**| $0 - $20 | İlk 1000 istek genelde ücretsizdir, sonrasında okunan fiş başına cüzi miktar. |
| **Apple App Store Geliştirici Hesabı** | $8.25 | Yıllık 99$ (Aylığa vurulduğunda). |
| **Google Play Store Geliştirici Hesabı** | $0 | Tek seferlik 25$ ödeme (Aylık masrafı yoktur). |
| **Aylık Toplam (Tahmini)** | **~$20 - $75** | Projenin MVP aşamasında aylık sabit giderleri oldukça düşüktür. |

### Sonuç
Proje, **React Native + Supabase** mimarisi ile modern, gerçek zamanlı ve son derece düşük işletme maliyetleriyle hayata geçirilecektir.
