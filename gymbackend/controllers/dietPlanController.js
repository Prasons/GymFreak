import * as dietPlanModel from "../models/dietPlanModel.js";
import { validationResult } from "express-validator";
import pool from "../config/db.js";

// @desc    Create a new diet plan
// @route   POST /api/diet-plans
// @access  Private/Admin
export const createDietPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dietPlan = await dietPlanModel.createDietPlan({
      ...req.body,
      meals: req.body.meals || [],
    });

    res.status(201).json({
      success: true,
      data: dietPlan,
    });
  } catch (error) {
    console.error("Error creating diet plan:", error);
    res.status(500).json({
      success: false,
      message: "Error creating diet plan",
      error: error.message,
    });
  }
};

// @desc    Get all diet plans
// @route   GET /api/diet-plans
// @access  Public
export const getAllDietPlans = async (req, res) => {
  try {
    const dietPlans = await dietPlanModel.getAllDietPlans();
    res.status(200).json({
      success: true,
      count: dietPlans.length,
      data: dietPlans,
    });
  } catch (error) {
    console.error("Error getting diet plans:", error);
    res.status(500).json({
      success: false,
      message: "Error getting diet plans",
      error: error.message,
    });
  }
};

// @desc    Get single diet plan
// @route   GET /api/diet-plans/:id
// @access  Public
export const getDietPlan = async (req, res) => {
  try {
    const dietPlan = await dietPlanModel.getDietPlanById(req.params.id);

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: dietPlan,
    });
  } catch (error) {
    console.error("Error getting diet plan:", error);
    res.status(500).json({
      success: false,
      message: "Error getting diet plan",
      error: error.message,
    });
  }
};

// @desc    Update diet plan
// @route   PUT /api/diet-plans/:id
// @access  Private/Admin
export const updateDietPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dietPlan = await dietPlanModel.updateDietPlan(req.params.id, {
      ...req.body,
      meals: req.body.meals || [],
    });

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: dietPlan,
    });
  } catch (error) {
    console.error("Error updating diet plan:", error);
    res.status(500).json({
      success: false,
      message: "Error updating diet plan",
      error: error.message,
    });
  }
};

// @desc    Delete diet plan
// @route   DELETE /api/diet-plans/:id
// @access  Private/Admin
export const deleteDietPlan = async (req, res) => {
  try {
    const dietPlan = await dietPlanModel.deleteDietPlan(req.params.id);

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Error deleting diet plan:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting diet plan",
      error: error.message,
    });
  }
};

// @desc    Toggle diet plan status
// @route   PATCH /api/diet-plans/:id/toggle-status
// @access  Private/Admin
export const toggleDietPlanStatus = async (req, res) => {
  try {
    const dietPlan = await dietPlanModel.toggleDietPlanStatus(req.params.id);

    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: "Diet plan not found",
      });
    }

    res.status(200).json({
      success: true,
      data: dietPlan,
    });
  } catch (error) {
    console.error("Error toggling diet plan status:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling diet plan status",
      error: error.message,
    });
  }
};

// @desc    Set user's diet plan
// @route   POST /api/diet-plans/users/me/plans
// @access  Private
export const setUserDietPlan = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { planIds } = req.body;
    const userId = req.user.userId;

     if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
  
    if (!Array.isArray(planIds)) {
      return res.status(400).json({ message: "planIds must be an array" });
    }
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
            `SELECT id FROM diet_plans WHERE id = ANY($1::int[])`,
            [planIds]
          );
          
          if (planCheck.rows.length !== planIds.length) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: "One or more workout plans not found" });
          }
        }
        
        // Remove all existing plans for this user
        await client.query(
          'DELETE FROM user_dietplans WHERE userid = $1', 
          [userId]
        );
        
        // Add the new selections if any
        if (planIds.length > 0) {
          for (const planId of planIds) {
            await client.query(
              `INSERT INTO user_dietplans (userid, dietplanid) VALUES ($1, $2)`,
              [parseInt(userId), parseInt(planId)]
        );
      }
        }
        
        await client.query('COMMIT');
        
        // Return the updated list of diet plans
        const result = await pool.query(
          `SELECT dp.* 
          FROM diet_plans dp
          JOIN user_dietplans udp ON dp.id = udp.dietplanid
          WHERE udp.userid = $1`,
          [userId]
        );
        
        res.json({
          message: "diet plans updated successfully",
          dietPlans: result.rows
        });
      } catch (err) {
      await client.query('ROLLBACK');
      console.error("Error updating user diet plans:", err);
      res.status(500).json({ 
        message: "Error updating diet plans",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    } finally {
      client.release();
    } 
  } catch (error) {
    console.error('Error getting user diet plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get diet plans',
      error: error.message 
    });
  }
};



