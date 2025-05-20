import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

// Simple test endpoint to check database connection
router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now');
    res.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Check users table structure
router.get('/check-users-table', async (req, res) => {
  try {
    // Check if users table exists
    const tableExists = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
    );
    
    if (!tableExists.rows[0].exists) {
      return res.status(404).json({
        status: 'error',
        message: 'Users table does not exist',
        tableExists: false
      });
    }
    
    // Get table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    // Get sample data
    const sampleData = await pool.query('SELECT * FROM users LIMIT 5');
    
    res.json({
      status: 'success',
      tableExists: true,
      columns: columns.rows,
      sampleData: sampleData.rows
    });
  } catch (error) {
    console.error('Error checking users table:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error checking users table',
      error: error.message
    });
  }
});

// Test admin login endpoint
router.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Check if admin exists
    const admin = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );

    if (admin.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // In a real app, you would verify the password hash here
    // For testing, we'll just return success if the admin exists
    res.json({
      status: 'success',
      message: 'Login successful',
      admin: {
        id: admin.rows[0].id,
        email: admin.rows[0].email,
        role: admin.rows[0].role
      }
    });
  } catch (error) {
    console.error('Login test error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Login failed',
      error: error.message
    });
  }
});

export default router;
