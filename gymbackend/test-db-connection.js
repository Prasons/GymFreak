import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  user: 'prason',
  host: 'localhost',
  database: 'gym_management',
  password: '',  // Add password here if you have one
  port: 5432,
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
