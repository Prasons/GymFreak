import pool from "../config/db.js";

// Get all diet plans
export const getDietPlans = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM diet_plans ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching diet plans:", err);
    res.status(500).json({ message: err.message });
  }
};

// Create a new diet plan (admin only)
export const createDietPlan = async (req, res) => {
  const { name, category, description, meals } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO diet_plans (name, category, description, meals) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, category, description, JSON.stringify(meals)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating diet plan:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a diet plan (admin only)
export const updateDietPlan = async (req, res) => {
  const { id } = req.params;
  const { name, category, description, meals } = req.body;
  try {
    const result = await pool.query(
      `UPDATE diet_plans SET name=$1, category=$2, description=$3, meals=$4 WHERE id=$5 RETURNING *`,
      [name, category, description, JSON.stringify(meals), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Diet plan not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating diet plan:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a diet plan (admin only)
export const deleteDietPlan = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM diet_plans WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Diet plan not found" });
    }
    res.json({ message: "Diet plan deleted" });
  } catch (err) {
    console.error("Error deleting diet plan:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all of the user's selected diet plans
export const getUserDietPlan = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dp.* FROM diet_plans dp 
       JOIN user_diet_plans udp ON dp.id = udp.diet_plan_id 
       WHERE udp.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user's diet plans:", err);
    res.status(500).json({ message: err.message });
  }
};

// Set the user's selected diet plans (multi-select)
export const setUserDietPlan = async (req, res) => {
  const { dietPlanIds } = req.body;
  const client = await pool.connect();

  try {
    // Verify all diet plan IDs exist
    const plansResult = await client.query('SELECT id FROM diet_plans WHERE id = ANY($1::int[])', [dietPlanIds]);
    if (plansResult.rows.length !== dietPlanIds.length) {
      return res.status(400).json({ message: 'One or more diet plan IDs are invalid' });
    }

    await client.query('BEGIN');
    
    // Remove existing diet plans for the user
    await client.query('DELETE FROM user_diet_plans WHERE user_id = $1', [req.user.id]);
    
    // Insert new diet plans
    for (const planId of dietPlanIds) {
      await client.query(
        'INSERT INTO user_diet_plans (user_id, diet_plan_id) VALUES ($1, $2)',
        [req.user.id, planId]
      );
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Diet plans updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error setting user diet plans:', err);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};

// Unset all of the user's selected diet plans
export const unsetUserDietPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    await pool.query("DELETE FROM user_diet_plans WHERE user_id = $1", [userId]);
    res.json({ message: "All user diet plans removed" });
  } catch (err) {
    console.error("Error unsetting user diet plans:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove a specific diet plan from the user's saved selections
export const removeUserDietPlan = async (req, res) => {
  const { planId } = req.params;
  
  // Validate planId is a number
  if (isNaN(planId)) {
    return res.status(400).json({ message: 'Invalid diet plan ID' });
  }
  
  try {
    // Verify the diet plan exists
    const planExists = await pool.query('SELECT id FROM diet_plans WHERE id = $1', [planId]);
    if (planExists.rows.length === 0) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    
    const result = await pool.query(
      'DELETE FROM user_diet_plans WHERE user_id = $1 AND diet_plan_id = $2 RETURNING *',
      [req.user.id, planId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Diet plan not found in user\'s selections' });
    }
    
    res.json({ message: 'Diet plan removed from selections' });
  } catch (err) {
    console.error('Error removing diet plan from selections:', err);
    res.status(500).json({ message: err.message });
  }
};
