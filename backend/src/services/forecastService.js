// Forecasting service - Core business logic
const db = require('../db');

/**
 * Generate forecast for a single product
 * @param {number} urun_id - Product ID
 * @param {number} ay_sayisi - Number of months to forecast (default 6)
 * @param {number} guvenlik_orani - Safety stock percentage (default from DB)
 * @param {boolean} mevsimsellik_aktif - Enable seasonality (default from DB)
 * @returns {Object} Forecast results
 */
async function generateProductForecast(urun_id, options = {}) {
  // Get parameters (use provided or fetch from DB)
  const params = await getParameters(options);
  
  // Get historical sales data for this product
  const salesData = await getProductSalesData(urun_id);
  
  if (salesData.length < 3) {
    throw new Error('Insufficient historical data (minimum 3 months required)');
  }
  
  // Get product info
  const [product] = await db.query(
    'SELECT urun_kodu, urun_adi FROM urunler WHERE id = ?',
    [urun_id]
  );
  
  if (product.length === 0) {
    throw new Error('Product not found');
  }
  
  // Calculate seasonality factors (if enabled)
  const seasonalityFactors = params.mevsimsellik_aktif 
    ? calculateSeasonality(salesData) 
    : {};
  
  // Calculate recent trend for more realistic forecasts
  const trendSlope = calculateTrend(salesData.slice(-6)); // Use last 6 months for trend
  
  // Generate forecasts
  const forecasts = [];
  let lastMonths = salesData.slice(-3); // Start with last 3 months
  
  for (let i = 0; i < params.ay_sayisi; i++) {
    const nextMonth = getNextMonth(salesData[salesData.length - 1 + i]?.ay || forecasts[i - 1]?.ay);
    
    // Calculate baseline using 3-month moving average
    let baseline = calculateMovingAverage(lastMonths);
    
    // Add trend continuation for more realism (10% of trend per future month)
    if (trendSlope !== 0) {
      baseline += (trendSlope * 0.1 * (i + 1));
    }
    
    // Apply seasonality if enabled
    const monthNumber = parseInt(nextMonth.split('-')[1]);
    const seasonalFactor = seasonalityFactors[monthNumber] || 1.0;
    const withSeasonality = baseline * seasonalFactor;
    
    // Apply campaign effect (optional - using historical campaign vs normal ratio)
    // For simplicity, we don't predict future campaigns, just use the baseline
    const tahmini_satis = Math.round(Math.max(0, withSeasonality)); // Ensure non-negative
    
    // Calculate production recommendation
    const onerilen_uretim = Math.round(tahmini_satis * (1 + params.guvenlik_orani / 100));
    
    forecasts.push({
      ay: nextMonth,
      tahmini_satis,
      onerilen_uretim
    });
    
    // Update rolling window: add forecast as new "historical" data
    lastMonths = [
      ...lastMonths.slice(1),
      { ay: nextMonth, satis_adedi: tahmini_satis }
    ];
  }
  
  return {
    urun_id: parseInt(urun_id),
    urun_kodu: product[0].urun_kodu,
    urun_adi: product[0].urun_adi,
    model: 'moving_average_v1',
    girdiler: {
      ay_sayisi: params.ay_sayisi,
      guvenlik_orani: params.guvenlik_orani,
      mevsimsellik_aktif: params.mevsimsellik_aktif
    },
    sonuclar: forecasts,
    // Toplam tahmini satış
    'Tahmini Toplam Satış (6 Ay)': forecasts.reduce((sum, f) => sum + (f.tahmini_satis || 0), 0),
    metadata: {
      trend_slope: trendSlope,
      seasonality_enabled: params.mevsimsellik_aktif,
      data_points: salesData.length,
      aciklama: params.mevsimsellik_aktif 
        ? 'Tahmin, 3 aylık hareketli ortalama, mevsimsel faktörler ve trend eğilimi kullanılarak hesaplanmıştır.'
        : 'Tahmin, 3 aylık hareketli ortalama ve trend eğilimi kullanılarak hesaplanmıştır. Hareketli ortalama yöntemi talebi düzleştirir ve kısa vadeli dalgalanmaları azaltır.'
    }
  };
}

/**
 * Generate forecasts for all active products
 */
