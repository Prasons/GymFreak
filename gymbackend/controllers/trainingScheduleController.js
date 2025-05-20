import pool from "../config/db.js";

// Get all training schedules
export const getTrainingSchedules = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ts.*,
        ts.time as schedule_time,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name,
        u.email as trainer_email
      FROM trainingschedules ts
      LEFT JOIN users u ON ts.trainer_id = u.id
      ORDER BY ts.time ASC
    `);
    
    // Format the schedule data for the client
    const formattedSchedules = result.rows.map(schedule => ({
      ...schedule,
      time: schedule.schedule_time,
      days: typeof schedule.days === 'string' ? JSON.parse(schedule.days) : schedule.days || []
    }));
    
    res.json(formattedSchedules);
  } catch (err) {
    console.error("Error fetching training schedules:", err);
    res.status(500).json({ 
      message: err.message || "Error fetching training schedules" 
    });
  }
};

// Create a new training schedule (admin only)
export const createTrainingSchedule = async (req, res) => {
  const { 
    title, 
    description, 
    start_time, 
    end_time, 
    trainer_id, 
    max_participants = 10, 
    status = 'scheduled',
    days = []
  } = req.body;

  // Validate required fields
  if (!title || !start_time || !end_time) {
    return res.status(400).json({ 
      message: "Title, start time, and end time are required" 
    });
  }

  // Validate date format and logic
  const startTime = new Date(start_time);
  const endTime = new Date(end_time);
  
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return res.status(400).json({ 
      message: "Invalid date format. Please use ISO 8601 format (e.g., 2023-01-01T10:00:00.000Z)" 
    });
  }

  if (startTime >= endTime) {
    return res.status(400).json({ 
      message: "End time must be after start time" 
    });
  }

  // If trainer_id is provided, verify the trainer exists
  if (trainer_id) {
    try {
      const trainerCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [trainer_id, 'trainer']
      );
      
      if (trainerCheck.rows.length === 0) {
        return res.status(400).json({ 
          message: "Trainer not found or is not a valid trainer" 
        });
      }
    } catch (err) {
      console.error("Error validating trainer:", err);
      return res.status(500).json({ message: "Error validating trainer" });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO training_schedules (
        title, 
        description, 
        start_time, 
        end_time,
        trainer_id,
        max_participants,
        status,
        days,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        title,
        description || null,
        startTime.toISOString(),
        endTime.toISOString(),
        trainer_id || null,
        max_participants,
        status,
        JSON.stringify(days),
        req.user?.id || null
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating training schedule:", err);
    res.status(500).json({ 
      message: err.message || "Error creating training schedule" 
    });
  }
};

// Update a training schedule (admin only)
export const updateTrainingSchedule = async (req, res) => {
  const { id } = req.params;
  const { 
    title, 
    description, 
    start_time, 
    end_time, 
    trainer_id, 
    max_participants, 
    status, 
    days 
  } = req.body;

  // Validate required fields
  if (!title && !start_time && !end_time && !trainer_id && !max_participants && !status && !days) {
    return res.status(400).json({ 
      message: "At least one field to update is required" 
    });
  }

  // Prepare update fields and values
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  if (title !== undefined) {
    updateFields.push(`title = $${paramIndex++}`);
    values.push(title);
  }
  
  if (description !== undefined) {
    updateFields.push(`description = $${paramIndex++}`);
    values.push(description || null);
  }
  
  if (start_time !== undefined) {
    const startTime = new Date(start_time);
    if (isNaN(startTime.getTime())) {
      return res.status(400).json({ 
        message: "Invalid start time format. Please use ISO 8601 format" 
      });
    }
    updateFields.push(`start_time = $${paramIndex++}`);
    values.push(startTime.toISOString());
  }
  
  if (end_time !== undefined) {
    const endTime = new Date(end_time);
    if (isNaN(endTime.getTime())) {
      return res.status(400).json({ 
        message: "Invalid end time format. Please use ISO 8601 format" 
      });
    }
    updateFields.push(`end_time = $${paramIndex++}`);
    values.push(endTime.toISOString());
  }
  
  // Validate date range if both times are being updated
  if (start_time !== undefined && end_time !== undefined) {
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    if (startTime >= endTime) {
      return res.status(400).json({ 
        message: "End time must be after start time" 
      });
    }
  }

  if (trainer_id !== undefined) {
    if (trainer_id === null) {
      // Allow setting trainer to null
      updateFields.push(`trainer_id = $${paramIndex++}`);
      values.push(null);
    } else {
      // Verify the trainer exists if a new trainer_id is provided
      try {
        const trainerCheck = await pool.query(
          'SELECT id FROM users WHERE id = $1 AND role = $2',
          [trainer_id, 'trainer']
        );
        
        if (trainerCheck.rows.length === 0) {
          return res.status(400).json({ 
            message: "Trainer not found or is not a valid trainer" 
          });
        }
        updateFields.push(`trainer_id = $${paramIndex++}`);
        values.push(trainer_id);
      } catch (err) {
        console.error("Error validating trainer:", err);
        return res.status(500).json({ message: "Error validating trainer" });
      }
    }
  }
  
  if (max_participants !== undefined) {
    if (typeof max_participants !== 'number' || max_participants < 1) {
      return res.status(400).json({ 
        message: "Max participants must be a positive number" 
      });
    }
    updateFields.push(`max_participants = $${paramIndex++}`);
    values.push(max_participants);
  }
  
  if (status !== undefined) {
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'in_progress'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    updateFields.push(`status = $${paramIndex++}`);
    values.push(status);
  }
  
  if (days !== undefined) {
    if (!Array.isArray(days)) {
      return res.status(400).json({ 
        message: "Days must be an array" 
      });
    }
    updateFields.push(`days = $${paramIndex++}`);
    values.push(JSON.stringify(days));
  }

  // Add the schedule ID as the last parameter
  values.push(id);
  
  try {
    const query = `
      UPDATE training_schedules 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *,
        (SELECT json_build_object(
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email
        ) FROM users u WHERE u.id = training_schedules.trainer_id) as trainer
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Training schedule not found" });
    }
    
    // Format the response
    const updatedSchedule = result.rows[0];
    const response = {
      ...updatedSchedule,
      start_time: updatedSchedule.start_time ? new Date(updatedSchedule.start_time).toISOString() : null,
      end_time: updatedSchedule.end_time ? new Date(updatedSchedule.end_time).toISOString() : null,
      days: typeof updatedSchedule.days === 'string' ? JSON.parse(updatedSchedule.days) : updatedSchedule.days || []
    };
    
    res.json(response);
  } catch (err) {
    console.error("Error updating training schedule:", err);
    res.status(500).json({ 
      message: err.message || "Error updating training schedule" 
    });
  }
};

