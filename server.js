require('dotenv').config();

// ============================================
// ENTERPRISE: Configuration Validation
// Validate all environment variables at startup
// ============================================
const { validateConfig } = require('./src/config/validator');

try {
    const config = validateConfig();
    console.log('✅ Configuration validated successfully');
} catch (error) {
    console.error(error.message);
    process.exit(1); // Exit if configuration is invalid
}

const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const timeout = require('connect-timeout');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const webRoutes = require('./src/routes/web');
const cacheRoutes = require('./src/routes/cache');
const correlationIdMiddleware = require('./src/middleware/correlationId');
const metricsMiddleware = require('./src/middleware/metricsMiddleware');
const { register: metricsRegister } = require('./src/utils/metrics');
const StartupPreloader = require('./src/core/StartupPreloader');
const logger = require('./src/utils/Logger');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';

// ============================================
// ENTERPRISE: Request Correlation IDs
// Track requests across distributed systems
// ============================================
app.use(correlationIdMiddleware);

// ============================================
// ENTERPRISE: Distributed Tracing
// Track requests across services with Jaeger
// ============================================
const tracingMiddleware = require('./src/middleware/tracing');
app.use(tracingMiddleware);

// ============================================
// ENTERPRISE: Prometheus Metrics
// Production-grade monitoring
// ============================================
app.use(metricsMiddleware);

// ============================================
// OPTIMIZATION: Security Headers
// ============================================
app.use(helmet({
    contentSecurityPolicy: false, // Disable if using inline scripts
    crossOriginEmbedderPolicy: false
}));

// ============================================
// OPTIMIZATION: Response Compression
// 60-80% reduction in response size
// ============================================
app.use(compression({
    level: 6, // Balance between speed and compression
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// ============================================
// OPTIMIZATION: Request Timeout
// Prevents hanging requests
// ============================================
app.use(timeout('30s'));
app.use((req, res, next) => {
    if (!req.timedout) next();
});

// Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// ============================================
// OPTIMIZATION: EJS View Caching
// 20-30% faster view rendering in production
// ============================================
if (isProduction) {
    app.set('view cache', true);
    logger.info('EJS view caching enabled');
}

// Middleware
app.use(morgan(isProduction ? 'combined' : 'dev')); // Logger

// ============================================
// OPTIMIZATION: Static File Caching
// 50-70% reduction in static asset requests
// ============================================
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: isProduction ? '1y' : 0, // Cache for 1 year in production
    etag: true,
    lastModified: true,
    immutable: isProduction
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ============================================
// OPTIMIZATION: Optional Redis Session Store
// Falls back to in-memory if Redis not configured
// ============================================
async function setupSessionStore() {
    const useRedis = process.env.REDIS_HOST && process.env.REDIS_PORT;
    
    if (useRedis) {
        try {
            const RedisStore = require('connect-redis').default;
            const { createClient } = require('redis');
            const RedisCacheManager = require('./src/utils/RedisCacheManager');
            
            const redisClient = createClient({
                socket: {
                    host: process.env.REDIS_HOST,
                    port: parseInt(process.env.REDIS_PORT)
                },
                password: process.env.REDIS_PASSWORD || undefined,
                database: parseInt(process.env.REDIS_DB || 0)
            });
            
            await redisClient.connect();
            
            logger.info('✅ Redis session store enabled', {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                db: process.env.REDIS_DB || 0
            });
            
            // ============================================
            // OPTIMIZATION: Initialize Redis cache manager
            // For load-data caching
            // ============================================
            await RedisCacheManager.initialize(redisClient);
            
            return new RedisStore({ 
                client: redisClient,
                prefix: 'sess:'
            });
            
        } catch (error) {
            logger.warn('⚠️  Redis connection failed, using in-memory sessions', {
                error: error.message
            });
            return undefined; // Use default MemoryStore
        }
    } else {
        logger.info('ℹ️  Using in-memory sessions (Redis not configured)');
        return undefined; // Use default MemoryStore
    }
}

// ============================================
// OPTIMIZATION: Rate Limiting
// Prevents abuse and DDoS attacks
// ============================================
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100), // 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path
        });
        res.status(429).json({
            error: 'Too many requests',
            message: 'Please try again later'
        });
    }
});

// Apply rate limiting to all routes
app.use(limiter);

// Routes moved to async startup to ensure session middleware is loaded first

// ============================================
// API Documentation
// ============================================
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./src/config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// ============================================
// Prometheus Metrics Endpoint
// ============================================
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', metricsRegister.contentType);
        res.end(await metricsRegister.metrics());
    } catch (error) {
        logger.error('Metrics endpoint error', { error: error.message });
        res.status(500).end(error.message);
    }
});

