// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  user: 'prason',         // Using the existing PostgreSQL user
  host: 'localhost',     // Local PostgreSQL server
  database: 'gym_management',  // Database we want to connect to
  password: '',          // No password for local development
  port: 5432,            // Default PostgreSQL port
});

async function testConnection() {
  const client = await pool.connect();
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const res = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    console.log('Current database time:', res.rows[0].now);
    
    // List tables
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    console.log('\n📋 Database tables:');
    tables.rows.forEach(row => console.log(`- ${row.table_name}`));
    
  } catch (err) {
    console.error('❌ Database connection error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

testConnection();
