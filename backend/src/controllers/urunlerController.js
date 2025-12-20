// Products controller
const db = require('../db');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT * FROM urunler WHERE aktif_mi = 1 ORDER BY urun_kodu ASC'
    );
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await db.query(
      'SELECT * FROM urunler WHERE id = ? AND aktif_mi = 1',
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};
