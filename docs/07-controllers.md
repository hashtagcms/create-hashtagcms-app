# Controllers Guide

Understanding controllers in the HashtagCMS Node.js Frontend Renderer.

## Overview

Controllers handle incoming HTTP requests, process business logic, and return responses. They are the "C" in the MVC (Model-View-Controller) pattern.

**Note:** For detailed information on creating custom controllers, see [Creating Custom Controllers](./14-custom-controllers.md). This guide covers the basics and controller architecture.

## Controller Hierarchy

```
Controller (base)
    ↓
FrontendBaseController (CMS-specific)
    ↓
Your Custom Controllers
    ├── BlogController
    ├── ProductController
    ├── ContactController
    └── etc.
```

## Base Controller

### Controller.js

The most basic controller class:

```javascript
// src/controllers/Controller.js
class Controller {
    constructor() {
        // Base initialization
    }
}

module.exports = Controller;
```

**Purpose:** Provides a base class for all controllers.

## FrontendBaseController

### Purpose

Provides CMS-specific functionality for all frontend controllers.

**Location:** `src/controllers/FrontendBaseController.js`

### Key Features

- Access to InfoLoader (CMS data)
- Access to LayoutManager (rendering)
- Standard rendering flow
- View helpers
- Data binding
- View replacement

### Basic Structure

```javascript
const Controller = require('./Controller');
const LayoutManager = require('../core/LayoutManager');
const CmsService = require('../services/CmsService');

class FrontendBaseController extends Controller {
    constructor() {
        super();
        this.layoutManager = null;
        this.infoLoader = null;
    }
    
    setup(req) {
        this.infoLoader = req.hashtagCms.infoLoader;
        this.layoutManager = new LayoutManager(this.infoLoader, CmsService);
    }
    
    async index(req, res) {
        // Standard page rendering logic
    }
}

module.exports = FrontendBaseController;
```

## Controller Lifecycle

### 1. Instantiation

```javascript
const controller = new BlogController();
```

### 2. Setup

```javascript
controller.setup(req);
// - Attaches InfoLoader
// - Creates LayoutManager
```

### 3. Execution

```javascript
await controller.index(req, res);
// - Loads data
// - Processes logic
// - Renders view
```

## Creating a Controller

### Step 1: Create File

**File:** `src/controllers/BlogController.js`

```javascript
const FrontendBaseController = require('./FrontendBaseController');

class BlogController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Your logic here
        
        return super.index(req, res);
    }
}

module.exports = BlogController;
```

### Step 2: Register Controller

**File:** `src/routes/web.js`

```javascript
const BlogController = require('../controllers/BlogController');

const controllers = {
    FrontendController,
    BlogController,  // Add here
    // ... other controllers
};
```

### Step 3: Configure Backend

In HashtagCMS backend:
- Create category with `linkRewrite` = `blog`
- Set controller to `BlogController`

## Controller Methods

### setup(req)

Initializes the controller with request data.

```javascript
setup(req) {
    this.infoLoader = req.hashtagCms.infoLoader;
    this.layoutManager = new LayoutManager(this.infoLoader, CmsService);
}
```

**Always call this first** in your `index` method.

### index(req, res)

Main action method, handles the request.

```javascript
async index(req, res) {
    this.setup(req);
    
    // Load data
    const result = await this.layoutManager.init();
    
    // Process
    // ...
    
    // Render
    return super.index(req, res);
}
```

### createViewHelpers(lang)

Creates helper functions for views.

```javascript
const helpers = this.createViewHelpers('en');
res.locals.helper = helpers;
```

**Available helpers:**
- `asset(path)` - Generate asset URL
- `trans(key)` - Translate text
- `getPath(category)` - Get category URL
- `md5(string)` - Generate MD5 hash
- `formatDate(date)` - Format date

### bindDataForView(view, data)

Bind additional data to a specific view.

```javascript
this.bindDataForView('fe/basic/sidebar/widget', {
    title: 'Popular Posts',
    posts: popularPosts
});
```

### replaceViewWith(original, replacement, data)

Replace one view with another.

```javascript
this.replaceViewWith(
    'fe/basic/blog/list',
    'fe/basic/blog/grid',
    { layout: 'grid' }
);
```

### setModuleMandatoryCheck(required)

Set whether content must be found.

```javascript
this.setModuleMandatoryCheck(true);
// If content not found, returns 404
```

## Built-in Controllers

### FrontendController

**Purpose:** Default controller for standard pages.

**Location:** `src/controllers/FrontendController.js`

**Usage:** Automatically used when no specific controller is configured.

### BlogController

**Purpose:** Handles blog listing and detail pages.

**Location:** `src/controllers/BlogController.js`

**Features:**
- List view (all posts)
- Detail view (single post)
- Pagination
- Latest posts loading

