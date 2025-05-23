import express from "express";
import {
  registerTrainer,
  loginTrainer,
  getProfile,
  adminLogin,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  changeTrainerStatus,
  deleteTrainer
} from "../controllers/trainerController.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerTrainer);
router.post("/login", loginTrainer);
router.get("/profile", protect, getProfile); // Protected profile route
router.post("/admin/login", adminLogin); // Route for admin login

// --- Member Management (Admin only) ---
router.get("", adminProtect, getAllTrainers); // List all trainers
router.get("/:id", adminProtect, getTrainerById); // Get trainer by ID
router.put("/:id", adminProtect, updateTrainer); // Update trainer
router.patch("/:id/status", adminProtect, changeTrainerStatus); // Change status
router.delete("/:id", adminProtect, deleteTrainer); // Delete trainer

// --- Trainer Profile (Authenticated trainers) ---
router.get("/profile/me", protect, getProfile); // Get current trainer's profile
router.put("/profile/me", protect, updateTrainer); // Update current trainer's profile

export default router;
