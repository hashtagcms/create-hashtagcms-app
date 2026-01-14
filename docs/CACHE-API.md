# Cache Management API Documentation

## 🎯 Overview

The Cache Management API provides endpoints to manage Redis cache for load-data responses. All endpoints are protected by API key authentication.

---

## 🔐 Authentication

All cache API endpoints require authentication via API key.

### **Methods:**

**1. Header (Recommended):**
```bash
curl -H "X-API-Secret: your_api_key" http://localhost:8004/api/cache/stats
```

**2. Query Parameter:**
```bash
curl http://localhost:8004/api/cache/stats?api_secret=your_api_key
```

### **API Key Configuration:**

**Production (REQUIRED):**
```env
# .env
CACHE_API_SECRET=your_secure_cache_api_key_change_this
```

⚠️ **In production, `CACHE_API_SECRET` MUST be set!** The API will return 500 error if not configured.

**Development (Optional):**
```env
# .env
# If CACHE_API_SECRET is not set, falls back to HASHTAGCMS_API_SECRET
CACHE_API_SECRET=dev_cache_key
# OR leave unset to use:
# HASHTAGCMS_API_SECRET=123456789
```

**Security Behavior:**

| Environment | CACHE_API_SECRET | Fallback | Behavior |
|-------------|---------------|----------|----------|
| **Production** | ✅ Set | ❌ No fallback | Uses CACHE_API_SECRET |
| **Production** | ❌ Not set | ❌ No fallback | **Returns 500 error** |
| **Development** | ✅ Set | - | Uses CACHE_API_SECRET |
| **Development** | ❌ Not set | ✅ HASHTAGCMS_API_SECRET | Uses HASHTAGCMS_API_SECRET |

**Why this matters:**
- 🔒 **Production security**: Prevents accidental use of CMS API key for cache management
- 🛡️ **Separation of concerns**: Different keys for different purposes
- ✅ **Explicit configuration**: Forces you to set up cache API key in production

---

## 📋 Available Endpoints

### **1. GET /api/cache/stats**

Get cache statistics.

**Request:**
```bash
curl -H "X-API-Secret: 123456789" \
  http://localhost:8004/api/cache/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "totalKeys": 47,
    "pattern": "cache:load-data:*"
  },
  "timestamp": "2026-01-11T09:00:43.000Z"
}
```

**If Redis not enabled:**
```json
{
  "success": true,
  "data": {
    "enabled": false,
    "message": "Redis cache not configured"
  },
  "timestamp": "2026-01-11T09:00:43.000Z"
}
```

---

### **2. DELETE /api/cache/clear**

Clear cache for a specific page.

**Request:**
```bash
curl -X DELETE \
  -H "X-API-Secret: 123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "site": "procms",
    "lang": "en",
    "platform": "web",
    "category": "blog/my-post"
  }' \
  http://localhost:8004/api/cache/clear
```

**Request Body:**
```json
{
  "site": "procms",
  "lang": "en",
  "platform": "web",
  "category": "blog/my-post"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "data": {
    "site": "procms",
    "lang": "en",
    "platform": "web",
    "category": "blog/my-post"
  }
}
```

**Error Response (Missing Fields):**
```json
{
  "success": false,
  "error": "Missing required fields",
  "required": ["site", "lang", "platform", "category"]
}
```

---

### **3. DELETE /api/cache/clear-all**

Clear all cache entries for a site.

**Request:**
```bash
curl -X DELETE \
  -H "X-API-Secret: 123456789" \
  -H "Content-Type: application/json" \
  -d '{"site": "procms"}' \
  http://localhost:8004/api/cache/clear-all
```

**Request Body:**
```json
{
  "site": "procms"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cleared 47 cache entries",
  "data": {
    "site": "procms",
    "keysCleared": 47
  }
}
```

---

### **4. POST /api/cache/warm**

Warm up cache for a specific page (pre-cache).

**Request:**
```bash
curl -X POST \
  -H "X-API-Secret: 123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "site": "procms",
    "lang": "en",
    "platform": "web",
    "category": "blog/my-post"
  }' \
  http://localhost:8004/api/cache/warm
```

**Request Body:**
```json
{
  "site": "procms",
  "lang": "en",
  "platform": "web",
  "category": "blog/my-post"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cache warmed up successfully",
  "data": {
    "site": "procms",
    "lang": "en",
    "platform": "web",
    "category": "blog/my-post"
  }
}
```

**Error Response (Page Not Found):**
```json
{
  "success": false,
  "error": "Page not found or failed to load"
}
```

---

### **5. GET /api/cache/health**

Check if cache system is healthy.

**Request:**
```bash
curl -H "X-API-Secret: 123456789" \
  http://localhost:8004/api/cache/health
```

**Response:**
```json
{
  "success": true,
  "cache": {
    "enabled": true,
    "healthy": true
  },
  "timestamp": "2026-01-11T09:00:43.000Z"
}
```

---

## 🎯 Common Use Cases

### **Use Case 1: Clear Cache After Content Update**

When you update a blog post in the CMS:

```bash
# Clear the specific page cache
curl -X DELETE \
  -H "X-API-Secret: 123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "site": "procms",
    "lang": "en",
    "platform": "web",
    "category": "blog/updated-post"
  }' \
  http://localhost:8004/api/cache/clear
```

---

### **Use Case 2: Clear All Cache After Major Update**

When you update site-wide settings:

