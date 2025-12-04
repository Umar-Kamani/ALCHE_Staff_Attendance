import { Router } from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get parking config
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parking_config ORDER BY id LIMIT 1');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parking config not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get parking config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update parking config
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { total_spaces, occupied_spaces } = req.body;

    if (total_spaces === undefined || occupied_spaces === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `UPDATE parking_config
       SET total_spaces = $1, occupied_spaces = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = (SELECT id FROM parking_config ORDER BY id LIMIT 1)
       RETURNING *`,
      [total_spaces, occupied_spaces]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parking config not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update parking config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
