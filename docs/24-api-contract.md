# API Contract

This document defines the expected JSON response structure from the HashtagCMS Backend API. The Node.js Frontend relies on specific keys to render pages correctly.

## Overview

The Frontend (Node.js) acts as a renderer for the Backend (HashtagCMS/Laravel). It consumes JSON data and renders HTML using EJS templates.

*   **Frontend**: Node.js + Express + EJS
*   **Backend**: Laravel (HashtagCMS)
*   **Authentication**: `x-api-secret` header

## 1. Load Data API (`/sites/v1/load-data`)

This is the primary endpoint for fetching page content.

**Request:**
*   **Method**: `GET`
*   **Params**: `site` (context), `lang` (iso code), `platform` (web), `category` (url path)

**Response Structure (JSON):**

```json
{
  "meta": {
    "site": {
      "id": 1,
      "name": "My Site",
      "context": "mysite",
      "domain": "mysite.com"
    },
    "platform": {
      "id": 1,
      "name": "web"
    },
    "lang": {
      "id": 1,
      "name": "English",
      "isoCode": "en"
    },
    "category": {
      "id": 10,
      "name": "Home",
      "linkRewrite": "home"
    },
    "page": {
      "id": 10,
      "name": "Home",
      "title": "Welcome Home",
      "linkRewrite": "home"
    },
    "theme": {
      "id": 1,
      "name": "basic",
      "directory": "basic"
    },
    "props": [
      { "name": "analytics_id", "value": "UA-12345" }
    ]
  },
  "html": {
    "head": {
      "title": "Home Page | My Site",
      "meta": {
        "metaCanonical": "https://mysite.com",
        "metaDescription": "Description here",
        "metaKeywords": "keyword1, keyword2",
        "metaRobots": "index, follow"
      },
      "headerContent": [
        { "html": "<header>...</header>" }
      ],
      "links": [
        { "rel": "icon", "href": "/favicon.ico" }
      ]
    },
    "body": {
      "content": {
        "skeleton": "landing",
        "modules": [
            // List of modules to render
        ]
      },
      "footer": {
        "footerContent": [
          { "html": "<footer>...</footer>" }
        ]
      }
    }
  }
}
```

**Key Dependencies:**
*   `InfoLoader.js` expects `meta.site`, `meta.lang`, `html.head`, etc.
*   Missing keys will cause 500 errors (e.g. `Cannot read properties of undefined (reading 'site')`).

## 2. Configs API (`/configs/v1/site-configs`)

Loads global site configurations, menus, and translations.

**Request:**
*   **Method**: `GET`
*   **Params**: `site`, `lang`

**Response Structure (JSON):**

```json
{
  "menus": {
    "main_menu": [
      { "label": "Home", "link": "/" },
      { "label": "About", "link": "/about" }
    ]
  },
  "settings": {
    "site_name": "HashtagCMS",
    "contact_email": "info@example.com"
  },
  "translations": {
    "welcome_message": "Welcome to our site"
  }
}
```

## 3. Blog API (`/sites/v1/blog/latests`)

Fetches partial blog data for widgets/sidebars.

**Request:**
*   **Method**: `GET`
*   **Params**: `site`, `lang`, `limit`

**Response Structure (JSON):**

```json
[
  {
    "id": 101,
    "title": "My Blog Post",
    "linkRewrite": "my-blog-post",
    "shortDescription": "Summary...",
    "createdAt": "2026-01-01T12:00:00Z",
    "author": "John Doe"
  }
]
```

## Common Issues

1.  **Missing `/api/hashtagcms/public`**: If the base URL is wrong, the backend might return 404 HTML instead of JSON. The Node.js app will crash trying to parse `undefined` properties.
2.  **Invalid API Secret**: Returns 401. Ensure `HASHTAGCMS_API_SECRET` matches the backend.
3.  **Context Mismatch**: If `HASHTAGCMS_CONTEXT` doesn't match a site in the backend, the API might return empty data or 404.
