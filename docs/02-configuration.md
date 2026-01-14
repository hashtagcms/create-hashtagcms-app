# Configuration Guide

This guide covers all configuration options for the HashtagCMS Node.js Frontend Renderer.

## Table of Contents
- [Configuration Files](#configuration-files)
- [HashtagCMS Configuration](#hashtagcms-configuration)
- [Server Configuration](#server-configuration)
- [Session Configuration](#session-configuration)
- [Cache Configuration](#cache-configuration)
- [Advanced Configuration](#advanced-configuration)

## Configuration Files

### 1. Environment Variables (`.env`)

The primary configuration file. Copy from `.env.example`:

```bash
cp .env.example .env
```

**Location**: Project root

### 2. HashtagCMS Config (`config/hashtagcms.js`)

CMS-specific configuration and API endpoints.

**Location**: `config/hashtagcms.js`

## HashtagCMS Configuration

### Basic Setup

```env
# Site identifier (must match your backend)
HASHTAGCMS_CONTEXT=mysite

# Backend API base URL
HASHTAGCMS_API_BASE_URL=http://your-cms.local/api/hashtagcms/public

# API authentication key
HASHTAGCMS_API_SECRET=your_api_key_here
```

### API Endpoints

```env
# Configuration API
HASHTAGCMS_CONFIG_API=/configs/v1/site-configs

# Data loading API
HASHTAGCMS_DATA_API=/sites/v1/load-data

# Blog API
HASHTAGCMS_BLOG_API=/sites/v1/blog/latests

# Authentication APIs
HASHTAGCMS_LOGIN_API=/auth/login
HASHTAGCMS_LOGOUT_API=/auth/logout

# User APIs
HASHTAGCMS_USER_ME_API=/user/me
HASHTAGCMS_USER_PROFILE_UPDATE_API=/user/profile/update

# Other APIs
HASHTAGCMS_PUBLISH_API=/publish
HASHTAGCMS_CONTACT_API=/contact
HASHTAGCMS_SUBSCRIBE_API=/subscribe
```

### config/hashtagcms.js

```javascript
module.exports = {
    // API Secret Key
    apiSecret: process.env.HASHTAGCMS_API_SECRET || '',
    
    // Base URL for API
    baseUrl: process.env.HASHTAGCMS_API_BASE_URL || '',
    
    // Site context
    context: process.env.HASHTAGCMS_CONTEXT || 'default',
    
    // API Endpoints
    endpoints: {
        config: process.env.HASHTAGCMS_CONFIG_API || '/configs/v1/site-configs',
        data: process.env.HASHTAGCMS_DATA_API || '/sites/v1/load-data',
        blog: process.env.HASHTAGCMS_BLOG_API || '/sites/v1/blog/latests',
        login: process.env.HASHTAGCMS_LOGIN_API || '/auth/login',
        logout: process.env.HASHTAGCMS_LOGOUT_API || '/auth/logout',
        userMe: process.env.HASHTAGCMS_USER_ME_API || '/user/me',
        userProfileUpdate: process.env.HASHTAGCMS_USER_PROFILE_UPDATE_API || '/user/profile/update',
        publish: process.env.HASHTAGCMS_PUBLISH_API || '/publish',
        contact: process.env.HASHTAGCMS_CONTACT_API || '/contact',
        subscribe: process.env.HASHTAGCMS_SUBSCRIBE_API || '/subscribe'
    }
};
```

## Server Configuration

### Port and Environment

```env
# Server port
PORT=3000

# Environment (development, production, staging)
NODE_ENV=development
```

### Usage in Code

```javascript
const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';

app.listen(port, () => {
    console.log(`Server running on port ${port} in ${env} mode`);
});
```

## Session Configuration

### Session Secret

```env
# Session secret (change in production!)
SESSION_SECRET=change_this_secret_key_in_production
```

### Session Settings in server.js

```javascript
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
```

## Cache Configuration

### Cache TTL Settings

```env
# External service timeout (seconds)
HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=5

# Config cache TTL (minutes)
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=60

# Data cache TTL (minutes)
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=30
```

### How Caching Works

**Config Cache:**
- Site configurations are cached for 60 minutes (default)
- Reduces API calls to backend
- Improves performance

**Data Cache:**
- Page data cached for 30 minutes (default)
- Can be adjusted based on content update frequency

**Timeout:**
- API requests timeout after 5 seconds (default)
- Prevents hanging requests

### Adjusting Cache

```env
# For frequently updated content
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=5

# For static content
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=120

# For development (no cache)
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=0
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=0
```

## Blog Configuration

```env
# Number of blog posts per page
BLOG_PER_PAGE=10
```

Usage in BlogController:

```javascript
const perPage = process.env.BLOG_PER_PAGE || 10;
```

## Asset Configuration

### CDN Configuration (Optional)

```env
# Asset URL (leave empty for local assets)
ASSET_URL=

# Or use CDN
ASSET_URL=https://cdn.example.com
```

### Usage in Views

```ejs
<!-- Without CDN -->
<link rel="stylesheet" href="/assets/hashtagcms/fe/basic/css/app.css">

<!-- With CDN -->
<link rel="stylesheet" href="https://cdn.example.com/assets/hashtagcms/fe/basic/css/app.css">
```

## Advanced Configuration

### Custom API Headers

Modify `src/services/CmsService.js`:

```javascript
this.client = axios.create({
    baseURL: config.baseUrl,
    timeout: timeout,
    headers: {
        'x-api-secret': config.apiSecret,
        'Content-Type': 'application/json',
        // Add custom headers
        'X-Custom-Header': 'value'
    }
});
```

### Request Interceptors

Add logging or modify requests:

```javascript
this.client.interceptors.request.use(
    (config) => {
        console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
        // Modify config if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
```

### Response Interceptors

Handle responses globally:

```javascript
this.client.interceptors.response.use(
    (response) => {
        // Process successful responses
        return response;
    },
    (error) => {
        // Handle errors globally
        if (error.response?.status === 401) {
            // Redirect to login
        }
        return Promise.reject(error);
    }
);
```

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
PORT=3000
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=0
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=0
```

### Staging

```env
NODE_ENV=staging
PORT=3000
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=30
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=15
```

### Production

```env
NODE_ENV=production
PORT=80
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=120
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=60
SESSION_SECRET=strong_random_secret_here
```

## Configuration Best Practices

### 1. Never Commit .env

```gitignore
# .gitignore
.env
.env.local
.env.*.local
```

### 2. Use .env.example

Provide a template:

```env
# .env.example
PORT=3000
NODE_ENV=development
HASHTAGCMS_CONTEXT=mysite
HASHTAGCMS_API_BASE_URL=http://your-backend.local/api
HASHTAGCMS_API_SECRET=your_api_key
```

### 3. Validate Configuration

Add validation in your code:

```javascript
const requiredEnvVars = [
    'HASHTAGCMS_CONTEXT',
    'HASHTAGCMS_API_BASE_URL',
    'HASHTAGCMS_API_SECRET'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});
```

### 4. Use Defaults

```javascript
const port = process.env.PORT || 3000;
const timeout = parseInt(process.env.HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT) || 5;
```

### 5. Type Conversion

```javascript
// String to number
const port = parseInt(process.env.PORT) || 3000;

// String to boolean
const isProduction = process.env.NODE_ENV === 'production';

// String to array
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
```

## Configuration Loading Order

1. **Environment variables** (`.env` file)
2. **Config files** (`config/hashtagcms.js`)
3. **Defaults** (hardcoded in code)

## Troubleshooting

### Configuration Not Loading

```bash
# Check if .env exists
ls -la .env

# Verify dotenv is loaded
# In server.js, should have:
require('dotenv').config();
```

### Wrong API URL

```bash
# Test API URL
curl -H "x-api-secret: your-key" \
     "http://your-backend.local/api/hashtagcms/public/configs/v1/site-configs?site=mysite&lang=en"
```

### Cache Issues

```bash
# Disable cache for testing
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=0
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=0
```

## Quick Reference

```env
# Essential Configuration
HASHTAGCMS_CONTEXT=mysite
HASHTAGCMS_API_BASE_URL=http://backend.local/api/hashtagcms/public
HASHTAGCMS_API_SECRET=your_key
PORT=3000
NODE_ENV=development

# Cache (minutes)
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=60
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=30

# Timeout (seconds)
HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=5

# Blog
BLOG_PER_PAGE=10

# Session
SESSION_SECRET=change_in_production
```

---

**Previous:** [Installation](./01-installation.md) | **Next:** [Environment Variables](./03-environment-variables.md)
