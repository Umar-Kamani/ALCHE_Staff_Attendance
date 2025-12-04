import pool from './db';
import bcrypt from 'bcrypt';

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migration...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'security', 'hr')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create employees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        employee_id VARCHAR(100) UNIQUE NOT NULL,
        department VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        vehicle_plate_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Employees table created');

    // Create attendance_records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        employee_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time_in TIME NOT NULL,
        time_out TIME,
        plate_number VARCHAR(50),
        is_guest BOOLEAN DEFAULT FALSE,
        guest_purpose VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Attendance records table created');

    // Create parking_config table
    await client.query(`
      CREATE TABLE IF NOT EXISTS parking_config (
        id SERIAL PRIMARY KEY,
        total_spaces INTEGER NOT NULL,
        occupied_spaces INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Parking config table created');

    // Insert default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (username, password, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', hashedPassword, 'admin']);
    console.log('✓ Default admin user created');

    // Insert default parking config
    await client.query(`
      INSERT INTO parking_config (total_spaces, occupied_spaces)
      SELECT 100, 0
      WHERE NOT EXISTS (SELECT 1 FROM parking_config)
    `);
    console.log('✓ Default parking config created');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
