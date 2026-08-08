const User = require('../models/User');

exports.createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

exports.getUserByUsername = async (username) => {
    return await User.findOne({ username });
};

exports.getAllUsers = async () => {
    return await User.find({}, '-password');
};

exports.deleteUserById = async (id) => {
    return await User.findByIdAndDelete(id);
};