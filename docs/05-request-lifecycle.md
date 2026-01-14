# Request Lifecycle

Understanding the request lifecycle is crucial for developing with the HashtagCMS Node.js Frontend Renderer. This document provides a deep dive into how requests flow through the system.

## Table of Contents
- [Overview](#overview)
- [Lifecycle Phases](#lifecycle-phases)
- [Detailed Flow](#detailed-flow)
- [Code Examples](#code-examples)
- [Debugging the Lifecycle](#debugging-the-lifecycle)

## Overview

Every HTTP request goes through a series of well-defined phases before a response is sent back to the client. Understanding this flow helps you:
- Debug issues effectively
- Add custom functionality at the right point
- Optimize performance
- Implement middleware correctly

## Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HTTP Request                                             │
│    GET /blog/my-first-post                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Express Middleware Stack                                 │
│    ├─ morgan (logging)                                      │
│    ├─ express.static (static files)                         │
│    ├─ express.json()                                        │
│    ├─ cookieParser()                                        │
│    ├─ session()                                             │
│    └─ Global variables (res.locals)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Route Matching                                           │
│    Router checks: /^\\/(?!assets|favicon).*/               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. HashtagCmsInterceptor Middleware                         │
│    ├─ Create InfoLoader instance                           │
│    ├─ Load site configurations (cached)                    │
│    ├─ Parse URL (UrlParser)                                │
│    │  └─ Extract: lang, platform, linkRewrite, callable    │
│    ├─ Set InfoKeeper state                                 │
│    └─ Attach to req.hashtagCms                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Controller Resolution                                    │
│    ├─ Get category data from InfoLoader                    │
│    ├─ Determine linkRewrite (e.g., "blog")                 │
│    ├─ Map to controller name                               │
│    │  └─ "blog" → "BlogController"                         │
│    └─ Instantiate controller                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Controller.index() Execution                             │
│    ├─ Setup (get InfoLoader, create LayoutManager)         │
│    ├─ LayoutManager.init()                                 │
│    │  ├─ Call CmsService.loadPageData()                    │
│    │  │  └─ HTTP GET to backend API                        │
│    │  ├─ Receive page data (meta, html, content)           │
│    │  ├─ InfoLoader.setLoadDataObjectAndEverything()       │
│    │  └─ Return result object                              │
│    ├─ Status check (404, 500, etc.)                        │
│    ├─ Content mandatory check                              │
│    ├─ Login requirement check                              │
│    ├─ Create view helpers (trans, asset, etc.)             │
│    └─ LayoutManager.parseSkeletonForView()                 │
│       ├─ Parse skeleton structure                          │
│       ├─ Render each module                                │
│       │  ├─ Check for view replacements                    │
│       │  ├─ Check for data bindings                        │
│       │  ├─ Render EJS template                            │
│       │  └─ Parse resource paths                           │
│       └─ Set body content                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. View Rendering                                           │
│    ├─ Resolve theme directory                              │
│    ├─ Load master layout: fe/{theme}/_layout_/index.ejs    │
│    ├─ Pass data to view:                                   │
│    │  ├─ cms (layoutManager, siteProps, data, meta)        │
│    │  ├─ user, session                                     │
│    │  ├─ helper (trans, asset, getPath, etc.)              │
│    │  └─ errors, inputs                                    │
│    └─ EJS processes template                               │
│       ├─ Includes header, footer                           │
│       ├─ Renders body content                              │
│       └─ Outputs final HTML                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. HTTP Response                                            │
│    Content-Type: text/html                                 │
│    Status: 200 OK                                           │
│    Body: Rendered HTML                                      │
└─────────────────────────────────────────────────────────────┘
```

## Lifecycle Phases

### Phase 1: Request Reception

**File:** `server.js`

When a request arrives, Express receives it and begins processing.

```javascript
app.listen(PORT, () => {
    console.log(`HashtagCMS Node.js Renderer running on port ${PORT}`);
});
```

### Phase 2: Middleware Processing

**File:** `server.js`

Request passes through the middleware stack in order:

```javascript
app.use(morgan('dev'));                    // 1. Logging
app.use(express.static(...));              // 2. Static files
app.use(express.json());                   // 3. JSON parsing
app.use(express.urlencoded(...));          // 4. Form data
app.use(cookieParser());                   // 5. Cookies
app.use(session({...}));                   // 6. Session
app.use((req, res, next) => {              // 7. Global variables
    res.locals.appUrl = process.env.APP_URL;
    res.locals.user = req.session.user || null;
    next();
});
```

**Key Points:**
- Static files bypass further processing
- Session data is loaded from cookies
- Global variables are available in all views

### Phase 3: Route Matching

**File:** `src/routes/web.js`

The router matches the request path:

```javascript
// Health check route (exact match)
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all route (regex match, excludes assets)
router.all(/^\\/(?!assets|favicon).*/, HashtagCmsInterceptor, async (req, res, next) => {
    // Controller resolution logic
});
```

**Pattern Explanation:**
- `/^\\/(?!assets|favicon).*/` - Matches all paths except those starting with `/assets` or `/favicon`
- This allows CMS to handle all content pages dynamically

### Phase 4: HashtagCmsInterceptor

**File:** `src/middleware/HashtagCmsInterceptor.js`

This is the most critical middleware for CMS functionality.

#### 4.1 InfoLoader Initialization

```javascript
const infoLoader = new InfoLoader();
req.hashtagCms = { infoLoader };
res.locals.cmsInfoLoader = infoLoader;
```

Creates a new `InfoLoader` instance for this request to manage all CMS data.

#### 4.2 Load Configurations

```javascript
const configs = await CmsService.loadConfigs();
infoLoader.setConfigs(configs);
```

Fetches site configurations (menus, settings, etc.) from the backend API. **This is cached** to avoid repeated API calls.

#### 4.3 URL Parsing

```javascript
const parsed = UrlParser.parse(req.path, configs);
```

**UrlParser** analyzes the URL and extracts:
- `lang` - Language code (e.g., "en")
- `platform` - Platform identifier (e.g., "web")
- `linkRewrite` - Category identifier (e.g., "blog")
- `callableValue` - Dynamic segments (e.g., ["my-first-post"])
- `linkRewritePattern` - Pattern from config

**Example:**
```
URL: /blog/my-first-post
Parsed:
  lang: "en"
  platform: "web"
  linkRewrite: "blog"
  callableValue: ["my-first-post"]
```

#### 4.4 Set InfoKeeper State

```javascript
infoLoader.setInfoKeeper(LayoutKeys.CONTEXT, Config.get('hashtagcms.context'));
infoLoader.setInfoKeeper(LayoutKeys.LANG_ISO_CODE, parsed.lang);
infoLoader.setInfoKeeper(LayoutKeys.PLATFORM_LINKREWRITE, parsed.platform);
infoLoader.setInfoKeeper(LayoutKeys.CATEGORY_NAME, categoryName);
```

Stores parsed data in `InfoKeeper` for easy access throughout the request.

### Phase 5: Controller Resolution

**File:** `src/routes/web.js`

The router determines which controller should handle the request.

```javascript
// Get category data
const categoryData = infoLoader.getCategoryData();
let linkRewrite = categoryData ? categoryData.linkRewrite : '';

// Default controller
let controllerName = 'FrontendController';

// Check for explicit controller in config
if (parsedParams && parsedParams.controllerName) {
    controllerName = parsedParams.controllerName;
} else if (linkRewrite) {
    // Map linkRewrite to controller
    // "blog" -> "BlogController"
    const cleanLink = linkRewrite.replace(/-/g, '').replace(/\//g, '');
    const potentialName = cleanLink.charAt(0).toUpperCase() + cleanLink.slice(1) + 'Controller';
    
    if (controllers[potentialName]) {
        controllerName = potentialName;
    }
}

// Instantiate and execute
const ControllerClass = controllers[controllerName];
const controller = new ControllerClass();
await controller.index(req, res);
```

**Controller Mapping Examples:**
- `blog` → `BlogController`
- `login` → `LoginController`
- `profile` → `ProfileController`
- `about-us` → `AboutusController`
- (default) → `FrontendController`

### Phase 6: Controller Execution

**File:** `src/controllers/FrontendBaseController.js`

All controllers extend `FrontendBaseController` which provides the core rendering logic.

#### 6.1 Setup

```javascript
setup(req) {
    this.infoLoader = req.hashtagCms.infoLoader;
    if (!this.layoutManager) {
        this.layoutManager = new LayoutManager(this.infoLoader, CmsService);
    }
}
```

#### 6.2 Initialize Layout Manager

```javascript
const result = await this.layoutManager.init();
```

**What `init()` does:**
1. Calls `CmsService.loadPageData()` with current category
2. Makes HTTP request to backend API
3. Receives structured data (meta, html, content)
4. Calls `InfoLoader.setLoadDataObjectAndEverything(data)`
5. Returns result object with status, data, and flags

**API Request Example:**
```
GET /sites/v1/load-data?site=mysite&lang=en&category=blog/my-first-post&platform=web
```

**API Response Structure:**
```json
{
  "status": 200,
  "meta": {
    "site": { "id": 1, "name": "My Site" },
    "platform": { "id": 1, "name": "Web" },
    "lang": { "id": 1, "isoCode": "en" },
    "category": { "id": 5, "linkRewrite": "blog" },
    "page": { "id": 123, "title": "My First Post" },
    "theme": { "directory": "basic" },
    "props": [...]
  },
  "html": {
    "head": {
      "title": "My First Post - My Site",
      "meta": { "metaDescription": "...", ... },
      "links": [...],
      "headerContent": [...]
    },
    "body": {
      "content": {
        "skeleton": "..." // JSON structure
      },
      "footer": {
        "footerContent": [...]
      }
    }
  }
}
```

#### 6.3 Status Checks

```javascript
// Check for errors
if (!result || (result.status && result.status !== 200)) {
    return res.status(status).render('404', { message: 'Not Found' });
}

// Check if content is required and found
if (isContentRequired && !isContentFound) {
    return res.status(404).send('Content not found!');
}

// Check if login is required
if (result.isLoginRequired && !req.session.user) {
    return res.redirect(`/login?redirect=/${categoryLink}`);
}
```

#### 6.4 Create View Helpers

```javascript
const lang = this.infoLoader.getLangIsoCode() || 'en';
res.locals.helper = this.createViewHelpers(lang);
```

**View helpers include:**
- `asset(path)` - Generate asset URLs
- `trans(key)` - Translate strings
- `getPath(link)` - Normalize paths
- `md5(str)` - Generate MD5 hash
- `formatDate(date)` - Format dates

#### 6.5 Parse Skeleton

```javascript
await this.layoutManager.parseSkeletonForView(theme, res);
```

**What this does:**
1. Gets skeleton JSON from `InfoLoader`
2. Parses the structure (modules, positions, etc.)
3. For each module:
   - Checks for view replacements
   - Checks for data bindings
   - Renders the EJS template
   - Parses resource paths (images, CSS, JS)
4. Combines all rendered modules into body content

**Skeleton Structure Example:**
```json
{
  "positions": {
    "content": {
      "modules": [
        {
          "view": "fe/basic/blog/detail",
          "data": { "post": {...} }
        }
      ]
    }
  }
}
```

### Phase 7: View Rendering

**File:** `src/controllers/FrontendBaseController.js`

```javascript
const themeDir = theme.directory || 'basic';
const viewName = `fe/${themeDir}/_layout_/index`;

res.render(viewName, {
    cms: {
        layoutManager: this.layoutManager,
        siteProps: this.infoLoader.getSiteProps(),
        data: this.infoLoader.getConfigs(),
        meta: result.meta,
    },
    user: res.locals.user || null,
    inputs: res.locals.inputs || {},
    errors: res.locals.errors || [],
    session: res.locals.session || {}
});
```

**Master Layout:** `views/fe/basic/_layout_/index.ejs`

```ejs
<!DOCTYPE html>
<html lang="<%= cms.meta.lang.isoCode %>">
<head>
    <title><%= cms.layoutManager.getTitle() %></title>
    <%- cms.layoutManager.getMetaContent() %>
    <%- cms.layoutManager.getHeaderContent() %>
</head>
<body>
    <%- cms.layoutManager.getBodyContent() %>
    <%- cms.layoutManager.getFooterContent() %>
</body>
</html>
```

### Phase 8: Response Transmission

Express sends the rendered HTML back to the client with appropriate headers.

## Code Examples

### Example 1: Custom Controller

```javascript
// src/controllers/CustomController.js
const FrontendBaseController = require('./FrontendBaseController');

class CustomController extends FrontendBaseController {
    async index(req, res) {
        // Call parent setup
        this.setup(req);
        
        // Custom logic before rendering
        const customData = await this.fetchCustomData();
        
        // Bind custom data to a view
        this.bindDataForView('fe/basic/custom/widget', customData);
        
        // Continue with normal rendering
        return super.index(req, res);
    }
    
    async fetchCustomData() {
        // Your custom data fetching logic
        return { message: 'Hello from CustomController!' };
    }
}

module.exports = CustomController;
```

### Example 2: Custom Middleware

```javascript
// src/middleware/CustomMiddleware.js
module.exports = async (req, res, next) => {
    // Add custom data to request
    req.customData = {
        timestamp: Date.now(),
        ip: req.ip
    };
    
    // Log request
    console.log(`[Custom] ${req.method} ${req.path}`);
    
    // Continue to next middleware
    next();
};
```

**Register in routes:**
```javascript
// src/routes/web.js
const CustomMiddleware = require('../middleware/CustomMiddleware');

router.all(/^\\/(?!assets|favicon).*/, 
    CustomMiddleware,           // Add here
    HashtagCmsInterceptor, 
    async (req, res, next) => {
        // ...
    }
);
```

## Debugging the Lifecycle

### Enable Detailed Logging

Add console.log statements at key points:

```javascript
// In HashtagCmsInterceptor.js
console.log('[Interceptor] Parsed URL:', parsed);
console.log('[Interceptor] Category:', categoryName);

// In web.js
console.log('[Router] Controller:', controllerName);

// In FrontendBaseController.js
console.log('[Controller] Init result:', result);
console.log('[Controller] Rendering view:', viewName);
```

### Use Morgan for HTTP Logging

Already configured in `server.js`:
```javascript
app.use(morgan('dev'));
```

Output example:
```
GET /blog/my-first-post 200 245.123 ms - 15234
```

### Inspect Request Object

```javascript
// In any controller
console.log('Request path:', req.path);
console.log('Request query:', req.query);
console.log('Session:', req.session);
console.log('HashtagCMS data:', req.hashtagCms);
```

### Monitor API Calls

Check `CmsService` logs:
```
[CmsService] API Call: /sites/v1/load-data { site: 'mysite', lang: 'en', category: 'blog', platform: 'web' }
```

## Performance Considerations

### Caching

- **Config cache**: Configurations are cached for 60 minutes (default)
- **Session cache**: Session data persists across requests
- **Static assets**: Served directly by Express without hitting the router

### Optimization Tips

1. **Reduce API calls**: Leverage caching
2. **Minimize middleware**: Only use necessary middleware
3. **Optimize views**: Keep EJS templates simple
4. **Use CDN**: Serve static assets from CDN in production

## Next Steps

- Learn about [Controllers](./07-controllers.md) in detail
- Understand [Layout Manager](./09-layout-manager.md) internals
- Explore [Middleware](./08-middleware.md) customization

---

**Previous:** [Architecture Overview](./04-architecture.md) | **Next:** [Routing System](./06-routing.md)
