/**
 * Catch-all middleware for 404 Not Found API routes.
 */
export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        message: `Route Not Found - ${req.originalUrl}`
    });
};

/**
 * Centralized global error handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || res.statusCode || 500;
    if (statusCode === 200) statusCode = 500;

    let message = err.message || "Internal Server Error";

    // Handle Mongoose CastError (Invalid ObjectId)
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid format for field: ${err.path}`;
    }

    // Handle Mongoose ValidationError
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(", ");
    }

    // Handle Mongoose Duplicate Key Error (code 11000)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0];
        message = `Duplicate field value entered for '${field}'. Please use another value.`;
    }

    console.error(`[Error] ${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);

    res.status(statusCode).json({
        message
    });
};
