const promClient = require('prom-client');
const Logger = require('./Logger');

/**
 * Prometheus Metrics
 * 
 * Production-grade metrics for monitoring and alerting
 */

// Create a Registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, event loop, etc.)
promClient.collectDefaultMetrics({ 
    register,
    prefix: 'hashtagcms_',
    gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// ============================================
// Custom Metrics
// ============================================

/**
 * HTTP Request Duration
 * Tracks how long requests take
 */
const httpRequestDuration = new promClient.Histogram({
    name: 'hashtagcms_http_request_duration_ms',
    help: 'Duration of HTTP requests in milliseconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    registers: [register]
});

/**
 * HTTP Request Total
 * Counts total number of requests
 */
const httpRequestsTotal = new promClient.Counter({
    name: 'hashtagcms_http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
});

/**
 * Cache Operations
 * Tracks cache hits and misses
 */
const cacheOperations = new promClient.Counter({
    name: 'hashtagcms_cache_operations_total',
    help: 'Total number of cache operations',
    labelNames: ['operation', 'result'], // operation: get/set/delete, result: hit/miss/success/error
    registers: [register]
});

/**
 * API Calls
 * Tracks external API calls
 */
const apiCallsTotal = new promClient.Counter({
    name: 'hashtagcms_api_calls_total',
    help: 'Total number of external API calls',
    labelNames: ['endpoint', 'status', 'source'], // source: cache/api
    registers: [register]
});

/**
 * API Call Duration
 * Tracks API call performance
 */
const apiCallDuration = new promClient.Histogram({
    name: 'hashtagcms_api_call_duration_ms',
    help: 'Duration of external API calls in milliseconds',
    labelNames: ['endpoint', 'source'],
    buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
    registers: [register]
});

/**
 * Active Requests
 * Tracks concurrent requests
 */
const activeRequests = new promClient.Gauge({
    name: 'hashtagcms_active_requests',
    help: 'Number of requests currently being processed',
    registers: [register]
});

/**
 * InfoLoader Pool
 * Tracks object pool usage
 */
const poolSize = new promClient.Gauge({
    name: 'hashtagcms_pool_size',
    help: 'Current size of InfoLoader pool',
    labelNames: ['state'], // state: available/in_use
    registers: [register]
});

/**
 * Error Rate
 * Tracks application errors
 */
const errorsTotal = new promClient.Counter({
    name: 'hashtagcms_errors_total',
    help: 'Total number of errors',
    labelNames: ['type', 'severity'], // type: validation/api/render, severity: warn/error/critical
    registers: [register]
});

/**
 * Module Render Duration
 * Tracks module rendering performance
 */
const moduleRenderDuration = new promClient.Histogram({
    name: 'hashtagcms_module_render_duration_ms',
    help: 'Duration of module rendering in milliseconds',
    labelNames: ['module_type'],
    buckets: [5, 10, 25, 50, 100, 200, 500],
    registers: [register]
});

/**
 * Circuit Breaker Status
 * Tracks circuit breaker state
 */
const circuitBreakerStatus = new promClient.Gauge({
    name: 'hashtagcms_circuit_breaker_status',
    help: 'Circuit breaker status (1=open, 0=closed)',
    labelNames: ['name', 'status'], // status: open/half-open/closed
    registers: [register]
});

/**
 * Circuit Breaker Events
 * Tracks circuit breaker events
 */
const circuitBreakerEvents = new promClient.Counter({
    name: 'hashtagcms_circuit_breaker_events_total',
    help: 'Total number of circuit breaker events',
    labelNames: ['name', 'event'], // event: success/failure/timeout/reject/fallback
    registers: [register]
});

// Register all custom metrics
// Custom metrics are registered via registers: [register] option in constructor

Logger.info('✅ Prometheus metrics initialized');

// ============================================
// Export metrics and registry
// ============================================
module.exports = {
    register,
    metrics: {
        httpRequestDuration,
        httpRequestsTotal,
        cacheOperations,
        apiCallsTotal,
        apiCallDuration,
        activeRequests,
        poolSize,
        errorsTotal,
        moduleRenderDuration,
        circuitBreakerStatus,
        circuitBreakerEvents
    }
};
