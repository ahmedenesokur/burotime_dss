# BüroTime KDS - Backend API

Backend service for BüroTime Karar Destek Sistemi (Decision Support System).

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- XAMPP running (MySQL)
- Database `karar-destek-sistemi` created and populated

### Installation

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env` (already done)
   - Verify database credentials in `.env`:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=karar-destek-sistemi
     DB_PORT=3306
     PORT=3000
     ```

4. **Start the server:**
   ```bash
   npm start
   ```

   Or for development (auto-restart on changes):
   ```bash
   npm run dev
   ```

5. **Verify it's running:**
   Open http://localhost:3000/api/health in your browser

---

## 📡 API Endpoints

### Products

#### `GET /api/urunler`
Get all active products.

**Response:**
```json
[
  {
    "id": 1,
    "urun_kodu": "BT-001",
    "urun_adi": "Çalışma Masası",
    "aktif_mi": 1
  },
  ...
]
```

#### `GET /api/urunler/:id`
Get single product by ID.

---

### Sales Data

#### `GET /api/satis?urun_id=1`
Get sales data (optionally filtered by product).

**Query Parameters:**
- `urun_id` (optional): Filter by product ID

**Response:**
```json
[
  {
    "id": 1,
    "urun_id": 1,
    "ay": "2023-01",
    "satis_adedi": 120,
    "kampanya_var_mi": 0,
    "urun_kodu": "BT-001",
    "urun_adi": "Çalışma Masası"
  },
  ...
]
```

#### `POST /api/satis`
Add new sales record.

**Body:**
```json
{
  "urun_id": 1,
  "ay": "2025-01",
  "satis_adedi": 150,
  "kampanya_var_mi": 0
}
```

---

### Dashboard

#### `GET /api/dashboard/ozet?urun_id=1`
Get summary metrics.

**Query Parameters:**
- `urun_id` (optional): Get summary for specific product, or all products if omitted

**Response (Single Product):**
```json
{
  "urun_id": 1,
  "urun_kodu": "BT-001",
  "urun_adi": "Çalışma Masası",
  "toplam_ay": 24,
  "aylik_ortalama_satis": 145.8,
  "min_satis": 115,
  "max_satis": 195,
  "toplam_satis": 3500,
  "kampanya_ortalama": 164,
  "normal_ortalama": 139,
  "trend": "growing",
  "trend_yuzde": 8.2
}
```

**Response (All Products):**
```json
{
  "genel": {
    "toplam_urun": 12,
    "toplam_kayit": 288,
    "toplam_satis": 42000,
    "ortalama_satis": 145.83,
    "kampanya_ortalama": 165,
    "normal_ortalama": 140
  },
  "en_cok_satan": {
    "urun_adi": "Ofis Koltuğu",
    "urun_kodu": "BT-002",
    "toplam_satis": 5040
  },
  "top_urunler": [ ... ]
}
```

---

### Forecasting

#### `GET /api/tahmin?urun_id=1&ay_sayisi=6`
Generate forecast for a single product.

**Query Parameters:**
- `urun_id` (required): Product ID
- `ay_sayisi` (optional, default 6): Number of months to forecast
- `guvenlik_orani` (optional): Safety stock % override
- `kampanya_etkisi` (optional): Campaign multiplier override
- `mevsimsellik_aktif` (optional, 0/1): Enable seasonality override

**Response:**
```json
{
  "urun_id": 1,
  "urun_kodu": "BT-001",
  "urun_adi": "Çalışma Masası",
  "model": "moving_average_v1",
  "girdiler": {
    "ay_sayisi": 6,
    "guvenlik_orani": 10,
    "kampanya_etkisi": 1.05,
    "mevsimsellik_aktif": 0
  },
  "sonuclar": [
    {
      "ay": "2025-01",
      "tahmini_satis": 183,
      "onerilen_uretim": 201
    },
    ...
  ]
}
```

#### `GET /api/tahmin/toplu?ay_sayisi=6`
Generate forecasts for all active products.

**Response:**
```json
{
  "toplam_urun": 12,
  "basarili": 12,
  "urunler": [
    { ... forecast for product 1 ... },
    { ... forecast for product 2 ... },
    ...
  ]
}
```

