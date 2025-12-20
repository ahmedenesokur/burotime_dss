# Database Setup Instructions

## Prerequisites
- XAMPP (Apache + MySQL) running
- phpMyAdmin accessible at http://localhost/phpmyadmin
- Database `karar-destek-sistemi` already created

## Installation Steps

### 1. Open phpMyAdmin
Navigate to: http://localhost/phpmyadmin

### 2. Select Database
Click on `karar-destek-sistemi` from the left sidebar.

### 3. Run Schema
- Go to the **SQL** tab
- Copy the contents of `schema.sql`
- Paste into the SQL editor
- Click **Go** to execute

This will create 3 tables:
- ✅ `satis_verileri` (Historical sales data)
- ✅ `tahmin_sonuclari` (Forecast results)
- ✅ `model_parametreleri` (Model parameters)

### 4. Run Seed Data
- Still in the **SQL** tab
- Copy the contents of `seed.sql`
- Paste into the SQL editor
- Click **Go** to execute

This will populate:
- ✅ 12 office furniture products (BT-001 to BT-012)
- ✅ 288 sales records (12 products × 24 months)
- ✅ Default model parameters (10% safety stock, 1.05 campaign effect)

### 5. Verify Installation

Run these verification queries in phpMyAdmin:

**Check products:**
```sql
SELECT COUNT(*) AS toplam_urun FROM urunler;
-- Expected: 12
```

**Check sales records:**
```sql
SELECT COUNT(*) AS toplam_kayit FROM satis_verileri;
-- Expected: 288
```

**View product sales summary:**
```sql
SELECT 
    u.urun_adi,
    COUNT(s.id) AS ay_sayisi,
    ROUND(AVG(s.satis_adedi), 2) AS ortalama_satis,
    SUM(s.satis_adedi) AS toplam_satis
FROM urunler u
LEFT JOIN satis_verileri s ON u.id = s.urun_id
GROUP BY u.id, u.urun_adi
ORDER BY toplam_satis DESC;
```

## Database Structure

### urunler (Products)
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| urun_kodu | VARCHAR(20) | Product code (BT-001) |
| urun_adi | VARCHAR(100) | Product name |
| aktif_mi | TINYINT(1) | Active flag (1/0) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### satis_verileri (Historical Sales)
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| urun_id | INT | Foreign key → urunler.id |
| ay | VARCHAR(7) | Month (YYYY-MM format) |
| satis_adedi | INT | Sales count for this product |
| kampanya_var_mi | TINYINT(1) | Campaign flag (0/1) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Update timestamp |

### tahmin_sonuclari (Forecast Results)
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| urun_id | INT | Foreign key → urunler.id |
| ay | VARCHAR(7) | Forecast month |
| tahmini_satis | INT | Predicted sales for this product |
| onerilen_uretim | INT | Recommended production |
| model_versiyonu | VARCHAR(50) | Model version |
| created_at | DATETIME | Creation timestamp |

### model_parametreleri (Model Parameters)
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| guvenlik_stok_orani | DECIMAL(5,2) | Safety stock % |
| kampanya_etkisi | DECIMAL(5,2) | Campaign multiplier |
| mevsimsellik_aktif | TINYINT(1) | Seasonality ON/OFF |
| guncelleme_tarihi | DATETIME | Update timestamp |

## Connection Details for Backend

```javascript
{
  host: 'localhost',
  user: 'root',
  password: '',  // Default XAMPP has no password
  database: 'karar-destek-sistemi',
  port: 3306
}
```

## Troubleshooting

### Issue: "Database does not exist"
**Solution:** Create it manually:
```sql
CREATE DATABASE `karar-destek-sistemi` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_turkish_ci;
```

### Issue: "Table already exists"
**Solution:** Drop tables first:
```sql
DROP TABLE IF EXISTS `tahmin_sonuclari`;
DROP TABLE IF EXISTS `satis_verileri`;
DROP TABLE IF EXISTS `model_parametreleri`;
```
Then re-run `schema.sql`.

### Issue: Turkish characters not displaying correctly
**Solution:** Ensure phpMyAdmin is using utf8mb4:
- Check database collation: `utf8mb4_turkish_ci`
- Check table collation: `utf8mb4_turkish_ci`

## Next Steps

After database setup:
1. ✅ Verify all tables exist
2. ✅ Verify sample data is loaded
3. ➡️ Proceed with backend implementation
4. ➡️ Test API endpoints
5. ➡️ Build frontend dashboard
