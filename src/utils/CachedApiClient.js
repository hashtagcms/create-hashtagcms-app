const Logger = require('./Logger');
const { metrics: Metrics } = require('./Metrics');
const RedisCacheManager = require('./RedisCacheManager');

class CachedApiClient {
    /**
     * Fetch data with Cache-Aside pattern
     * 
     * @param {Object} options
     * @param {string} options.key - Cache key (required)
     * @param {Function} options.fetcher - Async function to fetch data if cache miss (required). Should return { data, status }.
     * @param {number} options.ttl - Cache TTL in seconds (default: 300)
     * @param {boolean} options.skipCache - Force fetch from API (default: false)
     * @param {Object} options.metric - Metric labels { endpoint }
     * @param {Object} options.logContext - Additional context for logs
     * @returns {Promise<any>} Response data
     */
    async fetch({ 
        key, 
        fetcher, 
        ttl = 300, 
        skipCache = false,
        metric = { endpoint: 'unknown' },
        logContext = {} 
    }) {
        const startTime = Date.now();
        const baseLog = { ...logContext };

        // 1. Check Cache
        if (!skipCache) {
            try {
                const cached = await RedisCacheManager.getByKey(key);
                if (cached) {
                    const duration = Date.now() - startTime;
                    this._recordMetrics(metric.endpoint, 'cache', 'hit', duration, 200);
                    Logger.info(`⚡ ${metric.endpoint} from CACHE (HIT)`, { 
                        ...baseLog, 
                        duration: `${duration}ms`, 
                        source: 'redis-cache' 
                    });
                    return cached;
                }
            } catch (err) {
                Logger.warn('Cache check failed', { error: err.message, ...baseLog });
            }
        }

        // Cache Miss
        Metrics.cacheOperations.inc({ operation: 'get', result: 'miss' });
        
        try {
            // 2. Execute Fetcher
            // We expect fetcher to return a response object with .data and .status (like Axios)
            const response = await fetcher();
            const duration = Date.now() - startTime;
            
            const status = response.status || 200;
            const data = response.data; // Expecting axios structure

            this._recordMetrics(metric.endpoint, 'api', 'miss', duration, status);

            // 3. Set Cache
            if (status === 200 && data) {
                const stored = await RedisCacheManager.setByKey(key, data, ttl);
                if (stored) {
                    Metrics.cacheOperations.inc({ operation: 'set', result: 'success' });
                }
            }

            Logger.info(`🌍 ${metric.endpoint} from API (Cache MISS)`, { 
                ...baseLog, 
                duration: `${duration}ms`, 
                status, 
                source: 'api',
                cached: status === 200
            });

            return data;

        } catch (error) {
            const duration = Date.now() - startTime;
            const status = error.response ? error.response.status : 500;
            
            Logger.error(`Error fetching ${metric.endpoint}`, { 
                error: error.message, 
                ...baseLog, 
                duration: `${duration}ms`,
                status
            });
            
            // If it's an API valid response but error status, usually we return data or throw?
            // CmsService usually returns response.data if it exists (see catch block)
            if (error.response) {
                return error.response.data;
            }
            throw error;
        }
    }

    _recordMetrics(endpoint, source, result, duration, status) {
        if (source === 'cache') {
            Metrics.cacheOperations.inc({ operation: 'get', result });
        }
        Metrics.apiCallsTotal.inc({ endpoint, status: String(status), source });
        Metrics.apiCallDuration.observe({ endpoint, source }, duration);
    }
}

module.exports = new CachedApiClient();