### LoginController

**Purpose:** Handles user authentication.

**Location:** `src/controllers/LoginController.js`

**Features:**
- Login form display
- Login processing
- Logout
- Session management

## Controller Patterns

### List and Detail Pattern

```javascript
async index(req, res) {
    this.setup(req);
    
    const callableValue = this.infoLoader.getAppCallableValue();
    
    if (callableValue && callableValue.length > 0) {
        // Detail page
        return await this.showDetail(req, res, callableValue[0]);
    } else {
        // List page
        return await this.showList(req, res);
    }
}

async showList(req, res) {
    // Load list data
    const result = await this.layoutManager.init();
    return super.index(req, res);
}

async showDetail(req, res, slug) {
    // Load detail data
    const result = await this.layoutManager.init();
    return super.index(req, res);
}
```

### Form Handling Pattern

```javascript
async index(req, res) {
    this.setup(req);
    
    if (req.method === 'POST') {
        return await this.handleSubmit(req, res);
    }
    
    return super.index(req, res);
}

async handleSubmit(req, res) {
    const { name, email } = req.body;
    
    // Validate
    const errors = this.validate(req.body);
    if (errors.length > 0) {
        res.locals.errors = errors;
        res.locals.inputs = req.body;
        return super.index(req, res);
    }
    
    // Process
    await this.processForm(req.body);
    
    // Redirect
    return res.redirect('/success');
}
```

### API Integration Pattern

```javascript
const axios = require('axios');

async index(req, res) {
    this.setup(req);
    
    // Load from external API
    const apiData = await this.fetchFromApi();
    
    // Bind to view
    this.bindDataForView('fe/basic/api/results', {
        results: apiData
    });
    
    return super.index(req, res);
}

async fetchFromApi() {
    const response = await axios.get('https://api.example.com/data');
    return response.data;
}
```

## Accessing Data

### From InfoLoader

```javascript
// Site data
const site = this.infoLoader.getSiteData();

// Language
const lang = this.infoLoader.getLangData();

// Category
const category = this.infoLoader.getCategoryData();

// Page
const page = this.infoLoader.getPageData();

// Callable values (URL segments)
const callableValue = this.infoLoader.getAppCallableValue();
```

### From Request

```javascript
// Query parameters
const page = req.query.page;

// Body data (POST)
const formData = req.body;

// Session
const user = req.session.user;

// Cookies
const token = req.cookies.token;
```

## Response Types

### Render View

```javascript
return res.render('view-name', { data });
```

### Redirect

```javascript
return res.redirect('/new-url');
```

### JSON Response

```javascript
return res.json({ success: true, data: {} });
```

### Status Code

```javascript
return res.status(404).render('404');
```

## Error Handling

### Try-Catch Pattern

```javascript
async index(req, res) {
    try {
        this.setup(req);
        
        const result = await this.layoutManager.init();
        
        if (result.status !== 200) {
            return res.status(result.status).render('404');
        }
        
        return super.index(req, res);
        
    } catch (error) {
        console.error('Controller Error:', error);
        return res.status(500).send('Internal Server Error');
    }
}
```

### Validation Errors

```javascript
validate(data) {
    const errors = [];
    
    if (!data.name) {
        errors.push({ field: 'name', message: 'Name is required' });
    }
    
    return errors;
}
```

## Best Practices

### 1. Always Call setup()

```javascript
async index(req, res) {
    this.setup(req);  // Always first
    // ... rest of code
}
```

### 2. Use Try-Catch

```javascript
async index(req, res) {
    try {
        // Your code
    } catch (error) {
        console.error(error);
        return res.status(500).send('Error');
    }
}
```

### 3. Keep Controllers Thin

Move complex logic to services:

```javascript
// ❌ Bad
async index(req, res) {
    // 100 lines of business logic
}

// ✅ Good
async index(req, res) {
    const data = await MyService.getData();
    this.bindDataForView('view', { data });
    return super.index(req, res);
}
```

### 4. Use Descriptive Method Names

```javascript
// ✅ Good
async showProductList(req, res) { }
async showProductDetail(req, res, id) { }

// ❌ Bad
async doStuff(req, res) { }
```

### 5. Validate Input

```javascript
async handleSubmit(req, res) {
    const errors = this.validate(req.body);
    
    if (errors.length > 0) {
        // Handle errors
    }
    
    // Process valid data
}
```

## Next Steps

For detailed examples and advanced patterns, see:
- [Creating Custom Controllers](./14-custom-controllers.md) - Comprehensive guide with examples
- [Request Lifecycle](./05-request-lifecycle.md) - How requests flow through controllers
- [Routing](./06-routing.md) - How URLs map to controllers

---

**Previous:** [Routing](./06-routing.md) | **Next:** [Middleware](./08-middleware.md)
