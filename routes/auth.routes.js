/**
 * Authentication Routes
 * 
 * This file defines the API routes for user authentication operations.
 * It includes routes for registration, login, profile management, and password reset.
 */

const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  forgotPassword,
  resetPassword 
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/reset-password', protect, resetPassword);

module.exports = router;