// Delete a training schedule (admin only)
export const deleteTrainingSchedule = async (req, res) => {
  const { id } = req.params;
  
  // Validate ID is a number
  if (isNaN(parseInt(id, 10))) {
    return res.status(400).json({ message: "Invalid training schedule ID" });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, verify the training schedule exists
    const scheduleCheck = await client.query(
      'SELECT id FROM training_schedules WHERE id = $1 FOR UPDATE',
      [id]
    );
    
    if (scheduleCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Training schedule not found" });
    }
    
    // Delete related records first (enrollments, etc.)
    // Note: This uses CASCADE, but we're being explicit for clarity
    await client.query(
      'DELETE FROM user_training_schedules WHERE training_schedule_id = $1',
      [id]
    );
    
    // Delete the training schedule
    const result = await client.query(
      'DELETE FROM training_schedules WHERE id = $1 RETURNING id, title',
      [id]
    );
    
    await client.query('COMMIT');
    
    res.json({ 
      message: "Training schedule deleted successfully",
      deletedSchedule: result.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error deleting training schedule:", err);
    res.status(500).json({ 
      message: err.message || "Error deleting training schedule" 
    });
  } finally {
    client.release();
  }
};

// Get all of the user's enrolled training schedules
export const getUserTrainingSchedules = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ts.*, u.first_name as trainer_first_name, u.last_name as trainer_last_name 
       FROM trainingschedules ts
       JOIN user_trainingschedules uts ON ts.id = uts.schedule_id 
       LEFT JOIN users u ON ts.trainer_id = u.id
       WHERE uts.user_id = $1
       ORDER BY ts.time ASC`,
      [req.user.id]
    );
    
    // Format the response
    const formattedSchedules = result.rows.map(schedule => ({
      ...schedule,
      time: schedule.time,
      days: typeof schedule.days === 'string' ? JSON.parse(schedule.days) : schedule.days || []
    }));
    
    res.json(formattedSchedules);
  } catch (err) {
    console.error("Error fetching user training schedules:", err);
    res.status(500).json({ message: err.message });
  }
};

// Enroll user in training schedules (multi-select)
export const enrollUserTrainingSchedules = async (req, res) => {
  const { scheduleIds } = req.body; // expects an array of schedule IDs
  
  if (!Array.isArray(scheduleIds) || scheduleIds.length === 0) {
    return res.status(400).json({ message: "scheduleIds must be a non-empty array" });
  }
  
  // Validate all schedule IDs are numbers
  if (scheduleIds.some(id => isNaN(parseInt(id, 10)))) {
    return res.status(400).json({ message: "All schedule IDs must be numbers" });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verify all schedule IDs exist and check capacity
    const schedulesResult = await client.query(
      `SELECT id, max_participants, 
              (SELECT COUNT(*) FROM user_trainingschedules WHERE schedule_id = trainingschedules.id) as current_participants
       FROM trainingschedules 
       WHERE id = ANY($1::int[])`,
      [scheduleIds]
    );
    
    // Check if all IDs exist
    if (schedulesResult.rows.length !== scheduleIds.length) {
      const foundIds = schedulesResult.rows.map(r => r.id);
      const missingIds = scheduleIds.filter(id => !foundIds.includes(parseInt(id)));
      return res.status(404).json({ 
        message: `Some schedule IDs not found: ${missingIds.join(', ')}` 
      });
    }
    
    // Check for full schedules
    const fullSchedules = schedulesResult.rows.filter(
      s => s.max_participants && s.current_participants >= s.max_participants
    );
    
    if (fullSchedules.length > 0) {
      return res.status(400).json({
        message: `The following schedules are full: ${fullSchedules.map(s => s.id).join(', ')}`
      });
    }
    
    // Remove existing enrollments for these schedules to avoid duplicates
    await client.query(
      'DELETE FROM user_trainingschedules WHERE user_id = $1 AND schedule_id = ANY($2::int[])',
      [req.user.id, scheduleIds]
    );
    
    // Insert new enrollments
    const values = scheduleIds.map(scheduleId => `(${req.user.id}, ${scheduleId})`).join(',');
    if (values) {
      await client.query(
        `INSERT INTO user_trainingschedules (user_id, schedule_id) VALUES ${values}`
      );
    }
    
    await client.query('COMMIT');
    
    // Get the updated list of enrolled schedules with trainer info
    const result = await client.query(
      `SELECT ts.*, u.first_name as trainer_first_name, u.last_name as trainer_last_name 
       FROM trainingschedules ts
       JOIN user_trainingschedules uts ON ts.id = uts.schedule_id
       LEFT JOIN users u ON ts.trainer_id = u.id
       WHERE uts.user_id = $1`,
      [req.user.id]
    );
    
    // Format the response
    const formattedSchedules = result.rows.map(schedule => ({
      ...schedule,
      time: schedule.time,
      days: typeof schedule.days === 'string' ? JSON.parse(schedule.days) : schedule.days || []
    }));
    
    res.json({
      message: 'Training schedules updated successfully',
      schedules: formattedSchedules
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating training schedules:', err);
    res.status(500).json({ 
      message: 'Error updating training schedules',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

// Unenroll user from all training schedules
export const unenrollAllUserTrainingSchedules = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query(
      'DELETE FROM user_trainingschedules WHERE user_id = $1',
      [req.user.id]
    );
    
    await client.query('COMMIT');
    res.json({ message: 'Successfully unenrolled from all training schedules' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error unenrolling from all training schedules:', err);
    res.status(500).json({ 
      message: 'Error unenrolling from all training schedules',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

// Unenroll user from a specific training schedule
export const unenrollUserTrainingSchedule = async (req, res) => {
  const { scheduleId } = req.params;
  
  // Validate scheduleId is a number
  if (isNaN(parseInt(scheduleId, 10))) {
    return res.status(400).json({ message: 'Invalid training schedule ID' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Verify the schedule exists and user is enrolled
    const enrollmentResult = await client.query(
      `SELECT uts.id, ts.max_participants, 
              (SELECT COUNT(*) FROM user_trainingschedules WHERE schedule_id = $1) as current_participants
       FROM user_trainingschedules uts
       JOIN trainingschedules ts ON uts.schedule_id = ts.id
       WHERE uts.user_id = $2 AND uts.schedule_id = $1`,
      [scheduleId, req.user.id]
    );
    
    if (enrollmentResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'You are not enrolled in this schedule or the schedule does not exist' 
      });
    }
    
    // Delete the enrollment
    await client.query(
      'DELETE FROM user_trainingschedules WHERE user_id = $1 AND schedule_id = $2',
      [req.user.id, scheduleId]
    );
    
    await client.query('COMMIT');
    
    // Get the updated list of enrolled schedules with trainer info
    const result = await client.query(
      `SELECT ts.*, u.first_name as trainer_first_name, u.last_name as trainer_last_name 
       FROM trainingschedules ts
       JOIN user_trainingschedules uts ON ts.id = uts.schedule_id
       LEFT JOIN users u ON ts.trainer_id = u.id
       WHERE uts.user_id = $1`,
      [req.user.id]
    );
    
    // Format the response
    const formattedSchedules = result.rows.map(schedule => ({
      ...schedule,
      time: schedule.time,
      days: typeof schedule.days === 'string' ? JSON.parse(schedule.days) : schedule.days || []
    }));
    
    res.json({
      message: 'Successfully unenrolled from the training schedule',
      schedules: formattedSchedules
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error unenrolling from training schedule:', err);
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
};
