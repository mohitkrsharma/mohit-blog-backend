/**
 * JWT Utilities
 * 
 * This file contains utility functions for JWT token generation and verification.
 * These functions are used for user authentication and authorization.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object containing id and other user data
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  // Create payload with user ID and type
  const payload = {
    id: user._id,
    userType: user.userType
  };

  // Sign the token with JWT_SECRET from environment variables
  // Token expires in 30 days
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    // Verify the token with JWT_SECRET
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Return null if token is invalid
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
