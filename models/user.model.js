const mongoose= require('mongoose');
const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    profilePic: {type: String},
    userType: {type: String, enum: ['admin', 'user'], default: 'user'},
},{timestamps: true})

module.exports = mongoose.model('User', userSchema);
