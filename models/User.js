const mongoose = require('mongoose');
const { ROLES, USER_STATUS } = require('../utils/constants');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: [ROLES.ADMIN, ROLES.USER],
        default: ROLES.USER
    },
    status: {
        type: String,
        enum: [USER_STATUS.ACTIVE, USER_STATUS.DELETED],
        default: USER_STATUS.ACTIVE,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