async function generateBulkForecast(options = {}) {
  const [products] = await db.query(
    'SELECT id, urun_kodu, urun_adi FROM urunler WHERE aktif_mi = 1'
  );
  
  const results = [];
  
  for (const product of products) {
    try {
      const forecast = await generateProductForecast(product.id, options);
      results.push(forecast);
    } catch (error) {
      console.error(`Error forecasting product ${product.urun_kodu}:`, error.message);
      results.push({
        urun_id: product.id,
        urun_kodu: product.urun_kodu,
        urun_adi: product.urun_adi,
        error: error.message
      });
    }
  }
  
  return {
    toplam_urun: products.length,
    basarili: results.filter(r => !r.error).length,
    urunler: results
  };
}

/**
 * Save forecast results to database
 */
async function saveForecast(urun_id, forecasts, model_versiyonu = 'moving_average_v1') {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    for (const forecast of forecasts) {
      await connection.query(
        `INSERT INTO tahmin_sonuclari 
         (urun_id, ay, tahmini_satis, onerilen_uretim, model_versiyonu)
         VALUES (?, ?, ?, ?, ?)`,
        [urun_id, forecast.ay, forecast.tahmini_satis, forecast.onerilen_uretim, model_versiyonu]
      );
    }
    
    await connection.commit();
    return { success: true, count: forecasts.length };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get parameters (from options or database)
 */
async function getParameters(options) {
  const [dbParams] = await db.query(
    'SELECT * FROM model_parametreleri ORDER BY id DESC LIMIT 1'
  );
  
  const defaults = {
    guvenlik_stok_orani: 10.0,
    mevsimsellik_aktif: 1
  };

  // Prefer explicit `options` first. For `mevsimsellik_aktif` we enforce
  // the default ON (1) unless the caller explicitly passes a value.
  // We still read DB for `guvenlik_stok_orani` fallback only.
  const dbDefaults = dbParams.length > 0 ? dbParams[0] : {};

  return {
    ay_sayisi: options.ay_sayisi || 6,
    guvenlik_orani: options.guvenlik_orani !== undefined ? options.guvenlik_orani : (dbDefaults.guvenlik_stok_orani || defaults.guvenlik_stok_orani),
    mevsimsellik_aktif: options.mevsimsellik_aktif !== undefined ? options.mevsimsellik_aktif : defaults.mevsimsellik_aktif
  };
}

/**
 * Get historical sales data for a product
 */
async function getProductSalesData(urun_id) {
  const [sales] = await db.query(
    'SELECT ay, satis_adedi FROM satis_verileri WHERE urun_id = ? ORDER BY ay ASC',
    [urun_id]
  );
  return sales;
}

/**
 * Calculate 3-month moving average
 */
function calculateMovingAverage(data) {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, item) => acc + item.satis_adedi, 0);
  return sum / data.length;
}

/**
 * Calculate seasonality factors by month
 * Factor = (Average sales for month M) / (Overall average sales)
 * Amplified for more visible effects
 */
function calculateSeasonality(salesData) {
  // Group by month number (01-12)
  const monthGroups = {};
  
  salesData.forEach(item => {
    const monthNum = parseInt(item.ay.split('-')[1]);
    if (!monthGroups[monthNum]) {
      monthGroups[monthNum] = [];
    }
    monthGroups[monthNum].push(item.satis_adedi);
  });
  
  // Calculate overall average
  const overallAvg = salesData.reduce((sum, item) => sum + item.satis_adedi, 0) / salesData.length;
  
  // Calculate factor for each month
  const factors = {};
  for (const [month, values] of Object.entries(monthGroups)) {
    const monthAvg = values.reduce((a, b) => a + b, 0) / values.length;
    let factor = monthAvg / overallAvg;
    
    // Amplify seasonality by 30% for more realistic variance
    const deviation = factor - 1.0;
    factor = 1.0 + (deviation * 1.3);
    
    // Clamp between 0.75 and 1.25 for realism
    factors[parseInt(month)] = Math.max(0.75, Math.min(1.25, factor));
  }
  
  return factors;
}

/**
 * Calculate trend slope from recent data
 * Returns average change per month
 */
function calculateTrend(recentData) {
  if (recentData.length < 2) return 0;
  
  const values = recentData.map(d => d.satis_adedi);
  let sumDiff = 0;
  
  for (let i = 1; i < values.length; i++) {
    sumDiff += (values[i] - values[i - 1]);
  }
  
  return sumDiff / (values.length - 1);
}

/**
 * Get next month in YYYY-MM format
 */
function getNextMonth(currentMonth) {
  if (!currentMonth) {
    // If no month provided, use current date
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  
  const [year, month] = currentMonth.split('-').map(Number);
  
  if (month === 12) {
    return `${year + 1}-01`;
  } else {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  }
}

module.exports = {
  generateProductForecast,
  generateBulkForecast,
  saveForecast
};
