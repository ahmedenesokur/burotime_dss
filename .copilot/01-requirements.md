# Requirements (Functional + Non-Functional)

## Functional Requirements
FR-1: Import/insert historical sales data by month (Ay) with sales count (Satış Adedi) and campaign flag (Kampanya Var mı 0/1).
FR-2: List historical sales as a table.
FR-3: Compute monthly average sales (Aylık Ortalama Satış).
FR-4: Compute seasonality factor (Mevsimsellik Katsayısı) per month (optional but recommended).
FR-5: Forecast next 6 months (6 Aylık Satış Tahmini).
FR-6: Recommend production quantity for each forecasted month (Önerilen Üretim Miktarı).
FR-7: Dashboard charts:
- Line chart: historical sales + forecast
- Bar chart: campaign vs non-campaign sales (or monthly campaign effect)
FR-8: Support “what-if” parameter(s) (simple):
- production safety factor (%) OR
- campaign impact multiplier

## Non-Functional Requirements
NFR-1: UI and DB labels in Turkish.
NFR-2: Simple, explainable model (no complex ML required).
NFR-3: Clear code structure (MVC-ish).
NFR-4: Works locally with MySQL + Node + static frontend.
