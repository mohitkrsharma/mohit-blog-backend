/**
 * Blog Routes
 * 
 * This file defines the API routes for blog operations.
 * It includes routes for creating, reading, updating, and deleting blog posts.
 */

const express = require('express');
const router = express.Router();
const { 
  getAllBlogs, 
  getBlogById, 
  createBlog, 
  updateBlog, 
  deleteBlog 
} = require('../controllers/blog.controller');
const { protect, isAuthor } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);

// Protected routes
router.post('/', protect, createBlog);

// Protected routes with author check
router.put('/:id', protect, isAuthor, updateBlog);
router.delete('/:id', protect, isAuthor, deleteBlog);

module.exports = router;
