# 📖 HashtagCMS Node.js Frontend - Complete Documentation Index

Welcome to the comprehensive documentation for the HashtagCMS Node.js Frontend Renderer! This index will help you find exactly what you need.

---

## 🚀 Getting Started

Perfect for developers new to the project.

### [📘 Main README](./README.md)
**Start here!** Overview of the project, features, architecture, and quick start guide.

**Topics**: Project overview • Key features • Architecture diagram • Installation methods • Quick start • Technology stack

**Time to read**: 10 minutes

**Installation**: Manual installation currently recommended for complete setup

---

### [⚙️ Installation Guide](./01-installation.md)
Complete step-by-step installation instructions with **two methods**.

**Topics**: 
- **Manual Installation (Recommended)** - Complete repository clone
- **NPX Quick Setup** - Creates structure (requires manual file copying)
- System requirements • Prerequisites • Verification • Common issues • Development workflow

**Time to read**: 15 minutes

**Perfect for**: First-time setup, troubleshooting installation

**Current Recommendation**: 
- ✅ **Manual Method**: `git clone` - Complete setup with all files
- 🔧 **NPX Method**: Creates structure only, requires additional steps

---

## 🏗️ Understanding the System

Deep dive into how everything works.

### [🏛️ Architecture Overview](./04-architecture.md)
Comprehensive architecture documentation with diagrams and design patterns.

**Topics**: 
- High-level architecture
- Design principles (Separation of Concerns, DI, etc.)
- Core components (Server, Router, Controllers, Services)
- Data flow diagrams
- Directory structure
- Design patterns (MVC, Singleton, Factory, etc.)

**Time to read**: 30 minutes

**Perfect for**: Understanding the system design, planning custom features

---

### [🔄 Request Lifecycle](./05-request-lifecycle.md)
Detailed breakdown of how requests flow through the system.

**Topics**:
- Complete request flow (8 phases)
- Middleware processing
- HashtagCmsInterceptor deep dive
- Controller resolution
- LayoutManager initialization
- View rendering
- Code examples for each phase

**Time to read**: 25 minutes

**Perfect for**: Debugging, understanding data flow, adding middleware

---

## 🛠️ Building & Developing

Guides for creating custom functionality.

### [🎨 Theme Development](./12-theme-development.md)
Everything you need to create beautiful custom themes.

**Topics**:
- Theme structure
- Creating new themes
- Asset pipeline (Webpack)
- EJS view templates
- JavaScript development
- CSS/SCSS development
- Vue.js components
- Best practices

**Time to read**: 35 minutes

**Perfect for**: Theme developers, frontend developers, designers

**Includes**: Complete theme creation tutorial, code examples, best practices

---

### [🎮 Creating Custom Controllers](./14-custom-controllers.md)
Master the art of building powerful controllers.

**Topics**:
- Controller basics & lifecycle
- Creating your first controller
- Advanced patterns:
  - Custom data loading
  - API integration
  - Form handling & validation
  - Authentication guards
  - Pagination
- Working with InfoLoader & LayoutManager
- Real-world examples (E-commerce, Search, Dashboard)

**Time to read**: 40 minutes

**Perfect for**: Backend developers, adding custom functionality

**Includes**: 10+ complete controller examples, patterns, best practices

---

### [⚡ Layout Manager Deep Dive](./09-layout-manager.md)
Understanding the rendering engine.

**Topics**:
- Core responsibilities
- Initialization process
- Skeleton parsing (JSON → HTML)
- Module rendering
- View replacements & data binding
- Resource path parsing
- Advanced features

**Time to read**: 30 minutes

**Perfect for**: Advanced developers, custom rendering logic

**Includes**: Detailed API reference, code examples, advanced patterns

---

## 📚 Reference Materials

Quick access to APIs and common patterns.

### [⚡ Quick Reference Guide](./QUICK-REFERENCE.md)
Your go-to cheat sheet for daily development.

**Topics**:
- NPM commands
- Environment variables
- Controller snippets
- View helpers (asset, trans, getPath, etc.)
- InfoLoader API
- LayoutManager API
- CmsService API
- Common patterns (pagination, forms, auth, etc.)
- File paths
- Debugging commands

**Time to read**: 10 minutes (reference material)

**Perfect for**: Daily development, quick lookups, code snippets

**Use case**: Keep this open while coding!

---

### [📜 API Contract](./24-api-contract.md)
Detailed specification of the JSON responses expected from the backend.

**Topics**:
- Load Data API response structure
- Configs API structure
- Required keys for InfoLoader
- Common data issues

**Time to read**: 10 minutes

