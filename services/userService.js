const userRepository = require('../repositories/userRepository');
const noteRepository = require('../repositories/noteRepository');
const AppError = require('../utils/AppError.js');
const { ROLES, USER_STATUS, NOTE_STATUS } = require('../utils/constants');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinaryService = require('./cloudinaryService');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const ACTIVE_USER_CLAUSE = userRepository.ACTIVE_CLAUSE;

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

exports.getAllUsers = async (query = {}) => {
    const status = query.status || USER_STATUS.ACTIVE;
    if (![USER_STATUS.ACTIVE, USER_STATUS.DELETED].includes(status)) {
        throw new AppError('Invalid user status', 400);
    }

    const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1);
    const requestedLimit = parseInt(query.limit, 10) || DEFAULT_LIMIT;
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);
    const q = typeof query.q === 'string' ? query.q.trim() : '';

    return await userRepository.findUsers({
        status,
        q: q || undefined,
        page,
        limit
    });
};

exports.getAdminStats = async () => {
    const activeNoteClause = {
        $or: [
            { status: NOTE_STATUS.ACTIVE },
            { status: { $exists: false } },
            { status: null }
        ]
    };
    const notDeletedNoteClause = {
        $or: [
            { status: NOTE_STATUS.ACTIVE },
            { status: NOTE_STATUS.ARCHIVED },
            { status: { $exists: false } },
            { status: null }
        ]
    };

    const [
        usersTotal,
        usersAdmins,
        usersNormal,
        usersDeleted,
        notesActive,
        notesArchived,
        notesDeleted,
        notesTotal
    ] = await Promise.all([
        userRepository.countUsers(ACTIVE_USER_CLAUSE),
        userRepository.countUsers({ $and: [ACTIVE_USER_CLAUSE, { role: ROLES.ADMIN }] }),
        userRepository.countUsers({ $and: [ACTIVE_USER_CLAUSE, { role: ROLES.USER }] }),
        userRepository.countUsers({ status: USER_STATUS.DELETED }),
        noteRepository.countNotes(activeNoteClause),
        noteRepository.countNotes({ status: NOTE_STATUS.ARCHIVED }),
        noteRepository.countNotes({ status: NOTE_STATUS.DELETED }),
        noteRepository.countNotes(notDeletedNoteClause)
    ]);

    return {
        users: {
            total: usersTotal,
            admins: usersAdmins,
            normal: usersNormal,
            deleted: usersDeleted
        },
        notes: {
            total: notesTotal,
            active: notesActive,
            archived: notesArchived,
            deleted: notesDeleted
        }
    };
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
};
