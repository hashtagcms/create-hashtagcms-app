const express = require('express');
const router = express.Router();
const RedisCacheManager = require('../utils/RedisCacheManager');
const Logger = require('../utils/Logger');
const { validateBody: ValidateBody } = require('../middleware/Validator');
const { clearCacheSchema, clearAllCacheSchema, warmCacheSchema } = require('../validators/cacheValidator');

/**
 * Cache Management API
 * 
 * Endpoints to manage Redis cache for load-data
 * Protected by API key authentication
 * Validated with Joi schemas
 */

// ============================================
// Middleware: API Key Authentication
// Middleware to authenticate cache requests
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-secret'] || req.query.api_secret;
    
    // Determine valid API key based on environment
    let validApiKey;
    
    if (process.env.NODE_ENV === 'production') {
        // Production: MUST have dedicated CACHE_API_SECRET
        validApiKey = process.env.CACHE_API_SECRET;
        
        if (!validApiKey) {
            Logger.error('CACHE_API_SECRET not configured in production');
            return res.status(500).json({
                success: false,
                error: 'Server configuration error',
                message: 'Cache API not properly configured'
            });
        }
    } else {
        // Development: Use CACHE_API_SECRET or fallback to HASHTAGCMS_API_SECRET
        validApiKey = process.env.CACHE_API_SECRET || process.env.HASHTAGCMS_API_SECRET;
    }
    
    if (!apiKey || apiKey !== validApiKey) {
        Logger.warn('Unauthorized cache API access attempt', {
            ip: req.ip,
            path: req.path,
            hasApiKey: !!apiKey
        });
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Valid API key required'
        });
    }
    
    next();
};

// Apply authentication to all cache routes
router.use(authenticateApiKey);

// ============================================
// GET /api/cache/stats
// Get cache statistics
// ============================================
router.get('/stats', async (req, res) => {
    try {
        const stats = await RedisCacheManager.getStats();
        
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        Logger.error('Cache stats error', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// DELETE /api/cache/clear
// Clear specific page cache
// ============================================
router.delete('/clear', ValidateBody(clearCacheSchema), async (req, res) => {
    try {
        const { site, lang, platform, category } = req.body;
        
        const result = await RedisCacheManager.invalidate(site, lang, platform, category);
        
        Logger.info('Cache cleared for specific page', {
            site, lang, platform, category,
            success: result
        });
        
        res.json({
            success: true,
            message: 'Cache cleared successfully',
            data: { site, lang, platform, category }
        });
        
    } catch (error) {
        Logger.error('Cache clear error', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// DELETE /api/cache/clear-all
// Clear all cache for a site
// ============================================
router.delete('/clear-all', ValidateBody(clearAllCacheSchema), async (req, res) => {
    try {
        const { site } = req.body;
        
        const count = await RedisCacheManager.invalidateAll(site);
        
        Logger.info('All cache cleared for site', {
            site,
            keysCleared: count
        });
        
        res.json({
            success: true,
            message: `Cleared ${count} cache entries`,
            data: {
                site,
                keysCleared: count
            }
        });
        
    } catch (error) {
        Logger.error('Cache clear-all error', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// POST /api/cache/warm
// Warm up cache for specific page
// ============================================
router.post('/warm', ValidateBody(warmCacheSchema), async (req, res) => {
    try {
        const { site, lang, platform, category } = req.body;
        
        // Import CmsService to fetch data
        const CmsService = require('../services/CmsService');
        
        // Fetch data (this will cache it)
        const data = await CmsService.loadPageData(category, lang, platform);
        
        if (data) {
            Logger.info('Cache warmed up', {
                site, lang, platform, category
            });
            
            res.json({
                success: true,
                message: 'Cache warmed up successfully',
                data: { site, lang, platform, category }
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Page not found or failed to load'
            });
        }
        
    } catch (error) {
        Logger.error('Cache warm error', { error: error.message });
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// GET /api/cache/health
// Check if cache is available
// ============================================
router.get('/health', async (req, res) => {
    try {
        const stats = await RedisCacheManager.getStats();
        
        res.json({
            success: true,
            cache: {
                enabled: stats.enabled,
                healthy: stats.enabled && !stats.error
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