```bash
# Clear all cache for the site
curl -X DELETE \
  -H "X-API-Secret: 123456789" \
  -H "Content-Type: application/json" \
  -d '{"site": "procms"}' \
  http://localhost:8004/api/cache/clear-all
```

---

### **Use Case 3: Pre-Cache Popular Pages**

Before a traffic spike (e.g., product launch):

```bash
# Warm up cache for homepage
curl -X POST \
  -H "X-API-Secret: 123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "site": "procms",
    "lang": "en",
    "platform": "web",
    "category": "home"
  }' \
  http://localhost:8004/api/cache/warm

# Warm up cache for product page
curl -X POST \
  -H "X-API-Secret: 123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "site": "procms",
    "lang": "en",
    "platform": "web",
    "category": "products/new-launch"
  }' \
  http://localhost:8004/api/cache/warm
```

---

### **Use Case 4: Monitor Cache Health**

Check if caching is working:

```bash
# Check cache health
curl -H "X-API-Secret: 123456789" \
  http://localhost:8004/api/cache/health

# Get cache statistics
curl -H "X-API-Secret: 123456789" \
  http://localhost:8004/api/cache/stats
```

---

## 🔒 Security

### **Authentication:**
- ✅ All endpoints require valid API key
- ✅ Unauthorized attempts are logged
- ✅ Returns 401 for invalid keys

### **Best Practices:**

1. **Use dedicated cache API key:**
```env
CACHE_API_SECRET=your_secure_cache_api_key_different_from_cms_key
```

2. **Restrict access by IP (optional):**
```javascript
// Add to src/routes/cache.js
const allowedIPs = ['127.0.0.1', '192.168.1.100'];
if (!allowedIPs.includes(req.ip)) {
    return res.status(403).json({ error: 'Forbidden' });
}
```

3. **Use HTTPS in production:**
```
https://your-domain.com/api/cache/clear
```

---

## 📊 Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid or missing API key |
| 404 | Not Found | Page not found (warm endpoint) |
| 500 | Server Error | Internal server error |

---

## 🛠️ Integration Examples

### **Node.js:**
```javascript
const axios = require('axios');

async function clearPageCache(category) {
    try {
        const response = await axios.delete('http://localhost:8004/api/cache/clear', {
            headers: {
                'X-API-Secret': '123456789',
                'Content-Type': 'application/json'
            },
            data: {
                site: 'procms',
                lang: 'en',
                platform: 'web',
                category: category
            }
        });
        console.log('Cache cleared:', response.data);
    } catch (error) {
        console.error('Error:', error.response.data);
    }
}

clearPageCache('blog/my-post');
```

---

### **PHP (Laravel):**
```php
use Illuminate\Support\Facades\Http;

function clearPageCache($category) {
    $response = Http::withHeaders([
        'X-API-Secret' => '123456789',
    ])->delete('http://localhost:8004/api/cache/clear', [
        'site' => 'procms',
        'lang' => 'en',
        'platform' => 'web',
        'category' => $category
    ]);
    
    return $response->json();
}

clearPageCache('blog/my-post');
```

---

### **Python:**
```python
import requests

def clear_page_cache(category):
    url = 'http://localhost:8004/api/cache/clear'
    headers = {
        'X-API-Secret': '123456789',
        'Content-Type': 'application/json'
    }
    data = {
        'site': 'procms',
        'lang': 'en',
        'platform': 'web',
        'category': category
    }
    
    response = requests.delete(url, headers=headers, json=data)
    return response.json()

clear_page_cache('blog/my-post')
```

---

### **Bash Script:**
```bash
#!/bin/bash

API_KEY="123456789"
BASE_URL="http://localhost:8004/api/cache"

# Function to clear specific page
clear_page() {
    local category=$1
    curl -X DELETE \
      -H "X-API-Secret: $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{
        \"site\": \"procms\",
        \"lang\": \"en\",
        \"platform\": \"web\",
        \"category\": \"$category\"
      }" \
      "$BASE_URL/clear"
}

# Function to clear all cache
clear_all() {
    curl -X DELETE \
      -H "X-API-Secret: $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{"site": "procms"}' \
      "$BASE_URL/clear-all"
}

# Usage
clear_page "blog/my-post"
# clear_all
```

---

## 🎯 Webhook Integration

### **Trigger cache clear from CMS:**

When content is updated in HashtagCMS, automatically clear the cache:

```javascript
// In your CMS backend (after content update)
const axios = require('axios');

async function notifyFrontendCacheClear(category) {
    await axios.delete('http://frontend.local:8004/api/cache/clear', {
        headers: {
            'X-API-Secret': process.env.FRONTEND_CACHE_API_SECRET
        },
        data: {
            site: 'procms',
            lang: 'en',
            platform: 'web',
            category: category
        }
    });
}

// After saving blog post
await saveBlogPost(data);
await notifyFrontendCacheClear(`blog/${data.slug}`);
```

---

## 📝 Summary

**Cache Management API provides:**

- ✅ **5 endpoints** for complete cache control
- ✅ **API key authentication** for security
- ✅ **Clear specific pages** or entire site
- ✅ **Warm up cache** before traffic spikes
- ✅ **Monitor cache health** and statistics
- ✅ **Easy integration** with any language/framework

**Perfect for:**
- Content management workflows
- CI/CD pipelines
- Automated cache invalidation
- Performance optimization

---

*API Version: 1.0*  
*Last Updated: January 11, 2026*
