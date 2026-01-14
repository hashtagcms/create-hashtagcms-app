# Routing System

Understanding how the HashtagCMS Node.js Frontend handles routing and URL resolution.

## Table of Contents
- [Overview](#overview)
- [Route Configuration](#route-configuration)
- [URL Parsing](#url-parsing)
- [Controller Resolution](#controller-resolution)
- [Dynamic Routes](#dynamic-routes)
- [Route Parameters](#route-parameters)

## Overview

The routing system maps incoming URLs to controllers and actions. It uses a combination of:
- **Express.js routing** - Base routing framework
- **UrlParser** - Custom URL parsing logic
- **HashtagCmsInterceptor** - CMS context initialization
- **Dynamic controller resolution** - Maps URLs to controller classes

### Request Flow

```
URL Request
    ↓
Express Router (web.js)
    ↓
HashtagCmsInterceptor Middleware
    ↓
UrlParser (parse URL structure)
    ↓
Controller Resolution
    ↓
Controller Action
    ↓
Response
```

## Route Configuration

### Main Router (src/routes/web.js)

```javascript
const express = require('express');
const router = express.Router();
const HashtagCmsInterceptor = require('../middleware/HashtagCmsInterceptor');

// Import controllers
const FrontendController = require('../controllers/FrontendController');
const BlogController = require('../controllers/BlogController');
const LoginController = require('../controllers/LoginController');

// Controller registry
const controllers = {
    FrontendController,
    BlogController,
    LoginController,
    // Add more controllers here
};

// Catch-all route (excludes static assets)
router.all(/^\/(?!assets|favicon).*/, HashtagCmsInterceptor, async (req, res) => {
    try {
        const hashtagCms = req.hashtagCms;
        const linkRewrite = hashtagCms.infoLoader.getInfoKeeper('LINK_REWRITE');
        const parsedParams = hashtagCms.infoLoader.getInfoKeeper('PARSED_PARAMS');
        
        // Determine controller
        let controllerName = parsedParams?.controllerName || 'FrontendController';
        let ControllerClass = controllers[controllerName] || FrontendController;
        
        // Instantiate and execute
        const controller = new ControllerClass();
        await controller.index(req, res);
        
    } catch (error) {
        console.error('Route Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
```

### Route Pattern

The main route pattern:
```javascript
/^\/(?!assets|favicon).*/
```

**Matches:**
- `/` - Homepage
- `/blog` - Blog listing
- `/blog/my-post` - Blog detail
- `/about` - About page
- `/contact` - Contact page

**Excludes:**
- `/assets/*` - Static assets
- `/favicon.ico` - Favicon

## URL Parsing

### UrlParser (src/utils/UrlParser.js)

The UrlParser extracts information from URLs:

```javascript
class UrlParser {
    static parse(url, routes) {
        // Remove query string
        const path = url.split('?')[0];
        
        // Split into segments
        const segments = path.split('/').filter(s => s);
        
        // Extract language (if first segment matches language pattern)
        let language = 'en';
        let remainingSegments = segments;
        
        if (segments[0] && this.isLanguage(segments[0])) {
            language = segments[0];
            remainingSegments = segments.slice(1);
        }
        
        // Extract platform (if configured)
        let platform = 'web';
        if (remainingSegments[0] && this.isPlatform(remainingSegments[0])) {
            platform = remainingSegments[0];
            remainingSegments = remainingSegments.slice(1);
        }
        
        // Remaining segments form the category/link rewrite
        const linkRewrite = remainingSegments.join('/') || '';
        
        return {
            language,
            platform,
            linkRewrite,
            segments: remainingSegments
        };
    }
}
```

### URL Structure

```
https://example.com/[lang]/[platform]/[category]/[callable-value]
                     ↓      ↓          ↓          ↓
                     en     web        blog       my-post
```

**Examples:**

```
URL: /blog
→ language: en, platform: web, linkRewrite: blog

URL: /en/blog
→ language: en, platform: web, linkRewrite: blog

URL: /blog/my-first-post
→ language: en, platform: web, linkRewrite: blog/my-first-post

URL: /en/web/blog/my-first-post
→ language: en, platform: web, linkRewrite: blog/my-first-post
```

## Controller Resolution

### How Controllers Are Resolved

1. **URL is parsed** by UrlParser
2. **Category is identified** from linkRewrite
3. **Backend returns controller name** in API response
4. **Controller is dynamically loaded**

### Backend Response

```json
{
    "meta": {
        "category": {
            "linkRewrite": "blog",
            "controller": "BlogController"
        }
    }
}
```

### Dynamic Resolution

```javascript
// Get controller name from parsed params
const controllerName = parsedParams?.controllerName || 'FrontendController';

// Look up in registry
const ControllerClass = controllers[controllerName] || FrontendController;

// Instantiate
const controller = new ControllerClass();

// Execute
await controller.index(req, res);
```

### Controller Registry

```javascript
const controllers = {
    FrontendController,      // Default
    BlogController,          // /blog
    ProductController,       // /products
    ContactController,       // /contact
    LoginController,         // /login
    // Add your custom controllers
};
```

## Dynamic Routes

### Category-Based Routing

Routes are defined in the backend CMS:

**Backend Configuration:**
```
Category: blog
Link Rewrite: blog
Controller: BlogController
```

**Frontend Handling:**
```javascript
// URL: /blog
// → Loads BlogController
// → Calls BlogController.index(req, res)
```

### Callable Values

URLs can have dynamic segments (callable values):

```
/blog/my-first-post
      └─ callable value
```

**In Controller:**
```javascript
const callableValue = this.infoLoader.getAppCallableValue();
// Returns: ["my-first-post"]

if (callableValue && callableValue.length > 0) {
    // Detail page
    const slug = callableValue[0];
    return await this.showDetail(req, res, slug);
} else {
    // List page
    return await this.showList(req, res);
}
```

## Route Parameters

### Query Parameters

```javascript
// URL: /blog?page=2&category=tech

const page = req.query.page;        // "2"
const category = req.query.category; // "tech"
```

### URL Segments

```javascript
// URL: /blog/2024/january/my-post

const segments = this.infoLoader.getInfoKeeper('URL_SEGMENTS');
// ["blog", "2024", "january", "my-post"]

const callableValue = this.infoLoader.getAppCallableValue();
// ["2024", "january", "my-post"]
```

### Parsed Parameters

```javascript
const parsedParams = this.infoLoader.getInfoKeeper('PARSED_PARAMS');

// Contains:
// {
//     language: "en",
//     platform: "web",
//     category: "blog",
//     linkRewrite: "blog/my-post",
//     controllerName: "BlogController"
// }
```

## Custom Routes

### Adding Static Routes

For routes that don't use CMS data:

```javascript
// In web.js, before the catch-all route

// Static route
router.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Custom route with controller
router.get('/custom-page', (req, res) => {
    const controller = new CustomController();
    controller.index(req, res);
});

// Then the catch-all route
router.all(/^\/(?!assets|favicon).*/, HashtagCmsInterceptor, ...);
```

### Route Priority

Routes are matched in order:
1. **Static routes** (defined first)
2. **Catch-all route** (CMS-driven)

```javascript
router.get('/special-page', ...);  // Matched first
router.all(/^\/(?!assets).*/, ...); // Matched if above doesn't match
```

## Advanced Routing

### Multi-Language URLs

```javascript
// English
/en/blog/my-post

// Spanish
/es/blog/mi-publicacion

// French
/fr/blog/mon-article
```

**Handled by UrlParser:**
```javascript
const { language, linkRewrite } = UrlParser.parse(req.path);
// language: "es"
// linkRewrite: "blog/mi-publicacion"
```

### Platform-Specific Routes

```javascript
// Web platform
/web/blog

// Mobile platform
/mobile/blog

// API platform
/api/blog
```

### Nested Categories

```javascript
// URL: /products/electronics/phones/iphone-15

// Backend structure:
// Category: products
//   → Subcategory: electronics
//     → Subcategory: phones
//       → Product: iphone-15

const linkRewrite = "products/electronics/phones/iphone-15";
```

## Route Helpers

### Generating URLs

Create a helper in your controller:

```javascript
class Controller {
    getUrl(category, slug = null, language = 'en') {
        let url = `/${language}/${category}`;
        if (slug) {
            url += `/${slug}`;
        }
        return url;
    }
}

// Usage
const blogUrl = this.getUrl('blog', 'my-post', 'en');
// Returns: /en/blog/my-post
```

### In Views

```ejs
<!-- Generate blog post URL -->
<a href="<%= helper.getPath('blog') %>/<%= post.slug %>">
    <%= post.title %>
</a>

<!-- With language -->
<a href="/<%= cms.meta.lang.isoCode %>/blog/<%= post.slug %>">
    <%= post.title %>
</a>
```

## Debugging Routes

### Log Route Information

```javascript
// In HashtagCmsInterceptor or controller
console.log('URL:', req.path);
console.log('Parsed:', {
    language: infoLoader.getLangIsoCode(),
    platform: infoLoader.getPlatformData(),
    category: infoLoader.getCategoryData(),
    linkRewrite: infoLoader.getInfoKeeper('LINK_REWRITE'),
    callableValue: infoLoader.getAppCallableValue()
});
```

### Test Routes

```bash
# Test different URLs
curl http://localhost:3000/
curl http://localhost:3000/blog
curl http://localhost:3000/blog/my-post
curl http://localhost:3000/en/blog
curl http://localhost:3000/en/web/blog/my-post
```

## Best Practices

### 1. Use Descriptive Link Rewrites

```javascript
// ✅ Good
linkRewrite: "blog/how-to-use-nodejs"

// ❌ Bad
linkRewrite: "blog/123"
```

### 2. Handle Missing Controllers

```javascript
const ControllerClass = controllers[controllerName] || FrontendController;
// Always fallback to default
```

### 3. Validate Callable Values

```javascript
const callableValue = this.infoLoader.getAppCallableValue();

if (callableValue && callableValue.length > 0) {
    const slug = callableValue[0];
    
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
        return res.status(404).render('404');
    }
    
    // Continue...
}
```

### 4. Use Consistent URL Structure

```javascript
// ✅ Consistent
/blog/my-post
/products/laptop
/about

// ❌ Inconsistent
/blog/my-post
/product.php?id=123
/about.html
```

## Common Patterns

### List and Detail Pattern

```javascript
async index(req, res) {
    this.setup(req);
    
    const callableValue = this.infoLoader.getAppCallableValue();
    
    if (callableValue && callableValue.length > 0) {
        // Detail page: /blog/my-post
        return await this.showDetail(req, res, callableValue[0]);
    } else {
        // List page: /blog
        return await this.showList(req, res);
    }
}
```

### Pagination Pattern

```javascript
// URL: /blog?page=2

const page = parseInt(req.query.page) || 1;
const perPage = 10;

// Load paginated data
const posts = await this.loadPosts(page, perPage);
```

### Filter Pattern

```javascript
// URL: /products?category=electronics&price=low

const filters = {
    category: req.query.category,
    price: req.query.price
};

const products = await this.loadProducts(filters);
```

---

**Previous:** [Request Lifecycle](./05-request-lifecycle.md) | **Next:** [Controllers](./07-controllers.md)
