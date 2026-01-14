# Layout Manager Deep Dive

The **LayoutManager** is one of the most critical components in the HashtagCMS Node.js Frontend Renderer. It orchestrates the entire page rendering process, from loading data to parsing the skeleton structure and rendering individual modules.

## Table of Contents
- [Overview](#overview)
- [Core Responsibilities](#core-responsibilities)
- [Initialization Process](#initialization-process)
- [Skeleton Parsing](#skeleton-parsing)
- [Module Rendering](#module-rendering)
- [View Management](#view-management)
- [Resource Path Parsing](#resource-path-parsing)
- [Advanced Features](#advanced-features)
- [Code Examples](#code-examples)

## Overview

**File**: `src/core/LayoutManager.js`

The LayoutManager acts as the **rendering engine** for HashtagCMS pages. It:
1. Fetches page data from the backend API
2. Stores data in InfoLoader
3. Parses the skeleton structure (JSON)
4. Renders each module/component
5. Manages view replacements and data bindings
6. Assembles the final page content

```javascript
class LayoutManager {
    constructor(infoLoader, cmsService) {
        this.infoLoader = infoLoader;
        this.cmsService = cmsService;
        this.layoutData = {};
        this.viewDataBindings = {};
        this.moduleReplacements = {};
    }
}
```

## Core Responsibilities

### 1. Data Management
- Load page data from CMS API
- Store data in InfoLoader
- Normalize data structures
- Manage layout-specific data

### 2. Skeleton Processing
- Parse JSON skeleton structure
- Identify modules and positions
- Handle nested structures
- Process module metadata

### 3. Module Rendering
- Render EJS templates for each module
- Apply view replacements
- Inject data bindings
- Parse resource paths

### 4. Content Assembly
- Combine rendered modules
- Set body content
- Provide header/footer content
- Generate meta tags

## Initialization Process

### Method: `init(apiUrl = null)`

This is the **entry point** for page rendering. It's called by controllers to load and prepare page data.

```javascript
async init(apiUrl = null) {
    try {
        // 1. Get context information
        const context = this.infoLoader.getInfoKeeper(LayoutKeys.CONTEXT);
        const lang = this.infoLoader.getInfoKeeper(LayoutKeys.LANG_ISO_CODE);
        const platform = this.infoLoader.getInfoKeeper(LayoutKeys.PLATFORM_LINKREWRITE);
        const category = this.infoLoader.getInfoKeeper(LayoutKeys.CATEGORY_NAME);

        console.log(`[LayoutManager] Loading: ${context}/${lang}/${platform}/${category}`);

        // 2. Call CmsService to fetch data
        const data = await this.cmsService.loadPageData(category, lang, platform, apiUrl);

        // 3. Check response status
        if (!data || data.status !== 200) {
            return {
                status: data ? data.status : 404,
                message: data ? data.message : 'Not Found'
            };
        }

        // 4. Store data in InfoLoader
        this.setLoadDataObjectAndEverything(data);

        // 5. Return success result
        return {
            status: 200,
            meta: data.meta,
            isContentFound: data.isContentFound !== false,
            isLoginRequired: data.isLoginRequired || false
        };

    } catch (error) {
        console.error('[LayoutManager] Init error:', error);
        return { status: 500, message: 'Internal Server Error' };
    }
}
```

### What Happens During Init

#### Step 1: Gather Context
```javascript
const context = this.infoLoader.getInfoKeeper(LayoutKeys.CONTEXT);
// Example: "mysite"

const lang = this.infoLoader.getInfoKeeper(LayoutKeys.LANG_ISO_CODE);
// Example: "en"

const platform = this.infoLoader.getInfoKeeper(LayoutKeys.PLATFORM_LINKREWRITE);
// Example: "web"

const category = this.infoLoader.getInfoKeeper(LayoutKeys.CATEGORY_NAME);
// Example: "blog/my-first-post"
```

#### Step 2: API Call
```javascript
const data = await this.cmsService.loadPageData(category, lang, platform, apiUrl);
```

**API Request:**
```
GET /sites/v1/load-data?site=mysite&lang=en&category=blog/my-first-post&platform=web
```

**API Response Structure:**
```json
{
  "status": 200,
  "message": "Success",
  "isContentFound": true,
  "isLoginRequired": false,
  "meta": {
    "site": { "id": 1, "name": "My Site", "domain": "mysite.com" },
    "platform": { "id": 1, "name": "Web", "linkRewrite": "web" },
    "lang": { "id": 1, "name": "English", "isoCode": "en" },
    "category": { "id": 5, "name": "Blog", "linkRewrite": "blog" },
    "page": { "id": 123, "title": "My First Post", "slug": "my-first-post" },
    "theme": { "id": 1, "name": "Basic", "directory": "basic" },
    "props": [
      { "name": "siteName", "value": "My Awesome Site" },
      { "name": "logo", "value": "/images/logo.png" }
    ]
  },
  "html": {
    "head": {
      "title": "My First Post - My Site",
      "meta": {
        "metaDescription": "This is my first blog post",
        "metaKeywords": "blog, first post",
        "metaCanonical": "https://mysite.com/blog/my-first-post",
        "metaRobots": "index, follow"
      },
      "links": [
        { "rel": "icon", "href": "/favicon.ico" }
      ],
      "headerContent": [
        { "html": "<script>console.log('Header script');</script>" }
      ]
    },
    "body": {
      "content": {
        "skeleton": "{\"positions\":{\"content\":{\"modules\":[...]}}}"
      },
      "footer": {
        "footerContent": [
          { "html": "<script>console.log('Footer script');</script>" }
        ]
      }
    }
  }
}
```

#### Step 3: Store Data
```javascript
this.setLoadDataObjectAndEverything(data);
```

This method delegates to `InfoLoader`:
```javascript
setLoadDataObjectAndEverything(data) {
    this.infoLoader.setLoadDataObjectAndEverything(data);
    this.setData(LayoutKeys.LOAD_DATA, data);
}
```

**InfoLoader** then extracts and stores all the data:
```javascript
// In InfoLoader.setLoadDataObjectAndEverything()
this.setSiteData(meta.site);
this.setPlatformData(meta.platform);
this.setLangData(meta.lang);
this.setCategoryData(meta.category);
this.setPageData(meta.page);
this.setThemeData(meta.theme);
this.setSitePropsData(meta.props);
this.setHeaderContent(html.head.headerContent);
this.setFooterContent(html.body.footer.footerContent);
this.setMetaTitle(html.head.title);
this.setMetaCanonical(html.head.meta.metaCanonical);
// ... etc
```

## Skeleton Parsing

### Method: `parseSkeletonForView(theme, res)`

This method parses the skeleton JSON and renders all modules.

```javascript
async parseSkeletonForView(theme, res) {
    try {
        // 1. Get skeleton from InfoLoader
        const skeletonStr = this.infoLoader.getThemeSkeleton();
        
        if (!skeletonStr) {
            console.warn('[LayoutManager] No skeleton found');
            this.setBodyContent('');
            return;
        }

        // 2. Parse JSON
        const skeleton = JSON.parse(skeletonStr);
        
        // 3. Get positions
        const positions = skeleton.positions || {};
        
        // 4. Render each position
        let bodyContent = '';
        
        for (const positionKey in positions) {
            const position = positions[positionKey];
            const modules = position.modules || [];
            
            // 5. Render each module
            for (const module of modules) {
                const rendered = await this.getParsedViewData(module, res);
                bodyContent += rendered;
            }
        }
        
        // 6. Set final content
        this.setBodyContent(bodyContent);
        
    } catch (error) {
        console.error('[LayoutManager] Skeleton parsing error:', error);
        this.setBodyContent('');
    }
}
```

### Skeleton Structure

**Example Skeleton:**
```json
{
  "positions": {
    "header": {
      "modules": [
        {
          "view": "fe/basic/header/navigation",
          "data": {
            "menu": [...]
          }
        }
      ]
    },
    "content": {
      "modules": [
        {
          "view": "fe/basic/blog/detail",
          "data": {
            "post": {
              "id": 123,
              "title": "My First Post",
              "content": "<p>Post content...</p>",
              "author": "John Doe",
              "publishedAt": "2024-01-10"
            }
          }
        },
        {
          "view": "fe/basic/sidebar/recent-posts",
          "data": {
            "posts": [...]
          }
        }
      ]
    },
    "footer": {
      "modules": [
        {
          "view": "fe/basic/footer/copyright",
          "data": {
            "year": 2024
          }
        }
      ]
    }
  }
}
```

### Position Types

Common positions:
- `header` - Top navigation, logo, etc.
- `content` - Main page content
- `sidebar` - Sidebar widgets
- `footer` - Footer content

**Note**: Positions are flexible and defined by your theme.

## Module Rendering

### Method: `getParsedViewData(module, res)`

This is the **core rendering method** for individual modules.

```javascript
async getParsedViewData(module, res) {
    try {
        // 1. Get view path
        let viewPath = module.view;
        let moduleData = module.data || {};
        
        // 2. Check for view replacement
        if (this.moduleReplacements[viewPath]) {
            const replacement = this.moduleReplacements[viewPath];
            viewPath = replacement.targetView;
            moduleData = { ...moduleData, ...replacement.data };
        }
        
        // 3. Check for data binding
        if (this.viewDataBindings[viewPath]) {
            moduleData = { ...moduleData, ...this.viewDataBindings[viewPath] };
        }
        
        // 4. Prepare render data
        const renderData = {
            cms: {
                layoutManager: this,
                siteProps: this.infoLoader.getSiteProps(),
                data: this.infoLoader.getConfigs(),
                meta: this.getData(LayoutKeys.LOAD_DATA)?.meta || {}
            },
            module: moduleData,
            helper: res.locals.helper,
            user: res.locals.user
        };
        
        // 5. Render EJS template
        const rendered = await new Promise((resolve, reject) => {
            res.app.render(viewPath, renderData, (err, html) => {
                if (err) reject(err);
                else resolve(html);
            });
        });
        
        // 6. Parse resource paths
        const parsed = this.parseStringForPath(rendered);
        
        return parsed;
        
    } catch (error) {
        console.error(`[LayoutManager] Error rendering module ${module.view}:`, error);
        return `<!-- Error rendering ${module.view} -->`;
    }
}
```

### Rendering Flow

```
Module Definition
    ↓
Check View Replacement
    ↓
Check Data Binding
    ↓
Prepare Render Data
    ↓
Render EJS Template
    ↓
Parse Resource Paths
    ↓
Return HTML String
```

### Data Available in Views

When a module is rendered, the following data is available:

```ejs
<!-- In fe/basic/blog/detail.ejs -->

<!-- Module-specific data -->
<h1><%= module.post.title %></h1>
<p><%= module.post.content %></p>

<!-- CMS data -->
<%= cms.meta.site.name %>
<%= cms.siteProps.siteName %>

<!-- Helper functions -->
<img src="<%= helper.asset('img/logo.png') %>">
<%= helper.trans('hashtagcms::common.readMore') %>

<!-- User data -->
<% if (user) { %>
  Welcome, <%= user.name %>
<% } %>
```

## View Management

### View Replacements

Replace a view with another at runtime:

```javascript
// In a controller
this.replaceViewWith(
    'fe/basic/blog/list',      // Source view
    'fe/basic/blog/custom',    // Target view
    { customData: 'value' }    // Additional data
);
```

**Implementation:**
```javascript
replaceViewWith(sourceView, targetView, data) {
    this.moduleReplacements[sourceView] = {
        targetView: targetView,
        data: data || {}
    };
}
```

**Use Cases:**
- A/B testing different layouts
- Seasonal theme variations
- User-specific customizations
- Feature flags

### Data Bindings

Inject additional data into a view:

```javascript
// In a controller
this.bindDataForView('fe/basic/sidebar/widget', {
    customWidget: 'data',
    extraInfo: [1, 2, 3]
});
```

**Implementation:**
```javascript
bindDataForView(viewName, data) {
    this.viewDataBindings[viewName] = data;
}
```

**Use Cases:**
- Add dynamic data to static modules
- Inject API responses
- Add user-specific content
- Extend module functionality

## Resource Path Parsing

### Method: `parseStringForPath(str)`

This method converts relative paths to absolute URLs for resources (CSS, JS, images).

```javascript
parseStringForPath(str) {
    const themeData = this.infoLoader.getThemeData();
    const themeDir = themeData?.directory || 'basic';
    const basePath = `/assets/hashtagcms/fe/${themeDir}`;
    
    // Replace resource paths
    str = str.replace(/\{\{asset:([^}]+)\}\}/g, (match, path) => {
        return `${basePath}/${path.trim()}`;
    });
    
    return str;
}
```

### Usage in Views

```ejs
<!-- In your EJS template -->
<link rel="stylesheet" href="{{asset:css/custom.css}}">
<script src="{{asset:js/app.js}}"></script>
<img src="{{asset:img/banner.jpg}}" alt="Banner">
```

**After parsing:**
```html
<link rel="stylesheet" href="/assets/hashtagcms/fe/basic/css/custom.css">
<script src="/assets/hashtagcms/fe/basic/js/app.js"></script>
<img src="/assets/hashtagcms/fe/basic/img/banner.jpg" alt="Banner">
```

## Advanced Features

### Normalize Data

Convert flat data (like blog arrays) into page structure:

```javascript
normalizeData(data, category) {
    // Convert blog list into skeleton structure
    const modules = data.map(item => ({
        view: 'fe/basic/blog/item',
        data: { post: item }
    }));
    
    return {
        status: 200,
        meta: { /* ... */ },
        html: {
            body: {
                content: {
                    skeleton: JSON.stringify({
                        positions: {
                            content: { modules }
                        }
                    })
                }
            }
        }
    };
}
```

### Mandatory Content Check

Control whether content is required:

```javascript
// In controller
this.setModuleMandatoryCheck(true);

// In LayoutManager
setMandatoryCheck(value) {
    this.mandatoryCheck = value;
}

getMandatoryCheck() {
    return this.mandatoryCheck !== false; // Default true
}
```

## Code Examples

### Example 1: Custom Blog Controller

```javascript
const FrontendBaseController = require('./FrontendBaseController');

class BlogController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Get callable value (blog slug)
        const callableValue = this.infoLoader.getAppCallableValue();
        
        if (callableValue && callableValue.length > 0) {
            // Detail page - load specific blog
            const result = await this.layoutManager.init();
            
            if (result.status === 200) {
                // Custom data binding for comments
                this.bindDataForView('fe/basic/blog/comments', {
                    comments: await this.loadComments(callableValue[0])
                });
            }
        } else {
            // List page - load latest blogs
            const blogs = await CmsService.getLatestBlog(
                'blog',
                this.infoLoader.getLangIsoCode(),
                'web',
                10
            );
            
            // Normalize blog data into skeleton
            const normalized = this.layoutManager.normalizeData(blogs, 'blog');
            this.layoutManager.setLoadDataObjectAndEverything(normalized);
        }
        
        // Continue with standard rendering
        return super.index(req, res);
    }
    
    async loadComments(slug) {
        // Your comment loading logic
        return [];
    }
}

module.exports = BlogController;
```

### Example 2: Seasonal Theme Replacement

```javascript
class FrontendController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Check if it's holiday season
        const isHoliday = this.isHolidaySeason();
        
        if (isHoliday) {
            // Replace header with holiday version
            this.replaceViewWith(
                'fe/basic/header/navigation',
                'fe/basic/header/navigation-holiday',
                { holidayMessage: '🎄 Happy Holidays!' }
            );
        }
        
        return super.index(req, res);
    }
    
    isHolidaySeason() {
        const month = new Date().getMonth();
        return month === 11; // December
    }
}
```

### Example 3: User-Specific Content

```javascript
class ProfileController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Load user data
        const user = req.session.user;
        
        if (user) {
            // Bind user-specific data
            this.bindDataForView('fe/basic/profile/dashboard', {
                stats: await this.getUserStats(user.id),
                recentActivity: await this.getRecentActivity(user.id)
            });
        }
        
        return super.index(req, res);
    }
}
```

## Performance Tips

### 1. Cache Skeleton Parsing
```javascript
// Cache parsed skeleton in memory
if (!this.cachedSkeleton) {
    this.cachedSkeleton = JSON.parse(skeletonStr);
}
```

### 2. Lazy Load Modules
```javascript
// Only render visible modules
if (module.lazyLoad) {
    return '<div data-lazy-module="' + module.view + '"></div>';
}
```

### 3. Minimize API Calls
```javascript
// Batch data loading
const [blogs, comments, tags] = await Promise.all([
    this.loadBlogs(),
    this.loadComments(),
    this.loadTags()
]);
```

## Debugging

### Enable Detailed Logging

```javascript
// In LayoutManager.init()
console.log('[LayoutManager] API Response:', JSON.stringify(data, null, 2));

// In parseSkeletonForView()
console.log('[LayoutManager] Skeleton:', skeleton);
console.log('[LayoutManager] Modules:', modules);

// In getParsedViewData()
console.log('[LayoutManager] Rendering:', module.view);
console.log('[LayoutManager] Data:', moduleData);
```

### Common Issues

**Issue**: Module not rendering
- Check view path exists
- Verify data structure
- Check for EJS syntax errors

**Issue**: Resources not loading
- Verify asset paths
- Check webpack build output
- Ensure `parseStringForPath` is called

## Next Steps

- Learn about [InfoLoader](./10-infoloader.md)
- Understand [CMS Service](./11-cms-service.md)
- Explore [Theme Development](./12-theme-development.md)

---

**Previous:** [Middleware](./08-middleware.md) | **Next:** [InfoLoader](./10-infoloader.md)
