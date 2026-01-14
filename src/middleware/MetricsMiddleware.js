const { metrics: Metrics } = require('../utils/Metrics');

/**
 * Metrics Middleware
 * 
 * Tracks HTTP request metrics for Prometheus
 */
module.exports = (req, res, next) => {
    // Track active requests
    Metrics.activeRequests.inc();
    
    // Start timer for request duration
    const startTime = Date.now();
    
    // Track when response finishes
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const route = req.route ? req.route.path : req.path;
        const statusCode = res.statusCode;
        
        // Record request duration
        Metrics.httpRequestDuration.observe(
            {
                method: req.method,
                route: route,
                status_code: statusCode
            },
            duration
        );
        
        // Increment request counter
        Metrics.httpRequestsTotal.inc({
            method: req.method,
            route: route,
            status_code: statusCode
        });
        
        // Decrement active requests
        Metrics.activeRequests.dec();
    });
    
    next();
};
