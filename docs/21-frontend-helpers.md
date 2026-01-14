# Frontend Helpers & View Data Reference

Complete reference for all data and helper functions available in EJS views.

## Table of Contents
- [Helper Functions](#helper-functions)
- [CMS Data Object](#cms-data-object)
- [Module Data](#module-data)
- [User Data](#user-data)
- [Session Data](#session-data)
- [Form Data](#form-data)
- [Common Patterns](#common-patterns)

## Helper Functions

All helper functions are available via the `helper` object in views.

### helper.asset(path)

Generate asset URLs for theme resources.

**Signature:**
```javascript
helper.asset(path: string): string
```

**Examples:**
```ejs
<!-- Images -->
<img src="<%= helper.asset('img/logo.png') %>">
<!-- Output: /assets/hashtagcms/fe/basic/img/logo.png -->

<!-- CSS -->
<link rel="stylesheet" href="<%= helper.asset('css/custom.css') %>">
<!-- Output: /assets/hashtagcms/fe/basic/css/custom.css -->

<!-- JavaScript -->
<script src="<%= helper.asset('js/custom.js') %>"></script>
<!-- Output: /assets/hashtagcms/fe/basic/js/custom.js -->

<!-- Fonts -->
<link href="<%= helper.asset('fonts/custom-font.woff2') %>">
<!-- Output: /assets/hashtagcms/fe/basic/fonts/custom-font.woff2 -->
```

### helper.trans(key)

Translate text using language files.

**Signature:**
```javascript
helper.trans(key: string): string
```

**Language File Format:**
```
locales/{lang}/hashtagcms/{file}.json
```

**Examples:**
```ejs
<!-- Basic translation -->
<%= helper.trans('hashtagcms::auth.Login') %>
<!-- Output: Login (en) or लॉग इन (hi) -->

<%= helper.trans('hashtagcms::links.dashboard') %>
<!-- Output: Dashboard (en) or डैशबोर्ड (hi) -->

<%= helper.trans('hashtagcms::modules.Contact Us') %>
<!-- Output: Contact Us (en) or संपर्क करें (hi) -->

<!-- In buttons -->
<button><%= helper.trans('hashtagcms::auth.Submit') %></button>

<!-- In navigation -->
<a href="/blog"><%= helper.trans('hashtagcms::links.blog') %></a>
```

**Available Translation Files:**
- `auth.json` - Authentication strings
- `links.json` - Navigation links
- `modules.json` - Module content
- `common.json` - Common phrases

### helper.getPath(linkPath, fullPath)

Generate URLs with language and platform prefixes.

**Signature:**
```javascript
helper.getPath(linkPath: string, fullPath: boolean = true): string
```

**Parameters:**
- `linkPath` - The path to generate (e.g., 'blog/my-post')
- `fullPath` - Include lang/platform prefix (default: true)

**Examples:**
```ejs
<!-- Blog post link -->
<a href="<%= helper.getPath('blog/my-post') %>">
    Read Post
</a>
<!-- Output: /en/web/blog/my-post -->

<!-- Category link -->
<a href="<%= helper.getPath('products') %>">
    Products
</a>
<!-- Output: /en/web/products -->

<!-- Dynamic link from data -->
<a href="<%= helper.getPath(story.categoryLinkRewrite + '/' + story.linkRewrite) %>">
    <%= story.title %>
</a>
<!-- Output: /en/web/blog/my-first-post -->

<!-- Nested path -->
<a href="<%= helper.getPath('products/electronics/phones') %>">
    Phones
</a>
<!-- Output: /en/web/products/electronics/phones -->

<!-- Simple path without lang/platform -->
<a href="<%= helper.getPath('contact', false) %>">
    Contact
</a>
<!-- Output: /contact -->
```

**Multi-language Support:**
```ejs
<!-- English request (/en/web/blog) -->
<%= helper.getPath('blog/post-1') %>
<!-- Output: /en/web/blog/post-1 -->

<!-- Hindi request (/hi/web/blog) -->
<%= helper.getPath('blog/post-1') %>
<!-- Output: /hi/web/blog/post-1 -->
```

### helper.adminPath(path)

Generate URLs for admin panel pages.

**Signature:**
```javascript
helper.adminPath(path: string = ''): string
```

**Configuration:**
```env
# .env
ADMIN_BASE_URL=http://localhost:8000/admin
```

**Examples:**
```ejs
<!-- Admin dashboard -->
<a href="<%= helper.adminPath('dashboard') %>">
    Admin Dashboard
</a>
<!-- Output: http://localhost:8000/admin/dashboard -->

<!-- Admin users page -->
<a href="<%= helper.adminPath('users') %>">
    Manage Users
</a>
<!-- Output: http://localhost:8000/admin/users -->

<!-- Admin settings -->
<a href="<%= helper.adminPath('settings') %>">
    Settings
</a>
<!-- Output: http://localhost:8000/admin/settings -->

<!-- Admin home (no path) -->
<a href="<%= helper.adminPath() %>">
    Admin Panel
</a>
<!-- Output: http://localhost:8000/admin -->

<!-- Conditional admin link -->
<% if (user && user.userType && user.userType.toLowerCase() === 'staff') { %>
    <a href="<%= helper.adminPath('dashboard') %>">
        <i class="fa fa-dashboard"></i> Admin
    </a>
<% } %>
```

### helper.md5(string)

Generate MD5 hash of a string.

**Signature:**
```javascript
helper.md5(str: string): string
```

**Examples:**
```ejs
<!-- Gravatar URL -->
<img src="https://www.gravatar.com/avatar/<%= helper.md5(user.email) %>">

<!-- Cache busting -->
<link rel="stylesheet" href="/css/app.css?v=<%= helper.md5(Date.now().toString()) %>">

<!-- Unique IDs -->
<div id="widget-<%= helper.md5(module.id.toString()) %>">
    Content
</div>
```

### helper.formatDate(date)

Format date in human-readable format.

**Signature:**
```javascript
helper.formatDate(date: string|Date): string
```

**Examples:**
```ejs
<!-- Format post date -->
<span class="date">
    <%= helper.formatDate(post.created_at) %>
</span>
<!-- Output: January 10, 2026 -->

<!-- Format updated date -->
<small>Updated: <%= helper.formatDate(post.updated_at) %></small>
<!-- Output: Updated: December 25, 2025 -->

<!-- In blog listing -->
<% posts.forEach(post => { %>
    <div class="post">
        <h2><%= post.title %></h2>
        <time><%= helper.formatDate(post.published_at) %></time>
    </div>
<% }); %>
```

## CMS Data Object

The `cms` object contains all CMS-related data.

### cms.meta

Meta information about the current page.

**Structure:**
```javascript
cms.meta = {
    site: {
        id: 1,
        name: "My Site",
        domain: "example.com",
        context: "mysite",
        underMaintainance: false
    },
    lang: {
        id: 1,
        name: "English",
        isoCode: "en",
        locale: "en_US"
    },
    platform: {
        id: 1,
        name: "Web",
        linkRewrite: "web"
    },
    category: {
        id: 5,
        name: "Blog",
        linkRewrite: "blog",
        controller: "BlogController"
    },
    page: {
        id: 10,
        title: "My First Post",
        slug: "my-first-post",
        linkRewrite: "my-first-post"
    },
    theme: {
        id: 1,
        name: "Basic",
        directory: "basic"
    },
    props: {
        // Site-specific properties
    }
}
```

**Examples:**
```ejs
<!-- Site name -->
<h1><%= cms.meta.site.name %></h1>

<!-- Language code -->
<html lang="<%= cms.meta.lang.isoCode %>">

<!-- Platform name -->
<body data-platform="<%= cms.meta.platform.name %>">

<!-- Category name -->
<nav>
    <span>Category: <%= cms.meta.category.name %></span>
</nav>

<!-- Page title -->
<h1><%= cms.meta.page.title %></h1>

<!-- Theme directory -->
<!-- Using theme: <%= cms.meta.theme.directory %> -->
```

### cms.siteProps

Site properties and custom settings.

**Examples:**
```ejs
<!-- Site name -->
<%= cms.siteProps.siteName %>

<!-- Logo -->
<img src="<%= cms.siteProps.logo %>" alt="Logo">

<!-- Contact info -->
<a href="mailto:<%= cms.siteProps.email %>">
    <%= cms.siteProps.email %>
</a>

<!-- Social links -->
<a href="<%= cms.siteProps.facebook %>">Facebook</a>
<a href="<%= cms.siteProps.twitter %>">Twitter</a>

<!-- Custom properties -->
<%= cms.siteProps.customField %>
```

### cms.data

Configuration data including menus.

**Structure:**
```javascript
cms.data = {
    menus: {
        main: [
            { title: "Home", url: "/", active: true },
            { title: "Blog", url: "/blog", active: false },
            { title: "About", url: "/about", active: false }
        ],
        footer: [...]
    },
    settings: {...}
}
```

**Examples:**
```ejs
<!-- Main menu -->
<nav>
    <% cms.data.menus.main.forEach(item => { %>
        <a href="<%= item.url %>" 
           class="<%= item.active ? 'active' : '' %>">
            <%= item.title %>
        </a>
    <% }); %>
</nav>

<!-- Footer menu -->
<footer>
    <% cms.data.menus.footer.forEach(item => { %>
        <a href="<%= item.url %>"><%= item.title %></a>
    <% }); %>
</footer>

<!-- Nested menu -->
<ul>
    <% cms.data.menus.main.forEach(item => { %>
        <li>
            <a href="<%= item.url %>"><%= item.title %></a>
            <% if (item.children && item.children.length > 0) { %>
                <ul>
                    <% item.children.forEach(child => { %>
                        <li><a href="<%= child.url %>"><%= child.title %></a></li>
                    <% }); %>
                </ul>
            <% } %>
        </li>
    <% }); %>
</ul>
```

### cms.layoutManager

Layout manager methods for rendering.

**Available Methods:**

```ejs
<!-- Page title -->
<title><%= cms.layoutManager.getTitle() %></title>

<!-- Meta tags -->
<%- cms.layoutManager.getMetaContent() %>

<!-- Header content (scripts, styles) -->
<%- cms.layoutManager.getHeaderContent() %>

<!-- Body content (rendered modules) -->
<%- cms.layoutManager.getBodyContent() %>

<!-- Footer content (scripts) -->
<%- cms.layoutManager.getFooterContent() %>
```

**Example Master Layout:**
```ejs
<!DOCTYPE html>
<html lang="<%= cms.meta.lang.isoCode %>">
<head>
    <meta charset="UTF-8">
    <title><%= cms.layoutManager.getTitle() %></title>
    <%- cms.layoutManager.getMetaContent() %>
    <link rel="stylesheet" href="<%= helper.asset('css/app.css') %>">
    <%- cms.layoutManager.getHeaderContent() %>
</head>
<body>
    <div id="app">
        <%- cms.layoutManager.getBodyContent() %>
    </div>
    <%- cms.layoutManager.getFooterContent() %>
    <script src="<%= helper.asset('js/app.js') %>"></script>
</body>
</html>
```

## Module Data

Data bound to specific module views via `bindDataForView()`.

**Access via `module` object:**

```ejs
<!-- In a blog list module -->
<% module.posts.forEach(post => { %>
    <article>
        <h2><%= post.title %></h2>
        <p><%- post.excerpt %></p>
        <a href="<%= helper.getPath('blog/' + post.slug) %>">
            Read More
        </a>
    </article>
<% }); %>

<!-- In a sidebar widget -->
<div class="widget">
    <h3><%= module.title %></h3>
    <ul>
        <% module.items.forEach(item => { %>
            <li><%= item.name %></li>
        <% }); %>
    </ul>
</div>

<!-- In a product detail -->
<div class="product">
    <h1><%= module.product.name %></h1>
    <p><%= module.product.price %></p>
    <img src="<%= module.product.image %>">
</div>
```

## User Data

Current logged-in user information.

**Structure:**
```javascript
user = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    avatar: "/avatars/john.jpg"
}
```

**Examples:**
```ejs
<!-- Check if logged in -->
<% if (user) { %>
    <div class="user-menu">
        <img src="<%= user.avatar %>" alt="<%= user.name %>">
        <span>Welcome, <%= user.name %></span>
        <a href="/logout">Logout</a>
    </div>
<% } else { %>
    <a href="/login">Login</a>
<% } %>

<!-- User-specific content -->
<% if (user && user.role === 'admin') { %>
    <a href="/admin">Admin Panel</a>
<% } %>

<!-- User email -->
<% if (user) { %>
    <p>Logged in as: <%= user.email %></p>
<% } %>
```

## Session Data

Session information and flash messages.

**Structure:**
```javascript
session = {
    user: {...},
    flash: {
        message: "Success!",
        type: "success"
    }
}
```

**Examples:**
```ejs
<!-- Flash messages -->
<% if (session.flash) { %>
    <div class="alert alert-<%= session.flash.type %>">
        <%= session.flash.message %>
    </div>
<% } %>

<!-- Session data -->
<% if (session.cart) { %>
    <span class="cart-count"><%= session.cart.length %></span>
<% } %>
```

## Form Data

Form inputs and validation errors.

### inputs

Previously submitted form data.

**Examples:**
```ejs
<!-- Preserve input on error -->
<input type="text" 
       name="name" 
       value="<%= inputs.name || '' %>">

<input type="email" 
       name="email" 
       value="<%= inputs.email || '' %>">

<textarea name="message"><%= inputs.message || '' %></textarea>

<!-- Select with previous value -->
<select name="country">
    <option value="">Select Country</option>
    <option value="US" <%= inputs.country === 'US' ? 'selected' : '' %>>
        United States
    </option>
    <option value="IN" <%= inputs.country === 'IN' ? 'selected' : '' %>>
        India
    </option>
</select>

<!-- Checkbox with previous value -->
<input type="checkbox" 
       name="subscribe" 
       <%= inputs.subscribe ? 'checked' : '' %>>
```

### errors

Validation errors array.

**Structure:**
```javascript
errors = [
    { field: 'name', message: 'Name is required' },
    { field: 'email', message: 'Invalid email' }
]
```

**Examples:**
```ejs
<!-- Display all errors -->
<% if (errors && errors.length > 0) { %>
    <div class="alert alert-danger">
        <ul>
            <% errors.forEach(error => { %>
                <li><%= error.message %></li>
            <% }); %>
        </ul>
    </div>
<% } %>

<!-- Field-specific errors -->
<div class="form-group">
    <input type="text" 
           name="name" 
           value="<%= inputs.name || '' %>"
           class="<%= errors.find(e => e.field === 'name') ? 'is-invalid' : '' %>">
    
    <% if (errors.find(e => e.field === 'name')) { %>
        <span class="error">
            <%= errors.find(e => e.field === 'name').message %>
        </span>
    <% } %>
</div>

<!-- Inline error display -->
<input type="email" name="email" value="<%= inputs.email || '' %>">
<% const emailError = errors.find(e => e.field === 'email'); %>
<% if (emailError) { %>
    <small class="text-danger"><%= emailError.message %></small>
<% } %>
```

## Common Patterns

### Pattern: Navigation Menu

```ejs
<nav class="navbar">
    <a href="/" class="logo">
        <img src="<%= helper.asset('img/logo.png') %>" alt="<%= cms.meta.site.name %>">
    </a>
    
    <ul class="menu">
        <% cms.data.menus.main.forEach(item => { %>
            <li class="<%= item.active ? 'active' : '' %>">
                <a href="<%= item.url %>">
                    <%= helper.trans('hashtagcms::links.' + item.key) || item.title %>
                </a>
            </li>
        <% }); %>
    </ul>
    
    <div class="user-menu">
        <% if (user) { %>
            <span><%= user.name %></span>
            <a href="/logout"><%= helper.trans('hashtagcms::links.logout') %></a>
        <% } else { %>
            <a href="/login"><%= helper.trans('hashtagcms::links.login') %></a>
        <% } %>
    </div>
</nav>
```

### Pattern: Blog Post Card

```ejs
<% module.posts.forEach(post => { %>
    <article class="post-card">
        <% if (post.image) { %>
            <img src="<%= post.image %>" alt="<%= post.title %>">
        <% } %>
        
        <h2>
            <a href="<%= helper.getPath('blog/' + post.slug) %>">
                <%= post.title %>
            </a>
        </h2>
        
        <div class="meta">
            <span class="date">
                <%= helper.formatDate(post.created_at) %>
            </span>
            <% if (post.author) { %>
                <span class="author">By <%= post.author %></span>
            <% } %>
        </div>
        
        <p><%- post.excerpt %></p>
        
        <a href="<%= helper.getPath('blog/' + post.slug) %>" class="read-more">
            <%= helper.trans('hashtagcms::modules.Read More') %>
        </a>
    </article>
<% }); %>
```

### Pattern: Contact Form

```ejs
<form method="POST" action="/contact">
    <% if (errors && errors.length > 0) { %>
        <div class="alert alert-danger">
            <% errors.forEach(error => { %>
                <p><%= error.message %></p>
            <% }); %>
        </div>
    <% } %>
    
    <div class="form-group">
        <label><%= helper.trans('hashtagcms::modules.Name') %></label>
        <input type="text" 
               name="name" 
               value="<%= inputs.name || '' %>"
               placeholder="<%= helper.trans('hashtagcms::modules.Please enter your full name') %>">
    </div>
    
    <div class="form-group">
        <label><%= helper.trans('hashtagcms::modules.Email') %></label>
        <input type="email" 
               name="email" 
               value="<%= inputs.email || '' %>"
               placeholder="<%= helper.trans('hashtagcms::modules.Please enter your email') %>">
    </div>
    
    <div class="form-group">
        <label><%= helper.trans('hashtagcms::modules.Comment') %></label>
        <textarea name="message" 
                  placeholder="<%= helper.trans('hashtagcms::modules.Please tell us your query') %>"><%= inputs.message || '' %></textarea>
    </div>
    
    <button type="submit">
        <%= helper.trans('hashtagcms::modules.Submit') %>
    </button>
</form>
```

### Pattern: Language Switcher

```ejs
<div class="language-switcher">
    <% const currentLang = cms.meta.lang.isoCode; %>
    <% const currentPath = cms.meta.category.linkRewrite; %>
    
    <a href="/<%= 'en' %>/web/<%= currentPath %>" 
       class="<%= currentLang === 'en' ? 'active' : '' %>">
        English
    </a>
    
    <a href="/<%= 'hi' %>/web/<%= currentPath %>" 
       class="<%= currentLang === 'hi' ? 'active' : '' %>">
        हिन्दी
    </a>
</div>
```

### Pattern: Breadcrumbs

```ejs
<nav class="breadcrumbs">
    <a href="<%= helper.getPath('') %>">
        <%= helper.trans('hashtagcms::links.home') %>
    </a>
    
    <% if (cms.meta.category) { %>
        <span>/</span>
        <a href="<%= helper.getPath(cms.meta.category.linkRewrite) %>">
            <%= cms.meta.category.name %>
        </a>
    <% } %>
    
    <% if (cms.meta.page) { %>
        <span>/</span>
        <span><%= cms.meta.page.title %></span>
    <% } %>
</nav>
```

## Quick Reference

### All Available Objects

```ejs
helper          // Helper functions
cms             // CMS data
  .meta         // Meta information
  .siteProps    // Site properties
  .data         // Configuration data
  .layoutManager // Layout manager
module          // Module-specific data
user            // Current user
session         // Session data
inputs          // Form inputs
errors          // Validation errors
```

### All Helper Functions

```ejs
helper.asset(path)              // Asset URL
helper.trans(key)               // Translation
helper.getPath(path, fullPath)  // URL with lang/platform
helper.adminPath(path)          // Admin panel URL
helper.md5(string)              // MD5 hash
helper.formatDate(date)         // Format date
```

---

**Previous:** [Working with Views](./15-views.md) | **Next:** [Internationalization](./16-i18n.md)
