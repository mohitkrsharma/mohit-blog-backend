const express = require('express');
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    getCurrentUser
} = require('../controllers/auth.controller');

const authMiddleware = require('../middleware/auth.middleware');

// Routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
