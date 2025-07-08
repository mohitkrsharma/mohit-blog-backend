const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/auth.middleware');
const {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
} = require('../controllers/blog.controller');

const router = express.Router();

// Multer Config
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
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/', authMiddleware, upload.single('featuredImage'), createBlog);
router.put('/:id', authMiddleware, upload.single('featuredImage'), updateBlog);
router.delete('/:id', authMiddleware, deleteBlog);

module.exports = router;
