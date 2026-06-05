# Veritabanı Şeması (Database Schema)

Bu belge, Supabase (PostgreSQL) üzerinde kurulacak olan veritabanı tablolarını ve aralarındaki ilişkileri (ER Diagram) tanımlar.

## Temel Tablolar ve İlişkiler

Uygulamanın MVP fazı için 4 ana tabloya ihtiyaç vardır: Kullanıcılar, Gruplar, Grup Üyeleri, Masraflar (Harcamalar) ve Borçlar (Borç/Alacak durumu).

```mermaid
erDiagram
    USERS ||--o{ GROUP_MEMBERS : "üyesidir"
    USERS ||--o{ EXPENSES : "öder"
    USERS ||--o{ DEBTS : "borçludur / alacaklıdır"
    
    GROUPS ||--|{ GROUP_MEMBERS : "içerir"
    GROUPS ||--o{ EXPENSES : "sahiptir"
    GROUPS ||--o{ DEBTS : "sahiptir"
    
    EXPENSES ||--o{ EXPENSE_PARTICIPANTS : "faydalananlar"
    USERS ||--o{ EXPENSE_PARTICIPANTS : "katılır"

    USERS {
        uuid id PK
        string phone_number "Unique"
        string full_name
        string avatar_url
        string created_at
    }

    GROUPS {
        uuid id PK
        string title
        string cover_image_url
        string category
        uuid created_by FK
        string created_at
    }

    GROUP_MEMBERS {
        uuid group_id PK, FK
        uuid user_id PK, FK
        string joined_at
    }

    EXPENSES {
        uuid id PK
        uuid group_id FK
        uuid paid_by FK "Ödemeyi yapan kullanıcı"
        decimal amount
        string currency
        string description
        string split_type "EQUAL, PERCENTAGE, EXACT"
        string created_at
    }

    EXPENSE_PARTICIPANTS {
        uuid expense_id PK, FK
        uuid user_id PK, FK
        decimal exact_amount "Kullanıcıya düşen spesifik tutar"
    }

    DEBTS {
        uuid id PK
        uuid group_id FK
        uuid debtor_id FK "Borçlu (Kim ödeyecek?)"
        uuid creditor_id FK "Alacaklı (Kime ödenecek?)"
        decimal amount
        string currency
        boolean is_settled "Ödendi mi?"
        string created_at
    }
```

## Supabase Özellikleri ile Entegrasyon

*   **Row Level Security (RLS):** Supabase üzerinde, bir kullanıcının sadece üyesi olduğu grubun harcamalarını ve borçlarını görebilmesi için RLS (Satır Seviyesi Güvenlik) kuralları yazılacaktır.
*   **Realtime:** `EXPENSES` ve `DEBTS` tablolarına Supabase Realtime aboneliği (subscription) açılarak, bir kişi gruba masraf eklediğinde diğer kullanıcıların ekranının anında güncellenmesi sağlanacaktır.
