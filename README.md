# BüroTime 6 Aylık Satış Tahminine Dayalı Üretim Planlama Karar Destek Sistemi

## 🎓 Proje Hakkında

Bu proje, BüroTime ofis mobilyaları firması için geliştirilen web tabanlı bir karar destek sistemidir. Sistem, geçmiş satış verilerini analiz ederek gelecek 6 ay için satış tahminleri oluşturur ve üretim planlama kararlarını destekler.

**Üniversite Projesi** - Ahmed Enes Okur

## 🚀 Özellikler

- ✅ **12 Ürün Desteği**: BüroTime'ın 12 farklı ofis mobilyası ürünü için tahmin
- 📊 **Ürün Bazlı Analiz**: Her ürün için ayrı ayrı satış trendi ve tahmin
- 📈 **Hareketli Ortalama Algoritması**: 3 aylık hareketli ortalama ile basit ve açıklanabilir tahmin
- 🎯 **Mevsimsellik Desteği**: Opsiyonel mevsimsel faktörler ile daha doğru tahminler
- 🛡️ **Güvenlik Stoku**: Belirsizliği yönetmek için ayarlanabilir güvenlik stoku oranı
- 📱 **Responsive Tasarım**: Masaüstü, tablet ve mobil uyumlu arayüz
- 🔄 **Gerçek Zamanlı Grafikler**: Chart.js ile interaktif görselleştirmeler
- 💾 **Veri Yönetimi**: Satış verisi ekleme, görüntüleme ve filtreleme

## 🏗️ Sistem Mimarisi

### Teknoloji Stack

**Backend:**
- Node.js 18+
- Express.js 4.18.2
- MySQL (XAMPP)
- mysql2 (Promisified)
- CORS

**Frontend:**
- HTML5
- Bootstrap 5.3.0
- Chart.js 4.4.0
- Vanilla JavaScript
- Bootstrap Icons

**Database:**
- MySQL 8.0+ / MariaDB
- utf8mb4 encoding
- Turkish collation (utf8mb4_turkish_ci)

### Proje Yapısı

```
ahmed-enes-2/
├── database/
│   ├── schema.sql                 # Veritabanı şeması
│   ├── seed.sql                   # Örnek veri
│   ├── README.md                  # Veritabanı kurulum kılavuzu
│   └── PRODUCT-BASED-DESIGN.md    # Tasarım dokümantasyonu
├── backend/
│   ├── src/
│   │   ├── server.js              # Uygulama giriş noktası
│   │   ├── app.js                 # Express app yapılandırması
│   │   ├── db.js                  # MySQL bağlantı havuzu
│   │   ├── routes/                # API route'ları
│   │   ├── controllers/           # İş mantığı kontrolörleri
│   │   └── services/              # Tahmin servisleri
│   ├── package.json
│   ├── .env                       # Veritabanı bağlantı bilgileri
│   └── README.md                  # Backend API dokümantasyonu
└── frontend/
    ├── index.html                 # Ana dashboard
    ├── satis.html                 # Satış veri yönetimi
    └── assets/
        ├── css/
        │   └── style.css          # Özel stiller
        └── js/
            ├── dashboard.js       # Dashboard JavaScript
            └── satis.js           # Satış yönetimi JavaScript
```

## 📦 Kurulum

### Gereksinimler

- **XAMPP** (MySQL/Apache)
- **Node.js** 18.x veya üzeri
- **npm** (Node.js ile birlikte gelir)
- Modern web tarayıcı (Chrome, Firefox, Edge)

### Adım 1: Veritabanı Kurulumu

1. XAMPP'i başlatın ve MySQL servisini çalıştırın
2. phpMyAdmin'i açın: `http://localhost/phpmyadmin`
3. Yeni veritabanı oluşturun:
   - Veritabanı adı: `karar-destek-sistemi`
   - Collation: `utf8mb4_turkish_ci`
4. `database/schema.sql` dosyasını çalıştırın (SQL sekmesi)
5. `database/seed.sql` dosyasını çalıştırın (12 ürün + 288 satış kaydı)

### Adım 2: Backend Kurulumu

```powershell
# Backend klasörüne gidin
cd backend

# Bağımlılıkları yükleyin
npm install

# .env dosyasını kontrol edin (varsa düzenleyin)
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=karar-destek-sistemi
# PORT=3000

# Backend'i başlatın
npm start
```

Backend başarıyla başladığında:
```
🚀 Server is running on http://localhost:3000
✅ Database connected successfully
```

### Adım 3: Frontend Açma

