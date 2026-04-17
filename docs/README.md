# HashtagCMS Node.js Frontend Renderer

## Overview

The **HashtagCMS Node.js Frontend Renderer** is a standalone, headless frontend application built with **Node.js** and **Express.js**. It acts as a rendering layer for the HashtagCMS headless API, providing a complete server-side rendering (SSR) solution for dynamic, content-driven websites.

This project is designed for developers who want to:
- Build fast, SEO-friendly websites powered by HashtagCMS
- Leverage Node.js for frontend rendering
- Maintain full control over the presentation layer
- Create custom themes and layouts
- Integrate with HashtagCMS's powerful content management capabilities

## Key Features

### 🚀 Core Capabilities
- **Server-Side Rendering (SSR)**: Full SSR support for optimal SEO and performance
- **Headless CMS Integration**: Seamlessly connects to HashtagCMS API
- **Dynamic Routing**: Intelligent URL parsing and controller mapping
- **Multi-language Support**: Built-in internationalization (i18n)
- **Theme System**: Flexible theming with Vue.js components
- **Caching Layer**: Configurable caching for configs and data
- **Session Management**: Built-in authentication and session handling

### 🎨 Frontend Features
- **EJS Templates**: Server-side templating with EJS
- **Vue.js Components**: Modern, reactive UI components
- **Webpack Build System**: Optimized asset compilation
- **SCSS Support**: Advanced styling with Sass
- **Asset Management**: Automated asset copying and optimization

### 🔧 Developer Experience
- **Hot Reload**: Development server with auto-reload
- **Modular Architecture**: Clean separation of concerns
- **Extensible Controllers**: Easy to add custom functionality
- **Middleware System**: Request/response interceptors
- **Configuration Management**: Environment-based configuration

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP Request
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js Server (Node.js)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware Layer                                    │   │
│  │  - HashtagCmsInterceptor                            │   │
│  │  - Session Management                               │   │
│  │  - Cookie Parser                                    │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Router (web.js)                                     │   │
│  │  - URL Parsing                                       │   │
│  │  - Controller Resolution                            │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Controllers                                         │   │
│  │  - FrontendController                               │   │
│  │  - BlogController                                   │   │
│  │  - LoginController                                  │   │
│  │  - etc.                                             │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Core Layer                                          │   │
│  │  - LayoutManager (Skeleton Parsing)                 │   │
│  │  - InfoLoader (Data Management)                     │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     ▼                                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services                                            │   │
│  │  - CmsService (API Communication)                   │   │
│  └──────────────────┬───────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │ API Calls
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              HashtagCMS Backend API                         │
│  - Site Configurations                                      │
│  - Page Data                                                │
│  - Blog Content                                             │
│  - Authentication                                           │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Recommended: Manual Installation

Clone the complete repository:

```bash
git clone https://github.com/hashtagcms/nodejs-frontend.git my-project
cd my-project
npm install
```

Configure your environment in `.env`:

```env
HASHTAGCMS_API_BASE_URL=http://your-cms-backend.local/api/hashtagcms/public
HASHTAGCMS_API_KEY=your_api_key_here
HASHTAGCMS_CONTEXT=mysite
```

Build and start:

```bash
npm run build
npm start
```

Visit http://localhost:3000

### Alternative: NPX (Structure Only)

Create project structure (requires manual file copying):

```bash
npx @hashtagcms/create-hashtagcms-app my-awesome-site
cd my-awesome-site

# Then copy source files from the repository
# See installation guide for details
```

**Note:** The NPX method currently creates the project structure and installs dependencies, but you need to manually copy the source files (src/, views/, config/, etc.) from the repository. For a complete setup, use the manual installation method above.

## Project Structure

```
nodejs-frontend/
├── config/                 # Configuration files
│   └── hashtagcms.js      # HashtagCMS-specific config
├── docs/                  # Documentation
├── public/                # Static assets (compiled)
│   └── assets/
├── resources/             # Source assets
│   └── assets/
│       └── fe/
│           └── basic/     # Default theme assets
├── lang/               # Translation files
│   └── en/
│       └── hashtagcms/
├── views/                # EJS templates
│   └── fe/
│       └── basic/        # Default theme views
├── src/                   # Application source code
│   ├── controllers/       # Request handlers
│   ├── core/             # Core framework classes
│   ├── middleware/       # Express middleware
│   ├── routes/           # Route definitions
│   ├── services/         # External service integrations
│   └── utils/            # Utility functions
├── .env                  # Environment configuration
├── package.json          # Dependencies and scripts
├── server.js            # Application entry point
└── webpack.config.js    # Asset build configuration
```

## Documentation Index

### Getting Started
- [Installation Guide](./01-installation.md)
- [Configuration](./02-configuration.md)
- [Environment Variables](./03-environment-variables.md)

### Core Concepts
- [Architecture Overview](./04-architecture.md)
- [Request Lifecycle](./05-request-lifecycle.md)
- [Routing System](./06-routing.md)
- [Controllers](./07-controllers.md)
- [Middleware](./08-middleware.md)

### Advanced Topics
- [Layout Manager](./09-layout-manager.md)
- [InfoLoader & Data Management](./10-infoloader.md)
- [CMS Service & API Integration](./11-cms-service.md)
- [Theme Development](./12-theme-development.md)
- [Asset Pipeline](./13-asset-pipeline.md)

### Development
- [Creating Custom Controllers](./14-custom-controllers.md)
- [Working with Views](./15-views.md)
- [Internationalization](./16-i18n.md)
- [Authentication & Sessions](./17-authentication.md)
- [Frontend Helpers & View Data](./21-frontend-helpers.md)

### Deployment
- [Production Deployment](./18-deployment.md)
- [Performance Optimization](./19-performance.md)
- [Troubleshooting](./20-troubleshooting.md)

## Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | 14+ |
| **Express.js** | Web framework | ^4.18.2 |
| **EJS** | Template engine | ^3.1.9 |
| **Vue.js** | UI components | ^3.5.26 |
| **Webpack** | Asset bundler | ^5.104.1 |
| **Axios** | HTTP client | ^1.6.0 |
| **Sass** | CSS preprocessor | ^1.97.2 |

## NPM Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run server

# Build production assets
npm run build

# Build development assets with watch mode
npm run dev
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Support

- **Documentation**: [Full Documentation](./01-installation.md)
- **Issues**: [GitHub Issues](https://github.com/marghoobsuleman/hashtagcms/issues)
- **Community**: [HashtagCMS Community](https://hashtagcms.org/community)

## Next Steps

1. Read the [Installation Guide](./01-installation.md) for detailed setup instructions
2. Explore [Architecture Overview](./04-architecture.md) to understand the system design
3. Follow [Theme Development](./12-theme-development.md) to create custom themes
4. Check [API Integration](./11-cms-service.md) to understand backend communication

---

**Built with ❤️ for the HashtagCMS Community**
