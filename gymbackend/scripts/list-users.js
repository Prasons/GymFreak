import pool from '../config/db.js';

async function listUsers() {
  try {
    // List all users
    const users = await pool.query('SELECT id, name, email, created_at FROM users');
    
    console.log('Users in database:');
    console.table(users.rows);
    
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
listUsers();
