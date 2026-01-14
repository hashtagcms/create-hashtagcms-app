# InfoLoader & Data Management

Complete API reference for the InfoLoader class - the central data management system.

## Overview

**InfoLoader** is a request-scoped data container that stores all CMS-related information for a single HTTP request.

**Location:** `src/core/InfoLoader.js`

## Purpose

- Centralized data storage
- Request-scoped data management
- Type-safe data access
- Key-value store for custom data

## API Reference

### Site Data

```javascript
// Set
infoLoader.setSiteData({ id: 1, name: 'My Site', domain: 'example.com' });

// Get
const site = infoLoader.getSiteData();
// Returns: { id, name, domain, ... }
```

### Platform Data

```javascript
infoLoader.setPlatformData({ id: 1, name: 'Web', linkRewrite: 'web' });
const platform = infoLoader.getPlatformData();
```

### Language Data

```javascript
infoLoader.setLangData({ id: 1, name: 'English', isoCode: 'en' });
const lang = infoLoader.getLangData();
const isoCode = infoLoader.getLangIsoCode(); // 'en'
```

### Category Data

```javascript
infoLoader.setCategoryData({ id: 1, name: 'Blog', linkRewrite: 'blog' });
const category = infoLoader.getCategoryData();
```

### Page Data

```javascript
infoLoader.setPageData({ id: 1, title: 'My Page', slug: 'my-page' });
const page = infoLoader.getPageData();
```

### Theme Data

```javascript
infoLoader.setThemeData({ id: 1, name: 'Basic', directory: 'basic' });
const theme = infoLoader.getThemeData();
```

### Site Properties

```javascript
infoLoader.setSitePropsData({ siteName: 'My Site', logo: '/logo.png' });
const siteProps = infoLoader.getSiteProps();
```

### Configurations

```javascript
infoLoader.setConfigs({ menus: {...}, settings: {...} });
const configs = infoLoader.getConfigs();
```

### Meta Data

```javascript
// Title
infoLoader.setMetaTitle('Page Title');
const title = infoLoader.getMetaTitle();

// Description
infoLoader.setMetaDescription('Page description');
const description = infoLoader.getMetaDescription();

// Keywords
infoLoader.setMetaKeywords('keyword1, keyword2');
const keywords = infoLoader.getMetaKeywords();

// Canonical
infoLoader.setMetaCanonical('https://example.com/page');
const canonical = infoLoader.getMetaCanonical();

// Robots
infoLoader.setMetaRobots('index, follow');
const robots = infoLoader.getMetaRobots();

// Favicon
infoLoader.setFavIcon('/favicon.ico');
const favicon = infoLoader.getFavIcon();
```

### Content

```javascript
// Header
infoLoader.setHeaderContent('<script>...</script>');
const headerContent = infoLoader.getHeaderContent();

// Footer
infoLoader.setFooterContent('<script>...</script>');
const footerContent = infoLoader.getFooterContent();

// Skeleton
infoLoader.setThemeSkeleton('{"positions":{...}}');
const skeleton = infoLoader.getThemeSkeleton();
```

### InfoKeeper (Key-Value Store)

```javascript
// Set single value
infoLoader.setInfoKeeper('CUSTOM_KEY', 'value');

// Get single value
const value = infoLoader.getInfoKeeper('CUSTOM_KEY');

// Get all
const all = infoLoader.getInfoKeeper();
```

### Callable Values

```javascript
// URL: /blog/my-post
// Callable value: ["my-post"]

infoLoader.setAppCallableValue(['my-post']);
const callableValue = infoLoader.getAppCallableValue();
// Returns: ["my-post"]
```

### Complete Data Loading

```javascript
// Load everything from API response
infoLoader.setLoadDataObjectAndEverything(apiResponse);

// This sets:
// - Site data
// - Platform data
// - Language data
// - Category data
// - Page data
// - Theme data
// - Site props
// - Meta data
// - Content (header, footer, skeleton)
```

## Usage Examples

### In Controllers

```javascript
class MyController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Access data
        const site = this.infoLoader.getSiteData();
        const lang = this.infoLoader.getLangIsoCode();
        const category = this.infoLoader.getCategoryData();
        
        console.log(`Site: ${site.name}, Lang: ${lang}, Category: ${category.name}`);
    }
}
```

### In Middleware

```javascript
function MyMiddleware(req, res, next) {
    const infoLoader = req.hashtagCms.infoLoader;
    
    // Set custom data
    infoLoader.setInfoKeeper('REQUEST_TIME', Date.now());
    
    next();
}
```

### In Views

```ejs
<!-- Access via cms object -->
<%= cms.meta.site.name %>
<%= cms.meta.lang.isoCode %>
<%= cms.siteProps.siteName %>
```

## Best Practices

1. **Use Typed Methods**: Use specific methods (getSiteData) instead of generic InfoKeeper
2. **Request-Scoped**: InfoLoader is created per request, don't share between requests
3. **Immutable After Load**: Don't modify data after initial load
4. **Use InfoKeeper for Custom Data**: Store custom request data in InfoKeeper

---

**Previous:** [Layout Manager](./09-layout-manager.md) | **Next:** [CMS Service](./11-cms-service.md)
