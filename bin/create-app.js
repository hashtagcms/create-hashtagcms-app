#!/usr/bin/env node

/**
 * HashtagCMS Node.js Frontend - Project Scaffolder
 * 
 * Usage:
 *   npx create-hashtagcms-app my-project
 *   npx create-hashtagcms-app my-project --template basic
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const prompts = require('prompts');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

// Helper functions
const log = (message) => console.log(message);
const success = (message) => console.log(`${colors.green}✓${colors.reset} ${message}`);
const info = (message) => console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
const warn = (message) => console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
const error = (message) => console.log(`${colors.red}✗${colors.reset} ${message}`);
const title = (message) => console.log(`\n${colors.bright}${colors.cyan}${message}${colors.reset}\n`);

// Main execution function
async function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);

    // Show help
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
${colors.bright}${colors.cyan}create-hashtagcms-app${colors.reset} - Create HashtagCMS Node.js frontend applications

${colors.bright}Usage:${colors.reset}
  npx create-hashtagcms-app <project-name> [options]

${colors.bright}Arguments:${colors.reset}
  <project-name>    Name of your project (required)

${colors.bright}Options:${colors.reset}
  --template <name>  Template to use (default: basic)
  --help, -h         Show this help message
  --version, -v      Show version number

${colors.bright}Examples:${colors.reset}
  ${colors.green}npx @hashtagcms/create-hashtagcms-app${colors.reset} ${colors.cyan}<project-name>${colors.reset} [options]
  
Options:
  --context <context>      Site context (e.g., web, mobile)
  --api-base-url <url>     CMS API Base URL
  --api-secret <secret>    CMS API Secret (optional)
  --help                   Show this help message

Example:
  ${colors.cyan}npx @hashtagcms/create-hashtagcms-app${colors.reset} ${colors.green}my-blog${colors.reset} ${colors.yellow}--template basic${colors.reset}


${colors.bright}Learn more:${colors.reset}
  https://github.com/hashtagcms/create-hashtagcms-app
`);
        process.exit(0);
    }

    // Show version
    if (args.includes('--version') || args.includes('-v')) {
        const packageJson = require('../package.json');
        console.log(packageJson.version);
        process.exit(0);
    }

    let projectName = args[0];

    // Banner
    console.clear();
    title('🚀 HashtagCMS Node.js Frontend - Project Creator');

    // Prompt for project name if not provided
    if (!projectName) {
        const response = await prompts({
            type: 'text',
            name: 'projectName',
            message: 'What is your project name?',
            initial: 'my-hashtagcms-app',
            validate: value => {
                if (!value) return 'Project name is required';
                if (!/^[a-z0-9-_]+$/i.test(value)) return 'Project name can only contain letters, numbers, hyphens, and underscores';
                if (fs.existsSync(path.join(process.cwd(), value))) return `Directory "${value}" already exists`;
                return true;
            }
        });

        if (!response.projectName) {
            error('Project name is required');
            process.exit(1);
        }
        projectName = response.projectName;
    } else {
        // Validate provided project name
        if (!/^[a-z0-9-_]+$/i.test(projectName)) {
            error('Project name can only contain letters, numbers, hyphens, and underscores.');
            process.exit(1);
        }
        const projectPath = path.join(process.cwd(), projectName);
        if (fs.existsSync(projectPath)) {
            error(`Directory "${projectName}" already exists!`);
            process.exit(1);
        }
    }

    // Parse --url, --context, --secret from args
    const argUrl = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;
    const argContext = args.includes('--context') ? args[args.indexOf('--context') + 1] : null;
    const argSecret = args.includes('--secret') ? args[args.indexOf('--secret') + 1] : null;

    let config = {
        apiBaseUrl: argUrl,
        context: argContext,
        apiSecret: argSecret
    };

    // If any config is missing, prompt for it (or all if purely interactive)
    if (!config.apiBaseUrl || !config.context || !config.apiSecret) {
        
        // If user provided SOME args but not all, we could just prompt for missing ones.
        // For simplicity, let's use prompts but override initial values or skip if provided?
        // prompts library 'initial' doesn't auto-submit. 
        // Better: Only prompt for missing ones.
        
        const questions = [];
        if (!config.apiBaseUrl) {
            questions.push({
                type: 'text',
                name: 'apiBaseUrl',
                message: 'What is your CMS API Base URL?',
                initial: 'http://localhost:8080',
                validate: value => value.length > 0 ? true : 'API URL is required'
            });
        }
        if (!config.context) {
            questions.push({
                type: 'text',
                name: 'context',
                message: 'What is your Site Context (identifier)?',
                initial: 'web',
                validate: value => value.length > 0 ? true : 'Context is required'
            });
        }
        if (!config.apiSecret) {
            questions.push({
                type: 'text',
                name: 'apiSecret',
                message: 'What is your API Secret?',
                initial: 'your_api_secret_here'
            });
        }

        const answers = await prompts(questions);
        
        // Merge answers back to config
        config = { ...config, ...answers };
    }

    if (!config.apiBaseUrl) {
        error('Installation cancelled');
        process.exit(1);
    }

    const projectPath = path.join(process.cwd(), projectName);

    log(`\nCreating a new HashtagCMS Node.js frontend in ${colors.green}${projectPath}${colors.reset}\n`);

    // Create project directory
    try {
        info('Creating project directory...');
        fs.mkdirSync(projectPath, { recursive: true });
        success('Project directory created');
    } catch (err) {
        error(`Failed to create directory: ${err.message}`);
        process.exit(1);
    }

    // Change to project directory
    process.chdir(projectPath);

    // Create package.json
    info('Creating package.json...');
    const packageJson = {
        name: projectName,
        version: '2.0.2',
        description: 'The official standalone Node.js frontend application for HashtagCMS.',
        main: 'server.js',
        scripts: {
            start: 'node server.js',
            server: 'nodemon server.js',
            build: 'webpack --mode production',
            dev: 'webpack --mode development --watch'
        },
        keywords: ['hashtagcms', 'headless', 'cms', 'nodejs', 'express'],
        author: '',
        license: 'MIT',
        dependencies: {
            "@hashtagcms/web-sdk": "2.0.0",
            "@hashtagcms/web-ui-kit": "2.0.0",
            "axios": "1.6.0",
            "compression": "1.7.4",
            "connect-redis": "7.1.0",
            "connect-timeout": "1.9.0",
            "cookie-parser": "1.4.7",
            "dotenv": "16.3.0",
            "ejs": "3.1.9",
            "express": "4.18.2",
            "express-rate-limit": "7.1.5",
            "express-session": "1.18.2",
            "helmet": "7.1.0",
            "jaeger-client": "3.19.0",
            "joi": "18.0.2",
            "morgan": "1.10.0",
            "opentracing": "0.14.7",
            "opossum": "5.0.1",
            "prom-client": "15.1.3",
            "prompts": "2.4.2",
            "redis": "4.6.12",
            "swagger-jsdoc": "6.2.8",
            "swagger-ui-express": "5.0.1",
            "uuid": "13.0.0",
            "winston": "3.11.0"
        },
        devDependencies: {
            "@babel/core": "7.28.5",
            "@babel/preset-env": "7.28.5",
            "@tailwindcss/postcss": "4.2.2",
            "autoprefixer": "10.4.23",
            "babel-loader": "10.0.0",
            "case-sensitive-paths-webpack-plugin": "2.4.0",
            "copy-webpack-plugin": "13.0.1",
            "css-loader": "7.1.2",
            "cssnano": "7.1.2",
            "jest": "29.7.0",
            "mini-css-extract-plugin": "2.9.4",
            "nodemon": "3.0.0",
            "postcss-loader": "8.2.0",
            "sass": "1.97.2",
            "sass-loader": "16.0.6",
            "supertest": "7.2.2",
            "tailwindcss": "4.2.2",
            "vue": "3.5.26",
            "vue-loader": "17.4.2",
            "webpack": "5.104.1",
            "webpack-cli": "6.0.1"
        }
    };

    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    success('package.json created');

    // Create .gitignore
    info('Creating .gitignore...');
    const gitignore = `# Dependencies
node_modules/
package-lock.json

# Environment
.env
.env.local

# Build output
public/assets/

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Cache
.cache/
`;

    fs.writeFileSync('.gitignore', gitignore);
    success('.gitignore created');

    // Helper to join URL paths avoiding double slashes
    const joinUrl = (base, path) => {
        return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
    };

    // Create .env with configured values
    info('Creating .env configuration...');
    const envContent = `# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# HashtagCMS Context
HASHTAGCMS_CONTEXT=${config.context}

# HashtagCMS API Configuration
HASHTAGCMS_API_BASE_URL=${config.apiBaseUrl}
HASHTAGCMS_API_SECRET=${config.apiSecret}

# API Endpoints (Auto-generated)
HASHTAGCMS_CONFIG_API=${joinUrl(config.apiBaseUrl, 'api/hashtagcms/public/configs/v1/site-configs')}
HASHTAGCMS_DATA_API=${joinUrl(config.apiBaseUrl, 'api/hashtagcms/public/sites/v1/load-data')}
HASHTAGCMS_BLOG_API=${joinUrl(config.apiBaseUrl, 'api/hashtagcms/public/sites/v1/blog/latests')}
HASHTAGCMS_LOGIN_API=${joinUrl(config.apiBaseUrl, 'api/hashtagcms/public/user/v1/login')}
HASHTAGCMS_LOGOUT_API=${joinUrl(config.apiBaseUrl, 'api/hashtagcms/public/user/v1/logout')}
HASHTAGCMS_USER_ME_API=${joinUrl(config.apiBaseUrl, 'api/hashtagcms/public/user/v1/me')}
HASHTAGCMS_USER_PROFILE_UPDATE_API=${joinUrl(config.apiBaseUrl, 'api/hashtagcms/public/user/v1/profile')}
HASHTAGCMS_PUBLISH_API=${joinUrl(config.apiBaseUrl, 'api/hashtagcms/public/kpi/v1/publish')}
HASHTAGCMS_CONTACT_API=${joinUrl(config.apiBaseUrl, 'api/hashtagcms/public/common/v1/contact')}
HASHTAGCMS_SUBSCRIBE_API=${joinUrl(config.apiBaseUrl, 'api/hashtagcms/public/common/v1/subscribe')}

# Query params forwarded to load-data API (comma-separated)
HASHTAGCMS_QUERY_PARAMS_TO_LOAD_DATA=limit

# Blog Configuration
BLOG_PER_PAGE=10

# Cache & Timeout Settings (in seconds)
HASHTAG_CMS_EXTERNAL_SERVICE_TIMEOUT=30
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=60
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=30
CACHE_API_SECRET=${config.apiSecret}

# Load-Data Cache TTL (seconds) - only used if Redis is enabled
LOAD_DATA_CACHE_TTL=300

# Asset Base Path (theme assets will be appended: /assets/hashtagcms/fe/{theme})
ASSET_BASE_PATH=/assets/hashtagcms/fe

# Optional: Asset URL (if using CDN, leave empty for local)
ASSET_URL=

# Assets Version (used for cache-busting, update on each deploy)
ASSETS_VERSION=1

# Admin Panel URL
ADMIN_BASE_URL=${config.apiBaseUrl}/admin

# Supported Languages (comma-separated, for startup preloading)
SUPPORTED_LANGUAGES=en,hi,zh

# Session Secret (change this in production!)
SESSION_SECRET=${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}
SESSION_MAX_AGE=86400000

# Optional: Redis Session Store
# If not configured, will use in-memory sessions (default)
# Uncomment and configure to enable Redis:
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=your_redis_password
# REDIS_DB=0

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
`;

    fs.writeFileSync('.env', envContent);
    fs.writeFileSync('.env.example', envContent.replace(config.apiSecret, 'your_api_secret_here').replace(config.apiBaseUrl, 'http://localhost:8080'));
    success('.env configuration created');

    // Function to copy directory recursively
    const copyRecursiveSync = (src, dest) => {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        const isDirectory = exists && stats.isDirectory();

        if (isDirectory) {
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest);
            }
            fs.readdirSync(src).forEach((childItemName) => {
                copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
            });
        } else {
            fs.copyFileSync(src, dest);
        }
    };

    // Copy template files
    info('Copying template files...');
    
    // Determine source root (package root)
    const sourceRoot = path.join(__dirname, '..');
    
    const filesToCopy = [
        'config',

        'public',
        'resources',
        'src',

        'server.js',
        'webpack.config.js',
        '.editorconfig',
        '.prettierignore',
        'LICENSE'
    ];

    filesToCopy.forEach(file => {
        const srcPath = path.join(sourceRoot, file);
        const destPath = path.join(projectPath, file);
        
        if (fs.existsSync(srcPath)) {
            try {
                copyRecursiveSync(srcPath, destPath);
                // log(`Copied ${file}`); // Too verbose
            } catch (err) {
                warn(`Failed to copy ${file}: ${err.message}`);
            }
        } else {
            warn(`Source file not found: ${file}`);
        }
    });
    
    success('Template files copied');

    // Create README.md
    info('Creating documentation...');
    const readme = `# ${projectName}

HashtagCMS Node.js Frontend Renderer

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Build assets:
   \`\`\`bash
   npm run build
   \`\`\`

3. Start the server:
   \`\`\`bash
   npm start
   \`\`\`

4. Visit http://localhost:8004

## Configuration

Your project is already configured!
Check \`.env\` to see your API settings.

## Learn More

- [HashtagCMS Documentation](https://hashtagcms.org/docs)
- [GitHub Repository](https://github.com/hashtagcms/create-hashtagcms-app)
`;

    fs.writeFileSync('README.md', readme);
    success('Documentation created');

    // Install dependencies
    title('📦 Installing Dependencies');
    info('This might take a few minutes...');

    try {
        execSync('npm install', { stdio: 'inherit' });
        success('Dependencies installed successfully');
    } catch (err) {
        error('Failed to install dependencies');
        warn('You can install them manually by running: npm install');
    }

    // Check if pre-built assets exist; if not, build them
    const assetsPath = path.join(projectPath, 'public', 'assets', 'hashtagcms', 'fe');
    const hasPrebuiltAssets = fs.existsSync(assetsPath) &&
        fs.readdirSync(assetsPath).some(theme => {
            const cssFile = path.join(assetsPath, theme, 'css', 'app.css');
            return fs.existsSync(cssFile) && fs.statSync(cssFile).size > 0;
        });

    if (!hasPrebuiltAssets) {
        title('🔨 Building Assets');
        info('Pre-built assets not found. Running webpack build...');
        info('This might take a minute...');
        try {
            execSync('npm run build', { stdio: 'inherit' });
            success('Assets built successfully');
        } catch (err) {
            error('Failed to build assets');
            warn('You can build them manually by running: npm run build');
        }
    } else {
        success('Pre-built assets found ✓');
    }

    // Success message
    console.log('');
    title('🎉 Success! Your HashtagCMS project is ready!');

    log(`Created ${colors.green}${projectName}${colors.reset} at ${colors.cyan}${projectPath}${colors.reset}`);
    log('');
    log('Inside that directory, you can run:');
    log('');
    log(`  ${colors.cyan}npm start${colors.reset}`);
    log('    Starts the production server.');
    log('');
    log(`  ${colors.cyan}npm run dev${colors.reset}`);
    log('    Starts development server with watch mode.');
    log('');
    log('We suggest that you begin by typing:');
    log('');
    log(`  ${colors.cyan}cd${colors.reset} ${projectName}`);
    log(`  ${colors.cyan}npm run build${colors.reset}`);
    log(`  ${colors.cyan}npm start${colors.reset}`);
    log('');
    log(`${colors.bright}Happy coding! 🚀${colors.reset}`);
    log('');
}

// Run the main function
main().catch(err => {
    error('An unexpected error occurred:');
    console.error(err);
    process.exit(1);
});
