// Error handler middleware
export const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error(err.stack);
  
    // Mongoose duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      const message = `Duplicate field value entered for ${field}`;
      err = { statusCode: 400, message };
    }
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      err = { statusCode: 400, message };
    }
  
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = `Resource not found with id of ${err.value}`;
      err = { statusCode: 404, message };
    }
  
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      err = { statusCode: 401, message: 'Invalid token' };
    }
  
    if (err.name === 'TokenExpiredError') {
      err = { statusCode: 401, message: 'Token expired' };
    }
  
    res.status(err.statusCode || 500).json({
      success: false,
      error: err.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  // Not found middleware
  export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
  
  // Async handler to avoid try-catch blocks
  export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };