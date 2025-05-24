import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../config/db.js";
import Admin from "../models/adminModel.js"; // Use ES module import for the Admin model
import { sendEmail } from "../scripts/email-service.js"; 
import { signuptemplate } from "../scripts/email-templates.js";

// Store refresh tokens in memory for simplicity (use a database in production)
const refreshTokens = new Map();

// Register
import { useReferralCode, completeReferral, generateReferralCode } from "./referralController.js";

export const registerUser = async (req, res) => {
  const { name, email, password, referral_code } = req.body;

  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. If referral_code provided, create pending referral
    if (referral_code) {
      await useReferralCode({ body: { referral_code, referred_email: email } }, { status: () => ({ json: () => {} }) });
    }

    const newUser = await pool.query(
  `INSERT INTO users 
   (first_name, email, password, status) 
   VALUES ($1, $2, $3, 'Active') 
   RETURNING id, first_name, email, status, created_at`,
  [name, email, hashedPassword]
);

    // 2. Generate a referral code for the new user
    await generateReferralCode(newUser.rows[0].id);

    // 3. If referral_code was used, complete the referral
    if (referral_code) {
      await completeReferral(email, newUser.rows[0].id);
    }
 

      const result = await sendEmail({
        to:email,
        ...signuptemplate
      });
    
    res.status(201).json({ 
      message: "User created successfully", 
      user: {
        ...newUser.rows[0],
        name: name,
        mailsent:result
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
export const loginUser = async (req, res) => {
  const { email, password, isAdmin = false } = req.body; // Added isAdmin to differentiate login type

  try {
    console.log('Login attempt for email:', email);
    
    // Determine the table to query based on isAdmin flag
    const table = isAdmin ? "admins" : "users";
    console.log('Querying table:', table);

    const user = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
    console.log('Query result:', user.rows);

    if (user.rows.length === 0) {
      console.log('No user found with email:', email);
      return res.status(400).json({ message: "Invalid email" });
    }

    // Check user status
    if (user.rows[0].status !== 'Active') {
      console.log('User account is not active:', user.status);
      return res.status(403).json({ message: "Account is not active" });
    }

    console.log('Input password:', password);
    console.log('Stored hash:', user.rows[0].password);
    
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password comparison failed');
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user.rows[0].id, isAdmin: isAdmin || false }, // Include isAdmin in the token payload
      process.env.JWT_SECRET,
      {
        expiresIn: "15m", // Shorter expiration for access token
      }
    );

    const refreshToken = crypto.randomBytes(40).toString("hex");
    refreshTokens.set(refreshToken, {
      userId: user.rows[0].id,
      isAdmin: isAdmin || false,
    });

    const response = { 
      message: "Login successful", 
      token, 
      refreshToken,
      user: {
        id: user.rows[0].id,
        email: user.rows[0].email,
        first_name: user.rows[0].first_name,
        last_name: user.rows[0].last_name,
        isAdmin: isAdmin || false
      }
    };

    console.log('Sending login response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Refresh Token Endpoint
export const refreshAccessToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  const { userId, isAdmin } = refreshTokens.get(refreshToken);

  const newToken = jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  res.json({ token: newToken });
};

// Admin Login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { adminId: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Profile
export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, status FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Member Management ---
// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, first_name, email, status FROM users");
    // Combine first_name and last_name into a single name field for the frontend
    const users = result.rows.map(user => ({
      ...user,
      name: `${user.first_name || ''}`
    }));
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get single user by ID (admin or self)
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    // Only admin or the user themselves can view
    if (!req.user.isAdmin && req.user.userId != id) {
      return res.status(403).json({ message: "Access denied." });
    }
    const result = await pool.query(
      "SELECT id, first_name, email, status FROM users WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user by id:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user (admin or self)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    // Only admin or the user themselves can update
    if (!req.user.isAdmin && req.user.userId != id) {
      return res.status(403).json({ message: "Access denied." });
    }
    const result = await pool.query(
      "UPDATE users SET first_name = $1, email = $2 WHERE id = $3 RETURNING id, first_name, email, status",
      [name, email, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Change user status (admin only)
export const changeUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admins only." });
    }
    const result = await pool.query(
      "UPDATE users SET status = $1 WHERE id = $2 RETURNING id, first_name, email, status",
      [status, parseInt(id)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Status updated", user: result.rows[0] });
  } catch (error) {
    console.error("Error changing status:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admins only." });
    }
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
