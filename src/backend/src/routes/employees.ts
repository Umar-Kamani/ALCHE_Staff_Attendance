import { Router } from 'express';
import pool from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM employees ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create employee
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, employee_id, department, position, vehicle_plate_number } = req.body;

    if (!name || !employee_id || !department || !position) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO employees (name, employee_id, department, position, vehicle_plate_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, employee_id, department, position, vehicle_plate_number || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Employee ID already exists' });
    }
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, employee_id, department, position, vehicle_plate_number } = req.body;

    const result = await pool.query(
      `UPDATE employees
       SET name = $1, employee_id = $2, department = $3, position = $4, vehicle_plate_number = $5
       WHERE id = $6
       RETURNING *`,
      [name, employee_id, department, position, vehicle_plate_number || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Employee ID already exists' });
    }
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM employees WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
