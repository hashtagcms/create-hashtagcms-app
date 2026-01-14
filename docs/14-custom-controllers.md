# Creating Custom Controllers

Controllers are the heart of your application's business logic. This guide teaches you how to create powerful custom controllers for the HashtagCMS Node.js Frontend Renderer.

## Table of Contents
- [Controller Basics](#controller-basics)
- [Controller Lifecycle](#controller-lifecycle)
- [Creating Your First Controller](#creating-your-first-controller)
- [Advanced Patterns](#advanced-patterns)
- [Working with Data](#working-with-data)
- [View Management](#view-management)
- [Error Handling](#error-handling)
- [Real-World Examples](#real-world-examples)

## Controller Basics

### What is a Controller?

A controller is a class that:
- Handles HTTP requests for specific routes
- Processes business logic
- Loads and manipulates data
- Renders views
- Returns HTTP responses

### Controller Hierarchy

```
Controller (base class)
    ↓
FrontendBaseController (CMS-specific base)
    ↓
Your Custom Controllers
    ├── BlogController
    ├── ProductController
    ├── ContactController
    └── etc.
```

### Base Classes

#### 1. Controller (`src/controllers/Controller.js`)

The most basic controller class:

```javascript
class Controller {
    constructor() {
        // Base initialization
    }
}

module.exports = Controller;
```

#### 2. FrontendBaseController (`src/controllers/FrontendBaseController.js`)

Extends `Controller` and provides CMS-specific functionality:

```javascript
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
        // Standard CMS page rendering logic
    }
}
```

**Key Features**:
- Access to `InfoLoader` (CMS data)
- Access to `LayoutManager` (rendering)
- Standard rendering flow
- View helpers
- Data binding
- View replacement

## Controller Lifecycle

### Standard Request Flow

```
1. Route matches request
   ↓
2. Controller instantiated
   ↓
3. setup(req) called
   ├─ InfoLoader attached
   └─ LayoutManager created
   ↓
4. index(req, res) called
   ├─ Load data (LayoutManager.init())
   ├─ Process business logic
   ├─ Bind/replace views
   └─ Render response
   ↓
5. Response sent to client
```

### Method Execution Order

```javascript
class MyController extends FrontendBaseController {
    constructor() {
        // 1. Constructor called
        super();
    }
    
    setup(req) {
        // 2. Setup called
        super.setup(req);
    }
    
    async index(req, res) {
        // 3. Index called
        this.setup(req);
        // Your logic here
    }
}
```

## Creating Your First Controller

### Step 1: Create the File

**File**: `src/controllers/ProductController.js`

```javascript
const FrontendBaseController = require('./FrontendBaseController');

class ProductController extends FrontendBaseController {
    async index(req, res) {
        // Your logic here
    }
}

module.exports = ProductController;
```

### Step 2: Register the Controller

**File**: `src/routes/web.js`

```javascript
const ProductController = require('../controllers/ProductController');

const controllers = {
    FrontendController,
    BlogController,
    ProductController,  // Add your controller
    // ... other controllers
};
```

### Step 3: Configure Backend Route

In your HashtagCMS backend:
1. Create a category with `linkRewrite` = `product`
2. The router will automatically map `/product` → `ProductController`

### Step 4: Implement Logic

```javascript
const FrontendBaseController = require('./FrontendBaseController');
const CmsService = require('../services/CmsService');

class ProductController extends FrontendBaseController {
    async index(req, res) {
        try {
            // 1. Setup
            this.setup(req);
            
            // 2. Get callable value (e.g., product slug)
            const callableValue = this.infoLoader.getAppCallableValue();
            
            // 3. Determine if list or detail page
            if (callableValue && callableValue.length > 0) {
                return await this.showProduct(req, res, callableValue[0]);
            } else {
                return await this.listProducts(req, res);
            }
            
        } catch (error) {
            console.error('ProductController Error:', error);
            return res.status(500).send('Internal Server Error');
        }
    }
    
    async listProducts(req, res) {
        // Load product list
        const result = await this.layoutManager.init();
        
        if (result.status !== 200) {
            return res.status(result.status).render('404');
        }
        
        // Continue with standard rendering
        return super.index(req, res);
    }
    
    async showProduct(req, res, slug) {
        // Load specific product
        const result = await this.layoutManager.init();
        
        if (result.status !== 200) {
            return res.status(result.status).render('404');
        }
        
        // Add related products
        const relatedProducts = await this.getRelatedProducts(slug);
        this.bindDataForView('fe/basic/product/related', {
            products: relatedProducts
        });
        
        // Continue with standard rendering
        return super.index(req, res);
    }
    
    async getRelatedProducts(slug) {
        // Your logic to fetch related products
        return [];
    }
}

module.exports = ProductController;
```

## Advanced Patterns

### Pattern 1: Custom Data Loading

Override the standard flow to load custom data:

```javascript
class CustomController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Skip standard init, load custom data
        const customData = await this.loadCustomData();
        
        // Normalize into CMS structure
        const normalized = this.layoutManager.normalizeData(
            customData,
            'custom-category'
        );
        
        // Set the data
        this.layoutManager.setLoadDataObjectAndEverything(normalized);
        
        // Continue with rendering
        const lang = this.infoLoader.getLangIsoCode() || 'en';
        res.locals.helper = this.createViewHelpers(lang);
        
        const theme = this.infoLoader.getThemeData();
        await this.layoutManager.parseSkeletonForView(theme, res);
        
        const themeDir = theme.directory || 'basic';
        const viewName = `fe/${themeDir}/_layout_/index`;
        
        return res.render(viewName, {
            cms: {
                layoutManager: this.layoutManager,
                siteProps: this.infoLoader.getSiteProps(),
                data: this.infoLoader.getConfigs(),
                meta: normalized.meta
            },
            user: res.locals.user || null
        });
    }
    
    async loadCustomData() {
        // Your custom data loading logic
        return [];
    }
}
```

### Pattern 2: API Integration

Integrate with external APIs:

```javascript
const axios = require('axios');

class ApiController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Load from external API
        const apiData = await this.fetchFromExternalApi();
        
        // Bind to view
        this.bindDataForView('fe/basic/api/results', {
            results: apiData
        });
        
        // Continue with standard rendering
        return super.index(req, res);
    }
    
    async fetchFromExternalApi() {
        try {
            const response = await axios.get('https://api.example.com/data', {
                headers: {
                    'Authorization': `Bearer ${process.env.API_TOKEN}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    }
}
```

### Pattern 3: Form Handling

Handle form submissions:

```javascript
class ContactController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Handle POST request
        if (req.method === 'POST') {
            return await this.handleSubmit(req, res);
        }
        
        // Handle GET request (show form)
        return super.index(req, res);
    }
    
    async handleSubmit(req, res) {
        const { name, email, message } = req.body;
        
        // Validate
        const errors = this.validate({ name, email, message });
        
        if (errors.length > 0) {
            // Show form with errors
            res.locals.errors = errors;
            res.locals.inputs = req.body;
            return super.index(req, res);
        }
        
        // Process submission
        await this.sendEmail({ name, email, message });
        
        // Redirect with success message
        req.session.flash = { message: 'Thank you for contacting us!' };
        return res.redirect('/contact?success=1');
    }
    
    validate(data) {
        const errors = [];
        
        if (!data.name || data.name.trim() === '') {
            errors.push({ field: 'name', message: 'Name is required' });
        }
        
        if (!data.email || !this.isValidEmail(data.email)) {
            errors.push({ field: 'email', message: 'Valid email is required' });
        }
        
        if (!data.message || data.message.trim() === '') {
            errors.push({ field: 'message', message: 'Message is required' });
        }
        
        return errors;
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    async sendEmail(data) {
        // Your email sending logic
        console.log('Sending email:', data);
    }
}
```

### Pattern 4: Authentication Guard

Require authentication for certain pages:

```javascript
class ProtectedController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Check authentication
        if (!req.session.user || !req.session.user.id) {
            // Redirect to login
            const returnUrl = encodeURIComponent(req.originalUrl);
            return res.redirect(`/login?redirect=${returnUrl}`);
        }
        
        // User is authenticated, continue
        return super.index(req, res);
    }
}
```

### Pattern 5: Pagination

Implement pagination:

```javascript
class PaginatedController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Get page number from query
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        
        // Load paginated data
        const { items, total } = await this.loadPaginatedData(page, perPage);
        
        // Calculate pagination info
        const totalPages = Math.ceil(total / perPage);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;
        
        // Bind pagination data
        this.bindDataForView('fe/basic/pagination', {
            currentPage: page,
            totalPages,
            hasNext,
            hasPrev,
            items
        });
        
        return super.index(req, res);
    }
    
    async loadPaginatedData(page, perPage) {
        // Your data loading logic
        const offset = (page - 1) * perPage;
        
        // Example: Load from API
        const items = []; // Load items with offset and limit
        const total = 100; // Total count
        
        return { items, total };
    }
}
```

## Working with Data

### Accessing InfoLoader

```javascript
// Get site data
const site = this.infoLoader.getSiteData();
console.log(site.name, site.domain);

// Get language
const lang = this.infoLoader.getLangData();
console.log(lang.isoCode); // "en"

// Get category
const category = this.infoLoader.getCategoryData();
console.log(category.linkRewrite); // "blog"

// Get page data
const page = this.infoLoader.getPageData();
console.log(page.title);

// Get site props
const siteProps = this.infoLoader.getSiteProps();
console.log(siteProps.siteName);

// Get configs (menus, etc.)
const configs = this.infoLoader.getConfigs();
console.log(configs.menus);

// Get callable values (URL segments)
const callableValue = this.infoLoader.getAppCallableValue();
console.log(callableValue); // ["my-first-post"]
```

### Using CmsService

```javascript
const CmsService = require('../services/CmsService');

// Load page data
const pageData = await CmsService.loadPageData(
    'blog/my-post',  // category
    'en',            // language
    'web'            // platform
);

// Load configurations
const configs = await CmsService.loadConfigs('en');

// Get latest blogs
const blogs = await CmsService.getLatestBlog(
    'blog',          // category
    'en',            // language
    'web',           // platform
    10               // limit
);

// Login
const loginResult = await CmsService.login(email, password);

// Logout
await CmsService.logout(token);
```

## View Management

### Binding Data to Views

```javascript
// Bind additional data to a specific view
this.bindDataForView('fe/basic/sidebar/widget', {
    title: 'Custom Widget',
    items: [1, 2, 3],
    showMore: true
});

// The view can now access this data
// <%= module.title %>
// <%= module.items %>
```

### Replacing Views

```javascript
// Replace one view with another
this.replaceViewWith(
    'fe/basic/blog/list',      // Original view
    'fe/basic/blog/grid',      // Replacement view
    { layout: 'grid' }         // Additional data
);

// Use case: A/B testing, seasonal themes, user preferences
```

### Setting Mandatory Content Check

```javascript
// Require content to be found
this.setModuleMandatoryCheck(true);

// If content is not found, 404 will be returned
// Useful for detail pages where content must exist
```

## Error Handling

### Try-Catch Pattern

```javascript
async index(req, res) {
    try {
        this.setup(req);
        
        // Your logic
        const result = await this.layoutManager.init();
        
        if (result.status !== 200) {
            return this.handleError(res, result.status, result.message);
        }
        
        return super.index(req, res);
        
    } catch (error) {
        console.error('Controller Error:', error);
        return this.handleError(res, 500, 'Internal Server Error');
    }
}

handleError(res, status, message) {
    return res.status(status).render('404', { message });
}
```

### Validation Errors

```javascript
async handleSubmit(req, res) {
    const errors = this.validate(req.body);
    
    if (errors.length > 0) {
        res.locals.errors = errors;
        res.locals.inputs = req.body;
        return super.index(req, res);
    }
    
    // Process valid data
}

// In your view:
// <% if (errors && errors.length > 0) { %>
//     <% errors.forEach(error => { %>
//         <div class="error"><%= error.message %></div>
//     <% }); %>
// <% } %>
```

## Real-World Examples

### Example 1: E-commerce Product Controller

```javascript
const FrontendBaseController = require('./FrontendBaseController');
const axios = require('axios');

class ProductController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        const callableValue = this.infoLoader.getAppCallableValue();
        
        if (callableValue && callableValue.length > 0) {
            // Product detail page
            return await this.showProduct(req, res, callableValue[0]);
        } else {
            // Product listing page
            return await this.listProducts(req, res);
        }
    }
    
    async listProducts(req, res) {
        const result = await this.layoutManager.init();
        
        if (result.status !== 200) {
            return res.status(result.status).render('404');
        }
        
        // Get filters from query
        const category = req.query.category;
        const minPrice = req.query.min_price;
        const maxPrice = req.query.max_price;
        
        // Load filtered products
        const products = await this.loadProducts({
            category,
            minPrice,
            maxPrice
        });
        
        // Bind to view
        this.bindDataForView('fe/basic/product/list', {
            products,
            filters: { category, minPrice, maxPrice }
        });
        
        return super.index(req, res);
    }
    
    async showProduct(req, res, slug) {
        const result = await this.layoutManager.init();
        
        if (result.status !== 200) {
            return res.status(result.status).render('404');
        }
        
        // Load product details
        const product = await this.loadProduct(slug);
        
        if (!product) {
            return res.status(404).render('404', {
                message: 'Product not found'
            });
        }
        
        // Load related data
        const [reviews, relatedProducts] = await Promise.all([
            this.loadReviews(product.id),
            this.getRelatedProducts(product.category)
        ]);
        
        // Bind data
        this.bindDataForView('fe/basic/product/reviews', { reviews });
        this.bindDataForView('fe/basic/product/related', {
            products: relatedProducts
        });
        
        return super.index(req, res);
    }
    
    async loadProducts(filters) {
        // Load from your product API
        const response = await axios.get('/api/products', {
            params: filters
        });
        return response.data;
    }
    
    async loadProduct(slug) {
        const response = await axios.get(`/api/products/${slug}`);
        return response.data;
    }
    
    async loadReviews(productId) {
        const response = await axios.get(`/api/products/${productId}/reviews`);
        return response.data;
    }
    
    async getRelatedProducts(category) {
        const response = await axios.get('/api/products', {
            params: { category, limit: 4 }
        });
        return response.data;
    }
}

