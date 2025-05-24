import pool from "../config/db.js";

// Get all workout plans
export const getWorkoutPlans = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT wp.*, 
             a.first_name as created_by_first_name,
             a.last_name as created_by_last_name
      FROM workout_plans wp
      LEFT JOIN admins a ON wp.created_by = a.id
      ORDER BY wp.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching workout plans:", err);
    res.status(500).json({ 
      message: "Error fetching workout plans",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Create a new workout plan (admin only)
export const createWorkoutPlan = async (req, res) => {
  const { 
    name, 
    description, 
    difficulty_level = 'beginner', 
    duration_weeks = 4, 
    target_goals = [],
    category = '',
    is_public = true 
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO workout_plans 
       (name, description, difficulty_level, duration_weeks, category, target_goals, created_by, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        name, 
        description, 
        difficulty_level, 
        duration_weeks, 
        category,
        target_goals, 
        req.user?.id, // Assuming user ID is attached by auth middleware
        is_public
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating workout plan:", err);
    res.status(500).json({ 
      message: "Error creating workout plan",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update a workout plan (admin only)
export const updateWorkoutPlan = async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    description, 
    difficulty_level, 
    duration_weeks, 
    category,
    target_goals,
    is_public 
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const result = await pool.query(
      `UPDATE workout_plans 
       SET name = $1, 
           description = $2, 
           difficulty_level = COALESCE($3, difficulty_level),
           duration_weeks = COALESCE($4, duration_weeks),
           category = $5,
           target_goals = COALESCE($6, target_goals),
           is_public = COALESCE($7, is_public),
           updated_at = NOW()
       WHERE id = $8 
       RETURNING *`,
      [
        name, 
        description, 
        difficulty_level,
        duration_weeks,
        category,
        target_goals,
        is_public,
        id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Workout plan not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating workout plan:", err);
    res.status(500).json({ 
      message: "Error updating workout plan",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Delete a workout plan (admin only)
export const deleteWorkoutPlan = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Start a transaction
    await pool.query('BEGIN');
    
    // First, delete related workout plan exercises
    await pool.query(
      'DELETE FROM workout_plan_exercises WHERE workout_plan_id = $1',
      [id]
    );
    
    // Then delete the workout plan
    const result = await pool.query(
      'DELETE FROM workout_plans WHERE id = $1 RETURNING *',
      [id]
    );
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Workout plan not found" });
    }
    
    res.json({ message: "Workout plan deleted successfully" });
  } catch (err) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK');
    
    console.error("Error deleting workout plan:", err);
    res.status(500).json({ 
      message: "Error deleting workout plan",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get all of the user's selected workout plans
export const getUserWorkoutPlan = async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  
  try {
    // First, get the user's selected workout plan IDs
    const userPlansResult = await pool.query(
      `SELECT workoutplan_id 
       FROM user_workoutplans 
       WHERE user_id = $1`,
      [parseInt(userId)]
    );
    
    if (userPlansResult.rows.length === 0) {
      return res.json([]);
    }
    
    const planIds = userPlansResult.rows.map(row => row.workoutplan_id);
    
    // Then get the full details of each workout plan
    const result = await pool.query(
      `SELECT wp.*, 
              a.first_name as created_by_first_name,
              a.last_name as created_by_last_name
       FROM workout_plans wp
       LEFT JOIN admins a ON wp.created_by = a.id
       WHERE wp.id = ANY($1::int[])
       ORDER BY wp.name`,
      [planIds]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user workout plans:", err);
    res.status(500).json({ 
      message: "Error fetching user workout plans",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Set the user's selected workout plans (multi-select)
export const setUserWorkoutPlan = async (req, res) => {
  const { userId } = req.params;
  const { planIds } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  
  if (!Array.isArray(planIds)) {
    return res.status(400).json({ message: "planIds must be an array" });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, verify the user exists
    const userCheck = await client.query(
      'SELECT id FROM users WHERE id = $1', 
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify all plan IDs exist
    if (planIds.length > 0) {
      const planCheck = await client.query(
        `SELECT id FROM workout_plans WHERE id = ANY($1::int[])`,
        [planIds]
      );
      
      if (planCheck.rows.length !== planIds.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: "One or more workout plans not found" });
      }
    }
    
    // Remove all existing plans for this user
    await client.query(
      'DELETE FROM user_workoutplans WHERE user_id = $1', 
      [userId]
    );
    
    // Add the new selections if any
    if (planIds.length > 0) {
      for (const planId of planIds) {
        await client.query(
          `INSERT INTO user_workoutplans (user_id, workoutplan_id) VALUES ($1, $2)`,
          [parseInt(userId), parseInt(planId)]
    );
  }
    }
    
    await client.query('COMMIT');
    
    // Return the updated list of workout plans
    const result = await pool.query(
      `SELECT wp.* 
       FROM workout_plans wp
       JOIN user_workoutplans uwp ON wp.id = uwp.workoutplan_id
       WHERE uwp.user_id = $1`,
      [userId]
    );
    
    res.json({
      message: "Workout plans updated successfully",
      workoutPlans: result.rows
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error updating user workout plans:", err);
    res.status(500).json({ 
      message: "Error updating workout plans",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

// Unset all of the user's selected workout plans
export const unsetUserWorkoutPlan = async (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verify user exists
    const userCheck = await client.query(
      'SELECT id FROM users WHERE id = $1', 
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove all workout plans for this user
    const result = await client.query(
      'DELETE FROM user_workoutplans WHERE user_id = $1 RETURNING *',
      [userId]
    );
    
    await client.query('COMMIT');
    
    res.json({ 
      message: "All workout plans have been unset",
      removedCount: result.rowCount
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error unsetting user workout plans:", err);
    res.status(500).json({ 
      message: "Error unsetting workout plans",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

// Remove a specific workout plan from the user's saved selections
export const removeUserWorkoutPlan = async (req, res) => {
  const { userId, planId } = req.params;
  
  if (!userId || !planId) {
    return res.status(400).json({ message: "User ID and Plan ID are required" });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verify user exists
    const userCheck = await client.query(
      'SELECT id FROM users WHERE id = $1', 
      [userId]
    );
    
    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify workout plan exists
    const planCheck = await client.query(
      'SELECT id FROM workout_plans WHERE id = $1',
      [planId]
    );
    
    if (planCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Workout plan not found" });
    }
    
    // Remove the specific workout plan for the user
    const result = await client.query(
      `DELETE FROM user_workoutplans 
       WHERE user_id = $1 AND workoutplan_id = $2 
       RETURNING *`,
      [userId, planId]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        message: "This workout plan is not in the user's selections" 
      });
    }
    
    await client.query('COMMIT');
    
    res.json({ 
      message: "Workout plan removed from user's selections",
      removedPlan: result.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error removing workout plan from user's selections:", err);
    res.status(500).json({ 
      message: "Error removing workout plan",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};
