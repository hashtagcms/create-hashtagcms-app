const Logger = require('../utils/Logger');
const { metrics: Metrics } = require('../utils/Metrics');

/**
 * Validation Middleware Factory
 * 
 * Creates middleware to validate request data against Joi schema
 * Gracefully handles validation errors with detailed messages
 */

/**
 * Create validation middleware
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} source - Where to validate: 'body', 'query', 'params'
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        // Get data from specified source
        const data = req[source];
        
        // Validate against schema
        const { error, value } = schema.validate(data, {
            abortEarly: false, // Return all errors, not just first
            stripUnknown: true, // Remove unknown fields
            convert: true // Convert types (e.g., string to number)
        });
        
        if (error) {
            // Extract error details
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                type: detail.type
            }));
            
            // Log validation error
            if (req.log) {
                req.log.warn('Validation error', {
                    source,
                    errors,
                    data
                });
            } else {
                Logger.warn('Validation error', {
                    source,
                    errors,
                    data
                });
            }
            
            // Track validation errors in metrics
            if (Metrics && Metrics.errorsTotal) {
                Metrics.errorsTotal.inc({ type: 'validation', severity: 'warn' });
            }
            
            // Return validation error response
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Invalid request data',
                details: errors
            });
        }
        
        // Replace request data with validated and sanitized data
        req[source] = value;
        
        next();
    };
};

/**
 * Validate body data
 * @param {Joi.Schema} schema
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * Validate query parameters
 * @param {Joi.Schema} schema
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate URL parameters
 * @param {Joi.Schema} schema
 */
const validateParams = (schema) => validate(schema, 'params');

module.exports = {
    validate,
    validateBody,
    validateQuery,
    validateParams
};
