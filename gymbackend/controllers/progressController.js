import Progress from '../models/progressModel.js';

// Weight Tracking Controllers
export const addWeightRecord = async (req, res) => {
  try {
    const { weight_kg, date, notes } = req.body;
    const user_id = req.user.id;

    if (!weight_kg) {
      return res.status(400).json({
        success: false,
        message: 'Weight is required'
      });
    }

    const record = await Progress.addWeightRecord({
      user_id,
      weight_kg,
      date,
      notes
    });

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error adding weight record:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getWeightHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { startDate, endDate = new Date() } = req.query;

    const history = await Progress.getWeightHistory(
      user_id,
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default to last 30 days
      endDate
    );

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting weight history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Body Measurements Controllers
export const addMeasurements = async (req, res) => {
  try {
    const { measurements, date, notes } = req.body;
    const user_id = req.user.id;

    if (!measurements) {
      return res.status(400).json({
        success: false,
        message: 'Measurements are required'
      });
    }

    const record = await Progress.addMeasurements({
      user_id,
      measurements,
      date,
      notes
    });

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error adding measurements:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getMeasurementsHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { startDate, endDate = new Date() } = req.query;

    const history = await Progress.getMeasurementsHistory(
      user_id,
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate
    );

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting measurements history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Exercise Progress Controllers
export const addExerciseProgress = async (req, res) => {
  try {
    const { exercise_name, sets, reps, weight_kg, date, notes } = req.body;
    const user_id = req.user.id;

    if (!exercise_name || !sets || !reps) {
      return res.status(400).json({
        success: false,
        message: 'Exercise name, sets, and reps are required'
      });
    }

    const record = await Progress.addExerciseProgress({
      user_id,
      exercise_name,
      sets,
      reps,
      weight_kg,
      date,
      notes
    });

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error adding exercise progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getExerciseHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { exercise_name, startDate, endDate = new Date() } = req.query;

    if (!exercise_name) {
      return res.status(400).json({
        success: false,
        message: 'Exercise name is required'
      });
    }

    const history = await Progress.getExerciseHistory(
      user_id,
      exercise_name,
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate
    );

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting exercise history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Fitness Goals Controllers
export const addGoal = async (req, res) => {
  try {
    const { goal_type, target_value, current_value, target_date, notes } = req.body;
    const user_id = req.user.id;

    if (!goal_type || !target_value || current_value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Goal type, target value, and current value are required'
      });
    }

    const goal = await Progress.addGoal({
      user_id,
      goal_type,
      target_value,
      current_value,
      target_date,
      notes
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error adding goal:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const updateGoalProgress = async (req, res) => {
  try {
    const { goal_id } = req.params;
    const { current_value, status } = req.body;

    if (current_value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Current value is required'
      });
    }

    const goal = await Progress.updateGoalProgress(goal_id, current_value, status);

    res.status(200).json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getActiveGoals = async (req, res) => {
  try {
    const user_id = req.user.id;
    const goals = await Progress.getActiveGoals(user_id);

    res.status(200).json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error('Error getting active goals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Progress Summary Controller
export const getProgressSummary = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { days = 30 } = req.query;

    const summary = await Progress.getProgressSummary(user_id, days);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting progress summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
