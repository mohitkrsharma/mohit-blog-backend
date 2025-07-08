const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const {
    register,
    login,
    forgotPassword,
    getCurrentUser
} = require('../controllers/auth.controller');

const authMiddleware = require('../middleware/auth.middleware');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});

const upload = multer({storage});

// Routes
router.post('/register', upload.single('profilePic'), register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
