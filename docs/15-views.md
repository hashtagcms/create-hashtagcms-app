# Working with Views

Guide to EJS templates and view rendering.

## Overview

Views are server-side templates using **EJS** (Embedded JavaScript).

**Location:** `views/fe/{theme}/`

## View Structure

```
views/fe/basic/
├── _layout_/
│   └── index.ejs          # Master layout
├── blog/
│   ├── list.ejs           # Blog listing
│   └── detail.ejs         # Blog detail
├── header/
│   └── navigation.ejs     # Header
└── footer/
    └── copyright.ejs      # Footer
```

## Master Layout

**File:** `views/fe/basic/_layout_/index.ejs`

```ejs
<!DOCTYPE html>
<html lang="<%= cms.meta.lang.isoCode %>">
<head>
    <meta charset="UTF-8">
    <title><%= cms.layoutManager.getTitle() %></title>
    <%- cms.layoutManager.getMetaContent() %>
    <link rel="stylesheet" href="/assets/hashtagcms/fe/basic/css/app.css">
    <%- cms.layoutManager.getHeaderContent() %>
</head>
<body>
    <div id="app">
        <%- cms.layoutManager.getBodyContent() %>
    </div>
    <%- cms.layoutManager.getFooterContent() %>
    <script src="/assets/hashtagcms/fe/basic/js/app.js"></script>
</body>
</html>
```

## Module Views

**File:** `views/fe/basic/blog/list.ejs`

```ejs
<div class="blog-list">
    <% module.posts.forEach(post => { %>
        <article class="post">
            <h2><%= post.title %></h2>
            <p><%- post.excerpt %></p>
            <a href="/blog/<%= post.slug %>">Read More</a>
        </article>
    <% }); %>
</div>
```

## Available Data

### CMS Data

```ejs
<%= cms.meta.site.name %>
<%= cms.meta.lang.isoCode %>
<%= cms.siteProps.siteName %>
```

### Module Data

```ejs
<%= module.post.title %>
<%= module.post.content %>
```

### Helper Functions

```ejs
<%= helper.asset('img/logo.png') %>
<%= helper.trans('common.readMore') %>
<%= helper.getPath('blog') %>
```

### User Data

```ejs
<% if (user) { %>
    Welcome, <%= user.name %>
<% } %>
```

## EJS Syntax

### Output (Escaped)

```ejs
<%= variable %>
<!-- Escapes HTML -->
```

### Output (Unescaped)

```ejs
<%- htmlContent %>
<!-- Raw HTML -->
```

### JavaScript

```ejs
<% if (condition) { %>
    Content
<% } %>
```

### Loops

```ejs
<% items.forEach(item => { %>
    <%= item.name %>
<% }); %>
```

### Include

```ejs
<%- include('_partials/header') %>
```

## View Helpers

### asset(path)

```ejs
<img src="<%= helper.asset('img/logo.png') %>">
<!-- /assets/hashtagcms/fe/basic/img/logo.png -->
```

### trans(key)

```ejs
<%= helper.trans('hashtagcms::common.readMore') %>
<!-- Read More -->
```

### getPath(linkPath, fullPath)

Generate URLs with language and platform prefixes (matches PHP `htcms_get_path()`).

**Parameters:**
- `linkPath` (string) - The path to generate (e.g., 'blog/my-post')
- `fullPath` (boolean, optional) - Include lang/platform prefix (default: true)

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

<!-- Simple path without lang/platform -->
<a href="<%= helper.getPath('contact', false) %>">
    Contact
</a>
<!-- Output: /contact -->
```

**Multi-language Support:**

The helper automatically uses the current request language:

```ejs
<!-- English request (/en/web/blog) -->
<%= helper.getPath('blog/post-1') %>
<!-- Output: /en/web/blog/post-1 -->

<!-- Hindi request (/hi/web/blog) -->
<%= helper.getPath('blog/post-1') %>
<!-- Output: /hi/web/blog/post-1 -->
```

### md5(string)

```ejs
<%= helper.md5('hello@example.com') %>
<!-- 5d41402abc4b2a76b9719d911017c592 -->
```

### formatDate(date)

```ejs
<%= helper.formatDate(post.created_at) %>
<!-- January 10, 2026 -->
```

## Best Practices

1. **Escape Output**: Use `<%=` for user content
2. **Use Helpers**: Don't hardcode paths
3. **Keep Logic Minimal**: Move complex logic to controllers
4. **Reuse Partials**: Use includes for common elements

---

**Previous:** [Custom Controllers](./14-custom-controllers.md) | **Next:** [Internationalization](./16-i18n.md)
