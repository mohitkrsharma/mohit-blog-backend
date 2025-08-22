/**
 * Express Application Setup
 * 
 * This file configures the Express application, sets up middleware,
 * and registers API routes.
 */

// Import required modules
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const blogRoutes = require('./routes/blog.routes');

// Import middleware
const errorMiddleware = require('./middleware/error.middleware');

// Initialize Express app
const app = express();

// Configure middleware
app.use(cors({
    origin: "https://mohit-blog.vercel.app" // for dev, later restrict to your frontend domain
}));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(morgan('dev')); // HTTP request logger

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Base route for API health check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Blog API' });
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware
app.use(errorMiddleware);

module.exports = app;