// ============================================
// Pool Stats Endpoint (for monitoring)
// ============================================
app.get('/stats/pool', (req, res) => {
    const InfoLoaderPool = require('./src/utils/InfoLoaderPool');
    res.json({
        infoLoaderPool: InfoLoaderPool.getStats(),
        timestamp: new Date().toISOString()
    });
});

// ============================================
// Cache Stats Endpoint (for monitoring)
// ============================================
app.get('/stats/cache', async (req, res) => {
    const RedisCacheManager = require('./src/utils/RedisCacheManager');
    const stats = await RedisCacheManager.getStats();
    res.json({
        cache: stats,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ENTERPRISE: Structured Error Handling
// ============================================
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { AppError } = require('./src/errors/AppError');

// Error handlers moved to async startup to ensure correct order

// ============================================
// Server Startup with Preloading
// ============================================
(async () => {
    try {
        logger.info('Starting HashtagCMS Node.js Frontend...');
        
        // Setup session store (Redis or in-memory)
        const sessionStore = await setupSessionStore();
        
        // Configure session middleware
        app.use(session({
            store: sessionStore, // undefined = MemoryStore (default)
            secret: process.env.SESSION_SECRET || 'hashtagcms_secret',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: isProduction,
                httpOnly: true,
                maxAge: parseInt(process.env.SESSION_MAX_AGE || 86400000)
            }
        }));
        
        // ============================================
        // Global Variables for Views
        // Must be AFTER session middleware and BEFORE routes
        // ============================================
        app.use((req, res, next) => {
            res.locals.appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
            res.locals.user = req.session.user || null;
            res.locals.session = req.session;
            
            // Set cache headers for dynamic content
            if (!req.path.startsWith('/api/') && !req.path.startsWith('/common/')) {
                res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
            }
            
            next();
        });

        // ============================================
        // Routes Configuration
        // Moved here to ensure Session Middleware is loaded first
        // ============================================
        const apiV1Routes = require('./src/routes/api/v1');
        const commonRoutes = require('./src/routes/common');
        app.use('/api/v1', apiV1Routes);
        app.use('/api/cache', cacheRoutes); // Backward compatibility
        app.use('/common', commonRoutes); // Newsletter/Subscribe and Contact form handlers
        app.use('/', webRoutes);

        // ============================================
        // Error Handling (Must be last)
        // ============================================
        
        // Timeout error handler
        app.use((err, req, res, next) => {
            if (req.timedout) {
                const timeoutError = new AppError(
                    'Request timeout',
                    503,
                    'REQUEST_TIMEOUT',
                    true
                );
                return next(timeoutError);
            }
            next(err);
        });

        // 404 handler (must be after all routes)
        app.use(notFoundHandler);

        // Global error handler (must be last)
        app.use(errorHandler);
        
        // Preload site configs and translations
        await StartupPreloader.preload();
        
        // Start Server
        const server = app.listen(PORT, HOST, () => {
            const protocol = 'http';
            const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;

            logger.info('===============================================');
            logger.info(`HashtagCMS Node.js Renderer running on port ${PORT}`);            
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`Target Backend: ${process.env.HASHTAGCMS_API_BASE_URL}`);
            logger.info(`Context: ${process.env.HASHTAGCMS_CONTEXT}`);
            logger.info('Optimizations enabled:');
            logger.info('  ✓ Response compression');
            logger.info('  ✓ HTTP caching');
            logger.info('  ✓ Security headers');
            logger.info('  ✓ Request timeouts');
            logger.info('  ✓ Rate limiting');
            logger.info('  ✓ InfoLoader pooling');
            logger.info('  ✓ Async file I/O');
            logger.info('  ✓ Parallel module rendering');
            if (sessionStore) {
                logger.info('  ✓ Redis session store');
            } else {
                logger.info('  ℹ  In-memory sessions');
            }
            if (isProduction) {
                logger.info('  ✓ EJS view caching');
            }
            logger.info('===============================================');
            logger.info(`Project is running on ${protocol}://${displayHost}:${PORT}`);
            logger.info('===============================================');
        });
        
        // ============================================
        // OPTIMIZATION: Graceful Shutdown
        // ============================================
        const gracefulShutdown = () => {
            logger.info('Received shutdown signal, closing server gracefully...');
            server.close(() => {
                logger.info('Server closed successfully');
                process.exit(0);
            });
            
            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };
        
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
        
    } catch (error) {
        logger.error('Failed to start server', { error: error.message, stack: error.stack });
        process.exit(1);
    }
})();
