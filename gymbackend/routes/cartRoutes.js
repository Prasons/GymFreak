import express from "express";
import {
  addToCart,
  getUserCart,
  removeFromCart,
} from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get user's cart
router.get("/", protect, getUserCart);

// Add item to cart
router.post("/items", protect, addToCart);

// Remove item from cart
router.delete("/items/:id", protect, removeFromCart);

export default router;
