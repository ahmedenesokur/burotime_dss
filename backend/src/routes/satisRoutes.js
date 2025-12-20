// Sales routes
const express = require('express');
const router = express.Router();
const satisController = require('../controllers/satisController');

// GET /api/satis - Get all sales (with optional product filter)
router.get('/', satisController.getAllSales);

// POST /api/satis - Add new sales record
router.post('/', satisController.addSales);

module.exports = router;
