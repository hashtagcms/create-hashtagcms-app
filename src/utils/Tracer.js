const initTracer = require('jaeger-client').initTracer;
const Logger = require('./Logger');

/**
 * Initialize Jaeger Tracer
 * @param {string} serviceName - Name of the service
 */
function initializeTracer(serviceName) {
    const config = {
        serviceName: serviceName,
        sampler: {
            type: 'const',
            param: 1, // 1 = 100% sampling (sample every request)
        },
        reporter: {
            logSpans: true, // Log spans to console
            agentHost: process.env.JAEGER_HOST || 'localhost',
            agentPort: process.env.JAEGER_PORT || 6832,
        },
    };

    const options = {
        logger: {
            info(msg) {
                Logger.info('[TRACER] ' + msg);
            },
            error(msg) {
                Logger.error('[TRACER] ' + msg);
            },
        },
    };

    return initTracer(config, options);
}

module.exports = initializeTracer;
