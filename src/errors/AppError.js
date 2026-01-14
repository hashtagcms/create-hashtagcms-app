/**
 * Base Application Error
 * 
 * All custom errors extend from this class
 */
class AppError extends Error {
    constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', isOperational = true) {
        super(message);
        
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation Error (400)
 */
class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR', true);
        this.details = details;
    }
}

/**
 * Authentication Error (401)
 */
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR', true);
    }
}

/**
 * Authorization Error (403)
 */
class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR', true);
    }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND', true);
        this.resource = resource;
    }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409, 'CONFLICT', true);
    }
}

/**
 * Rate Limit Error (429)
 */
class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED', true);
    }
}

/**
 * External Service Error (502)
 */
class ExternalServiceError extends AppError {
    constructor(service, originalError = null) {
        super(`External service error: ${service}`, 502, 'EXTERNAL_SERVICE_ERROR', true);
        this.service = service;
        this.originalError = originalError;
    }
}

/**
 * Database Error (500)
 */
class DatabaseError extends AppError {
    constructor(message, originalError = null) {
        super(message, 500, 'DATABASE_ERROR', false);
        this.originalError = originalError;
    }
}

/**
 * Configuration Error (500)
 */
class ConfigurationError extends AppError {
    constructor(message) {
        super(message, 500, 'CONFIGURATION_ERROR', false);
    }
}

/**
 * Cache Error (500)
 * Non-operational - cache failures should not stop the app
 */
class CacheError extends AppError {
    constructor(message, originalError = null) {
        super(message, 500, 'CACHE_ERROR', false);
        this.originalError = originalError;
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    ExternalServiceError,
    DatabaseError,
    ConfigurationError,
    CacheError
};
