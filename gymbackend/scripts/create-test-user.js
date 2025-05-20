import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

async function createTestUser() {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [testUser.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('Test user already exists:');
      console.log({
        id: existingUser.rows[0].id,
        name: existingUser.rows[0].name,
        email: existingUser.rows[0].email,
        created_at: existingUser.rows[0].created_at
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);

    // Insert test user
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [testUser.name, testUser.email, hashedPassword]
    );

    console.log('Test user created successfully:');
    console.log(result.rows[0]);
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
createTestUser();