1. `frontend/index.html` dosyasını tarayıcınızda açın
2. Veya Live Server kullanabilirsiniz (VS Code extension)

**ÖNEMLİ:** Frontend'in backend ile iletişim kurabilmesi için backend'in çalışıyor olması gerekir!

## 🎯 Kullanım

### 1. Dashboard (Ana Sayfa)

**Tüm Ürünler Görünümü:**
- Dropdown'dan "-- Tüm Ürünler (Özet) --" seçili bırakın
- Toplam ürün sayısı, toplam satış, ortalama satış görüntülenir
- En çok satan ürün ve top 5 ürün listesi gösterilir
- "Tüm Ürünler İçin Tahmin Üret" butonu ile toplu tahmin oluşturabilirsiniz

**Tek Ürün Detay Görünümü:**
1. Dropdown'dan bir ürün seçin (örn: BT-001 - Çalışma Masası)
2. Ürüne özel KPI'lar ve trend bilgisi görüntülenir
3. Satış geçmişi grafiği ve kampanya karşılaştırması gösterilir
4. Tahmin parametrelerini ayarlayın:
   - **Tahmin Süresi**: 1-12 ay arası
   - **Güvenlik Stoku**: %0-50 arası (varsayılan %20)
   - **Mevsimsellik**: Aktif/Pasif
5. "Tahmin Üret" butonuna tıklayın
6. Tahmin sonuçları tablo ve grafik olarak gösterilir
7. "Veritabanına Kaydet" ile tahminleri kalıcı hale getirin

### 2. Satış Veri Yönetimi

1. Sol menüden "Satış Veri Yönetimi" sayfasına gidin
2. **Yeni Satış Kaydı Eklemek İçin:**
   - Ürün seçin
   - Ay seçin (YYYY-MM formatında)
   - Satış adedini girin
   - Kampanya durumunu belirtin
   - "Kaydet" butonuna tıklayın
3. **Mevcut Kayıtları Görüntülemek İçin:**
   - Tablo otomatik olarak tüm kayıtları listeler
   - Ürün filtresini kullanarak belirli bir ürünün kayıtlarını görüntüleyin

## 📊 Tahmin Algoritması

### 3 Aylık Hareketli Ortalama

Sistem, basit ve açıklanabilir bir tahmin algoritması kullanır:

```
Tahmin = Son 3 Ayın Ortalaması × Mevsimsel Faktör
Önerilen Üretim = Tahmin × (1 + Güvenlik Stoku %)
```

**Mevsimsellik Hesaplaması:**
- Her ay için son yıllardaki aynı aya göre ortalama sapma hesaplanır
- Mevsimsel faktör = Ayın ortalaması / Genel ortalama
- Örnek: Ocak ayı genelde %15 daha yüksek → Faktör = 1.15

**Güvenlik Stoku:**
- Talep belirsizliğini yönetmek için ekstra üretim miktarı
- %20 güvenlik stoku = Tahminin %20 fazlası üretilir
- Stok kırılma riskini azaltır

## 🗄️ Veritabanı Şeması

### Tablolar

**1. urunler (Ürünler)**
- `id`: Primary key
- `urun_kodu`: Ürün kodu (BT-001, BT-002, vb.)
- `urun_adi`: Ürün adı (Türkçe)
- `kategori`: Kategori (Masa, Koltuk, Dolap, vb.)
- `birim_fiyat`: Satış fiyatı
- `aktif_mi`: Aktif durum (0/1)

**2. satis_verileri (Satış Verileri)**
- `id`: Primary key
- `urun_id`: Foreign key → urunler
- `ay`: Satış ayı (YYYY-MM)
- `satis_adedi`: Satış miktarı
- `kampanya_var_mi`: Kampanya durumu (0/1)

**3. tahmin_sonuclari (Tahmin Sonuçları)**
- `id`: Primary key
- `urun_id`: Foreign key → urunler
- `tahmin_ayi`: Tahmin edilen ay
- `tahmini_satis`: Tahmin edilen satış
- `onerilen_uretim`: Önerilen üretim miktarı
- `model_versiyonu`: Kullanılan model

**4. model_parametreleri (Model Parametreleri)**
- Tahmin modelinin parametreleri
- Gelecekteki geliştirmeler için

## 🔌 API Endpoints

### Ürünler
- `GET /api/urunler` - Tüm ürünleri listele
- `GET /api/urunler/:id` - Tek ürün detayı

### Satış Verileri
- `GET /api/satis` - Tüm satış verilerini listele
- `GET /api/satis?urun_id=1` - Belirli ürünün satışları
- `POST /api/satis` - Yeni satış kaydı ekle

