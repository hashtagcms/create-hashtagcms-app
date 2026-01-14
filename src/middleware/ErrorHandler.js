const Logger = require('../utils/Logger');
const { metrics: Metrics } = require('../utils/Metrics');
const { AppError } = require('../errors/AppError');

/**
 * Global Error Handler Middleware
 * 
 * Handles all errors in a consistent, structured way
 * - Logs errors with correlation IDs
 * - Tracks errors in metrics
 * - Returns appropriate responses
 * - Handles operational vs programming errors
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Format error response
 */
function formatErrorResponse(err, req) {
    const error = {
        success: false,
        error: {
            code: err.errorCode || 'INTERNAL_ERROR',
            message: err.message,
            timestamp: err.timestamp || new Date().toISOString()
        }
    };
    
    // Add correlation ID if available
    if (req.correlationId) {
        error.error.correlationId = req.correlationId;
    }
    
    // Add details for validation errors
    if (err.details) {
        error.error.details = err.details;
    }
    
    // Add stack trace in development
    if (!isProduction && err.stack) {
        error.error.stack = err.stack;
    }
    
    return error;
}

/**
 * Log error with appropriate level
 */
function logError(err, req) {
    const logData = {
        errorCode: err.errorCode || 'UNKNOWN',
        message: err.message,
        statusCode: err.statusCode || 500,
        path: req.path,
        method: req.method,
        correlationId: req.correlationId,
        ip: req.ip,
        userAgent: req.get('user-agent')
    };
    
    // Add stack for non-operational errors
    if (!err.isOperational) {
        logData.stack = err.stack;
    }
    
    // Use appropriate log level
    if (err.statusCode >= 500) {
        if (req.log) {
            req.log.error('Application error', logData);
        } else {
            Logger.error('Application error', logData);
        }
    } else if (err.statusCode >= 400) {
        if (req.log) {
            req.log.warn('Client error', logData);
        } else {
            Logger.warn('Client error', logData);
        }
    }
}

/**
 * Track error in metrics
 */
function trackErrorMetrics(err) {
    if (!Metrics || !Metrics.errorsTotal) return;
    
    const type = err.errorCode || 'unknown';
    const severity = err.statusCode >= 500 ? 'error' : 'warn';
    
    Metrics.errorsTotal.inc({ type, severity });
}

/**
 * Main error handler
 */
function errorHandler(err, req, res, next) {
    // Default to 500 if not an AppError
    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || 'INTERNAL_ERROR';
    const isOperational = err.isOperational !== undefined ? err.isOperational : false;
    
    // Ensure error has required properties
    if (!err.timestamp) {
        err.timestamp = new Date().toISOString();
    }
    if (!err.errorCode) {
        err.errorCode = errorCode;
    }
    if (!err.statusCode) {
        err.statusCode = statusCode;
    }
    
    // Log error
    logError(err, req);
    
    // Track in metrics
    trackErrorMetrics(err);
    
    // Format response
    const response = formatErrorResponse(err, req);
    
    // For non-operational errors in production, hide details
    if (!isOperational && isProduction) {
        response.error.message = 'Internal Server Error';
        delete response.error.details;
    }
    
    // Send response
    res.status(statusCode).json(response);
}

/**
 * Handle 404 Not Found
 */
function notFoundHandler(req, res, next) {
    const error = new AppError(
        `Route not found: ${req.method} ${req.path}`,
        404,
        'ROUTE_NOT_FOUND',
        true
    );
    next(error);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
