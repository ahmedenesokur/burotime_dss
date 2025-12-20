// Dashboard routes
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/ozet - Get summary metrics
router.get('/ozet', dashboardController.getSummary);

module.exports = router;
