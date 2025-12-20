# Product-Based System Design

## 🎯 Overview

The system now supports **12 different office furniture products**, with sales forecasting and production planning calculated **per product**.

---

## 📊 Database Changes

### New Table: `urunler` (Products)
- Stores 12 office furniture products
- Each product has: code (BT-001), name (Turkish), active status
- Examples: Çalışma Masası, Ofis Koltuğu, Toplantı Masası, etc.

### Updated: `satis_verileri` (Sales Data)
- **Before:** Global sales per month (24 records)
- **After:** Product-based sales per month (288 records = 12 products × 24 months)
- Added `urun_id` foreign key
- Unique constraint: `(urun_id, ay)` - no duplicate product+month

### Updated: `tahmin_sonuclari` (Forecast Results)
- **Before:** Global forecast per month
- **After:** Product-based forecast per month
- Added `urun_id` foreign key
- Forecasts generated separately for each product

---

## 🏭 Product Patterns (Realistic Diversity)

Each product has a **unique sales pattern** to simulate real business:

| Product Code | Name | Volume | Pattern Type | Characteristics |
|--------------|------|--------|--------------|-----------------|
| **BT-001** | Çalışma Masası | High | 📈 Growing | +8% YoY growth |
| **BT-002** | Ofis Koltuğu | High | ➡️ Stable | Best seller, consistent |
| **BT-003** | Toplantı Masası | Medium | 🌊 Seasonal | Q4 peaks |
| **BT-004** | Dosya Dolabı | Medium | 📉 Declining | -7% YoY (digital transition) |
| **BT-005** | Kitaplık | Low | 🌊 Seasonal | Q4 peaks |
| **BT-006** | Bilgisayar Masası | High | 📈 Growing | +11% YoY (remote work) |
| **BT-007** | Tekerlekli Sandalye | High | ➡️ Stable | Steady demand |
| **BT-008** | Koltuk Takımı | Low | 🌊 Seasonal | Strong Q4 (62% in Q4) |
| **BT-009** | Ofis Seperatörü | Medium | 📈 Growing | +17% YoY (open offices) |
| **BT-010** | Yönetici Masası | Low | 💎 Premium | Low volume, stable |
| **BT-011** | Bekleme Koltuğu | Medium | ➡️ Stable | Consistent |
| **BT-012** | Arşiv Dolabı | Low | 📉 Declining | -12% YoY (digitalization) |

**Total Sales Across All Products:**
- 2023: 16,728 units
- 2024: 17,328 units
- Growth: +3.6% YoY

---

## 🔄 Forecasting Logic (Per Product)

### Key Principle
**Each product is forecasted independently using its own historical data.**

### Algorithm (Same, Applied Per Product)
1. **Filter data by product:** `SELECT * FROM satis_verileri WHERE urun_id = ?`
2. **Calculate moving average:** Last 3 months of THAT product
3. **Apply seasonality (optional):** Based on THAT product's monthly patterns
4. **Campaign adjustment:** Use THAT product's campaign impact
5. **Production recommendation:** `Forecast × (1 + Safety %)`

### Example Flow
```
User selects: BT-001 (Çalışma Masası)
└─ Fetch last 24 months for BT-001
└─ Calculate 3-month moving average: (Oct, Nov, Dec 2024) = (170 + 175 + 195) / 3 = 180
└─ Apply seasonality for January: factor = 0.92 (historically low)
└─ Forecast Jan 2025 = 180 × 0.92 = 166
└─ Production = 166 × 1.10 (10% safety) = 183 units
```

---

## 🖥️ Dashboard Changes

### 1️⃣ Product Selection Dropdown
```html
<select id="urunSelect">
  <option value="">-- Tüm Ürünler (Özet) --</option>
  <option value="1">BT-001 - Çalışma Masası</option>
  <option value="2">BT-002 - Ofis Koltuğu</option>
  ...
</select>
```

### 2️⃣ Two Dashboard Modes

#### **Mode A: All Products Summary (Default)**
- Shows **aggregated metrics** across all products
- KPIs:
  - Toplam Aylık Ortalama Satış (all products combined)
  - En Çok Satan Ürün (best seller)
  - Toplam Tahmini Üretim (sum of all forecasts)
- Chart: **Stacked bar chart** showing all products over time
- Table: Top 5 products by forecast volume

