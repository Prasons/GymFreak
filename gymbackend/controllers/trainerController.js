import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../config/db.js";
import Admin from "../models/adminModel.js"; // Use ES module import for the Admin model

// Store refresh tokens in memory for simplicity (use a database in production)
const refreshTokens = new Map();

// Register
import { useReferralCode, completeReferral, generateReferralCode } from "./referralController.js";

export const registerTrainer = async (req, res) => {
  const { name, email, experience, specialty,status } = req.body;

  try {
    const trainerExists = await pool.query(
      "SELECT * FROM trainers WHERE email = $1",
      [email]
    );

    if (trainerExists.rows.length > 0) {
      return res.status(400).json({ message: "Trainer already exists" });
    }

    const newTrainer = await pool.query(
  `INSERT INTO trainers 
   (name, email, experience, specialty, status) 
   VALUES ($1, $2, $3, $4, $5) 
   RETURNING *`,
  [name, email, experience, specialty, status]
    );
  
    res.status(201).json({ 
      message: "Trainer created successfully", 
      trainer: {
        ...newTrainer.rows[0],
        name: `${name || ''}`.trim() 
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
export const loginTrainer = async (req, res) => {
  const { email, password, isAdmin = false } = req.body; // Added isAdmin to differentiate login type

  try {
    console.log('Login attempt for email:', email);
    
    // Determine the table to query based on isAdmin flag
    const table = isAdmin ? "admins" : "trainers";
    console.log('Querying table:', table);

    const trainer = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
    console.log('Query result:', trainer.rows);

    if (trainer.rows.length === 0) {
      console.log('No trainer found with email:', email);
      return res.status(400).json({ message: "Invalid email" });
    }

    // Check trainer status
    if (trainer.rows[0].status !== 'active') {
      console.log('Trainer account is not active:', trainer.status);
      return res.status(403).json({ message: "Account is not active" });
    }

    console.log('Input password:', password);
    console.log('Stored hash:', trainer.rows[0].password);
    
    const isMatch = await bcrypt.compare(password, trainer.rows[0].password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password comparison failed');
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { trainerId: trainer.rows[0].id, isAdmin: isAdmin || false }, // Include isAdmin in the token payload
      process.env.JWT_SECRET,
      {
        expiresIn: "15m", // Shorter expiration for access token
      }
    );

    const refreshToken = crypto.randomBytes(40).toString("hex");
    refreshTokens.set(refreshToken, {
      trainerId: trainer.rows[0].id,
      isAdmin: isAdmin || false,
    });

    const response = { 
      message: "Login successful", 
      token, 
      refreshToken,
      trainer: {
        id: trainer.rows[0].id,
        email: trainer.rows[0].email,
        name: trainer.rows[0].name,
        last_name: trainer.rows[0].last_name,
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

  const { trainerId, isAdmin } = refreshTokens.get(refreshToken);

  const newToken = jwt.sign({ trainerId, isAdmin }, process.env.JWT_SECRET, {
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
      "SELECT id, name, email, status FROM trainers WHERE id = $1",
      [req.user.trainerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Member Management ---
// Get all trainers (admin only)
export const getAllTrainers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM trainers");
    // Combine name and last_name into a single name field for the frontend
    const trainers = result.rows.map(trainer => ({
      ...trainer,
      name: `${trainer.name || ''}`
    }));
    res.json(trainers);
  } catch (error) {
    console.error("Error fetching trainers:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get single trainer by ID (admin or self)
export const getTrainerById = async (req, res) => {
  const { id } = req.params;
  try {
    // Only admin or the trainer themselves can view
    if (!req.user.isAdmin && req.user.trainerId != id) {
      return res.status(403).json({ message: "Access denied." });
    }
    const result = await pool.query(
      "SELECT * FROM trainers WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching trainer by id:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update trainer (admin or self)
export const updateTrainer = async (req, res) => {
  const { id } = req.params;
  const { name, email, experience, specialty } = req.body;
  try {
    // Only admin or the trainer themselves can update
    if (!req.user.isAdmin && req.user.trainerId != id) {
      return res.status(403).json({ message: "Access denied." });
    }
    const result = await pool.query(
      "UPDATE trainers SET name = $1, email = $2, experience=$3, specialty=$4 WHERE id = $5 RETURNING *",
      [name, email,  experience, specialty ,id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    res.json({ message: "Trainer updated", trainer: result.rows[0] });
  } catch (error) {
    console.error("Error updating trainer:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Change trainer status (admin only)
export const changeTrainerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admins only." });
    }
    const result = await pool.query(
      "UPDATE trainers SET status = $1 WHERE id = $2 RETURNING *",
      [status, parseInt(id)]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    res.json({ message: "Status updated", trainer: result.rows[0] });
  } catch (error) {
    console.error("Error changing status:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete trainer (admin only)
export const deleteTrainer = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admins only." });
    }
    const result = await pool.query(
      "DELETE FROM trainers WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Trainer not found" });
    }
    res.json({ message: "Trainer deleted" });
  } catch (error) {
    console.error("Error deleting trainer:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
