// Sales controller
const db = require('../db');

// Get all sales (with optional product filter)
exports.getAllSales = async (req, res) => {
  try {
    const { urun_id } = req.query;
    
    let query = `
      SELECT 
        s.*,
        u.urun_kodu,
        u.urun_adi
      FROM satis_verileri s
      JOIN urunler u ON s.urun_id = u.id
    `;
    
    const params = [];
    
    if (urun_id) {
      query += ' WHERE s.urun_id = ?';
      params.push(urun_id);
    }
    
    query += ' ORDER BY s.ay ASC';
    
    const [sales] = await db.query(query, params);
    
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
};

// Add new sales record
exports.addSales = async (req, res) => {
  try {
    const { urun_id, ay, satis_adedi, kampanya_var_mi } = req.body;
    
    // Validation
    if (!urun_id || !ay || !satis_adedi) {
      return res.status(400).json({ 
        error: 'Missing required fields: urun_id, ay, satis_adedi' 
      });
    }
    
    // Check if product exists
    const [product] = await db.query(
      'SELECT id FROM urunler WHERE id = ? AND aktif_mi = 1',
      [urun_id]
    );
    
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Insert sales record
    const [result] = await db.query(
      `INSERT INTO satis_verileri (urun_id, ay, satis_adedi, kampanya_var_mi) 
       VALUES (?, ?, ?, ?)`,
      [urun_id, ay, satis_adedi, kampanya_var_mi || 0]
    );
    
    res.status(201).json({
      message: 'Sales record added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding sales:', error);
    
    // Handle duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        error: 'Sales record already exists for this product and month' 
      });
    }
    
    res.status(500).json({ error: 'Failed to add sales record' });
  }
};
