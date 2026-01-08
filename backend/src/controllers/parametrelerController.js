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
    
    // Return stored parameters, but ensure `mevsimsellik_aktif` defaults
    // to 1 (ON) when the DB value is missing. If DB has 0 or 1, return
    // that value so the user can toggle it via the API/UI.
    const out = { ...params[0] };

    if (out.mevsimsellik_aktif === undefined || out.mevsimsellik_aktif === null) {
      out.mevsimsellik_aktif = 1; // default ON
    } else {
      // Normalize to 0 or 1
      out.mevsimsellik_aktif = out.mevsimsellik_aktif ? 1 : 0;
    }

    res.json(out);
  } catch (error) {
    console.error('Error fetching parameters:', error);
    res.status(500).json({ error: 'Failed to fetch parameters' });
  }
};

// Update parameters
exports.updateParameters = async (req, res) => {
  try {
    const { guvenlik_stok_orani, mevsimsellik_aktif } = req.body;
    
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
    
    // kampanya_etkisi removed from parameters
    
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
