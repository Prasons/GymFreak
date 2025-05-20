import dotenv from 'dotenv';
import { pool, connectDB } from '../config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createInitialAdmin = async () => {
  const client = await pool.connect();
  
  try {
    // Connect to the database
    await connectDB();

    // Check if any admin already exists
    const checkQuery = 'SELECT * FROM admins WHERE email = $1';
    const checkRes = await client.query(checkQuery, [process.env.INITIAL_ADMIN_EMAIL]);
    
    if (checkRes.rows.length > 0) {
      console.log('Initial admin already exists');
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.INITIAL_ADMIN_PASSWORD, salt);
    const now = new Date();

    // Create initial admin
    const query = `
      INSERT INTO admins (
        "firstName", "lastName", email, password, role, status, "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, role, status
    `;

    const values = [
      'Super',
      'Admin',
      process.env.INITIAL_ADMIN_EMAIL,
      hashedPassword,
      'super_admin',
      'active',
      now,
      now
    ];

    const res = await client.query(query, values);
    const admin = res.rows[0];

    console.log('✅ Initial admin created successfully');
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Status:', admin.status);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating initial admin:');
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
  }
};

// Execute the function
createInitialAdmin();