#### `POST /api/tahmin/kaydet`
Save forecast results to database.

**Body:**
```json
{
  "urun_id": 1,
  "model_versiyonu": "moving_average_v1",
  "forecasts": [
    {
      "ay": "2025-01",
      "tahmini_satis": 183,
      "onerilen_uretim": 201
    },
    ...
  ]
}
```

---

### Model Parameters

#### `GET /api/parametreler`
Get current model parameters.

**Response:**
```json
{
  "id": 1,
  "guvenlik_stok_orani": 10.00,
  "kampanya_etkisi": 1.05,
  "mevsimsellik_aktif": 0,
  "guncelleme_tarihi": "2025-12-16T10:30:00.000Z"
}
```

#### `PUT /api/parametreler`
Update model parameters.

**Body:**
```json
{
  "guvenlik_stok_orani": 15.0,
  "kampanya_etkisi": 1.10,
  "mevsimsellik_aktif": 1
}
```

---

## 🧮 Forecasting Logic

### Algorithm: 3-Month Moving Average

1. **Baseline Calculation:**
   - Use last 3 months of historical data
   - Calculate average: `(Month1 + Month2 + Month3) / 3`

2. **Seasonality (Optional):**
   - Calculate month-of-year factors from historical data
   - Factor = (Avg sales for month M) / (Overall avg)
   - Apply: `Forecast = Baseline × Seasonal Factor`

3. **Rolling Window:**
   - For month 2+, use previous forecast as part of new window
   - Maintains consistency across forecast horizon

4. **Production Recommendation:**
   - `Production = Forecast × (1 + Safety Stock %)`
   - Example: Forecast 180, Safety 10% → Production 198

### Why This Approach?

✅ **Explainable:** Easy for managers to understand  
✅ **Simple:** No complex ML or training required  
✅ **Fast:** Real-time forecast generation  
✅ **Accurate enough:** Captures trends and patterns  

---

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── app.js                      # Express app setup
│   ├── server.js                   # Server entry point
│   ├── db.js                       # MySQL connection pool
│   ├── routes/
│   │   ├── urunlerRoutes.js       # Product routes
│   │   ├── satisRoutes.js         # Sales routes
│   │   ├── dashboardRoutes.js     # Dashboard routes
│   │   ├── tahminRoutes.js        # Forecast routes
│   │   └── parametrelerRoutes.js  # Parameters routes
│   ├── controllers/
│   │   ├── urunlerController.js
│   │   ├── satisController.js
│   │   ├── dashboardController.js
│   │   ├── tahminController.js
│   │   └── parametrelerController.js
│   └── services/
│       └── forecastService.js     # Core forecasting logic
├── package.json
├── .env
└── README.md
```

---

## 🧪 Testing the API

### Using PowerShell:

```powershell
# Test health check
Invoke-WebRequest http://localhost:3000/api/health

# Get all products
Invoke-WebRequest http://localhost:3000/api/urunler

# Get sales for product 1
Invoke-WebRequest "http://localhost:3000/api/satis?urun_id=1"

# Get dashboard summary
Invoke-WebRequest "http://localhost:3000/api/dashboard/ozet?urun_id=1"

# Generate forecast
Invoke-WebRequest "http://localhost:3000/api/tahmin?urun_id=1&ay_sayisi=6"
```

### Using Browser:
Just paste the URLs above into your browser.

---

## 🔧 Troubleshooting

### Port 3000 already in use
```bash
# Change PORT in .env file to 3001 or another available port
PORT=3001
```

### Database connection failed
- Verify XAMPP MySQL is running
- Check database name: `karar-destek-sistemi`
- Verify credentials in `.env`

### Module not found
```bash
# Reinstall dependencies
npm install
```

---

## 📝 Next Steps

1. ✅ Backend API is ready
2. ⏳ Build frontend (HTML + Bootstrap)
3. ⏳ Connect frontend to API
4. ⏳ Test full workflow
5. ⏳ Deploy (optional)

---

**Backend is complete and ready to use!** 🎉
