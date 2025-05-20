import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Create a new pool instance
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

/**
 * Connect to the database and return the pool
 * @returns {Promise<import('pg').Pool>} The database pool
 */
const connectDB = async () => {
  try {
    // Test the connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Export both pool and connectDB
export { pool, connectDB };

export default pool;
