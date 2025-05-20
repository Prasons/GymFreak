import pool from "../config/db.js";
import crypto from "crypto";

// Generate a unique referral code for a user
export const generateReferralCode = async (userId) => {
  // 8-character alphanumeric
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  await pool.query(
    "UPDATE users SET referral_code = $1 WHERE id = $2",
    [code, userId]
  );
  return code;
};

// Get current user's referral code (generate if missing)
export const getMyReferralCode = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRes = await pool.query("SELECT referral_code FROM users WHERE id = $1", [userId]);
    let code = userRes.rows[0]?.referral_code;
    if (!code) {
      code = await generateReferralCode(userId);
    }
    res.json({ referral_code: code });
  } catch (err) {
    console.error("Error getting referral code:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Use a referral code during signup
export const useReferralCode = async (req, res) => {
  const { referral_code, referred_email } = req.body; // referred_email is the new user's email
  try {
    // Find referrer
    const referrerRes = await pool.query("SELECT id FROM users WHERE referral_code = $1", [referral_code]);
    if (referrerRes.rows.length === 0) {
      return res.status(404).json({ message: "Referral code not found" });
    }
    const referrerId = referrerRes.rows[0].id;
    // Create referral entry (referred_user_id will be filled after user signup)
    const result = await pool.query(
      `INSERT INTO referrals (referrer_user_id, referred_email, status) VALUES ($1, $2, 'pending') RETURNING *`,
      [referrerId, referred_email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error using referral code:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// After referred user signs up, update referral record
export const completeReferral = async (referred_email, userId) => {
  // Called after user signup
  await pool.query(
    `UPDATE referrals SET referred_user_id = $1, status = 'success' WHERE referred_email = $2`,
    [userId, referred_email]
  );
};

// Get all referrals made by the current user
export const getMyReferrals = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(
      `SELECT r.*, u.email AS referred_email_actual FROM referrals r LEFT JOIN users u ON r.referred_user_id = u.id WHERE r.referrer_user_id = $1 ORDER BY r.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching referrals:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all referrals
export const getAllReferrals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, ref.email AS referrer_email, u.email AS referred_email_actual FROM referrals r JOIN users ref ON r.referrer_user_id = ref.id LEFT JOIN users u ON r.referred_user_id = u.id ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all referrals:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Mark reward as given
export const markRewardGiven = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE referrals SET reward_given = true WHERE id = $1", [id]);
    res.json({ message: "Reward marked as given" });
  } catch (err) {
    console.error("Error updating reward status:", err);
    res.status(500).json({ message: "Server error" });
  }
};
