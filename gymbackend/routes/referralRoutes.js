import express from "express";
import {
  getMyReferralCode,
  useReferralCode,
  getMyReferrals,
  getAllReferrals,
  markRewardGiven,
} from "../controllers/referralController.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User: Get my referral code
router.get("/code", protect, getMyReferralCode);

// Public: Use referral code at signup
router.post("/use", useReferralCode);

// User: See my referrals
router.get("/my-referrals", protect, getMyReferrals);

// Admin: See all referrals
router.get("/all", protect, adminProtect, getAllReferrals);

// Admin: Mark reward as given
router.put("/reward/:id", protect, adminProtect, markRewardGiven);

export default router;
