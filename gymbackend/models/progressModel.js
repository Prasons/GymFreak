import pool from "../config/db.js";

class Progress {
  // Weight Tracking Methods
  static async addWeightRecord({ user_id, weight_kg, date = new Date(), notes }) {
    const query = `
      INSERT INTO weight_tracking (user_id, weight_kg, date, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [user_id, weight_kg, date, notes]);
    return rows[0];
  }

  static async getWeightHistory(user_id, startDate, endDate) {
    const query = `
      SELECT * FROM weight_tracking
      WHERE user_id = $1
        AND date BETWEEN $2 AND $3
      ORDER BY date DESC
    `;
    const { rows } = await pool.query(query, [user_id, startDate, endDate]);
    return rows;
  }

  // Body Measurements Methods
  static async addMeasurements({ user_id, measurements, date = new Date(), notes }) {
    const query = `
      INSERT INTO body_measurements 
      (user_id, chest_cm, waist_cm, hips_cm, biceps_cm, thighs_cm, date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      user_id,
      measurements.chest_cm,
      measurements.waist_cm,
      measurements.hips_cm,
      measurements.biceps_cm,
      measurements.thighs_cm,
      date,
      notes
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async getMeasurementsHistory(user_id, startDate, endDate) {
    const query = `
      SELECT * FROM body_measurements
      WHERE user_id = $1
        AND date BETWEEN $2 AND $3
      ORDER BY date DESC
    `;
    const { rows } = await pool.query(query, [user_id, startDate, endDate]);
    return rows;
  }

  // Exercise Progress Methods
  static async addExerciseProgress({ user_id, exercise_name, sets, reps, weight_kg, date = new Date(), notes }) {
    const query = `
      INSERT INTO exercise_progress 
      (user_id, exercise_name, sets, reps, weight_kg, date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [user_id, exercise_name, sets, reps, weight_kg, date, notes];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async getExerciseHistory(user_id, exercise_name, startDate, endDate) {
    const query = `
      SELECT * FROM exercise_progress
      WHERE user_id = $1
        AND exercise_name = $2
        AND date BETWEEN $3 AND $4
      ORDER BY date DESC
    `;
    const { rows } = await pool.query(query, [user_id, exercise_name, startDate, endDate]);
    return rows;
  }

  // Fitness Goals Methods
  static async addGoal({ user_id, goal_type, target_value, current_value, start_date = new Date(), target_date, notes }) {
    const query = `
      INSERT INTO fitness_goals 
      (user_id, goal_type, target_value, current_value, start_date, target_date, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [user_id, goal_type, target_value, current_value, start_date, target_date, notes];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async updateGoalProgress(goal_id, current_value, status = 'in_progress') {
    const query = `
      UPDATE fitness_goals
      SET current_value = $1, status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const { rows } = await pool.query(query, [current_value, status, goal_id]);
    return rows[0];
  }

  static async getActiveGoals(user_id) {
    const query = `
      SELECT * FROM fitness_goals
      WHERE user_id = $1 AND status = 'in_progress'
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows;
  }

  // Optional: Progress Photos Methods
  static async addProgressPhoto({ user_id, photo_url, photo_type, date = new Date(), notes }) {
    const query = `
      INSERT INTO progress_photos 
      (user_id, photo_url, photo_type, date, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [user_id, photo_url, photo_type, date, notes];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async getProgressPhotos(user_id, startDate, endDate) {
    const query = `
      SELECT * FROM progress_photos
      WHERE user_id = $1
        AND date BETWEEN $2 AND $3
      ORDER BY date DESC
    `;
    const { rows } = await pool.query(query, [user_id, startDate, endDate]);
    return rows;
  }

  // Summary Methods
  static async getProgressSummary(user_id, days = 30) {
    const query = `
      WITH recent_weight AS (
        SELECT weight_kg, date
        FROM weight_tracking
        WHERE user_id = $1
          AND date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY date DESC
        LIMIT 1
      ),
      initial_weight AS (
        SELECT weight_kg, date
        FROM weight_tracking
        WHERE user_id = $1
          AND date >= CURRENT_DATE - INTERVAL '${days} days'
        ORDER BY date ASC
        LIMIT 1
      ),
      active_goals AS (
        SELECT COUNT(*) as total_goals,
               SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_goals
        FROM fitness_goals
        WHERE user_id = $1
          AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
      ),
      exercise_count AS (
        SELECT COUNT(DISTINCT date) as workout_days
        FROM exercise_progress
        WHERE user_id = $1
          AND date >= CURRENT_DATE - INTERVAL '${days} days'
      )
      SELECT 
        rw.weight_kg as current_weight,
        iw.weight_kg as initial_weight,
        rw.weight_kg - iw.weight_kg as weight_change,
        ag.total_goals,
        ag.completed_goals,
        ec.workout_days
      FROM recent_weight rw
      CROSS JOIN initial_weight iw
      CROSS JOIN active_goals ag
      CROSS JOIN exercise_count ec
    `;
    const { rows } = await pool.query(query, [user_id]);
    return rows[0];
  }
}

export default Progress;
