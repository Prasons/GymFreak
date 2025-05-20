import pool from '../config/db.js';

async function listTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Tables in the database:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('Error listing tables:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
listTables();
