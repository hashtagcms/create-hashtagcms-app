# Authentication & Sessions

Guide to user authentication and session management.

## Overview

Authentication is handled through:
- Express sessions
- CMS backend API
- Session cookies

## Session Configuration

**File:** `server.js`

```javascript
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
```

## Login Flow

### 1. Display Login Form

```javascript
// LoginController.js
async index(req, res) {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    
    return res.render('fe/basic/auth/login');
}
```

### 2. Process Login

```javascript
async login(req, res) {
    const { email, password } = req.body;
    
    try {
        const result = await CmsService.login(email, password);
        
        if (result.token) {
            req.session.user = result.user;
            req.session.token = result.token;
            return res.redirect('/dashboard');
        }
        
        res.locals.errors = [{ message: 'Invalid credentials' }];
        return res.render('fe/basic/auth/login');
        
    } catch (error) {
        res.locals.errors = [{ message: 'Login failed' }];
        return res.render('fe/basic/auth/login');
    }
}
```

### 3. Logout

```javascript
async logout(req, res) {
    if (req.session.token) {
        await CmsService.logout(req.session.token);
    }
    
    req.session.destroy();
    res.redirect('/');
}
```

## Protected Routes

### Middleware

```javascript
function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login?redirect=' + req.originalUrl);
    }
    next();
}

// Usage
router.get('/dashboard', requireAuth, dashboardController);
```

### In Controller

```javascript
async index(req, res) {
    this.setup(req);
    
    if (!req.session.user) {
        return res.redirect('/login');
    }
    
    // Protected content
}
```

## Session Data

### Store Data

```javascript
req.session.user = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
};
```

### Access Data

```javascript
const user = req.session.user;

// In views
<% if (user) { %>
    Welcome, <%= user.name %>
<% } %>
```

### Flash Messages

```javascript
// Set
req.session.flash = { message: 'Success!' };

// Display (then clear)
<% if (session.flash) { %>
    <%= session.flash.message %>
<% } %>
```

## Best Practices

1. **Secure Cookies**: Use `secure: true` in production
2. **Strong Secret**: Use long, random session secret
3. **Timeout**: Set appropriate session timeout
4. **HTTPS**: Always use HTTPS in production

---

**Previous:** [Internationalization](./16-i18n.md) | **Next:** [Deployment](./18-deployment.md)
