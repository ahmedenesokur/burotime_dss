// Model parameters controller
const db = require('../db');

// Get current parameters
exports.getParameters = async (req, res) => {
  try {
    const [params] = await db.query(
      'SELECT * FROM model_parametreleri ORDER BY id DESC LIMIT 1'
    );
    
    if (params.length === 0) {
      return res.status(404).json({ error: 'Parameters not found' });
    }
    
    res.json(params[0]);
  } catch (error) {
    console.error('Error fetching parameters:', error);
    res.status(500).json({ error: 'Failed to fetch parameters' });
  }
};

// Update parameters
exports.updateParameters = async (req, res) => {
  try {
    const { guvenlik_stok_orani, kampanya_etkisi, mevsimsellik_aktif } = req.body;
    
    // Get current parameters
    const [current] = await db.query(
      'SELECT id FROM model_parametreleri ORDER BY id DESC LIMIT 1'
    );
    
    if (current.length === 0) {
      return res.status(404).json({ error: 'Parameters not found' });
    }
    
    const id = current[0].id;
    
    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (guvenlik_stok_orani !== undefined) {
      updates.push('guvenlik_stok_orani = ?');
      values.push(guvenlik_stok_orani);
    }
    
    if (kampanya_etkisi !== undefined) {
      updates.push('kampanya_etkisi = ?');
      values.push(kampanya_etkisi);
    }
    
    if (mevsimsellik_aktif !== undefined) {
      updates.push('mevsimsellik_aktif = ?');
      values.push(mevsimsellik_aktif);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No parameters to update' });
    }
    
    values.push(id);
    
    await db.query(
      `UPDATE model_parametreleri SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    // Return updated parameters
    const [updated] = await db.query(
      'SELECT * FROM model_parametreleri WHERE id = ?',
      [id]
    );
    
    res.json({
      message: 'Parameters updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating parameters:', error);
    res.status(500).json({ error: 'Failed to update parameters' });
  }
};
