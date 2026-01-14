const axios = require('axios');
const http = require('http');
const https = require('https');
const Config = require('../utils/Config');
const Logger = require('../utils/Logger');

const { metrics: Metrics } = require('../utils/Metrics');
const { createCircuitBreaker: CreateCircuitBreaker } = require('../utils/CircuitBreaker');
const CachedApiClient = require('../utils/CachedApiClient');
const RedisCacheManager = require('../utils/RedisCacheManager');

class CmsService {
    constructor() {
        // Use Config for base URL and Context
        this.baseURL = Config.get('hashtagcms.external_api_base_url');
        this.context = Config.get('hashtagcms.context');
        this.apiKey = Config.get(`hashtagcms.api_secrets.${this.context}`);

        // Initialize Circuit Breaker for API calls
        this.breaker = CreateCircuitBreaker(
            async (url, config) => {
                return this.client.get(url, config);
            },
            {
                name: 'HashtagCMS-API',
                timeout: Config.get('hashtagcms.external_service_timeout', 30) * 1000,
                volumeThreshold: 5 // Start checking after 5 requests
            }
        );

        // ============================================
        // OPTIMIZATION: HTTP Connection Pooling
        // 30-50% faster API calls with keepAlive
        // ============================================
        const httpAgent = new http.Agent({
            keepAlive: true,
            maxSockets: 50,
            maxFreeSockets: 10,
            timeout: 60000,
            keepAliveMsecs: 30000
        });

        const httpsAgent = new https.Agent({
            keepAlive: true,
            maxSockets: 50,
            maxFreeSockets: 10,
            timeout: 60000,
            keepAliveMsecs: 30000
        });

        // Initialize Axios instance
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: Config.get('hashtagcms.external_service_timeout', 10) * 1000,
            httpAgent,
            httpsAgent,
            headers: {
                'x-api-secret': this.apiKey || '',
                'Accept': 'application/json',
                'Connection': 'keep-alive'
            }
        });

        // ============================================
        // OPTIMIZATION: Conditional Logging
        // Only log in development mode
        // ============================================
        this.client.interceptors.request.use(request => {
            if (process.env.NODE_ENV !== 'production') {
                Logger.debug('CMS API Call', { url: request.url, params: request.params });
            }
            return request;
        });

        // Initialize Config Cache
        this.configCache = {};
    }

    /**
     * Fetch page data from CMS based on the URL path (category/link_rewrite)
     * OPTIMIZATION: Uses Redis cache if available
     * @param {string} category - The request cat
     * @param {string} lang - Language code (e.g., 'en')
     */
    async loadPageData(category, lang = 'en', platform = 'web', apiUrl = null, queryParams = {}) {
        const cleanCategory = category === '/' ? '/' : category.replace(/^\/+|\/+$/g, '');

        // Generate Key
        const key = RedisCacheManager.generateKey(this.context, lang, platform, cleanCategory);
        
        const fetcher = async () => {
            const params = {
                site: this.context,
                lang: lang,
                category: cleanCategory,
                platform: platform || 'web',
                ...queryParams
            };
            const finalUrl = apiUrl || Config.get('hashtagcms.data_api');
            return this.breaker.fire(finalUrl, { params });
        };

        const skipCache = Object.keys(queryParams).length > 0;
        const cacheTTL = parseInt(process.env.LOAD_DATA_CACHE_TTL || 300);

        try {
            return await CachedApiClient.fetch({
                key,
                fetcher,
                ttl: cacheTTL,
                skipCache,
                metric: { endpoint: 'load-data' },
                logContext: { category: cleanCategory, lang, platform }
            });
        } catch (error) {
            // CachedApiClient usually handles error logging and response.data return
            // But if it re-threw a non-response error, we might want to catch it here 
            // if we need specific cleanup. 
            // The original code re-threw if not response.data.
            throw error;
        }
    }

    /**
     * Load global site configurations (Menus, Footer, currency, etc.)
     * Usually called once or cached.
     */
    async loadConfigs(lang = 'en') {
        try {
            const cacheKey = `site_${this.context}_lang_${lang}`;
            const ttlMinutes = Config.get('hashtagcms.external_config_cache_ttl', 30);
            const ttlMs = ttlMinutes * 60 * 1000;

            // Check Cache
            if (this.configCache[cacheKey]) {
                const cached = this.configCache[cacheKey];
                const now = Date.now();
                if (now - cached.timestamp < ttlMs) {
                    Logger.debug('Serving configs from cache', { cacheKey });
                    return cached.data;
                }
            }

            const params = {
                site: this.context,
                lang: lang
            };
            const apiUrl = Config.get('hashtagcms.config_api');
            
            // Execute via Circuit Breaker
            const response = await this.breaker.fire(apiUrl, { params });

            // Store in Cache
            if (response.data) {
                this.configCache[cacheKey] = {
                    data: response.data,
                    timestamp: Date.now()
                };
                Logger.info('Configs loaded and cached', { lang });
            }

            return response.data;
        } catch (error) {
            Logger.error('Error loading configs', { error: error.message, lang });
            return null;
        }
    }

    /**
     * Login user via External API
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>}
     */
    async login(email, password) {
        try {
            const loginUrl = Config.get('hashtagcms.login_api');
            const response = await this.client.post(loginUrl, { email, password });
            return response.data;
        } catch (error) {
            Logger.error('Login error', { error: error.message });
            return { error: 'Login failed' };
        }
    }

    /**
     * Logout user via External API
     * @param {string} token 
     * @returns {Promise<void>}
     */
    async logout(token) {
        try {
            const logoutUrl = Config.get('hashtagcms.logout_api');
            await this.client.post(logoutUrl, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            Logger.error('Logout error', { error: error.message });
        }
    }

    /**
     * Fetch latest blogs
     * @param {string|Array} category 
     * @param {string} lang - Language code (e.g., 'en')
     * @param {number} limit 
     * @returns {Promise<Array>}
     */
    async getLatestBlog(category, lang = 'en', platform = 'web', limit = 10) {
        const key = RedisCacheManager.generateBlogKey(this.context, lang, platform, category, limit);
        const cacheTTL = parseInt(process.env.LOAD_DATA_CACHE_TTL || 300);

        const fetcher = async () => {
             const context = this.context;
             const apiUrl = Config.get('hashtagcms.blog_api');
             return this.client.get(apiUrl, {
                 params: {
                     site: context,
                     category: category,
                     lang: lang,
                     platform: platform,
                     limit: limit
                 }
             });
        };

        try {
            return await CachedApiClient.fetch({
                key,
                fetcher,
                ttl: cacheTTL,
                metric: { endpoint: 'get-latest-blog' },
                logContext: { category, lang, platform, limit }
            });
        } catch (error) {
            // Original getLatestBlog returned [] on error. 
            // CachedApiClient throws or returns response.data
            // If CachedApiClient returned response error data, it will be returned here.
            // If it threw (network check failed etc that is NOT 200 and NOT response).
            Logger.error('Error fetching latest blog', { error: error.message, category });
            return [];
        }
    }
}

module.exports = new CmsService();
