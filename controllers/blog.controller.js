/**
 * Blog Controller
 * 
 * This controller handles CRUD operations for blog posts.
 * It includes functions for creating, reading, updating, and deleting blogs.
 */

const Blog = require('../models/blog.model');

/**
 * Get all blog posts
 * @route GET /api/blogs
 * @access Public
 */
const getAllBlogs = async (req, res, next) => {
  try {
    // Extract query parameters for pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Find blogs with pagination
    const blogs = await Blog.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Blog.countDocuments();

    res.status(200).json({
      success: true,
      count: blogs.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: blogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single blog post by ID
 * @route GET /api/blogs/:id
 * @access Public
 */
const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new blog post
 * @route POST /api/blogs
 * @access Private
 */
const createBlog = async (req, res, next) => {
  try {
    // Add author from authenticated user
    req.body.author = req.user._id;

    const blog = await Blog.create(req.body);

    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a blog post
 * @route PUT /api/blogs/:id
 * @access Private
 * @description Only the author of the blog post can update it
 */
const updateBlog = async (req, res, next) => {
  try {
    // Find blog by ID
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Update blog
    // Note: isAuthor middleware already checks if user is the author
    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return updated blog
      runValidators: true // Run model validators
    });

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a blog post
 * @route DELETE /api/blogs/:id
 * @access Private
 * @description Only the author of the blog post can delete it
 */
const deleteBlog = async (req, res, next) => {
  try {
    // Find blog by ID
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Delete blog
    // Note: isAuthor middleware already checks if user is the author
    await blog.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
};