// @desc    Get user's diet plans
// @route   GET /api/diet-plans/users/me/plans
// @access  Private
export const getUserDietPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get the user's diet plans using the junction table
    const query = `
      SELECT dp.*, 
           json_agg(
             json_build_object(
               'id', m.id,
               'meal_type', m.meal_type,
               'name', m.name,
               'description', m.description,
               'calories', m.calories,
               'protein_g', m.protein_g,
               'carbs_g', m.carbs_g,
               'fat_g', m.fat_g
             )
             ORDER BY 
               CASE m.meal_type
                 WHEN 'breakfast' THEN 1
                 WHEN 'snack1' THEN 2
                 WHEN 'lunch' THEN 3
                 WHEN 'snack2' THEN 4
                 WHEN 'dinner' THEN 5
                 ELSE 6
               END
           ) as meals
    FROM diet_plans dp
    LEFT JOIN meals m ON dp.id = m.diet_plan_id JOIN user_dietplans udp ON dp.id = udp.dietplanid
    WHERE udp.userid =$1
    GROUP BY dp.id
    ORDER BY dp.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
let dietPlans = result.rows.map((row) => ({
    ...row,
    meals: row.meals[0] ? row.meals : [],
  }));
    res.status(200).json({
      success: true,
      data: dietPlans
    });
  } catch (error) {
    console.error('Error getting user diet plans:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get diet plans',
      error: error.message 
    });
  }
};

// @desc    Remove user's diet plan
// @route   DELETE /api/diet-plans/users/me/plans
// @access  Private
export const removeUserDietPlan = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {id} = req.params;
    const userId = req.user.userId;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'Plan ID is required' 
      });
    }

    await client.query('BEGIN');

    // Check if the user has this plan
    const checkQuery = `
      SELECT id FROM user_dietplans 
      WHERE userid = $1 AND dietplanid = $2
    `;
    
    const { rowCount } = await client.query(checkQuery, [userId, id]);
    
    if (rowCount === 0) {
      await client.query('COMMIT');
      return res.status(404).json({ 
        success: false,
        message: 'Diet plan not found for this user' 
      });
    }

    // Remove the plan from user's diet plans
    const deleteQuery = `
      DELETE FROM user_dietplans 
      WHERE userid = $1 AND dietplanid = $2
      RETURNING *
    `;
    
    const result = await client.query(deleteQuery, [userId, id]);
    
    // Get the remaining diet plans
    
    await client.query('COMMIT');
    
    res.status(200).json({ 
      success: true, 
      message: 'Diet plan removed successfully',
      removedPlan: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing user diet plan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove diet plan',
      error: error.message 
    });
  } finally {
    client.release();
  }
};

// @desc    Delete all user diet plans (admin only)
// @route   DELETE /api/diet-plans/users/me/plans/all
// @access  Private/Admin
export const deleteUserDietPlans = async (req, res) => {
  const client = await pool.connect();

  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required' 
      });
    }

    await client.query('BEGIN');

    // Check if user has any diet plans (instead of checking existence in users table)
    const planCheck = await client.query('SELECT 1 FROM user_dietplans WHERE userid = $1 LIMIT 1', [userId]);
    if (planCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        message: 'No diet plans found for this user' 
      });
    }

    // Delete all diet plans for the user
    await client.query('DELETE FROM user_dietplans WHERE userid = $1', [userId]);
    
    await client.query('COMMIT');
    
    return res.status(200).json({ 
      success: true, 
      message: 'All diet plans removed successfully',
      data: [] 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting user diet plans:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete diet plans',
      error: error.message 
    });
  } finally {
    client.release();
  }
};
