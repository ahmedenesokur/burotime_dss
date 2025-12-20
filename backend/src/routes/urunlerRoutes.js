// Products routes
const express = require('express');
const router = express.Router();
const urunlerController = require('../controllers/urunlerController');

// GET /api/urunler - Get all products
router.get('/', urunlerController.getAllProducts);

// GET /api/urunler/:id - Get single product
router.get('/:id', urunlerController.getProductById);

module.exports = router;
