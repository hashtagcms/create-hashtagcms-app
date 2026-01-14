# Asset Pipeline

Guide to the Webpack-based asset build system.

## Overview

Assets are built using **Webpack 5** with support for:
- JavaScript (ES6+) with Babel
- Vue.js components
- SCSS/Sass
- Image and font copying

## Build Commands

```bash
# Production build (minified)
npm run build

# Development build with watch
npm run dev
```

## Configuration

**File:** `webpack.config.js`

### Entry Points

```javascript
{
    theme: { source: 'basic', type: 'theme' },
    assets: [
        { source: 'js/app.js', target: 'js/app', type: 'js' },
        { source: 'sass/app.scss', target: 'css/app', type: 'css' },
        { source: 'img', target: 'img', type: 'copy' },
        { source: 'fonts', target: 'fonts', type: 'copy' }
    ]
}
```

### Source Paths

```
resources/assets/fe/basic/
├── js/app.js          → public/assets/hashtagcms/fe/basic/js/app.js
├── sass/app.scss      → public/assets/hashtagcms/fe/basic/css/app.css
├── img/               → public/assets/hashtagcms/fe/basic/img/
└── fonts/             → public/assets/hashtagcms/fe/basic/fonts/
```

## JavaScript Build

### Babel Transpilation

ES6+ → ES5 for browser compatibility

```javascript
// Source (ES6+)
const myFunction = () => {
    console.log('Hello');
};

// Output (ES5)
var myFunction = function() {
    console.log('Hello');
};
```

### Vue Components

```javascript
// app.js
import { createApp } from 'vue';
import Header from './components/Header.vue';

const app = createApp({
    components: { Header }
});

app.mount('#app');
```

## CSS Build

### SCSS Compilation

```scss
// Source: app.scss
$primary-color: #3498db;

.button {
    background-color: $primary-color;
}

// Output: app.css
.button {
    background-color: #3498db;
}
```

### PostCSS & Autoprefixer

Automatically adds vendor prefixes:

```css
/* Source */
.box {
    display: flex;
}

/* Output */
.box {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
}
```

## Asset Copying

Images and fonts are copied as-is:

```
resources/assets/fe/basic/img/logo.png
→ public/assets/hashtagcms/fe/basic/img/logo.png
```

## Adding a New Theme

1. Create directory structure
2. Add to webpack.config.js
3. Build assets

```javascript
// webpack.config.js
{
    theme: { source: 'mytheme', type: 'theme' },
    assets: [
        { source: 'js/app.js', target: 'js/app', type: 'js' },
        { source: 'sass/app.scss', target: 'css/app', type: 'css' }
    ]
}
```

## Optimization

### Production Mode

```bash
npm run build
```

- Minifies JavaScript
- Minifies CSS
- Removes comments
- Optimizes images

### Development Mode

```bash
npm run dev
```

- Source maps enabled
- Faster builds
- Watch mode
- No minification

---

**Previous:** [Theme Development](./12-theme-development.md) | **Next:** [Custom Controllers](./14-custom-controllers.md)
