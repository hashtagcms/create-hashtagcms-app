# CMS Service & API Integration

Complete guide to the CmsService - the HTTP client for HashtagCMS backend API.

## Overview

**CmsService** handles all communication with the HashtagCMS backend API.

**Location:** `src/services/CmsService.js`

**Pattern:** Singleton (single Axios instance)

## API Methods

### loadPageData(category, lang, platform)

Load page data from backend.

```javascript
const data = await CmsService.loadPageData('blog/my-post', 'en', 'web');
```

**Parameters:**
- `category` - Category link rewrite (e.g., 'blog/my-post')
- `lang` - Language ISO code (e.g., 'en')
- `platform` - Platform name (e.g., 'web')

**Returns:** Page data object

### loadConfigs(lang)

Load site configurations (cached).

```javascript
const configs = await CmsService.loadConfigs('en');
```

**Parameters:**
- `lang` - Language ISO code

**Returns:** Configuration object with menus, settings, etc.

**Note:** Results are cached based on HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL

### getLatestBlog(category, lang, platform, limit)

Get latest blog posts.

```javascript
const posts = await CmsService.getLatestBlog('blog', 'en', 'web', 10);
```

**Parameters:**
- `category` - Blog category
- `lang` - Language
- `platform` - Platform
- `limit` - Number of posts

**Returns:** Array of blog posts

### login(email, password)

Authenticate user.

```javascript
const result = await CmsService.login('user@example.com', 'password');

if (result.token) {
    req.session.user = result.user;
    req.session.token = result.token;
}
```

**Returns:** `{ token, user }` on success

### logout(token)

Logout user.

```javascript
await CmsService.logout(req.session.token);
req.session.destroy();
```

## Configuration

### Environment Variables

```env
HASHTAGCMS_API_BASE_URL=http://backend.local/api/hashtagcms/public
HASHTAGCMS_API_SECRET=your_api_key
HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=5
```

### Axios Configuration

```javascript
this.client = axios.create({
    baseURL: config.baseUrl,
    timeout: timeout * 1000,
    headers: {
        'x-api-secret': config.apiSecret,
        'Content-Type': 'application/json'
    }
});
```

## Caching

### Config Cache

```javascript
// Cached for 60 minutes (default)
const configs = await CmsService.loadConfigs('en');
```

### Data Cache

```javascript
// Cached for 30 minutes (default)
const data = await CmsService.loadPageData('blog', 'en', 'web');
```

### Clear Cache

```env
# Disable caching
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=0
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=0
```

## Error Handling

```javascript
try {
    const data = await CmsService.loadPageData('blog', 'en', 'web');
} catch (error) {
    console.error('API Error:', error);
    // Handle error
}
```

## Usage Examples

### In Controllers

```javascript
const CmsService = require('../services/CmsService');

class BlogController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Load latest posts
        const posts = await CmsService.getLatestBlog('blog', 'en', 'web', 10);
        
        // Bind to view
        this.bindDataForView('fe/basic/blog/sidebar', { posts });
        
        return super.index(req, res);
    }
}
```

### In Middleware

```javascript
const CmsService = require('../services/CmsService');

async function MyMiddleware(req, res, next) {
    const configs = await CmsService.loadConfigs('en');
    req.configs = configs;
    next();
}
```

## Best Practices

1. **Use Caching**: Don't disable cache in production
2. **Handle Errors**: Always use try-catch
3. **Set Timeout**: Configure appropriate timeout
4. **Secure API Key**: Never commit API key to version control

---

**Previous:** [InfoLoader](./10-infoloader.md) | **Next:** [Theme Development](./12-theme-development.md)
