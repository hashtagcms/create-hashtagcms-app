# Installation Guide

This guide will walk you through the complete installation process for the HashtagCMS Node.js Frontend Renderer.

## Table of Contents
- [System Requirements](#system-requirements)
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Verification](#verification)
- [Common Issues](#common-issues)

## System Requirements

### Minimum Requirements
- **Operating System**: Linux, macOS, or Windows
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **Memory**: 512 MB RAM minimum
- **Disk Space**: 500 MB free space

### Recommended Requirements
- **Node.js**: v18.x LTS or higher
- **npm**: v8.x or higher
- **Memory**: 2 GB RAM
- **Disk Space**: 2 GB free space

## Prerequisites

### 1. Node.js and npm

Check if Node.js and npm are installed:

```bash
node --version
npm --version
```

If not installed, download from [nodejs.org](https://nodejs.org/) or use a version manager:

**Using nvm (recommended):**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js LTS
nvm install --lts
nvm use --lts
```

**Using Homebrew (macOS):**
```bash
brew install node
```

### 2. HashtagCMS Backend

You need a running HashtagCMS backend instance with API access. Ensure you have:
- Backend URL (e.g., `http://your-cms.local/api/hashtagcms/public`)
- API Key for authentication
- Site context name

## Installation Methods

### Method 1: NPX (Quick Setup) ⚡

Create project structure quickly:

```bash
npx create-hashtagcms-app my-project
cd my-project
```

**What this does:**
- ✅ Creates project directory structure
- ✅ Generates package.json with all dependencies
- ✅ Creates .env and .gitignore files
- ✅ Installs all npm dependencies
- ✅ Sets up basic README

**Note:** You'll need to copy the source files manually from this repository or clone it separately.

**Expected output:**
```
🚀 HashtagCMS Node.js Frontend - Project Creator

Creating a new HashtagCMS Node.js frontend in /path/to/my-project

ℹ Creating project directory...
✓ Project directory created
ℹ Creating package.json...
✓ package.json created
ℹ Creating .gitignore...
✓ .gitignore created
ℹ Creating environment files...
✓ Environment files created
ℹ Creating directory structure...
✓ Directory structure created
✓ Template files created

📦 Installing Dependencies
ℹ This might take a few minutes...
✓ Dependencies installed successfully

🎉 Success! Your HashtagCMS project is ready!
```

**After running npx, copy source files:**

```bash
# Option A: Clone into a temp directory and copy files
git clone https://github.com/marghoobsuleman/hashtagcms-nodejs-frontend.git temp
cp -r temp/src my-project/
cp -r temp/views my-project/
cp -r temp/config my-project/
cp -r temp/resources my-project/
cp -r temp/locales my-project/
cp temp/server.js my-project/
cp temp/webpack.config.js my-project/
rm -rf temp

# Option B: Use Method 2 (Manual Installation) below
```

---

### Method 2: Manual Installation (Recommended for Now)

Clone the complete repository with all source files:

**Option A: Clone from Git**
```bash
git clone https://github.com/marghoobsuleman/hashtagcms-nodejs-frontend.git my-project
cd my-project
npm install
```

**Option B: Download ZIP**
1. Download the project ZIP file from GitHub
2. Extract to your desired location
3. Navigate to the directory
4. Run `npm install`

**Expected output:**
```
added 847 packages, and audited 848 packages in 45s

123 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**This method is currently recommended** as it includes all source files, controllers, views, and configurations.

### Step 3: Environment Configuration

Create your environment configuration file:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# HashtagCMS Context (your site identifier)
HASHTAGCMS_CONTEXT=mysite

# HashtagCMS API Configuration
HASHTAGCMS_API_BASE_URL=http://your-cms-backend.local/api/hashtagcms/public
HASHTAGCMS_API_SECRET=your_api_key_here

# API Endpoints (usually don't need to change)
HASHTAGCMS_CONFIG_API=/configs/v1/site-configs
HASHTAGCMS_DATA_API=/sites/v1/load-data
HASHTAGCMS_BLOG_API=/sites/v1/blog/latests
HASHTAGCMS_LOGIN_API=/auth/login
HASHTAGCMS_LOGOUT_API=/auth/logout
HASHTAGCMS_USER_ME_API=/user/me
HASHTAGCMS_USER_PROFILE_UPDATE_API=/user/profile/update

# Blog Configuration
BLOG_PER_PAGE=10

# Cache & Timeout Settings
HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=5
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=60
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=30
```

**Important Configuration Values:**

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `HASHTAGCMS_CONTEXT` | Your site identifier | `mysite` |
| `HASHTAGCMS_API_BASE_URL` | Backend API URL | `http://cms.local/api/hashtagcms/public` |
| `HASHTAGCMS_API_SECRET` | API authentication key | `61c58507bbac1` |

### Step 4: Build Frontend Assets

Compile JavaScript, CSS, and copy static assets:

```bash
npm run build
```

**What this does:**
- Compiles Vue.js components
- Processes SCSS to CSS
- Bundles JavaScript files
- Copies images and fonts
- Minifies and optimizes assets

**Expected output:**
```
Building Frontend Assets...
{
  'public/assets/hashtagcms/fe/basic/js/app': './resources/assets/fe/basic/js/app.js',
  'public/assets/hashtagcms/fe/basic/css/app': './resources/assets/fe/basic/sass/app.scss'
}
asset public/assets/hashtagcms/fe/basic/js/app.js 245 KiB [emitted] (name: public/assets/hashtagcms/fe/basic/js/app)
asset public/assets/hashtagcms/fe/basic/css/app.css 89.2 KiB [emitted] (name: public/assets/hashtagcms/fe/basic/css/app)
webpack 5.104.1 compiled successfully in 3421 ms
Assets Compilation Completed!
```

### Step 5: Start the Server

**For Production:**
```bash
npm start
```

**For Development (with auto-reload):**
```bash
npm run server
```

**Expected output:**
```
===============================================
HashtagCMS Node.js Renderer running on port 3000
Target Backend: http://your-cms.local/api/hashtagcms/public
Context: mysite
===============================================
```

### Step 6: Access Your Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see your HashtagCMS-powered website!

## Verification

### Health Check

Test if the server is running:

```bash
curl http://localhost:3000/health
```

**Expected response:**
```json
{"status":"ok"}
```

### Check Logs

Monitor the console output for:
- ✅ Server startup message
- ✅ API connection logs
- ✅ Request logs (in development mode)

### Test a Page

Visit a known category/page:
```
http://localhost:3000/home
http://localhost:3000/blog
```

## Development Workflow

### Running in Development Mode

1. **Terminal 1 - Start the server:**
   ```bash
   npm run server
   ```

2. **Terminal 2 - Watch and rebuild assets:**
   ```bash
   npm run dev
   ```

This setup provides:
- Auto-reload on server code changes (via nodemon)
- Auto-rebuild on asset changes (via webpack watch)

### Making Changes

**Server-side code changes:**
- Edit files in `src/`, `views/`, `config/`
- Server auto-restarts (if using `npm run server`)

**Frontend asset changes:**
- Edit files in `resources/assets/`
- Webpack auto-rebuilds (if using `npm run dev`)
- Refresh browser to see changes

## Common Issues

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Change port in .env
PORT=3001

# Or kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Issue: Cannot Connect to Backend API

**Error:**
```
[CmsService] Error fetching data: connect ECONNREFUSED
```

**Solutions:**
1. Verify backend is running
2. Check `HASHTAGCMS_API_BASE_URL` in `.env`
3. Verify API key is correct
4. Check network/firewall settings

### Issue: Module Not Found

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Asset Build Fails

**Error:**
```
ERROR in ./resources/assets/fe/basic/sass/app.scss
Module build failed
```

**Solutions:**
1. Check for syntax errors in SCSS files
2. Ensure all dependencies are installed
3. Clear webpack cache:
   ```bash
   rm -rf node_modules/.cache
   npm run build
   ```

### Issue: Permission Denied

**Error:**
```
EACCES: permission denied
```

**Solution:**
```bash
# Fix npm permissions (don't use sudo with npm)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

## Next Steps

Now that you have the application installed and running:

1. **Configure your site** - See [Configuration Guide](./02-configuration.md)
2. **Understand the architecture** - Read [Architecture Overview](./04-architecture.md)
3. **Create custom themes** - Follow [Theme Development](./12-theme-development.md)
4. **Deploy to production** - Check [Deployment Guide](./18-deployment.md)

## Getting Help

If you encounter issues not covered here:
- Check the [Troubleshooting Guide](./20-troubleshooting.md)
- Review server logs for detailed error messages
- Visit the [HashtagCMS Community](https://hashtagcms.org/community)
- Open an issue on GitHub

---

**Next:** [Configuration Guide](./02-configuration.md)
