# İş Akışları (Workflows)

Bu belge, uygulamanın arka planında çalışan ve iş mantığını (business logic) oluşturan temel süreçleri tanımlar.

## 1. Borç Sadeleştirme Algoritması (Debt Simplification Workflow)

Bu sistem, grup içerisindeki tüm harcamalardan doğan karmaşık borç ağını en aza indiren optimizasyon sürecidir.

```mermaid
sequenceDiagram
    participant User as "Kullanıcılar (Grup)"
    participant App as "Mobil Uygulama"
    participant API as "Supabase API (REST)"
    participant DB as "Supabase PostgreSQL"
    participant Algo as "Edge Functions (Sadeleştirme Algoritması)"

    User->>App: Yeni masraf ekler
    App->>API: POST /api/expenses
    API->>DB: Masrafı ve alt kalemleri kaydet
    API->>Algo: Gruba ait borç optimizasyonunu tetikle
    
    Note over Algo: 1. Her üyenin net bakiyesini hesapla (Alacaklar - Borçlar)
    Note over Algo: 2. Alacaklıları ve Borçluları ayır
    Note over Algo: 3. En büyük borçludan en büyük alacaklıya doğru eşleştirme yap
    
    Algo-->>API: Yeni sadeleştirilmiş borç listesini dön
    API->>DB: Optimize edilmiş borç durumunu güncelle
    API-->>App: İşlem başarılı, yeni durumu ilet
    App-->>User: Sadeleştirilmiş borç tablosunu göster
```

## 2. OCR ile Fiş Tarama İş Akışı (Faz 2)

Kullanıcının bir fiş fotoğrafı çekip kalem bazlı hesabın oluşturulması süreci.

```mermaid
sequenceDiagram
    participant User as Kullanıcı
    participant App as "Mobil Uygulama"
    participant API as "Supabase Edge Functions"
    participant AI as "OCR/Vision API (Google/AWS)"
    participant LLM as "Parser LLM (Opsiyonel)"

    User->>App: Kamera ile Fiş Fotoğrafı Çeker
    App->>App: Görüntüyü sıkıştır ve optimize et
    App->>API: POST /api/ocr/scan (Image Upload)
    API->>AI: Görüntüyü Vision API'ye gönder
    AI-->>API: Ham metin ve koordinat verisi (JSON)
    
    Note over API: Fiyatları ve Ürün İsimlerini Eşleştir
    API->>LLM: Gerekirse metni anlamlandırmak için LLM kullan
    LLM-->>API: Yapılandırılmış Kalem Listesi (Items array)
    
    API-->>App: Parse edilmiş fiş kalemleri (Ürün: Fiyat)
    App-->>User: Fiş Onay Ekranını Göster
    User->>App: Kalemlerde düzeltme yapar veya onaylar
    User->>App: Kalemleri kişilere atar (Itemized Split)
    App->>API: Kesinleşmiş masrafı kaydet
```

## 3. Bildirim ve Hatırlatma İş Akışı

Sistemin kullanıcılara doğru zamanda bildirim gönderme süreci.

```mermaid
flowchart TD
    A["Cron Job / Scheduler"] --> B[Aktif Borçları Tara]
    B --> C{"Borç Süresi > 7 Gün mü?"}
    C -- Evet --> D[Borçluya Hatırlatma Bildirimi Kuyruğuna Ekle]
    C -- Hayır --> E[İşlem Yok]
    
    F["Kullanıcı A, Kullanıcı B'yi Dürt Butonuna Basar"] --> G[Manuel Bildirim Kuyruğuna Ekle]
    
    D --> H["Notification Service (FCM/APNS)"]
    G --> H
    
    H --> I[Kullanıcı Cihazına Push Notification Gönder]
    I --> J[Kullanıcı Bildirimi Görür ve Uygulamayı Açar]
```
