import express from "express";
import {
  getDietPlans,
  createDietPlan,
  updateDietPlan,
  deleteDietPlan,
  getUserDietPlan,
  setUserDietPlan,
  unsetUserDietPlan,
  removeUserDietPlan,
} from "../controllers/dietPlanController.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: Get all diet plans
router.get("/", getDietPlans);

// Admin: Create, update, delete diet plans
router.post("/", protect, adminProtect, createDietPlan);
router.put("/:id", protect, adminProtect, updateDietPlan);
router.delete("/:id", protect, adminProtect, deleteDietPlan);

// User: Get/set/unset selected diet plan
router.get("/user/selected", protect, getUserDietPlan);
router.post("/user/selected", protect, setUserDietPlan);
// User: Remove a specific diet plan from selection
router.delete("/user/selected/:dietplan_id", protect, removeUserDietPlan);
router.delete("/user/selected", protect, unsetUserDietPlan);

export default router;
