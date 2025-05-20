import express from "express";
import {
  getTrainingSchedules,
  createTrainingSchedule,
  updateTrainingSchedule,
  deleteTrainingSchedule,
  getUserTrainingSchedules,
  enrollUserTrainingSchedules,
  unenrollAllUserTrainingSchedules,
  unenrollUserTrainingSchedule,
} from "../controllers/trainingScheduleController.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public: Get all training schedules
router.get("/", getTrainingSchedules);

// Admin: Create, update, delete training schedules
router.post("/", protect, adminProtect, createTrainingSchedule);
router.put("/:id", protect, adminProtect, updateTrainingSchedule);
router.delete("/:id", protect, adminProtect, deleteTrainingSchedule);

// User: Get/enroll/unenroll training schedules
router.get("/user/enrollments", protect, getUserTrainingSchedules);
router.post("/user/enrollments", protect, enrollUserTrainingSchedules);

// Unenroll from a specific schedule
router.delete("/user/enrollments/:schedule_id", protect, unenrollUserTrainingSchedule);

// Unenroll from all schedules
router.delete("/user/enrollments", protect, unenrollAllUserTrainingSchedules);

export default router;
