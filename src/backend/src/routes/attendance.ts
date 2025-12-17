import { Router } from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all attendance records
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = 'SELECT * FROM attendance_records';
    const params: any[] = [];

    if (startDate && endDate) {
      query += ' WHERE date BETWEEN $1 AND $2';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY date DESC, time_in DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get attendance records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create attendance record (entry)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { employee_id, employee_name, date, time_in, plate_number, is_guest, guest_purpose } = req.body;

    if (!employee_name || !date || !time_in) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO attendance_records (employee_id, employee_name, date, time_in, plate_number, is_guest, guest_purpose)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [employee_id || null, employee_name, date, time_in, plate_number || null, is_guest || false, guest_purpose || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create attendance record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update attendance record (exit)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { time_out } = req.body;

    if (!time_out) {
      return res.status(400).json({ error: 'time_out is required' });
    }

    const result = await pool.query(
      `UPDATE attendance_records
       SET time_out = $1
       WHERE id = $2
       RETURNING *`,
      [time_out, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update attendance record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete attendance record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM attendance_records WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Delete attendance record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
