const User = require('../models/User');
const { USER_STATUS } = require('../utils/constants');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ACTIVE_CLAUSE = {
    $or: [
        { status: USER_STATUS.ACTIVE },
        { status: { $exists: false } },
        { status: null }
    ]
};

exports.ACTIVE_CLAUSE = ACTIVE_CLAUSE;

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

exports.countUsers = async (filter = {}) => {
    return await User.countDocuments(filter);
};

exports.findUsers = async ({ status = USER_STATUS.ACTIVE, q, page = 1, limit = 20 } = {}) => {
    const clauses = [];

    if (status === USER_STATUS.ACTIVE) {
        clauses.push(ACTIVE_CLAUSE);
    } else {
        clauses.push({ status });
    }

    if (q) {
        const pattern = new RegExp(escapeRegex(q), 'i');
        clauses.push({
            $or: [{ username: pattern }, { email: pattern }]
        });
    }

    const filter = clauses.length === 1 ? clauses[0] : { $and: clauses };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        User.find(filter, '-password').sort({ username: 1 }).skip(skip).limit(limit),
        User.countDocuments(filter)
    ]);

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: total === 0 ? 0 : Math.ceil(total / limit)
        }
    };
};

exports.softDeleteUserById = async (id) => {
    return await User.findOneAndUpdate(
        {
            _id: id,
            ...ACTIVE_CLAUSE
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
