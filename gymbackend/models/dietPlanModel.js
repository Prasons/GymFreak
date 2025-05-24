import pool from "../config/db.js";

// Create a new diet plan
export const createDietPlan = async (dietPlanData) => {
  const {
    name,
    description,
    difficulty,
    duration_weeks,
    target_goal,
    daily_calories,
    protein_grams,
    carbs_grams,
    fat_grams,
    is_active = true,
    meals = [],
  } = dietPlanData;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert diet plan
    const dietPlanResult = await client.query(
      `INSERT INTO diet_plans (
        name, description, difficulty, duration_weeks, target_goal,
        daily_calories, protein_grams, carbs_grams, fat_grams, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        name,
        description,
        difficulty,
        duration_weeks,
        target_goal,
        daily_calories,
        protein_grams,
        carbs_grams,
        fat_grams,
        is_active,
      ]
    );

    const dietPlan = dietPlanResult.rows[0];

    // Insert meals
    for (const meal of meals) {
      await client.query(
        `INSERT INTO meals (
          diet_plan_id, meal_type, name, description,
          calories, protein_g, carbs_g, fat_g
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          dietPlan.id,
          meal.meal_type,
          meal.name,
          meal.description,
          meal.calories,
          meal.protein_g,
          meal.carbs_g,
          meal.fat_g,
        ]
      );
    }

    await client.query("COMMIT");
    return { ...dietPlan, meals };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Get all diet plans with meals
export const getAllDietPlans = async () => {
  const result = await pool.query(`
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
    LEFT JOIN meals m ON dp.id = m.diet_plan_id
    GROUP BY dp.id
    ORDER BY dp.created_at DESC
  `);

  return result.rows.map((row) => ({
    ...row,
    meals: row.meals[0] ? row.meals : [],
  }));
};

// Get single diet plan with meals
export const getDietPlanById = async (id) => {
  const result = await pool.query(
    `SELECT dp.*, 
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
     LEFT JOIN meals m ON dp.id = m.diet_plan_id
     WHERE dp.id = $1
     GROUP BY dp.id`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...row,
    meals: row.meals[0] ? row.meals : [],
  };
};

// Update diet plan and meals
export const updateDietPlan = async (id, dietPlanData) => {
  const {
    name,
    description,
    difficulty,
    duration_weeks,
    target_goal,
    daily_calories,
    protein_grams,
    carbs_grams,
    fat_grams,
    is_active,
    meals = [],
  } = dietPlanData;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Update diet plan
    const result = await client.query(
      `UPDATE diet_plans
       SET name = $1, description = $2, difficulty = $3, duration_weeks = $4,
           target_goal = $5, daily_calories = $6, protein_grams = $7,
           carbs_grams = $8, fat_grams = $9, is_active = $10
           
       WHERE id = $11
       RETURNING *`,
      [
        name,
        description,
        difficulty,
        duration_weeks,
        target_goal,
        daily_calories,
        protein_grams,
        carbs_grams,
        fat_grams,
        is_active,
        id,
      ]
    );

    if (result.rows.length === 0) {
      throw new Error("Diet plan not found");
    }

    const dietPlan = result.rows[0];

    // Delete existing meals
    await client.query("DELETE FROM meals WHERE diet_plan_id = $1", [id]);

    // Insert updated meals
    for (const meal of meals) {
      await client.query(
        `INSERT INTO meals (
          diet_plan_id, meal_type, name, description,
          calories, protein_g, carbs_g, fat_g
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          meal.meal_type,
          meal.name,
          meal.description,
          meal.calories,
          meal.protein_g,
          meal.carbs_g,
          meal.fat_g,
        ]
      );
    }

    await client.query("COMMIT");
    // Get the updated diet plan with meals
    const updatedPlan = await getDietPlanById(id);

    return updatedPlan;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Delete diet plan (this will cascade to delete meals)
export const deleteDietPlan = async (id) => {
  const result = await pool.query(
    "DELETE FROM diet_plans WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

// Toggle diet plan status
export const toggleDietPlanStatus = async (id) => {
  const result = await pool.query(
    `UPDATE diet_plans
     SET is_active = NOT is_active,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0];
};

// All functions are exported individually above