**Perfect for**: Debugging API issues, building custom backends

---

## 🔧 Troubleshooting & Support

When things go wrong.

### [🩺 Troubleshooting Guide](./20-troubleshooting.md)
Comprehensive guide to diagnosing and fixing issues.

**Topics**:
- Server issues (port conflicts, crashes, env vars)
- API connection issues (ECONNREFUSED, 401, 404, timeouts)
- Rendering issues (blank pages, missing modules, 404s)
- Asset issues (CSS/JS not loading, images, webpack)
- Performance issues (slow loads, memory)
- Debugging tools & techniques
- Common error messages
- Preventive measures

**Time to read**: 20 minutes (reference material)

**Perfect for**: Debugging, solving problems, error resolution

**Use case**: First stop when encountering issues!

---

### [📝 Logging Guide](./23-logging.md)
Comprehensive guide to application and request logging.

**Topics**:
- Application logs (Winston)
- Request logs (Morgan)
- Configuration & levels
- Log rotation & storage
- Best practices

**Time to read**: 10 minutes

**Perfect for**: Debugging, monitoring, system administration

---

### [🏢 Enterprise Features](./22-enterprise-features.md)
Production-grade features for enterprise deployments.

**Topics**:
- Request Correlation IDs (distributed tracing)
- Prometheus Metrics (monitoring)
- Input Validation (security)
- Configuration Validation (fail-fast)
- Structured Error Handling
- Cache Management API
- Production deployment guide
- Observability stack
- Best practices

**Time to read**: 25 minutes

**Perfect for**: Production deployments, DevOps, monitoring setup

**Includes**: Complete setup guides, examples, best practices

---

### [🗄️ Cache Management API](./CACHE-API.md)
Programmatic cache control and monitoring.

**Topics**:
- API endpoints (stats, clear, warm, health)
- Authentication
- Request/response examples
- Integration examples (Node.js, PHP, Python, Bash)
- Security considerations
- Common use cases

**Time to read**: 15 minutes

**Perfect for**: Cache management, API integration, automation

---

## 📊 Documentation Overview

### [📋 Documentation Summary](./DOCUMENTATION-SUMMARY.md)
Meta-documentation about the documentation itself.

**Topics**:
- Documentation structure
- Coverage areas
- Statistics (pages, examples, diagrams)
- How to use this documentation
- Quality metrics

**Time to read**: 5 minutes

**Perfect for**: Understanding documentation scope, planning learning path

---

## 📖 Reading Paths

### Path 1: Complete Beginner
**Goal**: Get up and running and understand the basics

1. [README](./README.md) - Overview (10 min)
2. [Installation Guide](./01-installation.md) - Setup (15 min)
3. [Quick Reference](./QUICK-REFERENCE.md) - Basics (10 min)
4. [Architecture Overview](./04-architecture.md) - Understanding (30 min)

**Total time**: ~65 minutes

---

### Path 2: Theme Developer
**Goal**: Create custom themes

1. [README](./README.md) - Overview (10 min)
2. [Installation Guide](./01-installation.md) - Setup (15 min)
3. [Theme Development](./12-theme-development.md) - Deep dive (35 min)
4. [Quick Reference](./QUICK-REFERENCE.md) - Helpers (10 min)

**Total time**: ~70 minutes

---

### Path 3: Backend Developer
**Goal**: Build custom controllers and features

1. [README](./README.md) - Overview (10 min)
2. [Architecture Overview](./04-architecture.md) - System design (30 min)
3. [Request Lifecycle](./05-request-lifecycle.md) - How it works (25 min)
4. [Creating Custom Controllers](./14-custom-controllers.md) - Building (40 min)
5. [Quick Reference](./QUICK-REFERENCE.md) - APIs (10 min)

**Total time**: ~115 minutes

---

### Path 4: Advanced Developer
**Goal**: Master the entire system

1. [README](./README.md) - Overview (10 min)
2. [Architecture Overview](./04-architecture.md) - Design (30 min)
3. [Request Lifecycle](./05-request-lifecycle.md) - Flow (25 min)
4. [Layout Manager](./09-layout-manager.md) - Rendering (30 min)
5. [Creating Custom Controllers](./14-custom-controllers.md) - Controllers (40 min)
6. [Theme Development](./12-theme-development.md) - Themes (35 min)
7. [Troubleshooting](./20-troubleshooting.md) - Debugging (20 min)

**Total time**: ~190 minutes (~3 hours)

---

## 📈 Documentation Statistics

