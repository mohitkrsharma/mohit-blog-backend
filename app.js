const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.config');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Fixed typo: 'uplaods' -> '/uploads'

// Routes
app.use('/api/auth', require('./routes/auth.routes')); // Added .routes to match filename
app.use('/api/blogs', require('./routes/blog.routes')); // Changed to blog.routes (singular)

// Error Handling
app.use(require('./middleware/error.middleware'));

module.exports = app;
