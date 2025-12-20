# Forecasting Logic (Explainable)

## Goal
Forecast next 6 months based on:
- historical monthly sales (satis_adedi)
- optional seasonality
- optional campaign impact

## Recommended Simple Algorithm (v1)
1) Sort historical data by month.
2) Compute Moving Average:
   - use last 3 months average as baseline for next month
   - roll forward (each predicted month becomes part of next window)
3) Campaign impact (simple):
   - if manager sets kampanya_etkisi (e.g., 1.10), apply it only if forecast month is marked as "campaign month" (optional)
   - OR compute historical campaign avg vs non-campaign avg and derive a factor
4) Production recommendation:
   onerilen_uretim = round(tahmini_satis * (1 + guvenlik_orani/100))

## Seasonality (optional)
Compute month-of-year factors:
- For each month number (01..12), compute avg sales for that month / overall avg
- Apply factor to baseline when forecasting same month number.

## Important
Keep it simple enough to explain in presentation.
No heavy ML required.
