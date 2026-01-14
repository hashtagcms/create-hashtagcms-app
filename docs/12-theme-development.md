# Theme Development Guide

Creating custom themes for the HashtagCMS Node.js Frontend Renderer allows you to completely customize the look and feel of your website. This guide covers everything you need to know about theme development.

## Table of Contents
- [Overview](#overview)
- [Theme Structure](#theme-structure)
- [Creating a New Theme](#creating-a-new-theme)
- [Asset Pipeline](#asset-pipeline)
- [View Templates](#view-templates)
- [JavaScript Development](#javascript-development)
- [CSS/SCSS Development](#css-scss-development)
- [Vue.js Components](#vuejs-components)
- [Best Practices](#best-practices)

## Overview

A theme in HashtagCMS consists of:
- **Views** (EJS templates) - Server-side templates
- **JavaScript** - Client-side interactivity
- **CSS/SCSS** - Styling
- **Vue.js Components** - Reactive UI components
- **Assets** - Images, fonts, icons

### Default Theme

The project includes a default theme called **"basic"** located at:
- Views: `views/fe/basic/`
- Assets: `resources/assets/fe/basic/`
- Compiled: `public/assets/hashtagcms/fe/basic/`

## Theme Structure

```
Theme: "basic"

views/fe/basic/                    # EJS Templates
├── _layout_/                      # Master layouts
│   └── index.ejs                  # Main layout
├── blog/                          # Blog views
│   ├── list.ejs
│   ├── detail.ejs
│   └── item.ejs
├── auth/                          # Authentication views
│   ├── login.ejs
│   └── register.ejs
├── header/                        # Header components
│   └── navigation.ejs
├── footer/                        # Footer components
│   └── copyright.ejs
└── ...

resources/assets/fe/basic/         # Source Assets
├── js/                            # JavaScript source
│   ├── app.js                     # Main entry point
│   └── components/                # Vue components
│       ├── Header.vue
│       └── Footer.vue
├── sass/                          # SCSS source
│   ├── app.scss                   # Main stylesheet
│   ├── _variables.scss
│   ├── _mixins.scss
│   └── components/
│       ├── _header.scss
│       └── _footer.scss
├── img/                           # Images
│   ├── logo.png
│   └── banner.jpg
└── fonts/                         # Custom fonts
    └── custom-font.woff2

public/assets/hashtagcms/fe/basic/ # Compiled Assets
├── js/
│   └── app.js                     # Bundled JavaScript
├── css/
│   └── app.css                    # Compiled CSS
├── img/                           # Copied images
└── fonts/                         # Copied fonts
```

## Creating a New Theme

### Step 1: Create Directory Structure

```bash
# Create view directories
mkdir -p views/fe/mytheme/_layout_
mkdir -p views/fe/mytheme/blog
mkdir -p views/fe/mytheme/auth
mkdir -p views/fe/mytheme/header
mkdir -p views/fe/mytheme/footer

# Create asset directories
mkdir -p resources/assets/fe/mytheme/js/components
mkdir -p resources/assets/fe/mytheme/sass/components
mkdir -p resources/assets/fe/mytheme/img
mkdir -p resources/assets/fe/mytheme/fonts
```

### Step 2: Create Master Layout

**File**: `views/fe/mytheme/_layout_/index.ejs`

```ejs
<!DOCTYPE html>
<html lang="<%= cms.meta.lang.isoCode %>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Title -->
    <title><%= cms.layoutManager.getTitle() %></title>
    
    <!-- Meta Tags -->
    <%- cms.layoutManager.getMetaContent() %>
    
    <!-- Theme Stylesheet -->
    <link rel="stylesheet" href="/assets/hashtagcms/fe/mytheme/css/app.css">
    
    <!-- Header Content (from CMS) -->
    <%- cms.layoutManager.getHeaderContent() %>
</head>
<body>
    <!-- Main Content -->
    <div id="app">
        <%- cms.layoutManager.getBodyContent() %>
    </div>
    
    <!-- Footer Content (from CMS) -->
    <%- cms.layoutManager.getFooterContent() %>
    
    <!-- Theme JavaScript -->
    <script src="/assets/hashtagcms/fe/mytheme/js/app.js"></script>
</body>
</html>
```

### Step 3: Create Entry Point Files

**JavaScript**: `resources/assets/fe/mytheme/js/app.js`

```javascript
import { createApp } from 'vue';
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';

// Initialize Vue app
const app = createApp({
    components: {
        Header,
        Footer
    }
});

app.mount('#app');

console.log('MyTheme initialized!');
```

**SCSS**: `resources/assets/fe/mytheme/sass/app.scss`

```scss
// Variables
@import 'variables';

// Mixins
@import 'mixins';

// Base styles
@import 'base';

// Components
@import 'components/header';
@import 'components/footer';
@import 'components/blog';

// Utilities
@import 'utilities';
```

### Step 4: Configure Webpack

**File**: `webpack.config.js`

Add your theme to the `themesForFrontend` array:

```javascript
let themesForFrontend = [
    {
        theme: { source: 'basic', type: 'theme' },
        assets: [
            { source: 'js/app.js', target: 'js/app', type: 'js' },
            { source: 'sass/app.scss', target: 'css/app', type: 'css' },
            { source: 'img', target: 'img', type: 'copy' },
            { source: 'fonts', target: 'fonts', type: 'copy' }
        ]
    },
    // Add your theme
    {
        theme: { source: 'mytheme', type: 'theme' },
        assets: [
            { source: 'js/app.js', target: 'js/app', type: 'js' },
            { source: 'sass/app.scss', target: 'css/app', type: 'css' },
            { source: 'img', target: 'img', type: 'copy' },
            { source: 'fonts', target: 'fonts', type: 'copy' }
        ]
    }
];
```

### Step 5: Build Assets

```bash
npm run build
```

This will compile your theme assets to `public/assets/hashtagcms/fe/mytheme/`.

### Step 6: Configure Backend

In your HashtagCMS backend, set the theme for your site:
- Go to Site Settings
- Set Theme Directory to `mytheme`
- Save changes

## Asset Pipeline

### How It Works

```
Source Files                  Webpack                  Output
─────────────────────────────────────────────────────────────
resources/assets/fe/mytheme/
├── js/app.js          ──►  Bundle, Transpile  ──►  public/assets/.../js/app.js
├── sass/app.scss      ──►  Compile, Minify    ──►  public/assets/.../css/app.css
├── img/               ──►  Copy               ──►  public/assets/.../img/
└── fonts/             ──►  Copy               ──►  public/assets/.../fonts/
```

### Asset Types

#### 1. JavaScript (`type: 'js'`)
- Transpiled with Babel (ES6+ → ES5)
- Bundled with Webpack
- Vue components compiled
- Minified in production

#### 2. CSS (`type: 'css'`)
- SCSS compiled to CSS
- Autoprefixer applied
- Minified with cssnano
- Source maps in development

#### 3. Copy (`type: 'copy'`)
- Files copied as-is
- No processing
- Maintains directory structure

### Build Commands

```bash
# Production build (minified)
npm run build

# Development build with watch
npm run dev

# This watches for changes and rebuilds automatically
```

## View Templates

### Master Layout

The master layout is the wrapper for all pages.

**Location**: `views/fe/{theme}/_layout_/index.ejs`

**Required Elements**:
```ejs
<!-- Title -->
<title><%= cms.layoutManager.getTitle() %></title>

<!-- Meta tags -->
<%- cms.layoutManager.getMetaContent() %>

<!-- Header content -->
<%- cms.layoutManager.getHeaderContent() %>

<!-- Body content (rendered modules) -->
<%- cms.layoutManager.getBodyContent() %>

<!-- Footer content -->
<%- cms.layoutManager.getFooterContent() %>
```

### Module Views

Module views are individual components rendered within the skeleton.

**Example**: `views/fe/mytheme/blog/detail.ejs`

```ejs
<article class="blog-post">
    <header class="post-header">
        <h1 class="post-title"><%= module.post.title %></h1>
        <div class="post-meta">
            <span class="author">By <%= module.post.author %></span>
            <span class="date"><%= helper.formatDate(module.post.publishedAt) %></span>
        </div>
    </header>
    
    <div class="post-content">
        <%- module.post.content %>
    </div>
    
    <footer class="post-footer">
        <div class="tags">
            <% module.post.tags.forEach(tag => { %>
                <a href="/tag/<%= tag.slug %>" class="tag"><%= tag.name %></a>
            <% }); %>
        </div>
    </footer>
</article>
```

### Available Data in Views

```ejs
<!-- CMS Data -->
<%= cms.meta.site.name %>
<%= cms.meta.lang.isoCode %>
<%= cms.siteProps.siteName %>
<%= cms.data.menus %>

<!-- Module Data -->
<%= module.post.title %>
<%= module.post.content %>

<!-- Helper Functions -->
<%= helper.asset('img/logo.png') %>
<%= helper.trans('hashtagcms::common.readMore') %>
<%= helper.getPath('blog') %>
<%= helper.md5('string') %>
<%= helper.formatDate(date) %>

<!-- User Data -->
<% if (user) { %>
    <%= user.name %>
    <%= user.email %>
<% } %>

<!-- Session Data -->
<%= session.flash.message %>

<!-- Form Data -->
<%= inputs.email %>
<%= errors.email %>
```

## JavaScript Development

### Entry Point

**File**: `resources/assets/fe/mytheme/js/app.js`

```javascript
// Import Vue
import { createApp } from 'vue';

// Import components
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import BlogList from './components/BlogList.vue';

// Import utilities
import { initSmoothScroll } from './utils/scroll';
import { initLazyLoading } from './utils/lazyload';

// Create Vue app
const app = createApp({
    components: {
        Header,
        Footer,
        BlogList
    },
    
    mounted() {
        console.log('App mounted!');
        this.initFeatures();
    },
    
    methods: {
        initFeatures() {
            initSmoothScroll();
            initLazyLoading();
        }
    }
});

// Mount app
app.mount('#app');
```

### Using External Libraries

```javascript
// Install via npm
npm install axios lodash

// Import in your code
import axios from 'axios';
import { debounce } from 'lodash';

// Use in your components
export default {
    methods: {
        async fetchData() {
            const response = await axios.get('/api/data');
            return response.data;
        }
    }
};
```

## CSS/SCSS Development

### Variables

**File**: `resources/assets/fe/mytheme/sass/_variables.scss`

```scss
// Colors
$primary-color: #3498db;
$secondary-color: #2ecc71;
$text-color: #333;
$bg-color: #fff;

// Typography
$font-family: 'Inter', sans-serif;
$font-size-base: 16px;
$line-height-base: 1.6;

// Spacing
$spacing-unit: 8px;
$spacing-small: $spacing-unit * 2;
$spacing-medium: $spacing-unit * 3;
$spacing-large: $spacing-unit * 4;

// Breakpoints
$breakpoint-mobile: 576px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 992px;
$breakpoint-wide: 1200px;
```

### Mixins

**File**: `resources/assets/fe/mytheme/sass/_mixins.scss`

```scss
// Responsive breakpoints
@mixin mobile {
    @media (max-width: #{$breakpoint-mobile}) {
        @content;
    }
}

@mixin tablet {
    @media (min-width: #{$breakpoint-tablet}) {
        @content;
    }
}

@mixin desktop {
    @media (min-width: #{$breakpoint-desktop}) {
        @content;
    }
}

// Flexbox utilities
@mixin flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

// Button styles
@mixin button($bg-color, $text-color) {
    background-color: $bg-color;
    color: $text-color;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background-color: darken($bg-color, 10%);
    }
}
```

### Component Styles

**File**: `resources/assets/fe/mytheme/sass/components/_header.scss`

```scss
.site-header {
    background-color: $bg-color;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
    
    .header-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: $spacing-medium;
        @include flex-center;
        justify-content: space-between;
    }
    
    .logo {
        font-size: 24px;
        font-weight: bold;
        color: $primary-color;
        text-decoration: none;
    }
    
    .nav-menu {
        display: flex;
        gap: $spacing-medium;
        list-style: none;
        
        @include mobile {
            display: none;
        }
        
        a {
            color: $text-color;
            text-decoration: none;
            transition: color 0.3s ease;
            
            &:hover {
                color: $primary-color;
            }
        }
    }
}
```

## Vue.js Components

### Creating Components

**File**: `resources/assets/fe/mytheme/js/components/Header.vue`

```vue
<template>
    <header class="site-header">
        <div class="header-container">
            <a href="/" class="logo">{{ siteName }}</a>
            
            <nav class="nav-menu">
                <ul>
                    <li v-for="item in menuItems" :key="item.id">
                        <a :href="item.url">{{ item.title }}</a>
                    </li>
                </ul>
            </nav>
            
            <button @click="toggleMobileMenu" class="mobile-toggle">
                ☰
            </button>
        </div>
        
        <div v-if="mobileMenuOpen" class="mobile-menu">
            <ul>
                <li v-for="item in menuItems" :key="item.id">
                    <a :href="item.url" @click="closeMobileMenu">
                        {{ item.title }}
                    </a>
                </li>
            </ul>
        </div>
    </header>
</template>

<script>
export default {
    name: 'Header',
    
    data() {
        return {
            mobileMenuOpen: false,
            siteName: window._siteProps_?.siteName || 'My Site',
            menuItems: window._cmsData_?.menus?.main || []
        };
    },
    
    methods: {
        toggleMobileMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen;
        },
        
        closeMobileMenu() {
            this.mobileMenuOpen = false;
        }
    }
};
</script>

<style scoped lang="scss">
.site-header {
    // Component-specific styles
}
</style>
```

### Accessing CMS Data in Vue

In your master layout, expose CMS data to JavaScript:

```ejs
<script>
    // Make CMS data available to Vue
    window._siteProps_ = <%- JSON.stringify(cms.siteProps) %>;
    window._cmsData_ = <%- JSON.stringify(cms.data) %>;
    window._user_ = <%- JSON.stringify(user) %>;
</script>
```

Then access in Vue components:
```javascript
const siteProps = window._siteProps_;
const menus = window._cmsData_.menus;
const user = window._user_;
```

## Best Practices

### 1. Organize Your Code

```
mytheme/
├── js/
│   ├── app.js              # Entry point
│   ├── components/         # Vue components
│   ├── utils/              # Utility functions
│   └── services/           # API services
├── sass/
│   ├── app.scss            # Main stylesheet
│   ├── _variables.scss     # Variables
│   ├── _mixins.scss        # Mixins
│   ├── _base.scss          # Base styles
│   ├── components/         # Component styles
│   └── utilities/          # Utility classes
```

### 2. Use BEM Naming

```scss
.blog-post {
    &__header {
        // ...
    }
    
    &__title {
        // ...
    }
    
    &__content {
        // ...
    }
    
    &--featured {
        // ...
    }
}
```

### 3. Mobile-First Design

```scss
// Base styles (mobile)
.container {
    padding: 16px;
}

// Tablet and up
@include tablet {
    .container {
        padding: 24px;
    }
}

// Desktop and up
@include desktop {
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }
}
```

### 4. Performance Optimization

```javascript
// Lazy load images
import { initLazyLoading } from './utils/lazyload';

// Debounce scroll events
import { debounce } from 'lodash';

window.addEventListener('scroll', debounce(() => {
    // Handle scroll
}, 100));

// Code splitting
const BlogList = () => import('./components/BlogList.vue');
```

### 5. Accessibility

```ejs
<!-- Semantic HTML -->
<nav aria-label="Main navigation">
    <ul>
        <li><a href="/">Home</a></li>
    </ul>
</nav>

<!-- Alt text for images -->
<img src="logo.png" alt="Company Logo">

<!-- ARIA labels -->
<button aria-label="Close menu" @click="closeMenu">×</button>
```

## Next Steps

- Learn about [Asset Pipeline](./13-asset-pipeline.md) in detail
- Explore [Working with Views](./15-views.md)
- Check [Performance Optimization](./19-performance.md)

---

**Previous:** [CMS Service](./11-cms-service.md) | **Next:** [Asset Pipeline](./13-asset-pipeline.md)
