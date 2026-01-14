# Troubleshooting Guide

This guide helps you diagnose and fix common issues with the HashtagCMS Node.js Frontend Renderer.

## Table of Contents
- [Server Issues](#server-issues)
- [API Connection Issues](#api-connection-issues)
- [Rendering Issues](#rendering-issues)
- [Asset Issues](#asset-issues)
- [Performance Issues](#performance-issues)
- [Debugging Tools](#debugging-tools)

## Server Issues

### Issue: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causes:**
- Another process is using port 3000
- Previous server instance didn't shut down properly

**Solutions:**

1. **Change the port:**
   ```bash
   # Edit .env
   PORT=3001
   ```

2. **Find and kill the process:**
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Or find the PID
   lsof -i :3000
   # Then kill it
   kill -9 <PID>
   ```

3. **Use a different port temporarily:**
   ```bash
   PORT=3001 npm start
   ```

### Issue: Server Crashes on Startup

**Symptoms:**
```
Error: Cannot find module 'express'
```

**Solutions:**

1. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node --version
   # Should be v14+ or higher
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

### Issue: Environment Variables Not Loading

**Symptoms:**
- `undefined` values for `process.env.*`
- Server uses default values

**Solutions:**

1. **Verify .env file exists:**
   ```bash
   ls -la .env
   ```

2. **Check .env format:**
   ```env
   # ✅ Correct
   PORT=3000
   HASHTAGCMS_API_SECRET=abc123
   
   # ❌ Wrong (spaces around =)
   PORT = 3000
   ```

3. **Restart the server:**
   ```bash
   # Environment variables are loaded on startup
   npm start
   ```

## API Connection Issues

### Issue: Cannot Connect to Backend

**Symptoms:**
```
[CmsService] Error fetching data: connect ECONNREFUSED
[CmsService] Error loading configs: Network Error
```

**Solutions:**

1. **Verify backend is running:**
   ```bash
   curl http://your-backend-url/api/health
   ```

2. **Check API URL in .env:**
   ```env
   HASHTAGCMS_API_BASE_URL=http://your-cms.local/api/hashtagcms/public
   # Make sure this is correct and accessible
   ```

3. **Test API directly:**
   ```bash
   curl -H "x-api-secret: your-api-key" \
        "http://your-cms.local/api/hashtagcms/public/configs/v1/site-configs?site=mysite&lang=en"
   ```

4. **Check network/firewall:**
   - Ensure no firewall blocking the connection
   - Check if backend allows connections from your IP
   - Verify CORS settings if applicable

### Issue: API Returns 401 Unauthorized

**Symptoms:**
```
[CmsService] API Status: 401
```

**Solutions:**

1. **Verify API key:**
   ```env
   # In .env
   HASHTAGCMS_API_SECRET=your_correct_api_key
   ```

2. **Check context matches:**
   ```env
   HASHTAGCMS_CONTEXT=mysite
   # Must match the site identifier in backend
   ```

3. **Verify API key in backend:**
   - Check if the API key is active
   - Ensure it has proper permissions

### Issue: API Returns 404 Not Found

**Symptoms:**
```
[CmsService] API Status: 404
```

**Solutions:**

1. **Check API endpoints:**
   ```env
   HASHTAGCMS_CONFIG_API=/configs/v1/site-configs
   HASHTAGCMS_DATA_API=/sites/v1/load-data
   # Verify these match your backend routes
   ```

2. **Verify category exists:**
   - Check if the category/page exists in backend
   - Verify `linkRewrite` matches

3. **Check URL structure:**
   ```
   # Frontend request: /blog/my-post
   # Should map to category: blog/my-post
   ```

### Issue: Slow API Responses

**Symptoms:**
- Pages take 5+ seconds to load
- Timeout errors

**Solutions:**

1. **Increase timeout:**
   ```env
   HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=10
   # Increase from 5 to 10 seconds
   ```

2. **Check backend performance:**
   - Monitor backend logs
   - Check database queries
   - Optimize backend caching

3. **Enable caching:**
   ```env
   HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=120
   HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=60
   # Increase cache duration
   ```

## Rendering Issues

### Issue: Blank Page / No Content

**Symptoms:**
- Page loads but shows nothing
- No errors in console

**Solutions:**

1. **Check skeleton structure:**
   ```javascript
   // In controller, log the skeleton
   console.log('Skeleton:', this.infoLoader.getThemeSkeleton());
   ```

2. **Verify view paths:**
   ```javascript
   // Check if views exist
   // views/fe/basic/_layout_/index.ejs
   // views/fe/basic/blog/list.ejs
   ```

3. **Check for EJS errors:**
   ```bash
   # Look for template errors in logs
   npm run server
   # Watch for syntax errors
   ```

4. **Verify data is loaded:**
   ```javascript
   // In controller
   const result = await this.layoutManager.init();
   console.log('Init result:', result);
   ```

### Issue: Module Not Rendering

**Symptoms:**
- Specific module/component doesn't appear
- Other modules render fine

**Solutions:**

1. **Check module view path:**
   ```json
   {
     "view": "fe/basic/blog/list"
   }
   // File must exist: views/fe/basic/blog/list.ejs
   ```

2. **Check for EJS syntax errors:**
   ```ejs
   <!-- ❌ Wrong -->
   <%= module.post.title >
   
   <!-- ✅ Correct -->
   <%= module.post.title %>
   ```

3. **Verify module data:**
   ```javascript
   // In view
   <% console.log('Module data:', module); %>
   ```

4. **Check view replacement:**
   ```javascript
   // If you replaced the view, check the target exists
   this.replaceViewWith('fe/basic/blog/list', 'fe/basic/blog/grid');
   // Ensure fe/basic/blog/grid.ejs exists
   ```

### Issue: 404 Error Page

**Symptoms:**
- All pages show 404
- Even homepage returns 404

**Solutions:**

1. **Check route configuration:**
   ```javascript
   // In src/routes/web.js
   router.all(/^\\/(?!assets|favicon).*/, ...);
   // Verify this pattern is correct
   ```

2. **Verify backend category:**
   - Check if category exists in backend
   - Verify `linkRewrite` is correct

3. **Check InfoLoader state:**
   ```javascript
   // In controller
   console.log('Category:', this.infoLoader.getCategoryData());
   console.log('Category name:', this.infoLoader.getInfoKeeper('CATEGORY_NAME'));
   ```

4. **Test with homepage:**
   ```
   # Try accessing the root
   http://localhost:3000/
   ```

## Asset Issues

### Issue: CSS Not Loading

**Symptoms:**
- Page has no styling
- Console shows 404 for CSS files

**Solutions:**

1. **Verify build completed:**
   ```bash
   npm run build
   # Check for errors
   ```

2. **Check output directory:**
   ```bash
   ls -la public/assets/hashtagcms/fe/basic/css/
   # Should contain app.css
   ```

3. **Verify asset path in layout:**
   ```ejs
   <!-- Check this path is correct -->
   <link rel="stylesheet" href="/assets/hashtagcms/fe/basic/css/app.css">
   ```

4. **Check webpack config:**
   ```javascript
   // In webpack.config.js
   // Verify theme is configured
   {
       theme: { source: 'basic', type: 'theme' },
       assets: [
           { source: 'sass/app.scss', target: 'css/app', type: 'css' }
       ]
   }
   ```

### Issue: JavaScript Not Working

**Symptoms:**
- Interactive features don't work
- Console shows errors

**Solutions:**

1. **Check browser console:**
   ```
   F12 → Console tab
   Look for JavaScript errors
   ```

2. **Verify JS file loads:**
   ```bash
   curl http://localhost:3000/assets/hashtagcms/fe/basic/js/app.js
   # Should return JavaScript code
   ```

3. **Check Vue mounting:**
   ```javascript
   // In app.js
   console.log('Vue app mounting...');
   app.mount('#app');
   console.log('Vue app mounted!');
   ```

4. **Rebuild assets:**
   ```bash
   rm -rf public/assets/hashtagcms
   npm run build
   ```

### Issue: Images Not Loading

**Symptoms:**
- Broken image icons
- 404 for image files

**Solutions:**

1. **Check image path:**
   ```ejs
   <!-- Use helper function -->
   <img src="<%= helper.asset('img/logo.png') %>">
   
   <!-- Or full path -->
   <img src="/assets/hashtagcms/fe/basic/img/logo.png">
   ```

2. **Verify images were copied:**
   ```bash
   ls -la public/assets/hashtagcms/fe/basic/img/
   ```

3. **Check webpack copy config:**
   ```javascript
   { source: 'img', target: 'img', type: 'copy' }
   ```

4. **Rebuild with copy:**
   ```bash
   npm run build
   ```

### Issue: Webpack Build Fails

**Symptoms:**
```
ERROR in ./resources/assets/fe/basic/sass/app.scss
Module build failed
```

**Solutions:**

1. **Check SCSS syntax:**
   ```scss
   // Look for syntax errors
   // Missing semicolons, brackets, etc.
   ```

2. **Verify imports exist:**
   ```scss
   @import 'variables';  // Ensure _variables.scss exists
   ```

3. **Clear webpack cache:**
   ```bash
   rm -rf node_modules/.cache
   npm run build
   ```

4. **Check for missing dependencies:**
   ```bash
   npm install
   ```

## Performance Issues

### Issue: Slow Page Load

**Symptoms:**
- Pages take 3+ seconds to load
- Server feels sluggish

**Solutions:**

1. **Enable caching:**
   ```env
   HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=120
   HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=60
   ```

2. **Check API response time:**
   ```javascript
   // In CmsService
   console.time('API Call');
   const response = await this.client.get(apiUrl, { params });
   console.timeEnd('API Call');
   ```

3. **Optimize views:**
   ```ejs
   <!-- Avoid heavy processing in views -->
   <!-- Move logic to controllers -->
   ```

4. **Use production mode:**
   ```env
   NODE_ENV=production
   ```

5. **Monitor server resources:**
   ```bash
   # Check CPU/Memory usage
   top
   htop
   ```

### Issue: High Memory Usage

**Symptoms:**
- Server uses excessive RAM
- Memory leaks

**Solutions:**

1. **Restart server periodically:**
   ```bash
   # Use PM2 for automatic restarts
   npm install -g pm2
   pm2 start server.js --name hashtagcms
   pm2 restart hashtagcms
   ```

2. **Check for memory leaks:**
   ```javascript
   // Monitor memory
   setInterval(() => {
       const used = process.memoryUsage();
       console.log('Memory:', Math.round(used.heapUsed / 1024 / 1024), 'MB');
   }, 60000);
   ```

3. **Limit cache size:**
   - Implement cache size limits
   - Clear old cache entries

## Debugging Tools

### Enable Debug Logging

**In Controllers:**
```javascript
async index(req, res) {
    console.log('[Controller] Request:', req.path);
    console.log('[Controller] Query:', req.query);
    console.log('[Controller] Session:', req.session);
    
    const result = await this.layoutManager.init();
    console.log('[Controller] Init result:', result);
    
    // ... rest of code
}
```

**In LayoutManager:**
```javascript
async init(apiUrl = null) {
    console.log('[LayoutManager] Loading:', category);
    const data = await this.cmsService.loadPageData(...);
    console.log('[LayoutManager] API response:', JSON.stringify(data, null, 2));
    // ... rest of code
}
```

**In CmsService:**
```javascript
// Already has logging enabled
[CmsService] API Call: /sites/v1/load-data { site: 'mysite', ... }
```

### Use Morgan for HTTP Logging

Already configured in `server.js`:
```javascript
app.use(morgan('dev'));
```

Output:
```
GET /blog/my-post 200 245.123 ms - 15234
POST /contact 302 12.456 ms - 0
```

### Browser DevTools

1. **Network Tab:**
   - Check API calls
   - Monitor response times
   - Inspect headers

2. **Console Tab:**
   - Check JavaScript errors
   - View console.log output

3. **Elements Tab:**
   - Inspect rendered HTML
   - Check CSS styles

### Node.js Debugger

```bash
# Start with debugger
node --inspect server.js

# Or with nodemon
nodemon --inspect server.js
```

Then open Chrome and go to:
```
chrome://inspect
```

### Check Environment

```javascript
// Add to server.js
console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    API_URL: process.env.HASHTAGCMS_API_BASE_URL,
    CONTEXT: process.env.HASHTAGCMS_CONTEXT
});
```

### Test API Directly

```bash
# Test config API
curl -H "x-api-secret: your-key" \
     "http://your-cms.local/api/hashtagcms/public/configs/v1/site-configs?site=mysite&lang=en"

# Test data API
curl -H "x-api-secret: your-key" \
     "http://your-cms.local/api/hashtagcms/public/sites/v1/load-data?site=mysite&lang=en&category=blog&platform=web"
```

## Common Error Messages

### "Cannot read property 'X' of undefined"

**Cause:** Trying to access a property that doesn't exist

**Solution:**
```javascript
// ❌ Bad
const title = module.post.title;

// ✅ Good
const title = module?.post?.title || 'Default Title';
```

### "res.render is not a function"

**Cause:** Incorrect response object

**Solution:**
```javascript
// Ensure you're using Express response object
async index(req, res) {
    // res is the Express response object
    return res.render('view', data);
}
```

### "ENOENT: no such file or directory"

**Cause:** File or directory doesn't exist

**Solution:**
```bash
# Check if file exists
ls -la views/fe/basic/_layout_/index.ejs

# Check if directory exists
ls -la views/fe/basic/
```

### "Maximum call stack size exceeded"

**Cause:** Infinite recursion

**Solution:**
```javascript
// Check for circular calls
// Avoid calling super.index() in a loop
async index(req, res) {
    // ... your logic
    return super.index(req, res);  // Only call once
}
```

## Getting Help

If you can't resolve your issue:

1. **Check logs carefully:**
   - Server console output
   - Browser console
   - Network tab

2. **Search documentation:**
   - Read relevant docs sections
   - Check code examples

3. **Community support:**
   - HashtagCMS Community Forum
   - GitHub Issues
   - Stack Overflow

4. **Provide details when asking:**
   - Error message (full stack trace)
   - Steps to reproduce
   - Environment details (Node version, OS)
   - Relevant code snippets

## Preventive Measures

### 1. Use Version Control

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Regular Backups

```bash
# Backup your .env
cp .env .env.backup

# Backup custom code
tar -czf backup.tar.gz src/ views/ resources/
```

### 3. Keep Dependencies Updated

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Update to latest (carefully)
npm install package@latest
```

### 4. Monitor Logs

```bash
# Use PM2 for log management
pm2 logs hashtagcms

# Or redirect to file
npm start > logs/app.log 2>&1
```

### 5. Test Before Deploy

```bash
# Test locally first
npm run build
npm start

# Test all critical pages
# Test forms, authentication, etc.
```

---

**Previous:** [Performance Optimization](./19-performance.md) | **Back to:** [Documentation Index](./README.md)
