// Dashboard controller
const db = require('../db');

// Get summary metrics
exports.getSummary = async (req, res) => {
  try {
    const { urun_id } = req.query;
    
    if (urun_id) {
      // Single product summary
      const summary = await getSingleProductSummary(urun_id);
      res.json(summary);
    } else {
      // All products summary
      const summary = await getAllProductsSummary();
      res.json(summary);
    }
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary data' });
  }
};

// Helper: Get summary for a single product
async function getSingleProductSummary(urun_id) {
  // Get product info
  const [product] = await db.query(
    'SELECT * FROM urunler WHERE id = ?',
    [urun_id]
  );
  
  if (product.length === 0) {
    throw new Error('Product not found');
  }
  
  // Get sales statistics
  const [stats] = await db.query(
    `SELECT 
      COUNT(*) as toplam_ay,
      ROUND(AVG(satis_adedi), 2) as aylik_ortalama_satis,
      MIN(satis_adedi) as min_satis,
      MAX(satis_adedi) as max_satis,
      SUM(satis_adedi) as toplam_satis
    FROM satis_verileri
    WHERE urun_id = ?`,
    [urun_id]
  );
  
  // Campaign vs non-campaign averages
  const [kampanyaStats] = await db.query(
    `SELECT 
      AVG(CASE WHEN kampanya_var_mi = 1 THEN satis_adedi END) as kampanya_ortalama,
      AVG(CASE WHEN kampanya_var_mi = 0 THEN satis_adedi END) as normal_ortalama
    FROM satis_verileri
    WHERE urun_id = ?`,
    [urun_id]
  );
  
  // Calculate trend: last 6 months vs same 6-month period previous year
  function formatMonth(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }

  const now = new Date();
  // Build last 6 months array (including current month)
  const last6 = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6.push(formatMonth(d));
  }

  // Same 6-month period one year ago
  const prevYear6 = last6.map(m => {
    const [y, mm] = m.split('-').map(Number);
    return `${y - 1}-${String(mm).padStart(2, '0')}`;
  });

  const [currRows] = await db.query(
    `SELECT AVG(satis_adedi) as ortalama FROM satis_verileri WHERE urun_id = ? AND ay IN (${last6.map(()=>'?').join(',')})`,
    [urun_id, ...last6]
  );

  const [prevRows] = await db.query(
    `SELECT AVG(satis_adedi) as ortalama FROM satis_verileri WHERE urun_id = ? AND ay IN (${prevYear6.map(()=>'?').join(',')})`,
    [urun_id, ...prevYear6]
  );

  const son6 = currRows[0].ortalama || 0;
  const ilk6 = prevRows[0].ortalama || 0;
  const trendYuzde = ilk6 > 0 ? ((son6 - ilk6) / ilk6 * 100) : 0;
  
  let trend = 'stable';
  if (trendYuzde > 5) trend = 'growing';
  else if (trendYuzde < -5) trend = 'declining';
  
  return {
    urun_id: parseInt(urun_id),
    urun_kodu: product[0].urun_kodu,
    urun_adi: product[0].urun_adi,
    ...stats[0],
    kampanya_ortalama: Math.round(kampanyaStats[0].kampanya_ortalama || 0),
    normal_ortalama: Math.round(kampanyaStats[0].normal_ortalama || 0),
    trend,
    trend_yuzde: Math.round(trendYuzde * 10) / 10
  };
}

// Helper: Get summary for all products
async function getAllProductsSummary() {
  // Helper: Format date to YYYY-MM
  function formatMonth(date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${y}-${m}`;
  }

  const now = new Date();
  const last6 = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6.push(formatMonth(d));
  }

  const prevYear6 = last6.map(m => {
    const [y, mm] = m.split('-').map(Number);
    return `${y - 1}-${String(mm).padStart(2, '0')}`;
  });

  // Total sales stats (all time)
  const [totalStats] = await db.query(
    `SELECT 
      COUNT(DISTINCT urun_id) as toplam_urun,
      COUNT(*) as toplam_kayit,
      SUM(satis_adedi) as toplam_satis
    FROM satis_verileri`
  );

  // Last 6 months average for all products
  const [last6AvgStats] = await db.query(
    `SELECT 
      ROUND(AVG(satis_adedi), 2) as ortalama_satis
    FROM satis_verileri 
    WHERE ay IN (${last6.map(()=>'?').join(',')})`,
    [...last6]
  );
  
  // Best seller
  const [bestSeller] = await db.query(
    `SELECT 
      u.urun_adi,
      u.urun_kodu,
      SUM(s.satis_adedi) as toplam_satis
    FROM satis_verileri s
    JOIN urunler u ON s.urun_id = u.id
    GROUP BY u.id, u.urun_adi, u.urun_kodu
    ORDER BY toplam_satis DESC
    LIMIT 1`
  );
  
  // Campaign impact (overall)
  const [kampanyaImpact] = await db.query(
    `SELECT 
      AVG(CASE WHEN kampanya_var_mi = 1 THEN satis_adedi END) as kampanya_ortalama,
      AVG(CASE WHEN kampanya_var_mi = 0 THEN satis_adedi END) as normal_ortalama
    FROM satis_verileri`
  );
  
  // Top 5 products by total sales
  const [topProducts] = await db.query(
    `SELECT 
      u.id as urun_id,
      u.urun_kodu,
      u.urun_adi,
      COUNT(s.id) as ay_sayisi,
      SUM(s.satis_adedi) as toplam_satis,
      ROUND(AVG(s.satis_adedi), 2) as ortalama_satis
    FROM urunler u
    LEFT JOIN satis_verileri s ON u.id = s.urun_id
    WHERE u.aktif_mi = 1
    GROUP BY u.id, u.urun_kodu, u.urun_adi
    ORDER BY toplam_satis DESC
    LIMIT 5`
  );

  // Calculate aggregated trend for ALL products: last 6 months vs same period previous year
  const [currAgg] = await db.query(
    `SELECT AVG(satis_adedi) as ortalama FROM satis_verileri WHERE ay IN (${last6.map(()=>'?').join(',')})`,
    [...last6]
  );

  const [prevAgg] = await db.query(
    `SELECT AVG(satis_adedi) as ortalama FROM satis_verileri WHERE ay IN (${prevYear6.map(()=>'?').join(',')})`,
    [...prevYear6]
  );

  const son6_agg = currAgg[0].ortalama || 0;
  const ilk6_agg = prevAgg[0].ortalama || 0;
  const trendYuzdeAgg = ilk6_agg > 0 ? ((son6_agg - ilk6_agg) / ilk6_agg * 100) : 0;
  let trendAgg = 'stable';
  if (trendYuzdeAgg > 5) trendAgg = 'growing';
  else if (trendYuzdeAgg < -5) trendAgg = 'declining';
  
  return {
    genel: {
      ...totalStats[0],
      ortalama_satis: last6AvgStats[0].ortalama_satis || 0,
      kampanya_ortalama: Math.round(kampanyaImpact[0].kampanya_ortalama || 0),
      normal_ortalama: Math.round(kampanyaImpact[0].normal_ortalama || 0),
      trend: trendAgg,
      trend_yuzde: Math.round(trendYuzdeAgg * 10) / 10
    },
    en_cok_satan: bestSeller[0],
    top_urunler: topProducts
  };
}
  