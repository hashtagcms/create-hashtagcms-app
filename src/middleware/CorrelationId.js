const { v4: uuidv4 } = require('uuid');
const Logger = require('../utils/Logger');

/**
 * Correlation ID Middleware
 * 
 * Adds a unique correlation ID to each request for tracking across services
 * - Accepts existing correlation ID from headers (for distributed tracing)
 * - Generates new UUID if not provided
 * - Adds correlation ID to response headers
 * - Attaches correlation ID to request object
 * - Creates child logger with correlation ID
 */
module.exports = (req, res, next) => {
    // Check for existing correlation ID from upstream services
    const correlationId = req.headers['x-correlation-id'] 
        || req.headers['x-request-id'] 
        || uuidv4();
    
    // Attach to request
    req.correlationId = correlationId;
    
    // Add to response headers for downstream services
    res.setHeader('X-Correlation-ID', correlationId);
    
    // Create child logger with correlation ID
    req.log = Logger.child({ 
        correlationId,
        requestId: correlationId // Alias for compatibility
    });
    
    // Log incoming request
    req.log.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    
    // Track request duration
    const startTime = Date.now();
    
    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        req.log.info('Request completed', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`
        });
    });
    
    next();
};