#### **Mode B: Single Product Detail (User Selects)**
- Shows **detailed analysis** for ONE product
- KPIs:
  - Ürün Adı
  - Aylık Ortalama Satış (this product)
  - Trend (Growing / Stable / Declining)
  - Kampanya Etkisi (for this product)
- Charts:
  - **Line chart:** Historical sales + 6-month forecast (this product only)
  - **Bar chart:** Campaign vs non-campaign months (this product)
- Table: Month-by-month forecast with production recommendations

---

## 📡 API Endpoint Changes

### Updated Endpoints

#### **GET /api/urunler**
Returns all products.
```json
[
  { "id": 1, "urun_kodu": "BT-001", "urun_adi": "Çalışma Masası", "aktif_mi": 1 },
  ...
]
```

#### **GET /api/satis?urun_id=1**
Returns sales for a specific product (optional filter).
```json
[
  { "ay": "2024-01", "satis_adedi": 130, "kampanya_var_mi": 0, "urun_adi": "Çalışma Masası" },
  ...
]
```

#### **GET /api/dashboard/ozet?urun_id=1**
Returns summary metrics (all products or filtered by product).
```json
{
  "urun_id": 1,
  "urun_adi": "Çalışma Masası",
  "aylik_ortalama_satis": 145.8,
  "kampanya_ortalama": 163.8,
  "normal_ortalama": 138.9,
  "trend": "growing",
  "trend_yuzde": 8.2
}
```

#### **GET /api/tahmin?urun_id=1&ay_sayisi=6**
Generates forecast for a specific product.
```json
{
  "urun_id": 1,
  "urun_adi": "Çalışma Masası",
  "model": "moving_average_v1",
  "girdiler": { "ay_sayisi": 6, "guvenlik_orani": 10 },
  "sonuclar": [
    { "ay": "2025-01", "tahmini_satis": 166, "onerilen_uretim": 183 },
    ...
  ]
}
```

#### **GET /api/tahmin/toplu?ay_sayisi=6**
Generates forecasts for **all active products** at once.
```json
{
  "toplam_urun": 12,
  "urunler": [
    {
      "urun_id": 1,
      "urun_adi": "Çalışma Masası",
      "sonuclar": [...]
    },
    ...
  ]
}
```

---

## 🎨 Frontend Pages

### 1. **Dashboard (index.html)**
- Product dropdown filter
- Two modes: Summary vs Single Product
- Dynamic charts based on selection
- "Tüm Ürünler İçin Tahmin Üret" button (bulk forecast)

### 2. **Sales Data (satis.html)**
- Form: Add sales for specific product + month
- Table: View/edit all sales records
- Filter by product
- Bulk import option (Excel/CSV)

### 3. **Products (urunler.html)** *(NEW - Optional)*
- List all products
- Add/edit/deactivate products
- View product statistics

---

## ✅ Key Design Decisions

### ✅ Why Product-Based?
- **Realistic:** Companies manufacture multiple products
- **Better decisions:** Different products need different strategies
- **Scalable:** Easy to add new products

### ✅ Why NOT Over-Engineer?
- **No inventory table:** This is DSS, not ERP
- **No customer/order tables:** Focus on planning, not transactions
- **No complex ML:** Moving average is sufficient and explainable

### ✅ Why Foreign Keys?
- **Data integrity:** Prevent orphaned records
- **Referential consistency:** CASCADE deletes
- **Query optimization:** Indexed joins

---

## 🚀 Next Steps

1. ✅ **Database schema updated** (with products)
2. ✅ **Seed data created** (12 products, 288 records)
3. ⏳ **Backend implementation** (per-product forecasting)
4. ⏳ **Frontend with product selector**
5. ⏳ **Testing with real data patterns**

---

## 📈 Expected Outcomes

### Manager Benefits
- See which products are growing vs declining
- Allocate resources based on product demand
- Identify seasonal products for planning
- Compare campaign effectiveness per product

### Example Insights from Seed Data
1. **BT-006 (Bilgisayar Masası)** is growing fast (+11%) → Increase production capacity
2. **BT-004 (Dosya Dolabı)** is declining (-7%) → Reduce inventory, consider phasing out
3. **BT-008 (Koltuk Takımı)** has strong Q4 seasonality → Stock up before holidays
4. **BT-002 (Ofis Koltuğu)** is the best seller → Ensure consistent supply chain

---

**This design keeps the system simple, realistic, and manager-oriented! ✅**
