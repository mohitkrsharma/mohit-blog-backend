/**
 * Blog Model
 * 
 * This file defines the schema and model for Blog documents in MongoDB.
 * It includes fields for blog content, metadata, and author reference.
 */

const mongoose = require('mongoose');

/**
 * Blog Schema
 */
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  featuredImage: {
    type: String,
    default: function() {
      // Set random image for the blog using picsum.photos
      // Using a random seed based on the blog title to ensure consistency
      const seed = this.title.length * 5;
      return `https://picsum.photos/seed/${seed}/800/400`;
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Blog author is required']
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

/**
 * Pre-find middleware to populate author information
 */
blogSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'firstName lastName email profilePic'
  });
  next();
});

/**
 * Method to get blog summary
 * @param {number} length - Maximum length of the summary
 * @returns {string} - Blog summary
 */
blogSchema.methods.getSummary = function(length = 150) {
  if (this.content.length <= length) return this.content;
  return this.content.substring(0, length) + '...';
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
