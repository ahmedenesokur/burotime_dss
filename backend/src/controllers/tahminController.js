// Forecast controller
const forecastService = require('../services/forecastService');

// Generate forecast for a single product
exports.generateForecast = async (req, res) => {
  try {
    const { urun_id, ay_sayisi, guvenlik_orani, kampanya_etkisi, mevsimsellik_aktif } = req.query;
    
    if (!urun_id) {
      return res.status(400).json({ 
        error: 'Missing required parameter: urun_id' 
      });
    }
    
    const options = {
      ay_sayisi: ay_sayisi ? parseInt(ay_sayisi) : undefined,
      guvenlik_orani: guvenlik_orani ? parseFloat(guvenlik_orani) : undefined,
      kampanya_etkisi: kampanya_etkisi ? parseFloat(kampanya_etkisi) : undefined,
      mevsimsellik_aktif: mevsimsellik_aktif !== undefined ? parseInt(mevsimsellik_aktif) : undefined
    };
    
    const forecast = await forecastService.generateProductForecast(urun_id, options);
    
    res.json(forecast);
  } catch (error) {
    console.error('Error generating forecast:', error);
    
    if (error.message.includes('not found') || error.message.includes('Insufficient')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
};

// Generate forecast for all products
exports.generateBulkForecast = async (req, res) => {
  try {
    const { ay_sayisi, guvenlik_orani, kampanya_etkisi, mevsimsellik_aktif } = req.query;
    
    const options = {
      ay_sayisi: ay_sayisi ? parseInt(ay_sayisi) : undefined,
      guvenlik_orani: guvenlik_orani ? parseFloat(guvenlik_orani) : undefined,
      kampanya_etkisi: kampanya_etkisi ? parseFloat(kampanya_etkisi) : undefined,
      mevsimsellik_aktif: mevsimsellik_aktif !== undefined ? parseInt(mevsimsellik_aktif) : undefined
    };
    
    const forecasts = await forecastService.generateBulkForecast(options);
    
    res.json(forecasts);
  } catch (error) {
    console.error('Error generating bulk forecast:', error);
    res.status(500).json({ error: 'Failed to generate bulk forecast' });
  }
};

// Save forecast results to database
exports.saveForecast = async (req, res) => {
  try {
    const { urun_id, forecasts, model_versiyonu } = req.body;
    
    if (!urun_id || !forecasts || !Array.isArray(forecasts)) {
      return res.status(400).json({ 
        error: 'Missing required fields: urun_id, forecasts (array)' 
      });
    }
    
    const result = await forecastService.saveForecast(urun_id, forecasts, model_versiyonu);
    
    res.status(201).json({
      message: 'Forecast saved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error saving forecast:', error);
    res.status(500).json({ error: 'Failed to save forecast' });
  }
};
