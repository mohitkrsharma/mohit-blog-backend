/**
 * Server Entry Point
 * 
 * This file initializes the Express server and connects to the MongoDB database.
 * It serves as the main entry point for the blog backend application.
 */

// Suppress the punycode deprecation warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.code === 'DEP0040') {
    // Ignore the punycode deprecation warning
    return;
  }
  // Log all other warnings
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const app = require('./app');
const connectDB = require('./config/db.config');

// Define port
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start a server
connectDB()
  .then(() => {
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close the server and exit process
  process.exit(1);
});
