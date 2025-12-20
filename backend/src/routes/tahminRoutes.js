// Forecast routes
const express = require('express');
const router = express.Router();
const tahminController = require('../controllers/tahminController');

// GET /api/tahmin - Generate forecast for a product
router.get('/', tahminController.generateForecast);

// GET /api/tahmin/toplu - Generate forecast for all products
router.get('/toplu', tahminController.generateBulkForecast);

// POST /api/tahmin/kaydet - Save forecast results
router.post('/kaydet', tahminController.saveForecast);

module.exports = router;
