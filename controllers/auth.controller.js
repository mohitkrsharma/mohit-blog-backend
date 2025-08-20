/**
 * Authentication Controller
 * 
 * This controller handles user authentication operations including
 * registration, login, password reset, and profile management.
 */

const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt.utils');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/mailer');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
      // profilePic will be generated automatically based on name
    });

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePic: user.profilePic,
        userType: user.userType
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return user data and token
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePic: user.profilePic,
        userType: user.userType
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res, next) => {
  try {
    // User is already attached to req by auth middleware
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // To prevent user enumeration, return success even if not found
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    // Generate reset token and set expiry
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const expiresInMinutes = 15;

// Build reset URL (prefer FRONTEND_URL or APP_URL)
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200'; // Default to Angular port
      // Include email in query params so UI can prefill the input when user clicks the link
      const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password/${resetToken}?email=${encodeURIComponent(user.email)}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.getFullName ? user.getFullName() : user.firstName,
        resetUrl,
        expiresInMinutes
      });
    } catch (mailErr) {
      // If email sending fails, clear the token so it can be retried
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw mailErr;
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password for logged-in user
 * @route PUT /api/auth/reset-password
 * @access Private
 */
const resetPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;

    // Validate input
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    if (confirmNewPassword !== undefined && newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Load the full user document to update password (req.user has password omitted)
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set the new password; pre-save hook will hash it
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using token
 * @route POST /api/auth/reset-password/:token
 * @access Public
 */
const resetPasswordWithToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide a new password' });
    }
    if (confirmNewPassword !== undefined && newPassword !== confirmNewPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirm password do not match' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Hash token and find matching user with unexpired token
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or has expired' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  resetPasswordWithToken
};
