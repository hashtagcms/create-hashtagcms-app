# Quick Reference Guide

A quick reference for common tasks and code snippets in the HashtagCMS Node.js Frontend Renderer.

## Table of Contents
- [NPM Commands](#npm-commands)
- [Environment Variables](#environment-variables)
- [Controller Snippets](#controller-snippets)
- [View Helpers](#view-helpers)
- [InfoLoader API](#infoloader-api)
- [LayoutManager API](#layoutmanager-api)
- [CmsService API](#cmsservice-api)
- [Common Patterns](#common-patterns)

**📖 For complete view data reference, see:** [Frontend Helpers & View Data](./21-frontend-helpers.md)

## NPM Commands

### Project Creation

```bash
# Recommended: Clone complete repository
git clone https://github.com/marghoobsuleman/hashtagcms-nodejs-frontend.git my-project
cd my-project
npm install

# Alternative: NPX (creates structure only, requires manual file copying)
npx create-hashtagcms-app my-project
# Note: You'll need to copy src/, views/, config/, etc. manually

# Show NPX help
npx create-hashtagcms-app --help

# Show NPX version
npx create-hashtagcms-app --version
```

### Development Commands

```bash
# Install dependencies (if cloned manually)
npm install

# Start production server
npm start

# Start development server (auto-reload)
npm run server

# Build production assets
npm run build

# Build development assets (watch mode)
npm run dev

# Clean and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Environment Variables

### Essential Variables

```env
# Server
PORT=3000
NODE_ENV=development

# HashtagCMS
HASHTAGCMS_CONTEXT=mysite
HASHTAGCMS_API_BASE_URL=http://cms.local/api/hashtagcms/public
HASHTAGCMS_API_SECRET=your_api_key

# Cache & Timeout (seconds/minutes)
HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=5
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=60
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=30
```

### API Endpoints

```env
HASHTAGCMS_CONFIG_API=/configs/v1/site-configs
HASHTAGCMS_DATA_API=/sites/v1/load-data
HASHTAGCMS_BLOG_API=/sites/v1/blog/latests
HASHTAGCMS_LOGIN_API=/auth/login
HASHTAGCMS_LOGOUT_API=/auth/logout
```

## Controller Snippets

### Basic Controller

```javascript
const FrontendBaseController = require('./FrontendBaseController');

class MyController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        return super.index(req, res);
    }
}

module.exports = MyController;
```

### Controller with Custom Data

```javascript
async index(req, res) {
    this.setup(req);
    
    // Load custom data
    const customData = await this.loadData();
    
    // Bind to view
    this.bindDataForView('fe/basic/custom/widget', customData);
    
    return super.index(req, res);
}
```

### Controller with List/Detail Logic

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
```

### Controller with Authentication

```javascript
async index(req, res) {
    this.setup(req);
    
    if (!req.session.user) {
        return res.redirect('/login?redirect=' + req.originalUrl);
    }
    
    return super.index(req, res);
}
```

### Controller with Form Handling

```javascript
async index(req, res) {
    this.setup(req);
    
    if (req.method === 'POST') {
        return await this.handleSubmit(req, res);
    }
    
    return super.index(req, res);
}

async handleSubmit(req, res) {
    const errors = this.validate(req.body);
    
    if (errors.length > 0) {
        res.locals.errors = errors;
        res.locals.inputs = req.body;
        return super.index(req, res);
    }
    
    // Process form
    await this.processForm(req.body);
    return res.redirect('/success');
}
```

## View Helpers

### In EJS Templates

```ejs
<!-- Asset URL -->
<%= helper.asset('img/logo.png') %>
<!-- Output: /assets/hashtagcms/fe/basic/img/logo.png -->

<!-- Translation -->
<%= helper.trans('hashtagcms::common.readMore') %>
<!-- Output: Read More -->

<!-- Path with Language and Platform (matches PHP htcms_get_path()) -->
<%= helper.getPath('blog/my-post') %>
<!-- Output: /en/web/blog/my-post -->

<!-- Category path -->
<%= helper.getPath('products') %>
<!-- Output: /en/web/products -->

<!-- Dynamic path from data -->
<%= helper.getPath(story.categoryLinkRewrite + '/' + story.linkRewrite) %>
<!-- Output: /en/web/blog/my-first-post -->

<!-- Simple path without lang/platform -->
<%= helper.getPath('contact', false) %>
<!-- Output: /contact -->

<!-- MD5 Hash -->
<%= helper.md5('email@example.com') %>
<!-- Output: md5 hash -->

<!-- Format Date -->
<%= helper.formatDate('2024-01-10') %>
<!-- Output: January 10, 2024 -->
```

**getPath() Multi-language Support:**

```ejs
<!-- English request (/en/web/blog) -->
<%= helper.getPath('blog/post-1') %>
<!-- Output: /en/web/blog/post-1 -->

<!-- Hindi request (/hi/web/blog) -->
<%= helper.getPath('blog/post-1') %>
<!-- Output: /hi/web/blog/post-1 -->
```

### Accessing CMS Data

```ejs
<!-- Site Name -->
<%= cms.meta.site.name %>

<!-- Language -->
<%= cms.meta.lang.isoCode %>

<!-- Site Props -->
<%= cms.siteProps.siteName %>
<%= cms.siteProps.logo %>

<!-- Menus -->
<% cms.data.menus.main.forEach(item => { %>
    <a href="<%= item.url %>"><%= item.title %></a>
<% }); %>

<!-- Module Data -->
<%= module.post.title %>
<%= module.post.content %>

<!-- User -->
<% if (user) { %>
    Welcome, <%= user.name %>
<% } %>
```

### Layout Manager Methods

```ejs
<!-- Title -->
<title><%= cms.layoutManager.getTitle() %></title>

<!-- Meta Tags -->
<%- cms.layoutManager.getMetaContent() %>

<!-- Header Content -->
<%- cms.layoutManager.getHeaderContent() %>

<!-- Body Content -->
<%- cms.layoutManager.getBodyContent() %>

<!-- Footer Content -->
<%- cms.layoutManager.getFooterContent() %>
```

## InfoLoader API

### Get Data

```javascript
// Site
const site = this.infoLoader.getSiteData();
// { id, name, domain, ... }

// Platform
const platform = this.infoLoader.getPlatformData();
// { id, name, linkRewrite, ... }

// Language
const lang = this.infoLoader.getLangData();
// { id, name, isoCode, ... }

// Category
const category = this.infoLoader.getCategoryData();
// { id, name, linkRewrite, ... }

// Page
const page = this.infoLoader.getPageData();
// { id, title, slug, ... }

// Theme
const theme = this.infoLoader.getThemeData();
// { id, name, directory, ... }

// Site Props
const siteProps = this.infoLoader.getSiteProps();
// { siteName: 'My Site', logo: '/logo.png', ... }

// Configs (menus, etc.)
const configs = this.infoLoader.getConfigs();
// { menus: {...}, ... }

// Callable Values (URL segments)
const callableValue = this.infoLoader.getAppCallableValue();
// ["my-first-post"]
```

### Get Meta Data

```javascript
// Title
const title = this.infoLoader.getMetaTitle();

// Description
const description = this.infoLoader.getMetaDescription();

// Keywords
const keywords = this.infoLoader.getMetaKeywords();

// Canonical
const canonical = this.infoLoader.getMetaCanonical();

// Robots
const robots = this.infoLoader.getMetaRobots();

// Favicon
const favicon = this.infoLoader.getFavIcon();
```

### Get Content

```javascript
// Header Content
const headerContent = this.infoLoader.getHeaderContent();

// Footer Content
const footerContent = this.infoLoader.getFooterContent();

// Skeleton
const skeleton = this.infoLoader.getThemeSkeleton();
```

### InfoKeeper (Key-Value Store)

```javascript
// Set
this.infoLoader.setInfoKeeper('customKey', 'customValue');

// Get
const value = this.infoLoader.getInfoKeeper('customKey');

// Get all
const all = this.infoLoader.getInfoKeeper();
```

## LayoutManager API

### Initialization

```javascript
// Initialize and load data
const result = await this.layoutManager.init();

// Check result
if (result.status === 200) {
    // Success
    console.log(result.meta);
    console.log(result.isContentFound);
    console.log(result.isLoginRequired);
}
```

### Data Binding

```javascript
// Bind data to a view
this.layoutManager.bindDataForView('fe/basic/sidebar/widget', {
    title: 'My Widget',
    items: [1, 2, 3]
});
```

### View Replacement

```javascript
// Replace one view with another
this.layoutManager.replaceViewWith(
    'fe/basic/blog/list',      // Source
    'fe/basic/blog/grid',      // Target
    { layout: 'grid' }         // Additional data
);
```

### Content Management

```javascript
// Set body content
this.layoutManager.setBodyContent('<div>Content</div>');

// Get body content
const body = this.layoutManager.getBodyContent();

// Get header content
const header = this.layoutManager.getHeaderContent();

// Get footer content
const footer = this.layoutManager.getFooterContent();

// Get title
const title = this.layoutManager.getTitle();

// Get meta content
const meta = this.layoutManager.getMetaContent();
```

### Mandatory Check

```javascript
// Set mandatory content check
this.layoutManager.setMandatoryCheck(true);

// Get mandatory check
const isMandatory = this.layoutManager.getMandatoryCheck();
```

## CmsService API

### Load Data

```javascript
const CmsService = require('../services/CmsService');

// Load page data
const pageData = await CmsService.loadPageData(
    'blog/my-post',  // category
    'en',            // language
    'web'            // platform
);

// Load configurations (cached)
const configs = await CmsService.loadConfigs('en');

// Get latest blogs
const blogs = await CmsService.getLatestBlog(
    'blog',          // category
    'en',            // language
    'web',           // platform
    10               // limit
);
```

### Authentication

```javascript
// Login
const result = await CmsService.login(email, password);
if (result.token) {
    req.session.user = result.user;
    req.session.token = result.token;
}

// Logout
await CmsService.logout(req.session.token);
req.session.destroy();
```

## Common Patterns

### Pattern: Load and Display List

```javascript
// Controller
async index(req, res) {
    this.setup(req);
    
    const items = await this.loadItems();
    
    this.bindDataForView('fe/basic/list', { items });
    
    return super.index(req, res);
}

async loadItems() {
    return await CmsService.getLatestBlog('blog', 'en', 'web', 10);
}
```

```ejs
<!-- View: fe/basic/list.ejs -->
<ul>
    <% module.items.forEach(item => { %>
        <li>
            <a href="/blog/<%= item.slug %>">
                <%= item.title %>
            </a>
        </li>
    <% }); %>
</ul>
```

### Pattern: Pagination

```javascript
// Controller
async index(req, res) {
    this.setup(req);
    
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    
    const { items, total } = await this.loadPaginated(page, perPage);
    
    this.bindDataForView('fe/basic/pagination', {
        items,
        currentPage: page,
        totalPages: Math.ceil(total / perPage),
        hasNext: page < Math.ceil(total / perPage),
        hasPrev: page > 1
    });
    
    return super.index(req, res);
}
```

```ejs
<!-- View: fe/basic/pagination.ejs -->
<div class="pagination">
    <% if (module.hasPrev) { %>
        <a href="?page=<%= module.currentPage - 1 %>">Previous</a>
    <% } %>
    
    <span>Page <%= module.currentPage %> of <%= module.totalPages %></span>
    
    <% if (module.hasNext) { %>
        <a href="?page=<%= module.currentPage + 1 %>">Next</a>
    <% } %>
</div>
```

### Pattern: Form with Validation

```javascript
// Controller
async handleSubmit(req, res) {
    const { name, email, message } = req.body;
    
    const errors = [];
    if (!name) errors.push({ field: 'name', message: 'Name required' });
    if (!email) errors.push({ field: 'email', message: 'Email required' });
    if (!message) errors.push({ field: 'message', message: 'Message required' });
    
    if (errors.length > 0) {
        res.locals.errors = errors;
        res.locals.inputs = req.body;
        return super.index(req, res);
    }
    
    await this.processForm({ name, email, message });
    return res.redirect('/success');
}
```

```ejs
<!-- View: form.ejs -->
<form method="POST">
    <div>
        <input type="text" name="name" value="<%= inputs.name || '' %>">
        <% if (errors && errors.find(e => e.field === 'name')) { %>
            <span class="error">
                <%= errors.find(e => e.field === 'name').message %>
            </span>
        <% } %>
    </div>
    
    <button type="submit">Submit</button>
</form>
```

### Pattern: Conditional Rendering

```ejs
<!-- Check if user is logged in -->
<% if (user) { %>
    <div>Welcome, <%= user.name %></div>
    <a href="/logout">Logout</a>
<% } else { %>
    <a href="/login">Login</a>
<% } %>

<!-- Check if data exists -->
<% if (module.items && module.items.length > 0) { %>
    <ul>
        <% module.items.forEach(item => { %>
            <li><%= item.title %></li>
        <% }); %>
    </ul>
<% } else { %>
    <p>No items found.</p>
<% } %>
```

### Pattern: Include Partials

```ejs
<!-- Master layout -->
<!DOCTYPE html>
<html>
<head>
    <%- include('_partials/head') %>
</head>
<body>
    <%- include('_partials/header') %>
    
    <main>
        <%- cms.layoutManager.getBodyContent() %>
    </main>
    
    <%- include('_partials/footer') %>
</body>
</html>
```

### Pattern: Loop with Index

```ejs
<% module.items.forEach((item, index) => { %>
    <div class="item item-<%= index %>">
        <span class="number"><%= index + 1 %></span>
        <h3><%= item.title %></h3>
    </div>
<% }); %>
```

### Pattern: Nested Data

```ejs
<% if (module.post && module.post.author) { %>
    <div class="author">
        <img src="<%= module.post.author.avatar %>">
        <span><%= module.post.author.name %></span>
    </div>
<% } %>
```

## File Paths

### Project Structure

```
views/fe/{theme}/
  _layout_/index.ejs          # Master layout
  blog/list.ejs               # Blog list
  blog/detail.ejs             # Blog detail
  
resources/assets/fe/{theme}/
  js/app.js                   # JavaScript entry
  sass/app.scss               # SCSS entry
  img/                        # Images
  fonts/                      # Fonts
  
public/assets/hashtagcms/fe/{theme}/
  js/app.js                   # Compiled JS
  css/app.css                 # Compiled CSS
  img/                        # Copied images
  fonts/                      # Copied fonts
```

### Asset URLs

```
Source: resources/assets/fe/basic/img/logo.png
Output: public/assets/hashtagcms/fe/basic/img/logo.png
URL:    /assets/hashtagcms/fe/basic/img/logo.png
Helper: <%= helper.asset('img/logo.png') %>
```

## Useful Commands

```bash
# Find files
find . -name "*.ejs"
find . -name "*.js" -not -path "./node_modules/*"

# Search in files
grep -r "searchterm" src/
grep -r "FrontendController" src/ --include="*.js"

# Check port usage
lsof -i :3000

# Monitor logs
tail -f logs/app.log

# Process management
ps aux | grep node
kill -9 <PID>

# Disk usage
du -sh public/assets/
```

## Quick Debugging

```javascript
// In controller
console.log('Request path:', req.path);
console.log('Query params:', req.query);
console.log('Session:', req.session);
console.log('InfoLoader data:', this.infoLoader.getInfoKeeper());

// In view
<% console.log('Module data:', module); %>
<% console.log('CMS data:', cms); %>

// In browser console
console.log('Site props:', window._siteProps_);
console.log('CMS data:', window._cmsData_);
```

---

**Back to:** [Documentation Index](./README.md)
