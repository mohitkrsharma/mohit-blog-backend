/**
 * Authentication Middleware
 * 
 * This middleware verifies JWT tokens and protects routes that require authentication.
 * It also provides authorization checks for user types.
 */

const { verifyToken } = require('../utils/jwt.utils');
const User = require('../models/user.model');

/**
 * Middleware to protect routes that require authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }

    // Find user by id from decoded token
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

/**
 * Middleware to restrict access to specific user types
 * @param {...String} roles - User types allowed to access the route
 * @returns {Function} Middleware function
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user type is in allowed roles
    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

/**
 * Middleware to check if user is the author of a blog post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAuthor = async (req, res, next) => {
  try {
    // Get blog ID from request parameters
    const blogId = req.params.id;
    
    // Find blog by ID
    const Blog = require('../models/blog.model');
    const blog = await Blog.findById(blogId);
    
    // Check if blog exists
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Check if user is the author or an admin
    if (blog.author._id.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to perform this action'
      });
    }
    
    next();
  } catch (error) {
    console.error('isAuthor middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  protect,
  restrictTo,
  isAuthor
};
