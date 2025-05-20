import pool from '../config/db.js';

async function describeWorkoutPlans() {
  try {
    // Get table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'workoutplans'
      ORDER BY ordinal_position
    `);
    
    console.log('workoutplans table structure:');
    console.table(columns.rows);
    
    // Check for any data
    const rowCount = await pool.query('SELECT COUNT(*) FROM workoutplans');
    console.log(`\nNumber of rows in workoutplans: ${rowCount.rows[0].count}`);
    
    if (rowCount.rows[0].count > 0) {
      const sampleData = await pool.query('SELECT * FROM workoutplans LIMIT 1');
      console.log('\nSample data from workoutplans:');
      console.log(JSON.stringify(sampleData.rows[0], null, 2));
    }
    
  } catch (error) {
    console.error('Error describing workoutplans table:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
describeWorkoutPlans();
