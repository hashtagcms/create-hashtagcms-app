const InitializeTracer = require('../utils/Tracer');
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');

// Initialize tracer
const tracer = InitializeTracer('hashtagcms-app');

/**
 * Tracing Middleware
 * Starts a span for each incoming request
 */
const tracingMiddleware = (req, res, next) => {
    const wireCtx = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
    const span = tracer.startSpan(req.path, { childOf: wireCtx });
    
    // Add custom tags
    span.setTag(Tags.HTTP_METHOD, req.method);
    span.setTag(Tags.HTTP_URL, req.path);
    span.setTag('correlation_id', req.correlationId);

    // Attach span to request so other parts of app can use it
    req.span = span;

    // Finish span when response finishes
    res.on('finish', () => {
        span.setTag(Tags.HTTP_STATUS_CODE, res.statusCode);
        
        if (res.statusCode >= 500) {
            span.setTag(Tags.ERROR, true);
        }
        
        span.finish();
    });

    next();
};

module.exports = tracingMiddleware;