- **Total Documents**: 10 comprehensive guides
- **Total Content**: ~157 KB of documentation
- **Code Examples**: 100+ working examples
- **Diagrams**: 15+ architectural diagrams
- **Topics Covered**: 50+ major topics
- **Complexity Levels**: Beginner → Advanced

---

## 🎯 Quick Navigation

### By Role

**👨‍💻 Frontend Developer**
- [Theme Development](./12-theme-development.md)
- [Quick Reference](./QUICK-REFERENCE.md)

**👩‍💻 Backend Developer**
- [Creating Custom Controllers](./14-custom-controllers.md)
- [Request Lifecycle](./05-request-lifecycle.md)
- [Layout Manager](./09-layout-manager.md)

**🏗️ Architect**
- [Architecture Overview](./04-architecture.md)
- [Request Lifecycle](./05-request-lifecycle.md)

**🐛 Debugger**
- [Troubleshooting Guide](./20-troubleshooting.md)
- [Quick Reference](./QUICK-REFERENCE.md)

---

### By Task

**🚀 Setting Up**
→ [Installation Guide](./01-installation.md)

**🎨 Creating a Theme**
→ [Theme Development](./12-theme-development.md)

**🎮 Building a Controller**
→ [Creating Custom Controllers](./14-custom-controllers.md)

**🔍 Understanding Data Flow**
→ [Request Lifecycle](./05-request-lifecycle.md)

**🏗️ Understanding Architecture**
→ [Architecture Overview](./04-architecture.md)

**⚡ Quick Lookup**
→ [Quick Reference](./QUICK-REFERENCE.md)

**🩺 Fixing Issues**
→ [Troubleshooting Guide](./20-troubleshooting.md)

---

## 💡 Tips for Using This Documentation

### 1. Start with the README
Always begin with the main [README](./README.md) to get oriented.

### 2. Follow a Learning Path
Choose one of the reading paths above based on your role and goals.

### 3. Keep Quick Reference Handy
Bookmark the [Quick Reference](./QUICK-REFERENCE.md) for daily use.

### 4. Use Search
Use your browser's search (Ctrl/Cmd + F) to find specific topics.

### 5. Read Code Examples
Don't just read - try the code examples in your project.

### 6. Refer to Troubleshooting
When stuck, check the [Troubleshooting Guide](./20-troubleshooting.md) first.

---

## 🌟 Documentation Highlights

### Most Comprehensive
**[Creating Custom Controllers](./14-custom-controllers.md)**
- 22+ KB of content
- 10+ complete examples
- Real-world patterns

### Most Practical
**[Quick Reference](./QUICK-REFERENCE.md)**
- Copy-paste code snippets
- API references
- Common patterns

### Most Visual
**[Architecture Overview](./04-architecture.md)**
- Multiple diagrams
- Component interactions
- Data flow charts

### Best for Beginners
**[Installation Guide](./01-installation.md)**
- Step-by-step instructions
- Common issues covered
- Verification steps

---

## 📞 Getting Help

If you can't find what you need:

1. **Search the docs** - Use browser search across all files
2. **Check troubleshooting** - [Troubleshooting Guide](./20-troubleshooting.md)
3. **Review examples** - Look at code examples in relevant guides
4. **Community support** - HashtagCMS community forum
5. **GitHub issues** - Report documentation gaps

---

## 🎓 Learning Objectives

After reading this documentation, you will be able to:

✅ Install and configure the Node.js frontend renderer
✅ Understand the complete architecture and design
✅ Follow the request lifecycle from start to finish
✅ Create custom controllers with advanced features
✅ Develop beautiful custom themes
✅ Work with the Layout Manager and InfoLoader
✅ Integrate with external APIs
✅ Debug and troubleshoot issues
✅ Optimize performance
✅ Follow best practices

---

## 📝 Documentation Quality

This documentation is:
- ✅ **Comprehensive** - Covers all major aspects
- ✅ **Practical** - Real-world examples throughout
- ✅ **Well-Structured** - Logical topic progression
- ✅ **Visual** - Diagrams and code examples
- ✅ **Searchable** - Clear headings and TOCs
- ✅ **Up-to-Date** - Based on current codebase
- ✅ **Developer-Focused** - Written for developers, by developers

---

## 🚀 Start Learning!

Choose your path and start reading:

**New to the project?** → [README](./README.md)

**Ready to build?** → [Creating Custom Controllers](./14-custom-controllers.md)

**Need quick answers?** → [Quick Reference](./QUICK-REFERENCE.md)

**Having issues?** → [Troubleshooting](./20-troubleshooting.md)

---

**Happy Coding! 🎉**

*Documentation Version: 1.0.0*
*Last Updated: January 2026*
