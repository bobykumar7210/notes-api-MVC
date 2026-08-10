const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError.js');
const { ROLES, USER_STATUS } = require('../utils/constants');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinaryService = require('./cloudinaryService');

const assertUniqueCredentials = async (username, email) => {
    const existingUserByUsername = await userRepository.getUserByUsername(username);
    if (existingUserByUsername) {
        throw new AppError(`Username ${username} is already taken`, 400);
    }

    const existingUserByEmail = await userRepository.getUserByEmail(email);
    if (existingUserByEmail) {
        throw new AppError(`Email ${email} is already registered`, 400);
    }
};

exports.registerUser = async (userData) => {
    await assertUniqueCredentials(userData.username, userData.email);

    const password = await bcrypt.hash(userData.password, 10);
    return await userRepository.createUser({
        username: userData.username,
        email: userData.email,
        password,
        role: ROLES.USER,
        status: USER_STATUS.ACTIVE
    });
};

exports.createAdminUser = async (userData) => {
    await assertUniqueCredentials(userData.username, userData.email);

    const password = await bcrypt.hash(userData.password, 10);
    return await userRepository.createUser({
        username: userData.username,
        email: userData.email,
        password,
        role: ROLES.ADMIN,
        status: USER_STATUS.ACTIVE
    });
};

exports.getUserById = async (id) => {
    const user = await userRepository.getUserById(id);
    if (!user) {
        throw new AppError(`User not found`, 404);
    }
    if (user.status === USER_STATUS.DELETED) {
        throw new AppError('Account has been deleted', 401);
    }
    return user;
};  


exports.getAllUsers = async (status = USER_STATUS.ACTIVE) => {
    if (![USER_STATUS.ACTIVE, USER_STATUS.DELETED].includes(status)) {
        throw new AppError('Invalid user status', 400);
    }
    return await userRepository.getAllUsers(status);
};

exports.deleteUser = async (id, requesterId) => {
    if (String(id) === String(requesterId)) {
        throw new AppError('You cannot delete your own account', 400);
    }

    const user = await userRepository.softDeleteUserById(id);
    if (!user) {
        throw new AppError(`User not found`, 404);
    }
    return user;
};

exports.restoreUser = async (id) => {
    const user = await userRepository.restoreUserById(id);
    if (!user) {
        throw new AppError(`User not found`, 404);
    }
    return user;
};

exports.uploadProfileImage = async (userId, file) => {
    const user = await userRepository.getUserById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    if (user.status === USER_STATUS.DELETED) {
        throw new AppError('Account has been deleted', 401);
    }

    const imageUrl = await cloudinaryService.uploadFile(file, `notes-api/profiles/${userId}`);
    user.profileImage = imageUrl;
    await user.save();
    return user;
};

exports.loginUser = async (username, password) => {
    const user = await userRepository.getUserByUsername(username);
    if (!user) {
        throw new AppError(`User with username ${username} not found`, 404);
    }
    if (user.status === USER_STATUS.DELETED) {
        throw new AppError('This account has been deleted', 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError('Invalid password', 401);
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new AppError('JWT_SECRET environment variable is required', 500);
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, jwtSecret, { expiresIn: '24h' });
    return token;
}
