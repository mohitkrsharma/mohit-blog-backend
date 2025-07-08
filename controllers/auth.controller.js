const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const {generateToken} = require('../utils/jwt.utils');

exports.register = async (req, res) => {
    try{
        const {firstName, lastName, email, password} = req.body;
        const profilePic = req.file?.fileName;

        if(await User.findOne({email})){
            return res.status(400).json({message: 'Email already registered'});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            profilePic
        });

        res.status(201).json({
            message: 'User created successfully', 
            user: newUser,
            token: generateToken(newUser._id),
            userId: newUser._id,
            userType: newUser.userType
        });
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}

exports.login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message: 'Invalid credentials'});
        }
        res.status(200).json({
            message: 'Login successful',
            token: generateToken(user._id),
            userId: user._id,
            userType: user.userType
        })
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}

exports.forgotPassword = async (req, res) => {
    try{
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: 'Email not found'});
        }
        res.status(200).json({message: 'Password reset link (simulated)'});
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}

exports.getCurrentUser = async (req, res) => {
    res.json(req.user);
}
