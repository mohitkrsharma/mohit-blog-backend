const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    featuredImage: {type: String},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
}, {timestamps: true});

module.exports = mongoose.model('Blog', blogSchema);
