import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const ADMIN_EMAIL = 'admin@example.com';
const NEW_PASSWORD = 'admin123';

async function resetAdminPassword() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Check if admin exists
    const checkRes = await client.query(
      'SELECT id FROM admins WHERE email = $1', 
      [ADMIN_EMAIL]
    );
    
    if (checkRes.rows.length === 0) {
      console.log('Admin not found, creating new admin account...');
      // Create admin if not exists
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
      await client.query(
        `INSERT INTO admins (email, password, first_name, last_name, status, role)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [ADMIN_EMAIL, hashedPassword, 'Admin', 'User', 'active', 'admin']
      );
      console.log('✅ Admin account created successfully');
    } else {
      // Update existing admin
      const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
      await client.query(
        'UPDATE admins SET password = $1, updated_at = NOW() WHERE email = $2',
        [hashedPassword, ADMIN_EMAIL]
      );
      console.log('✅ Admin password reset successfully');
    }
    
    await client.query('COMMIT');
    console.log(`\n🔑 Admin login credentials:\n   Email: ${ADMIN_EMAIL}\n   Password: ${NEW_PASSWORD}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

// Run the script
resetAdminPassword();
