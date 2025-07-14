const Blog = require('../models/blog.model');

exports.createBlog = async(req, res) => {
    try{
        const {title, content} = req.body;

        const blog = await Blog.create({
            title,
            content,
            author: req.user._id
        })

        res.status(201).json(blog);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}

exports.getAllBlogs = async (req, res) => {
    try{
        const {search} = req.query;
        const query = search ? {title: {$regex: search, $options: 'i'}} : {};

        const blogs = await Blog.find(query).populate('author','firstName lastName profilePic');
        res.json(blogs);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}

exports.getBlogById = async (req, res) => {
    try{
        const blog = await Blog.findById(req.params.id).populate('author','firstName lastName profilePic');
        if(!blog){
            return res.status(404).json({message: 'Blog not found'});
        }
        res.json(blog);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}


exports.updateBlog = async (req, res) => {
    try{
        const blog = await Blog.findById(req.params.id);
        if(!blog){
            return res.status(404).json({message: 'Blog not found'});
        }

        if(req.user._id.toString() !== blog.author.toString()){
            return res.status(401).json({message: 'Unauthorized'});
        }

        blog.title = req.body.title || blog.title;
        blog.content = req.body.content || blog.content;

        const updated = await blog.save();
        res.json(updated);
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}


exports.deleteBlog = async (req, res) => {
    try{
        const blog = await Blog.findById(req.params.id);
        if(!blog){
            return res.status(404).json({message: 'Blog not found'});
        }
        if(req.user._id.toString() !== blog.author.toString()){
            return res.status(401).json({message: 'Unauthorized'});
        }
        await blog.deleteOne();
        res.json({message: 'Blog deleted successfully'});
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}
