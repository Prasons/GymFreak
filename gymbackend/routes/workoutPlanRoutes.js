import express from "express";
import {
  getWorkoutPlans,
  createWorkoutPlan,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  getUserWorkoutPlan,
  setUserWorkoutPlan,
  unsetUserWorkoutPlan,
  removeUserWorkoutPlan,
} from "../controllers/workoutPlanController.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: Get all workout plans
router.get("/", getWorkoutPlans);

// Admin: Create, update, delete workout plans
router.post("/", protect, adminProtect, createWorkoutPlan);
router.put("/:id", protect, adminProtect, updateWorkoutPlan);
router.delete("/:id", protect, adminProtect, deleteWorkoutPlan);

// User workout plans routes
router.route('/user/:userId')
  .get(protect, getUserWorkoutPlan)  // GET /api/workout-plans/user/123
  .post(protect, setUserWorkoutPlan) // POST /api/workout-plans/user/123
  .delete(protect, unsetUserWorkoutPlan); // DELETE /api/workout-plans/user/123

// Remove a specific workout plan from user's selection
router.delete('/user/:userId/plans/:planId', protect, removeUserWorkoutPlan); // DELETE /api/workout-plans/user/123/plans/456

export default router;
