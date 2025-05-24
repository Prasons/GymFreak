import express from "express";
import { check } from "express-validator";
import {
  getAllDietPlans,
  getDietPlan,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan,
  toggleDietPlanStatus,
  setUserDietPlan,
  getUserDietPlan,
  removeUserDietPlan,
  deleteUserDietPlans
} from "../controllers/dietPlanController.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Validation middleware
const validateDietPlan = [
  check("name", "Name is required").not().isEmpty(),
  check("difficulty", "Difficulty is required").isIn([
    "beginner",
    "intermediate",
    "advanced",
  ]),
  check("duration_weeks", "Duration must be a positive number").isInt({
    min: 1,
  }),
  check("target_goal", "Target goal is required").not().isEmpty(),
  check("daily_calories", "Daily calories must be a positive number").isInt({
    min: 0,
  }),
  check("protein_grams", "Protein must be a positive number").isInt({ min: 0 }),
  check("carbs_grams", "Carbs must be a positive number").isInt({ min: 0 }),
  check("fat_grams", "Fat must be a positive number").isInt({ min: 0 }),
  check("meals").optional().isArray(),
  check("meals.*.meal_type", "Meal type is required").not().isEmpty(),
  check("meals.*.name", "Meal name is required").not().isEmpty(),
];

// Public routes
router.get("/", getAllDietPlans);
router.get("/:id", getDietPlan);

// Protected Admin routes
router.post(
  "/",
  protect,
  adminProtect,
  validateDietPlan,
  createDietPlan
);
router.put(
  "/:id",
  protect,
  adminProtect,
  validateDietPlan,
  updateDietPlan
);
router.delete("/:id", protect, adminProtect, deleteDietPlan);
router.patch(
  "/:id/toggle-status",
  protect,
  adminProtect,
  toggleDietPlanStatus
);

// User diet plan routes
router.post("/users/plans/", protect, setUserDietPlan);
router.get("/users/plans/", protect, getUserDietPlan);
router.delete("/users/plans/all", protect, deleteUserDietPlans);
router.delete("/users/plans/:id", protect, removeUserDietPlan);

export default router;