const Joi = require('joi');

/**
 * Configuration Schema
 * 
 * Validates all environment variables at startup
 * Ensures application has proper configuration before running
 */

const configSchema = Joi.object({
    // ============================================
    // Server Configuration
    // ============================================
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development')
        .description('Application environment'),
    
    PORT: Joi.number()
        .integer()
        .min(1)
        .max(65535)
        .default(8004)
        .description('Server port'),
    
    // ============================================
    // HashtagCMS Configuration
    // ============================================
    HASHTAGCMS_CONTEXT: Joi.string()
        .required()
        .max(50)
        .description('HashtagCMS site context'),
    
    HASHTAGCMS_API_BASE_URL: Joi.string()
        .uri()
        .required()
        .description('HashtagCMS API base URL'),
    
    HASHTAGCMS_API_SECRET: Joi.string()
        .required()
        .min(6)
        .description('HashtagCMS API secret'),
    
    HASHTAGCMS_CONFIG_API: Joi.string()
        .uri()
        .optional()
        .description('HashtagCMS config API endpoint'),
    
    HASHTAGCMS_DATA_API: Joi.string()
        .uri()
        .optional()
        .description('HashtagCMS data API endpoint'),
    
    // ============================================
    // Cache & Timeout Settings
    // ============================================
    HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT: Joi.number()
        .integer()
        .min(1)
        .max(300)
        .default(30)
        .description('External service timeout in seconds'),
    
    HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL: Joi.number()
        .integer()
        .min(0)
        .default(60)
        .description('Config cache TTL in minutes'),
    
    HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL: Joi.number()
        .integer()
        .min(0)
        .default(30)
        .description('Data cache TTL in minutes'),
    
    // ============================================
    // Asset Configuration
    // ============================================
    ASSET_BASE_PATH: Joi.string()
        .default('/assets/hashtagcms/fe')
        .description('Base path for assets'),
    
    ASSET_URL: Joi.string()
        .uri({ allowRelative: true })
        .allow('')
        .optional()
        .description('CDN URL for assets'),
    
    // ============================================
    // Session Configuration
    // ============================================
    SESSION_SECRET: Joi.string()
        .min(16)
        .required()
        .description('Session secret key')
        .when('NODE_ENV', {
            is: 'production',
            then: Joi.string().min(32),
            otherwise: Joi.string().min(16)
        }),
    
    SESSION_MAX_AGE: Joi.number()
        .integer()
        .min(60000) // 1 minute minimum
        .default(86400000) // 24 hours
        .description('Session max age in milliseconds'),
    
    // ============================================
    // Redis Configuration (Optional)
    // ============================================
    REDIS_HOST: Joi.string()
        .hostname()
        .optional()
        .description('Redis host'),
    
    REDIS_PORT: Joi.number()
        .integer()
        .min(1)
        .max(65535)
        .optional()
        .description('Redis port'),
    
    REDIS_PASSWORD: Joi.string()
        .allow('')
        .optional()
        .description('Redis password'),
    
    REDIS_DB: Joi.number()
        .integer()
        .min(0)
        .max(15)
        .default(0)
        .description('Redis database number'),
    
    // ============================================
    // Cache API Configuration
    // ============================================
    CACHE_API_SECRET: Joi.string()
        .min(6)
        .when('NODE_ENV', {
            is: 'production',
            then: Joi.required(),
            otherwise: Joi.optional()
        })
        .description('Cache API secret (required in production)'),
    
    LOAD_DATA_CACHE_TTL: Joi.number()
        .integer()
        .min(0)
        .default(300)
        .description('Load-data cache TTL in seconds'),
    
    // ============================================
    // Rate Limiting Configuration
    // ============================================
    RATE_LIMIT_WINDOW_MS: Joi.number()
        .integer()
        .min(1000)
        .default(900000) // 15 minutes
        .description('Rate limit window in milliseconds'),
    
    RATE_LIMIT_MAX_REQUESTS: Joi.number()
        .integer()
        .min(1)
        .default(100)
        .description('Max requests per window'),
    
    // ============================================
    // Logging Configuration
    // ============================================
    LOG_LEVEL: Joi.string()
        .valid('error', 'warn', 'info', 'debug')
        .default('info')
        .description('Winston log level'),
    
    // ============================================
    // Language Configuration
    // ============================================
    SUPPORTED_LANGUAGES: Joi.string()
        .pattern(/^[a-z]{2}(,[a-z]{2})*$/)
        .default('en,hi')
        .description('Comma-separated list of supported languages'),
    
    // ============================================
    // App URL
    // ============================================
    APP_URL: Joi.string()
        .uri()
        .optional()
        .description('Application URL')
        
}).unknown(true); // Allow other environment variables

/**
 * Validate configuration
 * @param {Object} env - Environment variables (process.env)
 * @returns {Object} Validated configuration
 * @throws {Error} If validation fails
 */
function validateConfig(env = process.env) {
    const { error, value: validatedConfig } = configSchema.validate(env, {
        abortEarly: false, // Return all errors
        stripUnknown: false, // Keep unknown variables
        convert: true // Convert types
    });
    
    if (error) {
        const errors = error.details.map(detail => ({
            key: detail.path.join('.'),
            message: detail.message,
            type: detail.type
        }));
        
        // Format error message
        const errorMessage = [
            '❌ Configuration validation failed!',
            '',
            'Errors:',
            ...errors.map(err => `  - ${err.key}: ${err.message}`),
            '',
            'Please check your .env file and ensure all required variables are set correctly.'
        ].join('\n');
        
        throw new Error(errorMessage);
    }
    
    return validatedConfig;
}

/**
 * Get validated configuration
 * Validates on first call, then returns cached config
 */
let cachedConfig = null;

function getConfig() {
    if (!cachedConfig) {
        cachedConfig = validateConfig();
    }
    return cachedConfig;
}

module.exports = {
    validateConfig,
    getConfig,
    configSchema
};
