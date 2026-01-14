# Middleware System

Understanding and creating middleware in the HashtagCMS Node.js Frontend Renderer.

## Table of Contents
- [What is Middleware](#what-is-middleware)
- [Built-in Middleware](#built-in-middleware)
- [HashtagCmsInterceptor](#hashtagcmsinterceptor)
- [Creating Custom Middleware](#creating-custom-middleware)
- [Middleware Order](#middleware-order)

## What is Middleware

Middleware functions have access to the request (`req`), response (`res`), and the next middleware function (`next`). They can:
- Execute code
- Modify request/response objects
- End the request-response cycle
- Call the next middleware

### Middleware Pattern

```javascript
function myMiddleware(req, res, next) {
    // Do something
    console.log('Request received');
    
    // Modify request
    req.customData = 'value';
    
    // Continue to next middleware
    next();
}
```

## Built-in Middleware

### Server.js Middleware Stack

```javascript
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

// 1. Logging
app.use(morgan('dev'));

// 2. Static files
app.use(express.static(path.join(__dirname, 'public')));

// 3. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 4. Cookies
app.use(cookieParser());

// 5. Sessions
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));

// 6. Global view variables
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errors = [];
    res.locals.inputs = {};
    res.locals.session = req.session;
    next();
});
```

### Middleware Execution Order

```
Request
  ↓
1. morgan (logging)
  ↓
2. express.static (static files)
  ↓
3. express.json (JSON parsing)
  ↓
4. express.urlencoded (form parsing)
  ↓
5. cookieParser (cookies)
  ↓
6. session (sessions)
  ↓
7. Global variables
  ↓
8. Routes
  ↓
9. HashtagCmsInterceptor (CMS context)
  ↓
10. Controller
```

## HashtagCmsInterceptor

The most important middleware for CMS functionality.

**Location:** `src/middleware/HashtagCmsInterceptor.js`

### Purpose

- Initializes CMS context for each request
- Loads site configurations
- Parses URL structure
- Attaches CMS data to request

### Implementation

```javascript
const InfoLoader = require('../core/InfoLoader');
const CmsService = require('../services/CmsService');
const UrlParser = require('../utils/UrlParser');
const Config = require('../utils/Config');

async function HashtagCmsInterceptor(req, res, next) {
    try {
        // 1. Create InfoLoader instance
        const infoLoader = new InfoLoader();
        
        // 2. Load site configurations (cached)
        const lang = 'en'; // Extract from URL if needed
        const configs = await CmsService.loadConfigs(lang);
        
        // 3. Set configurations
        infoLoader.setConfigs(configs);
        
        // 4. Parse URL
        const urlInfo = UrlParser.parse(req.path, configs.routes);
        
        // 5. Set URL info
        infoLoader.setInfoKeeper('LINK_REWRITE', urlInfo.linkRewrite);
        infoLoader.setInfoKeeper('PARSED_PARAMS', {
            language: urlInfo.language,
            platform: urlInfo.platform,
            linkRewrite: urlInfo.linkRewrite,
            controllerName: urlInfo.controllerName
        });
        
        // 6. Set site data from configs
        if (configs.site) {
            infoLoader.setSiteData(configs.site);
        }
        
        if (configs.platform) {
            infoLoader.setPlatformData(configs.platform);
        }
        
        if (configs.lang) {
            infoLoader.setLangData(configs.lang);
        }
        
        // 7. Attach to request
        req.hashtagCms = {
            infoLoader: infoLoader,
            configs: configs
        };
        
        // 8. Continue
        next();
        
    } catch (error) {
        console.error('[HashtagCmsInterceptor] Error:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = HashtagCmsInterceptor;
```

### What It Does

**Step 1: Create InfoLoader**
```javascript
const infoLoader = new InfoLoader();
```
Creates a new data container for this request.

**Step 2: Load Configurations**
```javascript
const configs = await CmsService.loadConfigs(lang);
```
Loads site configurations from backend (cached).

**Step 3: Parse URL**
```javascript
const urlInfo = UrlParser.parse(req.path, configs.routes);
```
Extracts language, platform, category from URL.

**Step 4: Attach to Request**
```javascript
req.hashtagCms = { infoLoader, configs };
```
Makes CMS data available to controllers.

### Usage in Controllers

```javascript
async index(req, res) {
    // Access InfoLoader
    const infoLoader = req.hashtagCms.infoLoader;
    
    // Get data
    const site = infoLoader.getSiteData();
    const lang = infoLoader.getLangData();
    const linkRewrite = infoLoader.getInfoKeeper('LINK_REWRITE');
}
```

## Creating Custom Middleware

### Basic Middleware

```javascript
// src/middleware/MyMiddleware.js

function MyMiddleware(req, res, next) {
    console.log('Custom middleware executed');
    
    // Add custom data to request
    req.customData = {
        timestamp: Date.now(),
        ip: req.ip
    };
    
    // Continue
    next();
}

module.exports = MyMiddleware;
```

### Async Middleware

```javascript
async function AsyncMiddleware(req, res, next) {
    try {
        // Async operation
        const data = await fetchSomeData();
        req.fetchedData = data;
        
        next();
    } catch (error) {
        next(error); // Pass error to error handler
    }
}
```

### Conditional Middleware

```javascript
function ConditionalMiddleware(req, res, next) {
    if (req.path.startsWith('/admin')) {
        // Check admin authentication
        if (!req.session.isAdmin) {
            return res.redirect('/login');
        }
    }
    
    next();
}
```

### Error Handling Middleware

```javascript
function ErrorMiddleware(err, req, res, next) {
    console.error('Error:', err);
    
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
}
```

## Middleware Order

### Global Middleware (server.js)

```javascript
// Order matters!

app.use(morgan('dev'));              // 1. Logging
app.use(express.static('public'));   // 2. Static files
app.use(express.json());             // 3. JSON parsing
app.use(cookieParser());             // 4. Cookies
app.use(session({}));                // 5. Sessions
app.use(globalVariables);            // 6. Global vars
app.use('/api', apiRoutes);          // 7. API routes
app.use('/', webRoutes);             // 8. Web routes
app.use(errorHandler);               // 9. Error handler (last)
```

### Route-Specific Middleware

```javascript
// In routes/web.js

// Single middleware
router.get('/protected', authMiddleware, controller);

// Multiple middleware
router.get('/admin', [authMiddleware, adminMiddleware], controller);

// All routes
router.all(/^\/(?!assets).*/, HashtagCmsInterceptor, controller);
```

## Common Middleware Patterns

### Authentication Middleware

```javascript
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login?redirect=' + req.originalUrl);
    }
    next();
}

// Usage
router.get('/dashboard', requireAuth, dashboardController);
```

### Role-Based Access

```javascript
function requireRole(role) {
    return function(req, res, next) {
        if (!req.session.user || req.session.user.role !== role) {
            return res.status(403).send('Forbidden');
        }
        next();
    };
}

// Usage
router.get('/admin', requireRole('admin'), adminController);
```

### Request Logging

```javascript
function requestLogger(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
}
```

### Rate Limiting

```javascript
const rateLimit = {};

function rateLimiter(req, res, next) {
    const ip = req.ip;
    const now = Date.now();
    
    if (!rateLimit[ip]) {
        rateLimit[ip] = { count: 1, resetTime: now + 60000 };
    } else if (now > rateLimit[ip].resetTime) {
        rateLimit[ip] = { count: 1, resetTime: now + 60000 };
    } else {
        rateLimit[ip].count++;
        
        if (rateLimit[ip].count > 100) {
            return res.status(429).send('Too Many Requests');
        }
    }
    
    next();
}
```

### CORS Middleware

```javascript
function cors(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
}
```

## Middleware Best Practices

### 1. Always Call next()

```javascript
// ✅ Good
function middleware(req, res, next) {
    // Do something
    next();
}

// ❌ Bad (request hangs)
function middleware(req, res, next) {
    // Do something
    // Forgot to call next()
}
```

### 2. Handle Errors

```javascript
// ✅ Good
async function middleware(req, res, next) {
    try {
        await doSomething();
        next();
    } catch (error) {
        next(error);
    }
}
```

### 3. Use Specific Routes

```javascript
// ✅ Good - Only for /api routes
app.use('/api', apiMiddleware);

// ❌ Bad - For all routes
app.use(apiMiddleware);
```

### 4. Order Matters

```javascript
// ✅ Good - Static files before body parsing
app.use(express.static('public'));
app.use(express.json());

// ❌ Bad - Body parsing before static files (unnecessary)
app.use(express.json());
app.use(express.static('public'));
```

### 5. Keep Middleware Focused

```javascript
// ✅ Good - Single responsibility
function authMiddleware(req, res, next) {
    // Only handles authentication
}

// ❌ Bad - Too many responsibilities
function megaMiddleware(req, res, next) {
    // Auth + logging + validation + ...
}
```

## Debugging Middleware

### Log Middleware Execution

```javascript
function debugMiddleware(name) {
    return function(req, res, next) {
        console.log(`[${name}] ${req.method} ${req.path}`);
        next();
    };
}

// Usage
app.use(debugMiddleware('Start'));
app.use(express.json());
app.use(debugMiddleware('After JSON'));
```

### Inspect Request Object

```javascript
function inspectMiddleware(req, res, next) {
    console.log('Request:', {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        session: req.session,
        cookies: req.cookies
    });
    next();
}
```

## Summary

Middleware is essential for:
- ✅ Request processing
- ✅ Authentication
- ✅ Logging
- ✅ Error handling
- ✅ CMS context initialization (HashtagCmsInterceptor)

**Key Points:**
- Middleware executes in order
- Always call `next()` or send a response
- Use try-catch for async middleware
- Keep middleware focused and reusable

---

**Previous:** [Controllers](./07-controllers.md) | **Next:** [Layout Manager](./09-layout-manager.md)
