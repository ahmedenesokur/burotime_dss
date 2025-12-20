# Data Model (MySQL) — Turkish Names Required

## Tables

### 1) satis_verileri
Stores historical monthly sales data.

Columns:
- id (PK, INT, AI)
- ay (VARCHAR(7))  // format: YYYY-MM (e.g., 2024-01)
- satis_adedi (INT)
- kampanya_var_mi (TINYINT) // 0 or 1
- created_at (DATETIME)
- updated_at (DATETIME)

Constraints:
- UNIQUE(ay) to avoid duplicate months (optional).

### 2) tahmin_sonuclari
Stores generated forecast results (optional: persist forecasts, or compute on the fly).

Columns:
- id (PK, INT, AI)
- ay (VARCHAR(7))           // forecasted month YYYY-MM
- tahmini_satis (INT)
- onerilen_uretim (INT)
- model_versiyonu (VARCHAR(50)) // e.g. "moving_average_v1"
- created_at (DATETIME)

### 3) model_parametreleri (optional but useful)
Stores manager-defined parameters.

Columns:
- id (PK)
- guvenlik_stok_orani (DECIMAL(5,2))  // e.g. 10.00 means +10%
- kampanya_etkisi (DECIMAL(5,2))      // e.g. 1.10 means +10%
- guncelleme_tarihi (DATETIME)

## Notes
- Turkish table/column names are mandatory.
- Backend code may map them to English DTOs if needed.
