# API Spec (Node.js + Express)

Base URL: http://localhost:3000/api

## Endpoints

### GET /satis
Returns historical sales data (ordered by ay asc).
Response:
[
  { "ay": "2024-01", "satis_adedi": 120, "kampanya_var_mi": 0 },
  ...
]

### POST /satis
Insert a monthly sales record.
Body:
{ "ay": "2024-02", "satis_adedi": 140, "kampanya_var_mi": 1 }

### GET /dashboard/ozet
Returns computed metrics:
- aylik_ortalama_satis
- kampanya_ortalama_satis
- normal_ortalama_satis
- trend_info (optional)

### GET /tahmin?ay_sayisi=6
Generates forecast for next N months (default 6).
Query params:
- ay_sayisi (int)
- guvenlik_orani (optional, percent)
- kampanya_etkisi (optional multiplier)

Response:
{
  "model": "moving_average_v1",
  "girdiler": { "ay_sayisi": 6, "guvenlik_orani": 10, "kampanya_etkisi": 1.05 },
  "sonuclar": [
    { "ay": "2025-01", "tahmini_satis": 180, "onerilen_uretim": 198 },
    ...
  ]
}

### POST /tahmin/kaydet (optional)
Persists forecast results into tahmin_sonuclari.
