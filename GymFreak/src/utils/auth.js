import { jwtDecode } from 'jwt-decode';

// Token expiration buffer in seconds (5 minutes)
const TOKEN_EXPIRATION_BUFFER = 5 * 60;

// Utility functions for authentication

/**
 * Save access and refresh tokens to localStorage
 * @param {Object} tokens
 * @param {string} tokens.accessToken - The access token to save
 * @param {string} tokens.refreshToken - The refresh token to save
 * @param {string} [tokens.adminToken] - The admin token to save (if different from accessToken)
 * @param {boolean} [isAdmin=false] - Whether this is an admin token
 */
export function saveTokens({ accessToken, refreshToken, adminToken, isAdmin = false }) {
  try {
    const tokenKey = 'authToken'; // Always use 'authToken' for regular users
    
    // Save access token
    if (accessToken) {
      localStorage.setItem(tokenKey, accessToken);
      console.log('Access token saved');
    }
    
    // Save admin token if provided (or use accessToken if not)
    if (isAdmin) {
      const adminTokenToSave = adminToken || accessToken;
      localStorage.setItem('adminToken', adminTokenToSave);
      console.log('Admin token saved');
    }
    
    // Save refresh token
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      console.log('Refresh token saved');
    }
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw new Error('Failed to save authentication tokens');
  }
}

/**
 * Retrieve the access token from localStorage
 * @returns {string | null} - The access token or null if not found
 */
export function getAccessToken() {
  // Check for admin token first, then regular auth token
  const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
  console.log('Retrieved access token:', token ? 'Token exists' : 'No token found');
  return token;
}

/**
 * Retrieve the refresh token from localStorage
 * @returns {string | null} - The refresh token or null if not found
 */
export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

/**
 * Set the access token
 * @param {string} token - The access token to save
 * @param {boolean} [isAdmin=false] - Whether this is an admin token
 */
export function setToken(token, isAdmin = false) {
  const tokenKey = isAdmin ? 'adminToken' : 'authToken';
  localStorage.setItem(tokenKey, token);
}

/**
 * Check if a token is expired
 * @param {string} token - The JWT token to check
 * @returns {boolean} - True if token is expired or invalid
 */
export function isTokenExpired(token) {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    // Consider token expired if it's within the buffer time
    return decoded.exp < (currentTime + TOKEN_EXPIRATION_BUFFER);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user has a valid token
 */
export function isAuthenticated() {
  const token = getAccessToken();
  return !isTokenExpired(token);
}

/**
 * Check if current user is an admin
 * @returns {boolean} - True if user is an admin
 */
export function isAdmin() {
  return localStorage.getItem('adminAuth') === 'true';
}

/**
 * Clear all authentication data
 * @param {boolean} [isAdmin=false] - Whether to clear admin data
 */
export function clearAuthData(isAdmin = false) {
  localStorage.removeItem(isAdmin ? 'adminToken' : 'authToken');
  localStorage.removeItem('refreshToken');
  
  if (isAdmin) {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminInfo');
  } else {
    localStorage.removeItem('userInfo');
  }
}

export function setAdminToken(token) {
  localStorage.setItem("adminToken", token);
}

export function getAdminToken() {
  const token = localStorage.getItem("adminToken");
  if (isTokenExpired(token)) {
    clearAuthData(true);
    return null;
  }
  return token;
}

/**
 * Remove access and refresh tokens from localStorage
 */
export function removeTokens() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('adminToken');
}

/**
 * Get the current user from the JWT token
 * @returns {Object | null} - The decoded token payload or null if not authenticated
 */
export function getCurrentUser() {
  try {
    const token = getAccessToken();
    if (!token) return null;
    
    // Decode the token to get user info
    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
