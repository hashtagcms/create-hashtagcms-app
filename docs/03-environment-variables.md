# Environment Variables Reference

Complete reference for all environment variables used in the HashtagCMS Node.js Frontend Renderer.

## Quick Reference

```env
# Server
PORT=3000
NODE_ENV=development

# HashtagCMS
HASHTAGCMS_CONTEXT=mysite
HASHTAGCMS_API_BASE_URL=http://backend.local/api/hashtagcms/public
HASHTAGCMS_API_SECRET=your_api_key

# API Endpoints
HASHTAGCMS_CONFIG_API=/configs/v1/site-configs
HASHTAGCMS_DATA_API=/sites/v1/load-data
HASHTAGCMS_BLOG_API=/sites/v1/blog/latests
HASHTAGCMS_LOGIN_API=/auth/login
HASHTAGCMS_LOGOUT_API=/auth/logout

# Cache & Performance
HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=5
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=60
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=30

# Blog
BLOG_PER_PAGE=10

# Session
SESSION_SECRET=change_this_in_production

# Assets (Optional)
ASSET_URL=
```

## Server Configuration

### PORT
- **Type**: Number
- **Default**: `3000`
- **Required**: No
- **Description**: Port number for the Express server

```env
PORT=3000
```

### NODE_ENV
- **Type**: String
- **Default**: `development`
- **Required**: No
- **Values**: `development`, `production`, `staging`, `test`
- **Description**: Application environment

```env
NODE_ENV=production
```

**Impact:**
- `development`: Verbose logging, no minification
- `production`: Optimized, secure cookies, caching enabled
- `staging`: Similar to production but with more logging

## HashtagCMS Core

### HASHTAGCMS_CONTEXT
- **Type**: String
- **Default**: None
- **Required**: Yes
- **Description**: Site identifier that matches your backend configuration

```env
HASHTAGCMS_CONTEXT=mysite
```

**Example values:**
- `mysite`
- `blog`
- `ecommerce`
- `portfolio`

### HASHTAGCMS_API_BASE_URL
- **Type**: URL
- **Default**: None
- **Required**: Yes
- **Description**: Base URL for HashtagCMS backend API

```env
HASHTAGCMS_API_BASE_URL=http://cms.local/api/hashtagcms/public
```

**Examples:**
```env
# Local development
HASHTAGCMS_API_BASE_URL=http://localhost:8000/api/hashtagcms/public

# Staging
HASHTAGCMS_API_BASE_URL=https://staging-api.example.com/api/hashtagcms/public

# Production
HASHTAGCMS_API_BASE_URL=https://api.example.com/api/hashtagcms/public
```

### HASHTAGCMS_API_SECRET
- **Type**: String
- **Default**: None
- **Required**: Yes
- **Description**: API authentication key for backend requests

```env
HASHTAGCMS_API_SECRET=abc123def456ghi789
```

**Security Notes:**
- Never commit this to version control
- Use different keys for dev/staging/production
- Rotate keys periodically

## API Endpoints

### HASHTAGCMS_CONFIG_API
- **Type**: String (URL path)
- **Default**: `/configs/v1/site-configs`
- **Required**: No
- **Description**: Endpoint for loading site configurations

```env
HASHTAGCMS_CONFIG_API=/configs/v1/site-configs
```

### HASHTAGCMS_DATA_API
- **Type**: String (URL path)
- **Default**: `/sites/v1/load-data`
- **Required**: No
- **Description**: Endpoint for loading page data

```env
HASHTAGCMS_DATA_API=/sites/v1/load-data
```

### HASHTAGCMS_BLOG_API
- **Type**: String (URL path)
- **Default**: `/sites/v1/blog/latests`
- **Required**: No
- **Description**: Endpoint for loading blog posts

```env
HASHTAGCMS_BLOG_API=/sites/v1/blog/latests
```

### HASHTAGCMS_LOGIN_API
- **Type**: String (URL path)
- **Default**: `/auth/login`
- **Required**: No
- **Description**: Endpoint for user login

```env
HASHTAGCMS_LOGIN_API=/auth/login
```

### HASHTAGCMS_LOGOUT_API
- **Type**: String (URL path)
- **Default**: `/auth/logout`
- **Required**: No
- **Description**: Endpoint for user logout

```env
HASHTAGCMS_LOGOUT_API=/auth/logout
```

### HASHTAGCMS_USER_ME_API
- **Type**: String (URL path)
- **Default**: `/user/me`
- **Required**: No
- **Description**: Endpoint for getting current user info

```env
HASHTAGCMS_USER_ME_API=/user/me
```

### HASHTAGCMS_USER_PROFILE_UPDATE_API
- **Type**: String (URL path)
- **Default**: `/user/profile/update`
- **Required**: No
- **Description**: Endpoint for updating user profile

```env
HASHTAGCMS_USER_PROFILE_UPDATE_API=/user/profile/update
```

### HASHTAGCMS_PUBLISH_API
- **Type**: String (URL path)
- **Default**: `/publish`
- **Required**: No
- **Description**: Endpoint for publishing content

```env
HASHTAGCMS_PUBLISH_API=/publish
```

### HASHTAGCMS_CONTACT_API
- **Type**: String (URL path)
- **Default**: `/contact`
- **Required**: No
- **Description**: Endpoint for contact form submissions

```env
HASHTAGCMS_CONTACT_API=/contact
```

