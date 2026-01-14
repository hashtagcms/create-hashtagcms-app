# Architecture Overview

This document provides a comprehensive overview of the HashtagCMS Node.js Frontend Renderer architecture, design patterns, and core components.

## Table of Contents
- [High-Level Architecture](#high-level-architecture)
- [Design Principles](#design-principles)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Directory Structure](#directory-structure)
- [Design Patterns](#design-patterns)

## High-Level Architecture

The HashtagCMS Node.js Frontend Renderer follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  EJS Views   │  │ Vue.js       │  │  Static      │      │
│  │  Templates   │  │ Components   │  │  Assets      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   Application Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Controllers  │  │  Middleware  │  │   Routes     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                     Business Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Layout       │  │  InfoLoader  │  │  Constants   │      │
│  │ Manager      │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                     Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ CmsService   │  │  UrlParser   │  │   Config     │      │
│  │ (API Client) │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                  External Services                          │
│  ┌──────────────────────────────────────────────────┐       │
│  │         HashtagCMS Backend API                   │       │
│  │  - Site Configs  - Page Data  - Authentication   │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. Separation of Concerns
Each component has a single, well-defined responsibility:
- **Controllers**: Handle HTTP requests and responses
- **Services**: Communicate with external APIs
- **Core Classes**: Manage business logic and data
- **Views**: Present data to users

### 2. Dependency Injection
Components receive their dependencies rather than creating them:
```javascript
class LayoutManager {
    constructor(infoLoader, cmsService) {
        this.infoLoader = infoLoader;
        this.cmsService = cmsService;
    }
}
```

### 3. Configuration Over Code
Behavior is controlled through configuration files:
- `.env` for environment-specific settings
- `config/hashtagcms.js` for application settings
- Backend API provides runtime configuration

### 4. Convention Over Configuration
Follows predictable patterns:
- Controller naming: `{Name}Controller`
- View paths: `fe/{theme}/{module}/{view}`
- Route mapping: URL segments map to controllers

### 5. Extensibility
Easy to extend without modifying core:
- Add new controllers
- Create custom middleware
- Override views
- Bind custom data

## Core Components

### 1. Server (`server.js`)

**Purpose**: Application entry point and Express configuration

**Responsibilities**:
- Initialize Express app
- Configure middleware stack
- Set up view engine (EJS)
- Define global variables
- Start HTTP server

**Key Code**:
```javascript
const app = express();
app.set('view engine', 'ejs');
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({...}));
app.use('/', webRoutes);
app.listen(PORT);
```

### 2. Router (`src/routes/web.js`)

**Purpose**: Route definition and controller resolution

**Responsibilities**:
- Match incoming requests to routes
- Apply middleware (HashtagCmsInterceptor)
- Resolve appropriate controller
- Handle controller instantiation

**Key Features**:
- Catch-all route for dynamic CMS pages
- Excludes static assets
- Maps URL segments to controller names
- Fallback to FrontendController

**Controller Resolution Logic**:
```javascript
// "blog" -> "BlogController"
// "login" -> "LoginController"
// "about-us" -> "AboutusController"
const cleanLink = linkRewrite.replace(/-/g, '').replace(/\//g, '');
const potentialName = cleanLink.charAt(0).toUpperCase() + cleanLink.slice(1) + 'Controller';
```

### 3. HashtagCmsInterceptor (`src/middleware/HashtagCmsInterceptor.js`)

**Purpose**: Initialize CMS context for each request

**Responsibilities**:
- Create InfoLoader instance
- Load site configurations (cached)
- Parse URL to extract route parameters
- Set InfoKeeper state
- Attach CMS data to request object

**Flow**:
```
Request → Create InfoLoader → Load Configs → Parse URL → Set State → Next
```

### 4. Controllers (`src/controllers/`)

**Purpose**: Handle business logic for specific routes

**Base Controller**: `FrontendBaseController`
- Provides core rendering logic
- All controllers extend this base

**Specialized Controllers**:
- `FrontendController` - Default/generic pages
- `BlogController` - Blog listing and details
- `LoginController` - User authentication
- `ProfileController` - User profile management
- etc.

**Controller Lifecycle**:
```javascript
async index(req, res) {
    this.setup(req);                              // 1. Initialize
    const result = await this.layoutManager.init(); // 2. Load data
    // Status checks...                            // 3. Validate
    res.locals.helper = this.createViewHelpers(); // 4. Setup helpers
    await this.layoutManager.parseSkeletonForView(); // 5. Parse skeleton
    res.render(viewName, {...});                  // 6. Render
}
```

### 5. LayoutManager (`src/core/LayoutManager.js`)

**Purpose**: Manage page layout and module rendering

**Responsibilities**:
- Initialize page data from API
- Parse skeleton structure
- Render individual modules
- Manage view replacements
- Handle data bindings
- Parse resource paths

**Key Methods**:
- `init()` - Load page data from CMS
- `parseSkeletonForView()` - Parse and render modules
- `getParsedViewData()` - Render individual module
- `bindDataForView()` - Bind custom data to views
- `replaceViewWith()` - Replace view templates

**Skeleton Parsing**:
```javascript
// Skeleton is a JSON structure defining page layout
{
  "positions": {
    "content": {
      "modules": [
        { "view": "fe/basic/blog/list", "data": {...} },
        { "view": "fe/basic/sidebar/widget", "data": {...} }
      ]
    }
  }
}
```

### 6. InfoLoader (`src/core/InfoLoader.js`)

**Purpose**: Centralized data storage and retrieval

**Responsibilities**:
- Store request-scoped data
- Provide getters/setters for all CMS data
- Manage InfoKeeper (key-value store)
- Store context variables
- Provide site props

**Data Categories**:
- **Meta Data**: Site, Platform, Language, Category, Page, Theme
- **Content**: Header, Footer, Body
- **SEO**: Title, Description, Keywords, Canonical, Robots
- **Configuration**: Site configs, parsed params

**Usage Pattern**:
```javascript
// Set data
infoLoader.setSiteData(siteData);
infoLoader.setMetaTitle("My Page Title");

// Get data
const site = infoLoader.getSiteData();
const title = infoLoader.getMetaTitle();
```

### 7. CmsService (`src/services/CmsService.js`)

**Purpose**: HTTP client for HashtagCMS backend API

**Responsibilities**:
- Configure Axios instance
- Make API requests
- Handle authentication (API key)
- Implement caching
- Error handling

**Key Methods**:
```javascript
// Load page data
await CmsService.loadPageData(category, lang, platform);

// Load configurations (cached)
await CmsService.loadConfigs(lang);

// Authentication
await CmsService.login(email, password);
await CmsService.logout(token);

// Blog data
await CmsService.getLatestBlog(category, lang, platform, limit);
```

**Caching Strategy**:
- Configs cached for 60 minutes (configurable)
- In-memory cache (resets on server restart)
- Cache key: `site_{context}_lang_{lang}`

### 8. UrlParser (`src/utils/UrlParser.js`)

**Purpose**: Parse URLs and extract route parameters

**Responsibilities**:
- Match URL against configured routes
- Extract language, platform, category
- Parse dynamic segments (callable values)
- Determine controller name

**Example**:
```javascript
// URL: /en/web/blog/my-first-post
// Parsed:
{
  lang: "en",
  platform: "web",
  linkRewrite: "blog",
  callableValue: ["my-first-post"],
  foundLang: true,
  foundPlatform: true
}
```

### 9. Config (`src/utils/Config.js`)

**Purpose**: Configuration management utility

**Responsibilities**:
- Load configuration from `config/hashtagcms.js`
- Provide dot-notation access
- Support default values

**Usage**:
```javascript
Config.get('hashtagcms.context');
Config.get('hashtagcms.api_secrets.mysite');
Config.get('hashtagcms.blog_per_page', 10); // with default
```

## Data Flow

### Request Data Flow

```
1. HTTP Request
   ↓
2. Express Middleware
   ↓
3. HashtagCmsInterceptor
   ├─ Create InfoLoader
   ├─ Load Configs (API → Cache)
   ├─ Parse URL
   └─ Set InfoKeeper
   ↓
4. Router
   └─ Resolve Controller
   ↓
5. Controller
   ├─ LayoutManager.init()
   │  └─ CmsService.loadPageData() → API
   │     └─ InfoLoader.setLoadDataObjectAndEverything()
   ├─ LayoutManager.parseSkeletonForView()
   │  └─ Render each module (EJS)
   └─ res.render()
   ↓
6. EJS Engine
   └─ Compile template with data
   ↓
7. HTTP Response (HTML)
```

### Data Storage Hierarchy

```
Request Object (req)
├─ req.hashtagCms
│  ├─ infoLoader (InfoLoader instance)
│  └─ parsedParams (URL parsing result)
├─ req.session
│  └─ user (authenticated user)
└─ req.query, req.body, req.params

Response Locals (res.locals)
├─ cmsInfoLoader (InfoLoader reference)
├─ user (session user)
├─ appUrl (application URL)
├─ helper (view helper functions)
├─ inputs (form inputs)
└─ errors (validation errors)

InfoLoader
├─ infoKeeper (key-value store)
├─ infoData (structured CMS data)
├─ contextVars (context variables)
├─ configs (site configurations)
└─ parsedParams (URL parameters)
```

## Directory Structure

```
nodejs-frontend/
│
├── config/                      # Configuration files
│   └── hashtagcms.js           # CMS configuration
│
├── docs/                        # Documentation
│
├── locales/                     # Translation files
│   └── {lang}/
│       └── hashtagcms/
│           ├── modules.json
│           ├── links.json
│           ├── auth.json
│           └── common.json
│
├── public/                      # Compiled assets (output)
│   └── assets/
│       └── hashtagcms/
│           └── fe/
│               └── {theme}/
│                   ├── js/
│                   ├── css/
│                   ├── img/
│                   └── fonts/
│
├── resources/                   # Source assets (input)
│   └── assets/
│       └── fe/
│           └── {theme}/
│               ├── js/
│               │   └── app.js
│               ├── sass/
│               │   └── app.scss
│               ├── img/
│               └── fonts/
│
├── src/                         # Application source
│   ├── controllers/            # Request handlers
│   │   ├── Controller.js       # Base controller
│   │   ├── FrontendBaseController.js
│   │   ├── FrontendController.js
│   │   ├── BlogController.js
│   │   └── ...
│   │
│   ├── core/                   # Core business logic
│   │   ├── Constants.js        # Application constants
│   │   ├── InfoLoader.js       # Data management
│   │   └── LayoutManager.js    # Layout rendering
│   │
│   ├── middleware/             # Express middleware
│   │   └── HashtagCmsInterceptor.js
│   │
│   ├── routes/                 # Route definitions
│   │   └── web.js
│   │
│   ├── services/               # External services
│   │   └── CmsService.js       # API client
│   │
│   └── utils/                  # Utilities
│       ├── Config.js           # Config helper
│       └── UrlParser.js        # URL parsing
│
├── views/                       # EJS templates
│   ├── 404.ejs                 # Error page
│   └── fe/
│       └── {theme}/
│           ├── _layout_/       # Master layouts
│           │   └── index.ejs
│           ├── blog/           # Blog views
│           ├── auth/           # Auth views
│           └── ...
│
├── .env                         # Environment config
├── .env.example                # Environment template
├── package.json                # Dependencies
├── server.js                   # Entry point
└── webpack.config.js           # Asset build config
```

## Design Patterns

### 1. MVC (Model-View-Controller)

**Model**: Data from CmsService and InfoLoader
**View**: EJS templates
**Controller**: Controller classes

### 2. Singleton Pattern

**CmsService** is exported as a singleton:
```javascript
module.exports = new CmsService();
```

Benefits:
- Single Axios instance
- Shared cache
- Consistent configuration

### 3. Factory Pattern

**Controller Resolution** uses factory pattern:
```javascript
const ControllerClass = controllers[controllerName];
const controller = new ControllerClass();
```

### 4. Middleware Pattern

Express middleware chain:
```javascript
app.use(middleware1);
app.use(middleware2);
app.use(middleware3);
```

### 5. Template Method Pattern

**FrontendBaseController** defines template:
```javascript
async index(req, res) {
    this.setup(req);
    const result = await this.layoutManager.init();
    // ... standard flow
}
```

Subclasses can override:
```javascript
class BlogController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        // Custom logic
        return super.index(req, res);
    }
}
```

### 6. Dependency Injection

Components receive dependencies:
```javascript
class LayoutManager {
    constructor(infoLoader, cmsService) {
        this.infoLoader = infoLoader;
        this.cmsService = cmsService;
    }
}
```

### 7. Repository Pattern

**CmsService** acts as repository for backend data:
```javascript
// Abstract data source
await CmsService.loadPageData(...);
await CmsService.loadConfigs(...);
```

## Component Interaction Diagram

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  HashtagCms         │
│  Interceptor        │
└──────┬──────────────┘
       │ creates
       ▼
┌─────────────────────┐      ┌─────────────────────┐
│   InfoLoader        │◄─────│   UrlParser         │
└──────┬──────────────┘      └─────────────────────┘
       │ used by
       ▼
┌─────────────────────┐      ┌─────────────────────┐
│   Controller        │─────►│  LayoutManager      │
└──────┬──────────────┘      └──────┬──────────────┘
       │                             │ uses
       │                             ▼
       │                      ┌─────────────────────┐
       │                      │   CmsService        │
       │                      └──────┬──────────────┘
       │                             │ calls
       │                             ▼
       │                      ┌─────────────────────┐
       │                      │  Backend API        │
       │                      └─────────────────────┘
       │ renders
       ▼
┌─────────────────────┐
│   EJS Views         │
└─────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling
- Stateless design (session in cookies/external store)
- No in-memory state (except cache)
- Can run multiple instances behind load balancer

### Caching Strategy
- Config caching reduces API calls
- Static assets served by CDN
- Consider Redis for distributed cache

### Performance
- Server-side rendering for SEO
- Lazy loading for Vue components
- Webpack optimization for assets

## Security

### API Security
- API key authentication
- HTTPS for production
- CORS configuration

### Session Security
- Secure cookies in production
- Session secret from environment
- CSRF protection (implement as needed)

### Input Validation
- Sanitize user inputs
- Validate API responses
- Escape output in views

## Next Steps

- Understand [Request Lifecycle](./05-request-lifecycle.md)
- Learn about [Controllers](./07-controllers.md)
- Explore [Layout Manager](./09-layout-manager.md)

---

**Previous:** [Environment Variables](./03-environment-variables.md) | **Next:** [Request Lifecycle](./05-request-lifecycle.md)
