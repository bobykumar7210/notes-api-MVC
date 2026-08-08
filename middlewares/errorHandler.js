exports.errorHandler = (err, req, res, next) => {

    console.error(err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    res.status(err.statusCode).json({

        success: false,
        statusCode: err.statusCode,
        message: err.message

    });

};