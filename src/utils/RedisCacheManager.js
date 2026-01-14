const Logger = require('../utils/Logger');

/**
 * Redis Cache Manager
 * 
 * Optional Redis caching for load-data API responses
 * Falls back gracefully if Redis not available
 */
class RedisCacheManager {
    constructor() {
        this.client = null;
        this.enabled = false;
    }
    
    /**
     * Initialize Redis client (optional)
     * @param {Object} redisClient - Redis client instance
     */
    async initialize(redisClient) {
        if (redisClient) {
            this.client = redisClient;
            this.enabled = true;
            Logger.info('✅ Redis cache manager initialized');
        } else {
            Logger.info('ℹ️  Redis cache manager disabled (Redis not configured)');
        }
    }
    
    /**
     * Generate cache key for load-data
     * @param {string} site - Site context
     * @param {string} lang - Language code
     * @param {string} platform - Platform code
     * @param {string} category - Category path
     * @returns {string}
     */
    generateKey(site, lang, platform, category) {
        // Handle homepage and empty categories
        let cleanCategory = category || '/';
        
        // For homepage, use 'home' as key
        if (cleanCategory === '/' || cleanCategory === '') {
            cleanCategory = 'home';
        } else {
            // Replace slashes with colons for other categories
            cleanCategory = cleanCategory.replace(/\//g, ':');
        }
        
        return `cache:load-data:${site}:${lang}:${platform}:${cleanCategory}`;
    }
    
    /**
     * Get cached load-data
     * @param {string} site
     * @param {string} lang
     * @param {string} platform
     * @param {string} category
     * @returns {Promise<Object|null>}
     */
    async get(site, lang, platform, category) {
        if (!this.enabled) return null;
        
        try {
            const key = this.generateKey(site, lang, platform, category);
            const cached = await this.client.get(key);
            
            if (cached) {
                Logger.debug('Cache HIT', { key });
                return JSON.parse(cached);
            }
            
            Logger.debug('Cache MISS', { key });
            return null;
            
        } catch (error) {
            Logger.warn('Redis cache GET error', { error: error.message });
            return null;
        }
    }
    
    /**
     * Set cached load-data
     * @param {string} site
     * @param {string} lang
     * @param {string} platform
     * @param {string} category
     * @param {Object} data
     * @param {number} ttl - TTL in seconds (default: 5 minutes)
     * @returns {Promise<boolean>}
     */
    async set(site, lang, platform, category, data, ttl = 300) {
        if (!this.enabled) return false;
        
        try {
            const key = this.generateKey(site, lang, platform, category);
            await this.client.setEx(key, ttl, JSON.stringify(data));
            
            Logger.debug('Cache SET', { key, ttl });
            return true;
            
        } catch (error) {
            Logger.warn('Redis cache SET error', { error: error.message });
            return false;
        }
    }

    /**
     * Generate cache key for blog-list
     * @param {string} site 
     * @param {string} lang 
     * @param {string} platform 
     * @param {string|Array} category 
     * @param {number} limit 
     * @returns {string}
     */
    generateBlogKey(site, lang, platform, category, limit) {
        let categoryKey = category;
        if (Array.isArray(category)) {
            categoryKey = category.join(',');
        }
        categoryKey = categoryKey || 'all';
         // Replace slashes with colons
        categoryKey = categoryKey.replace(/\//g, ':');
        
        return `cache:blog-list:${site}:${lang}:${platform}:${categoryKey}:${limit}`;
    }

    /**
     * Get cached blog list
     */
    async getBlog(site, lang, platform, category, limit) {
        if (!this.enabled) return null;
        try {
            const key = this.generateBlogKey(site, lang, platform, category, limit);
            const cached = await this.client.get(key);
            if (cached) {
                Logger.debug('Blog Cache HIT', { key });
                return JSON.parse(cached);
            }
            Logger.debug('Blog Cache MISS', { key });
            return null;
        } catch (error) {
            Logger.warn('Redis blog cache GET error', { error: error.message });
            return null;
        }
    }

    /**
     * Set cached blog list
     */
    async setBlog(site, lang, platform, category, limit, data, ttl = 300) {
        if (!this.enabled) return false;
        try {
            const key = this.generateBlogKey(site, lang, platform, category, limit);
            await this.client.setEx(key, ttl, JSON.stringify(data));
            Logger.debug('Blog Cache SET', { key, ttl });
            return true;
        } catch (error) {
            Logger.warn('Redis blog cache SET error', { error: error.message });
            return false;
        }
    }
    
    /**
     * Invalidate cache for specific page
     * @param {string} site
     * @param {string} lang
     * @param {string} platform
     * @param {string} category
     * @returns {Promise<boolean>}
     */
    async invalidate(site, lang, platform, category) {
        if (!this.enabled) return false;
        
        try {
            const key = this.generateKey(site, lang, platform, category);
            await this.client.del(key);
            
            Logger.info('Cache invalidated', { key });
            return true;
            
        } catch (error) {
            Logger.warn('Redis cache DELETE error', { error: error.message });
            return false;
        }
    }
        /**
     * Get by direct key
     * @param {string} key 
     * @returns {Promise<Object|null>}
     */
    async getByKey(key) {
        if (!this.enabled) return null;
        try {
            const cached = await this.client.get(key);
            if (cached) {
                Logger.debug('Cache HIT (raw)', { key });
                return JSON.parse(cached);
            }
            Logger.debug('Cache MISS (raw)', { key });
            return null;
        } catch (error) {
            Logger.warn('Redis raw cache GET error', { error: error.message });
            return null;
        }
    }

    /**
     * Set by direct key
     * @param {string} key 
     * @param {Object} data 
     * @param {number} ttl 
     * @returns {Promise<boolean>}
     */
    async setByKey(key, data, ttl) {
        if (!this.enabled) return false;
        try {
            await this.client.setEx(key, ttl, JSON.stringify(data));
            Logger.debug('Cache SET (raw)', { key, ttl });
            return true;
        } catch (error) {
            Logger.warn('Redis raw cache SET error', { error: error.message });
            return false;
        }
    }

    
    /**
     * Invalidate all cache for a site
     * @param {string} site
     * @returns {Promise<number>}
     */
    async invalidateAll(site) {
        if (!this.enabled) return 0;
        
        try {
            const pattern = `cache:load-data:${site}:*`;
            const keys = await this.client.keys(pattern);
            
            if (keys.length > 0) {
                await this.client.del(keys);
                Logger.info('Cache invalidated for site', { site, count: keys.length });
                return keys.length;
            }
            
            return 0;
            
        } catch (error) {
            Logger.warn('Redis cache INVALIDATE ALL error', { error: error.message });
            return 0;
        }
    }
    
    /**
     * Get cache statistics
     * @returns {Promise<Object>}
     */
    async getStats() {
        if (!this.enabled) {
            return {
                enabled: false,
                message: 'Redis cache not configured'
            };
        }
        
        try {
            const pattern = 'cache:load-data:*';
            const keys = await this.client.keys(pattern);
            
            return {
                enabled: true,
                totalKeys: keys.length,
                pattern
            };
            
        } catch (error) {
            return {
                enabled: true,
                error: error.message
            };
        }
    }
}

// Export singleton
module.exports = new RedisCacheManager();
