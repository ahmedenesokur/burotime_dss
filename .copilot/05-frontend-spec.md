# Frontend Spec (HTML + Bootstrap)

## Pages
1) /index.html (Dashboard)
2) /satis.html (Data entry/listing)

## Dashboard Components (Turkish Labels)
- "Geçmiş Satışlar" table (last 12 months)
- KPIs:
  - "Aylık Ortalama Satış"
  - "Kampanya Dönemi Ortalama Satış"
  - "Kampanyasız Ortalama Satış"
- Charts:
  - Line chart: "Geçmiş vs Tahmin"
  - Bar chart: "Kampanya Etkisi"

## Controls
- Input: "Güvenlik Oranı (%)" default 10
- Input: "Kampanya Etkisi" default 1.05
- Button: "Tahmin Üret (6 Ay)"
- Render result table:
  - Ay | Tahmini Satış | Önerilen Üretim

## Notes
You may use Chart.js via CDN.
Keep UI simple and manager-oriented.
