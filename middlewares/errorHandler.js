const logger = require('./logger');

exports.errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    logger.error('Request failed', {
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: err.statusCode,
        message: err.message,
        stack: err.stack,
    });

    res.status(err.statusCode).json({
        success: false,
        statusCode: err.statusCode,
        message: err.message,
    });
};