module.exports = ProductController;
```

### Example 2: Search Controller

```javascript
class SearchController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        const query = req.query.q || '';
        const page = parseInt(req.query.page) || 1;
        const perPage = 20;
        
        if (!query) {
            // Show empty search page
            return super.index(req, res);
        }
        
        // Perform search
        const { results, total } = await this.search(query, page, perPage);
        
        // Calculate pagination
        const totalPages = Math.ceil(total / perPage);
        
        // Bind results
        this.bindDataForView('fe/basic/search/results', {
            query,
            results,
            total,
            page,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        });
        
        return super.index(req, res);
    }
    
    async search(query, page, perPage) {
        // Your search logic (Elasticsearch, database, etc.)
        const offset = (page - 1) * perPage;
        
        // Example: Search API
        const response = await axios.get('/api/search', {
            params: { q: query, offset, limit: perPage }
        });
        
        return {
            results: response.data.results,
            total: response.data.total
        };
    }
}
```

### Example 3: User Dashboard Controller

```javascript
class DashboardController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        
        // Require authentication
        const user = req.session.user;
        if (!user) {
            return res.redirect('/login?redirect=/dashboard');
        }
        
        // Load user-specific data
        const [orders, wishlist, notifications] = await Promise.all([
            this.loadUserOrders(user.id),
            this.loadUserWishlist(user.id),
            this.loadUserNotifications(user.id)
        ]);
        
        // Bind data to different views
        this.bindDataForView('fe/basic/dashboard/orders', { orders });
        this.bindDataForView('fe/basic/dashboard/wishlist', { wishlist });
        this.bindDataForView('fe/basic/dashboard/notifications', {
            notifications
        });
        
        return super.index(req, res);
    }
    
    async loadUserOrders(userId) {
        const response = await axios.get(`/api/users/${userId}/orders`);
        return response.data;
    }
    
    async loadUserWishlist(userId) {
        const response = await axios.get(`/api/users/${userId}/wishlist`);
        return response.data;
    }
    
    async loadUserNotifications(userId) {
        const response = await axios.get(`/api/users/${userId}/notifications`);
        return response.data;
    }
}
```

## Best Practices

### 1. Keep Controllers Thin

Move complex logic to services:

```javascript
// ❌ Bad: Too much logic in controller
class ProductController extends FrontendBaseController {
    async index(req, res) {
        // 100 lines of business logic...
    }
}

// ✅ Good: Delegate to services
class ProductController extends FrontendBaseController {
    async index(req, res) {
        this.setup(req);
        const products = await ProductService.getAll();
        this.bindDataForView('fe/basic/product/list', { products });
        return super.index(req, res);
    }
}
```

### 2. Use Async/Await

```javascript
// ✅ Good
async index(req, res) {
    const data = await this.loadData();
    return super.index(req, res);
}
```

### 3. Handle Errors Gracefully

```javascript
async index(req, res) {
    try {
        // Your logic
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).render('500', { error });
    }
}
```

### 4. Validate Input

```javascript
async handleSubmit(req, res) {
    const errors = this.validate(req.body);
    if (errors.length > 0) {
        // Handle validation errors
    }
}
```

### 5. Use Meaningful Names

```javascript
// ❌ Bad
async doStuff(req, res) { }

// ✅ Good
async showProductDetails(req, res) { }
async listProductsByCategory(req, res) { }
```

## Next Steps

- Learn about [View Management](./15-views.md)
- Explore [Authentication](./17-authentication.md)
- Check [Performance Optimization](./19-performance.md)

---

**Previous:** [Asset Pipeline](./13-asset-pipeline.md) | **Next:** [Working with Views](./15-views.md)
