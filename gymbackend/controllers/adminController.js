import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import Admin from '../models/adminModel.js';
import pool from '../config/db.js';

// Promisify randomBytes
const randomBytesAsync = promisify(randomBytes);

// Store refresh tokens in memory (consider using Redis in production)
const adminRefreshTokens = new Map();

/**
 * @desc    Register a new admin
 * @route   POST /api/admin/register
 * @access  Private/Admin (only existing admins can create new admins)
 */
export const registerAdmin = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Create new admin
    const admin = await Admin.create({
      email,
      password,
      first_name,
      last_name
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateAdminTokens(admin.id);

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: admin.role,
        status: admin.status,
        created_at: admin.created_at
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ 
      message: 'Error registering admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Authenticate admin & get token
 * @route   POST /api/admin/login
 * @access  Public
 */
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email with password
    const result = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );
    
    const admin = result.rows[0];
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await Admin.updateLastLogin(admin.id);

    // Generate tokens
    const { accessToken, refreshToken } = await generateAdminTokens(admin.id);
    
    // Store the refresh token
    adminRefreshTokens.set(refreshToken, { adminId: admin.id, isAdmin: true });

    res.json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: admin.role,
        status: admin.status
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      message: 'Error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get admin profile
 * @route   GET /api/admin/profile
 * @access  Private/Admin
 */
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      id: admin.id,
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name,
      role: admin.role,
      status: admin.status,
      last_login: admin.last_login,
      created_at: admin.created_at
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ 
      message: 'Error fetching admin profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update admin profile
 * @route   PUT /api/admin/profile
 * @access  Private/Admin
 */
export const updateAdminProfile = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;
    
    const updatedAdmin = await Admin.update(req.admin.id, {
      first_name,
      last_name,
      email
    });

    res.json({
      message: 'Profile updated successfully',
      admin: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        first_name: updatedAdmin.first_name,
        last_name: updatedAdmin.last_name,
        role: updatedAdmin.role,
        status: updatedAdmin.status
      }
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ 
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Change admin password
 * @route   PUT /api/admin/change-password
 * @access  Private/Admin
 */
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    await Admin.updatePassword(admin.id, newPassword);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get all admins (paginated)
 * @route   GET /api/admin/admins
 * @access  Private/Admin
 */
export const getAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await Admin.listAdmins(page, limit);
    
    res.json({
      admins: result.admins,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit: result.limit
      }
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ 
      message: 'Error fetching admins',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update admin status
 * @route   PUT /api/admin/admins/:id/status
 * @access  Private/Admin
 */
export const updateAdminStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Prevent deactivating self
    if (parseInt(id) === req.admin.id) {
      return res.status(400).json({ message: 'Cannot update your own status' });
    }

    const admin = await Admin.update(id, { status });
    
    res.json({
      message: 'Admin status updated successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        status: admin.status
      }
    });
  } catch (error) {
    console.error('Update admin status error:', error);
    res.status(500).json({ 
      message: 'Error updating admin status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete admin
 * @route   DELETE /api/admin/admins/:id
 * @access  Private/Admin
 */
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (parseInt(id) === req.admin.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await Admin.delete(id);
    
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    const statusCode = error.message.includes('last admin') ? 400 : 500;
    res.status(statusCode).json({ 
      message: error.message || 'Error deleting admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/admin/refresh-token
 * @access  Public
 */
export const refreshAdminToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !adminRefreshTokens.has(refreshToken)) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }

  const { adminId } = adminRefreshTokens.get(refreshToken);

  // Generate new access token
  const accessToken = jwt.sign(
    { adminId, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Generate new refresh token
  const newRefreshToken = randomBytes(40).toString('hex');
  adminRefreshTokens.delete(refreshToken);
  adminRefreshTokens.set(newRefreshToken, { adminId, isAdmin: true });

  res.json({
    accessToken: accessToken,
    refreshToken: newRefreshToken
  });
};

// Helper function to generate JWT tokens
const generateAdminTokens = async (adminId) => {
  // Generate a secure random string for JWT secret if not set
  if (!process.env.JWT_SECRET) {
    const buf = await randomBytesAsync(32);
    process.env.JWT_SECRET = buf.toString('hex');
  }

  if (!process.env.REFRESH_TOKEN_SECRET) {
    const buf = await randomBytesAsync(32);
    process.env.REFRESH_TOKEN_SECRET = buf.toString('hex');
  }

  // Get admin data to include in the token
  const admin = await Admin.findById(adminId);
  
  if (!admin) {
    throw new Error('Admin not found');
  }

  const accessToken = jwt.sign(
    { 
      id: adminId,
      isAdmin: true,
      role: admin.role || 'admin',
      email: admin.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { 
      id: adminId,
      isAdmin: true
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Middleware to verify admin token
export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user is admin
      if (!decoded.isAdmin) {
        return res.status(401).json({ message: 'Not authorized as an admin' });
      }

      // Get admin from the token
      const admin = await Admin.findById(decoded.adminId);
      
      if (!admin || admin.status !== 'active') {
        return res.status(401).json({ message: 'Admin not found or inactive' });
      }

      req.admin = {
        id: admin.id,
        email: admin.email,
        role: admin.role
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
