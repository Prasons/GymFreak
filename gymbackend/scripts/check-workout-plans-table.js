import pool from '../config/db.js';

async function checkWorkoutPlansTable() {
  try {
    // Check if workoutplans table exists
    const tableExists = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'workoutplans')"
    );
    
    if (!tableExists.rows[0].exists) {
      console.error('Error: workoutplans table does not exist');
      return;
    }
    
    // Get table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'workoutplans'
      ORDER BY ordinal_position
    `);
    
    console.log('workoutplans table structure:');
    console.table(columns.rows);
    
    // Try to get some sample data
    try {
      const sampleData = await pool.query('SELECT * FROM workoutplans LIMIT 5');
      console.log('\nSample data from workoutplans:');
      console.table(sampleData.rows);
    } catch (err) {
      console.error('Error fetching sample data:', err.message);
    }
    
  } catch (error) {
    console.error('Error checking workoutplans table:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
checkWorkoutPlansTable();