### Dashboard
- `GET /api/dashboard/ozet` - Tüm ürünler özeti
- `GET /api/dashboard/ozet?urun_id=1` - Tek ürün özeti

### Tahmin
- `GET /api/tahmin?urun_id=1&ay_sayisi=6` - Tahmin oluştur
- `GET /api/tahmin/toplu?ay_sayisi=6` - Tüm ürünler için tahmin
- `POST /api/tahmin/kaydet` - Tahminleri veritabanına kaydet
- `GET /api/tahmin/gecmis?urun_id=1` - Geçmiş tahminleri getir

### Sistem
- `GET /api/health` - Sistem sağlık kontrolü
- `GET /api/parametreler` - Model parametreleri

Detaylı API dokümantasyonu: `backend/README.md`

## 🎨 Ekran Görüntüleri

### Dashboard - Tüm Ürünler
- 4 KPI kartı (Toplam ürün, toplam satış, ortalama, en çok satan)
- Top 5 ürün performans tablosu
- Toplu tahmin butonu

### Dashboard - Tek Ürün
- 4 KPI kartı (Aylık ortalama, kampanya vs normal, toplam satış, trend)
- Satış geçmişi grafiği (çizgi grafik)
- Kampanya karşılaştırma grafiği (bar grafik)
- Tahmin parametreleri formu
- Tahmin sonuçları tablosu
- Grafiklerde tahmin görselleştirmesi

### Satış Veri Yönetimi
- Yeni kayıt ekleme formu
- Tüm satış kayıtları tablosu
- Ürün bazlı filtreleme

## 🧪 Test

### Backend Test
```powershell
# Sağlık kontrolü
curl http://localhost:3000/api/health

# Tüm ürünler
curl http://localhost:3000/api/urunler

# Dashboard özeti
curl http://localhost:3000/api/dashboard/ozet

# Tahmin oluşturma
curl "http://localhost:3000/api/tahmin?urun_id=1&ay_sayisi=6"
```

### Frontend Test
1. Backend'in çalıştığından emin olun
2. index.html'i tarayıcıda açın
3. Ürün seçin ve tahmin oluşturun
4. Grafiklerin ve tabloların yüklendiğini kontrol edin
5. Satış sayfasından yeni kayıt ekleyin

## 📝 Örnek Ürünler

Sistemde 12 adet BüroTime ürünü bulunmaktadır:

1. **BT-001** - Çalışma Masası (Masa)
2. **BT-002** - Ofis Koltuğu (Koltuk)
3. **BT-003** - Dosya Dolabı (Dolap)
4. **BT-004** - Toplantı Masası (Masa)
5. **BT-005** - Yönetici Koltuğu (Koltuk)
6. **BT-006** - Kitaplık (Dolap)
7. **BT-007** - Bilgisayar Masası (Masa)
8. **BT-008** - Misafir Koltuğu (Koltuk)
9. **BT-009** - Arşiv Dolabı (Dolap)
10. **BT-010** - Çalışma İstasyonu (Masa)
11. **BT-011** - Ergonomik Koltuk (Koltuk)
12. **BT-012** - Vestiyer Dolabı (Dolap)

Her ürün için 24 aylık (2023-01'den 2024-12'ye) satış verisi bulunmaktadır.

## 🔧 Sorun Giderme

### Backend başlamıyor
- MySQL servisinin çalıştığından emin olun
- `.env` dosyasındaki bağlantı bilgilerini kontrol edin
- `npm install` komutuyla bağımlılıkları yeniden yükleyin

### Frontend API'ye bağlanamıyor
- Backend'in çalıştığından emin olun: `http://localhost:3000/api/health`
- CORS hatası alıyorsanız backend'de CORS middleware'in aktif olduğunu kontrol edin
- Tarayıcı konsolunda hata mesajlarını kontrol edin

### Veritabanı hataları
- Veritabanı adının `karar-destek-sistemi` olduğundan emin olun
- Tablo yapısının schema.sql ile eşleştiğini kontrol edin
- phpMyAdmin'de sorguları manuel olarak test edin

### Grafikler görünmüyor
- Chart.js CDN bağlantısının çalıştığını kontrol edin
- Tarayıcı konsolunda JavaScript hataları olup olmadığına bakın
- Sayfayı yenileyin (Ctrl+F5)


## 📄 Lisans

Bu proje üniversite projesi olarak geliştirilmiştir.

##  Teşekkürler#   b u r o t i m e _ d s s  
 #   b u r o t i m e _ d s s  
 