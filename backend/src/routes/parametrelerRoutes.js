// Model parameters routes
const express = require('express');
const router = express.Router();
const parametrelerController = require('../controllers/parametrelerController');

// GET /api/parametreler - Get current parameters
router.get('/', parametrelerController.getParameters);

// PUT /api/parametreler - Update parameters
router.put('/', parametrelerController.updateParameters);

module.exports = router;
