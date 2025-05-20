import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  adminLogin,
  getAllUsers,
  getUserById,
  updateUser,
  changeUserStatus,
  deleteUser
} from "../controllers/userController.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile); // Protected profile route
router.post("/admin/login", adminLogin); // Route for admin login

// --- Member Management (Admin only) ---
router.get("", adminProtect, getAllUsers); // List all users
router.get("/:id", adminProtect, getUserById); // Get user by ID
router.put("/:id", adminProtect, updateUser); // Update user
router.patch("/:id/status", adminProtect, changeUserStatus); // Change status
router.delete("/:id", adminProtect, deleteUser); // Delete user

// --- User Profile (Authenticated users) ---
router.get("/profile/me", protect, getProfile); // Get current user's profile
router.put("/profile/me", protect, updateUser); // Update current user's profile

export default router;
