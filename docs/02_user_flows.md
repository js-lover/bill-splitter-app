# Kullanıcı Akışları (User Flows)

Bu belge, kullanıcıların uygulama içindeki temel yolculuklarını ve etkileşimlerini görselleştirmektedir.

## 1. Uygulamaya Kayıt ve İlk Giriş Akışı

Kullanıcının uygulamayı ilk indirdiğinde karşılaştığı kayıt/giriş sürecidir.

```mermaid
flowchart TD
    A[Uygulamayı Aç] --> B{Hesap Var mı?}
    B -- Hayır --> C[Kayıt Ol Seçeneğini Seç]
    B -- Evet --> D[Giriş Yap Seçeneğini Seç]
    
    C --> C1[Telefon No Gir]
    C1 --> C2[SMS OTP Kodunu Doğrula]
    C2 --> C3["Profil Bilgilerini Gir\nİsim, Soyisim, Foto"]
    C3 --> E["Ana Ekrana Ulaş (Dashboard)"]
    
    C --> C4["Sosyal Medya ile Devam Et\nGoogle/Apple"]
    C4 --> C5[İzinleri Onayla]
    C5 --> E
    
    D --> D1["Telefon No / Şifre Gir"]
    D1 --> E
```

## 2. Grup Oluşturma ve Üye Davet Akışı

Kullanıcının yeni bir etkinlik için grup oluşturması ve arkadaşlarını davet etmesi.

```mermaid
flowchart TD
    A[Ana Ekran] --> B[Yeni Grup Oluştur Butonuna Tıkla]
    B --> C["Grup Adı ve Kapak Fotoğrafı Belirle\nÖrn: Antalya Tatili"]
    C --> D["Kategori Seç\nTatil, Ev, Yemek vb."]
    D --> E[Grup Oluşturuldu]
    E --> F[Üye Ekle Seçeneği]
    
    F --> G{Ekleme Yöntemi}
    G -- Rehberden --> H[Rehber İznini Onayla]
    H --> I[Kişileri Seç ve Ekle]
    
    G -- Davet Linki --> J[Link Oluştur ve Kopyala]
    J --> K["WhatsApp/Telegram ile Paylaş"]
    
    I --> L[Kişiler Gruba Eklendi]
    K --> L
```

## 3. Masraf (Harcama) Ekleme Akışı

Bir kullanıcının grup içine yeni bir harcama girmesi.

```mermaid
flowchart TD
    A[Grup Detay Ekranı] --> B[Masraf Ekle Butonuna Tıkla]
    B --> C[Tutar ve Para Birimi Gir]
    C --> D["Açıklama Yaz\nÖrn: Akşam Yemeği"]
    D --> E["Kim Ödedi Seç\nVarsayılan: Kendisi"]
    E --> F[Bölüştürme Yöntemini Seç]
    
    F --> G{Nasıl Bölünecek?}
    G -- Eşit --> H[İlgili Kişileri Seç ve Eşit Böl]
    G -- "Oransal/Yüzde" --> I[Kişi Bazlı Yüzdeleri Gir]
    G -- "Tutar Bazlı" --> J[Kişi Bazlı Tutarları Gir]
    
    H --> K[Kaydet]
    I --> K
    J --> K
    
    K --> L[Masraf Gruba Eklendi]
    L --> M[İlgili Üyelere Bildirim Gönder]
```

## 4. Borç Ödeme ve Hesaplaşma Akışı

Kullanıcının borcunu ödemesi ve sistemde kapatması.

```mermaid
flowchart TD
    A["Ana Ekran / Borçlarım"] --> B[Ödenecek Kişiyi Seç]
    B --> C["Detayları Gör\nToplam Borç Tutarı"]
    C --> D[Öde Butonuna Tıkla]
    
    D --> E{Ödeme Yöntemi}
    E -- "Elden / Uygulama Dışı" --> F[Ödendi Olarak İşaretle]
    F --> G[Karşı Tarafa Onay Bildirimi Gider]
    G --> H{Karşı Taraf Onayı}
    H -- Onayladı --> I[Borç Kapatıldı]
    H -- Reddetti --> J["Borç Açık Kalır, İtiraz"]
    
    E -- "IBAN / Banka" --> K["IBAN Kopyala / Banka Uygulamasına Git"]
    K --> L[Transferi Gerçekleştir]
    L --> F
```
