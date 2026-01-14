const CircuitBreaker = require('opossum');
const Logger = require('./Logger');
const { metrics: Metrics } = require('./Metrics');

/**
 * Circuit Breaker for External API Calls
 * 
 * Prevents cascading failures when external services are down
 * Automatically opens circuit after threshold failures
 * Provides fallback mechanisms
 */

/**
 * Circuit Breaker Options
 */
const defaultOptions = {
    timeout: 30000, // 30 seconds - matches EXTERNAL_SERVICE_TIMEOUT
    errorThresholdPercentage: 50, // Open circuit if 50% of requests fail
    resetTimeout: 30000, // Try again after 30 seconds
    rollingCountTimeout: 10000, // 10 second rolling window
    rollingCountBuckets: 10, // Number of buckets in rolling window
    name: 'HashtagCMS-API',
    volumeThreshold: 10, // Minimum number of requests before opening circuit
};

/**
 * Create circuit breaker for a function
 * @param {Function} fn - Function to wrap with circuit breaker
 * @param {Object} options - Circuit breaker options
 * @param {Function} fallback - Fallback function when circuit is open
 * @returns {CircuitBreaker}
 */
function createCircuitBreaker(fn, options = {}, fallback = null) {
    const mergedOptions = { ...defaultOptions, ...options };
    const breaker = new CircuitBreaker(fn, mergedOptions);
    
    // Set fallback if provided
    if (fallback) {
        breaker.fallback(fallback);
    }
    
    // Event listeners for monitoring
    breaker.on('open', () => {
        Logger.error('Circuit breaker opened', {
            name: mergedOptions.name,
            message: 'Too many failures - circuit is now OPEN'
        });
        
        // Track in metrics
        if (Metrics && Metrics.circuitBreakerStatus) {
            Metrics.circuitBreakerStatus.set({ name: mergedOptions.name, status: 'open' }, 1);
        }
    });
    
    breaker.on('halfOpen', () => {
        Logger.warn('Circuit breaker half-open', {
            name: mergedOptions.name,
            message: 'Testing if service has recovered'
        });
        
        if (Metrics && Metrics.circuitBreakerStatus) {
            Metrics.circuitBreakerStatus.set({ name: mergedOptions.name, status: 'half-open' }, 1);
        }
    });
    
    breaker.on('close', () => {
        Logger.info('Circuit breaker closed', {
            name: mergedOptions.name,
            message: 'Service has recovered - circuit is now CLOSED'
        });
        
        if (Metrics && Metrics.circuitBreakerStatus) {
            Metrics.circuitBreakerStatus.set({ name: mergedOptions.name, status: 'closed' }, 1);
        }
    });
    
    breaker.on('success', (result) => {
        Logger.debug('Circuit breaker success', {
            name: mergedOptions.name
        });
        
        if (Metrics && Metrics.circuitBreakerEvents) {
            Metrics.circuitBreakerEvents.inc({ name: mergedOptions.name, event: 'success' });
        }
    });
    
    breaker.on('failure', (error) => {
        Logger.warn('Circuit breaker failure', {
            name: mergedOptions.name,
            error: error.message
        });
        
        if (Metrics && Metrics.circuitBreakerEvents) {
            Metrics.circuitBreakerEvents.inc({ name: mergedOptions.name, event: 'failure' });
        }
    });
    
    breaker.on('timeout', () => {
        Logger.warn('Circuit breaker timeout', {
            name: mergedOptions.name,
            timeout: mergedOptions.timeout
        });
        
        if (Metrics && Metrics.circuitBreakerEvents) {
            Metrics.circuitBreakerEvents.inc({ name: mergedOptions.name, event: 'timeout' });
        }
    });
    
    breaker.on('reject', () => {
        Logger.warn('Circuit breaker rejected request', {
            name: mergedOptions.name,
            message: 'Circuit is OPEN - request rejected'
        });
        
        if (Metrics && Metrics.circuitBreakerEvents) {
            Metrics.circuitBreakerEvents.inc({ name: mergedOptions.name, event: 'reject' });
        }
    });
    
    breaker.on('fallback', (result) => {
        Logger.info('Circuit breaker using fallback', {
            name: mergedOptions.name
        });
        
        if (Metrics && Metrics.circuitBreakerEvents) {
            Metrics.circuitBreakerEvents.inc({ name: mergedOptions.name, event: 'fallback' });
        }
    });
    
    return breaker;
}

/**
 * Get circuit breaker status
 * @param {CircuitBreaker} breaker
 * @returns {Object}
 */
function getStatus(breaker) {
    return {
        name: breaker.name,
        state: breaker.opened ? 'open' : breaker.halfOpen ? 'half-open' : 'closed',
        stats: breaker.stats,
        options: {
            timeout: breaker.options.timeout,
            errorThresholdPercentage: breaker.options.errorThresholdPercentage,
            resetTimeout: breaker.options.resetTimeout
        }
    };
}

module.exports = {
    createCircuitBreaker,
    getStatus,
    defaultOptions
};
