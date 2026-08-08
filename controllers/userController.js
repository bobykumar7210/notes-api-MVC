const userService = require('../services/userService');
const AppError = require('../utils/AppError');

exports.registerUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new AppError('Username and password are required', 400);
        }
        const user = await userService.registerUser({ username, password });
        res.status(201).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new AppError('Username and password are required', 400);
        }
        const token = await userService.loginUser(username, password);
        res.json({
            success: true,
            token
        });
    } catch (err) {
        next(err);
    }
}; 

exports.getUserProfile = async (req, res, next) => {
    try {
        const username = req.user.username;
        const user = await userService.getUserByUsername(username);
        res.json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json({
            success: true,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        await userService.deleteUser(userId);
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};