### HASHTAGCMS_SUBSCRIBE_API
- **Type**: String (URL path)
- **Default**: `/subscribe`
- **Required**: No
- **Description**: Endpoint for newsletter subscriptions

```env
HASHTAGCMS_SUBSCRIBE_API=/subscribe
```

## Cache & Performance

### HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT
- **Type**: Number (seconds)
- **Default**: `5`
- **Required**: No
- **Description**: Timeout for external API requests

```env
HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=5
```

**Recommendations:**
- Development: `10` (slower connections)
- Production: `5` (fail fast)
- Slow backend: `15`

### HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL
- **Type**: Number (minutes)
- **Default**: `60`
- **Required**: No
- **Description**: Cache duration for site configurations

```env
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=60
```

**Recommendations:**
- Development: `0` (no cache)
- Staging: `30`
- Production: `120` (configs rarely change)

### HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL
- **Type**: Number (minutes)
- **Default**: `30`
- **Required**: No
- **Description**: Cache duration for page data

```env
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=30
```

**Recommendations:**
- Development: `0` (no cache)
- Frequently updated: `5`
- Static content: `60`
- Production: `30`

## Blog Configuration

### BLOG_PER_PAGE
- **Type**: Number
- **Default**: `10`
- **Required**: No
- **Description**: Number of blog posts per page

```env
BLOG_PER_PAGE=10
```

**Common values:**
- `5` - Few posts, more pages
- `10` - Standard
- `20` - Many posts per page

## Session Configuration

### SESSION_SECRET
- **Type**: String
- **Default**: `change_this_secret_key_in_production`
- **Required**: Yes (for production)
- **Description**: Secret key for session encryption

```env
SESSION_SECRET=your_very_long_random_secret_key_here
```

**Best Practices:**
- Use a long, random string (32+ characters)
- Different secret for each environment
- Never use the default in production
- Generate with: `openssl rand -base64 32`

## Asset Configuration

### ASSET_URL
- **Type**: URL
- **Default**: Empty (uses local assets)
- **Required**: No
- **Description**: CDN URL for static assets

```env
# Local assets (default)
ASSET_URL=

# With CDN
ASSET_URL=https://cdn.example.com
```

**Usage:**
```ejs
<!-- Local -->
<img src="/assets/hashtagcms/fe/basic/img/logo.png">

<!-- CDN -->
<img src="https://cdn.example.com/assets/hashtagcms/fe/basic/img/logo.png">
```

## Environment Templates

### Development

```env
# Development Environment
PORT=3000
NODE_ENV=development

HASHTAGCMS_CONTEXT=mysite
HASHTAGCMS_API_BASE_URL=http://localhost:8000/api/hashtagcms/public
HASHTAGCMS_API_SECRET=dev_api_key_123

# No caching for development
HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=10
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=0
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=0

BLOG_PER_PAGE=5
SESSION_SECRET=dev_secret_not_for_production
```

### Staging

```env
# Staging Environment
PORT=3000
NODE_ENV=staging

HASHTAGCMS_CONTEXT=mysite
HASHTAGCMS_API_BASE_URL=https://staging-api.example.com/api/hashtagcms/public
HASHTAGCMS_API_SECRET=staging_api_key_456

# Moderate caching
HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=5
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=30
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=15

BLOG_PER_PAGE=10
SESSION_SECRET=staging_secret_random_string_here
```

### Production

```env
# Production Environment
PORT=80
NODE_ENV=production

HASHTAGCMS_CONTEXT=mysite
HASHTAGCMS_API_BASE_URL=https://api.example.com/api/hashtagcms/public
HASHTAGCMS_API_SECRET=production_api_key_789

# Aggressive caching
HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=5
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=120
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=60

BLOG_PER_PAGE=10
SESSION_SECRET=production_very_long_random_secret_key_here

# CDN
ASSET_URL=https://cdn.example.com
```

## Validation

### Required Variables

These must be set:
- `HASHTAGCMS_CONTEXT`
- `HASHTAGCMS_API_BASE_URL`
- `HASHTAGCMS_API_SECRET`

### Validation Script

Add to `server.js`:

```javascript
const requiredVars = [
    'HASHTAGCMS_CONTEXT',
    'HASHTAGCMS_API_BASE_URL',
    'HASHTAGCMS_API_SECRET'
];

requiredVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

console.log('✅ All required environment variables are set');
```

## Troubleshooting

### Variables Not Loading

**Check .env file exists:**
```bash
ls -la .env
```

**Verify dotenv is loaded:**
```javascript
// At the top of server.js
require('dotenv').config();
```

**Check for typos:**
```bash
# Variable names are case-sensitive
HASHTAGCMS_CONTEXT=mysite  # ✅ Correct
hashtagcms_context=mysite  # ❌ Wrong
```

### Values Not Applied

**Restart server:**
```bash
# Environment variables are loaded on startup
npm start
```

**Check for spaces:**
```env
# ❌ Wrong (spaces around =)
PORT = 3000

# ✅ Correct
PORT=3000
```

### Production Issues

**Use production values:**
```env
NODE_ENV=production  # Not 'prod' or 'Production'
```

**Secure session secret:**
```bash
# Generate strong secret
openssl rand -base64 32
```

---

**Previous:** [Configuration](./02-configuration.md) | **Next:** [Architecture](./04-architecture.md)
