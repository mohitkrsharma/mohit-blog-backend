const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
} = require('../controllers/blog.controller');

const router = express.Router();

// Routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', authMiddleware, createBlog);
router.put('/:id', authMiddleware, updateBlog);
router.delete('/:id', authMiddleware, deleteBlog);

module.exports = router;
