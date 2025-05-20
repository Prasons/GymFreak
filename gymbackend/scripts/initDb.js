import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDb = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database initialization...');
    
    // Check if admins table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admins'
      );
    `;
    
    const tableExists = (await client.query(checkTableQuery)).rows[0].exists;
    
    if (tableExists) {
      console.log('✅ Admins table already exists');
    } else {
      console.log('ℹ️ Creating admins table...');
      
      // Read the SQL file
      const sqlPath = path.join(__dirname, '../migrations/001_create_admins_table.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      // Execute the SQL
      await client.query(sql);
      console.log('✅ Admins table created successfully');
    }
    
    console.log('✨ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Error initializing database:');
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
};

initDb();
