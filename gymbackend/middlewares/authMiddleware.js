import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

/**
 * @desc    Protect routes - verify JWT token for regular users
 * @access  Private
 */
export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired, please login again' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: 'Not authorized, token failed' 
    });
  }
};

/**
 * @desc    Protect admin routes - verify JWT token and admin status
 * @access  Private/Admin
 */
export const adminProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user is admin
    if (!decoded.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized as an admin' 
      });
    }

    // Get admin from the token
    const adminId = decoded.adminId || (decoded.userId ? decoded.userId : null);
    
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: Missing admin ID'
      });
    }
    
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin account is inactive' 
      });
    }

    // Attach admin to request object
    req.user = {
      id: admin.id,
      email: admin.email,
      role: admin.role || 'admin',
      isAdmin: true
    };

    next();
  } catch (error) {
    console.error('Admin token verification error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired, please login again' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: 'Not authorized, token failed' 
    });
  }
};

/**
 * @desc    Authorize admin roles
 * @param   {...String} roles - Allowed roles
 * @returns {Function} Middleware function
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to access this route' 
      });
    }
    
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ 
        success: false,
        message: `User role ${req.admin.role} is not authorized to access this route` 
      });
    }
    
    next();
  };
};

/**
 * @desc    Generate JWT tokens for admin
 * @param   {Object} admin - Admin object
 * @returns {Object} Object containing accessToken and refreshToken
 */
export const generateAdminTokens = (admin) => {
  // Generate access token (15 minutes)
  const accessToken = jwt.sign(
    { 
      adminId: admin.id, 
      email: admin.email,
      role: admin.role || 'admin',
      isAdmin: true 
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Generate refresh token (7 days)
  const refreshToken = jwt.sign(
    { 
      adminId: admin.id, 
      isAdmin: true 
    },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + '_refresh',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * @desc    Verify refresh token
 * @access  Public
 */
export const verifyRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ 
      success: false,
      message: 'No refresh token provided' 
    });
  }

  try {
    const decoded = jwt.verify(
      refreshToken, 
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + '_refresh'
    );

    if (!decoded.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid refresh token' 
      });
    }

    req.admin = { id: decoded.adminId };
    next();
  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Refresh token expired, please login again' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: 'Invalid refresh token' 
    });
  }
};
