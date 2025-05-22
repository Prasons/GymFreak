import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  addWeightRecord,
  getWeightHistory,
  addMeasurements,
  getMeasurementsHistory,
  addExerciseProgress,
  getExerciseHistory,
  addGoal,
  updateGoalProgress,
  getActiveGoals,
  getProgressSummary
} from '../controllers/progressController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Weight tracking routes
router.post('/weight', addWeightRecord);
router.get('/weight', getWeightHistory);

// Body measurements routes
router.post('/measurements', addMeasurements);
router.get('/measurements', getMeasurementsHistory);

// Exercise progress routes
router.post('/exercise', addExerciseProgress);
router.get('/exercise', getExerciseHistory);

// Fitness goals routes
router.post('/goals', addGoal);
router.patch('/goals/:goal_id', updateGoalProgress);
router.get('/goals', getActiveGoals);

// Progress summary route
router.get('/summary', getProgressSummary);

export default router;
