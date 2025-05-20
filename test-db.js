const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool instance
const pool = new Pool({
  user: 'prason',
  host: 'localhost',
  database: 'gym_management',
  password: '', // Add password here if you have one
  port: 5432,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0].now);
    
    // List all tables
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    console.log('\nTables in the database:');
    console.table(tables.rows);
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1);
  }
}

testConnection();
