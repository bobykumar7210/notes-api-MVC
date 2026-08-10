const User = require('../models/User');
const { USER_STATUS } = require('../utils/constants');

exports.createUser = async (userData) => {
    const user = new User(userData);
    return await user.save();
};

exports.getUserByUsername = async (username) => {
    return await User.findOne({ username });
};

exports.getUserByEmail = async (email) => {
    return await User.findOne({ email });
};

exports.getUserById = async (id) => {
    return await User.findById(id).select('-password');
};

exports.getAllUsers = async (status = USER_STATUS.ACTIVE) => {
    if (status === USER_STATUS.ACTIVE) {
        return await User.find(
            {
                $or: [
                    { status: USER_STATUS.ACTIVE },
                    { status: { $exists: false } },
                    { status: null }
                ]
            },
            '-password'
        );
    }
    return await User.find({ status }, '-password');
};

exports.softDeleteUserById = async (id) => {
    return await User.findOneAndUpdate(
        {
            _id: id,
            $or: [
                { status: USER_STATUS.ACTIVE },
                { status: { $exists: false } },
                { status: null }
            ]
        },
        { status: USER_STATUS.DELETED, deletedAt: new Date() },
        { new: true }
    ).select('-password');
};

exports.restoreUserById = async (id) => {
    return await User.findOneAndUpdate(
        { _id: id, status: USER_STATUS.DELETED },
        { status: USER_STATUS.ACTIVE, deletedAt: null },
        { new: true }
    ).select('-password');
};
