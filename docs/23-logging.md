# Logging Guide

This guide covers the logging strategy used in the HashtagCMS Node.js Frontend Renderer.

## Overview

The project employs a dual-logging approach to capture both application-level events and HTTP request details:

1.  **Application Logs (Winston)**: Handles general logging for system events, errors, and debug information.
2.  **HTTP Request Logs (Morgan)**: Captures details of every incoming HTTP request.

## Application Logs (Winston)

Application logging is managed by `src/utils/Logger.js`. It ensures that logs are structured, persistent (in production), and readable.

### Configuration

*   **File**: `src/utils/Logger.js`
*   **Library**: [winston](https://github.com/winstonjs/winston)

### Log Levels

The logger respects the standard syslog log levels. The active level is controlled by the `LOG_LEVEL` environment variable.

*   `error`: Critical errors that require immediate attention.
*   `warn`: Important warnings that might indicate a problem.
*   `info`: General operational messages (startup, connection success).
*   `http`: HTTP request details.
*   `verbose`: Detailed information useful for debugging.
*   `debug`: Low-level debug information.
*   `silly`: Extremely detailed trace information.

**Default**: `info`

### Storage & Formats

The logging behavior changes based on the environment:

#### Production
*   **Console**: Disabled (to reduce I/O blocking and noise).
*   **Files**:
    *   `logs/error.log`: Contains only logs with level `error` and below.
    *   `logs/combined.log`: Contains all logs.
*   **Format**: JSON (structured logging) with timestamps (`YYYY-MM-DD HH:mm:ss`), stack traces for errors, and service metadata.
*   **Rotation**: Files are automatically rotated when they reach **5MB**, keeping a maximum of **5 archived files**.

#### Development / Non-Production
*   **Console**: Enabled.
*   **Format**: Human-readable, colorized output.
*   **Files**: Logs are still written to `logs/error.log` and `logs/combined.log`.

### Usage

Import the logger into your module and use the appropriate method:

```javascript
const logger = require('./src/utils/Logger');

// Info message
logger.info('Server started successfully');

// Warning with metadata
logger.warn('Cache miss', { key: 'user_123' });

// Error with stack trace
try {
    // ... code that might fail
} catch (error) {
    logger.error('Database connection failed', { error: error.message, stack: error.stack });
}
```

## HTTP Request Logs (Morgan)

HTTP request logging is configured in `server.js` using the Morgan middleware.

### Configuration

*   **File**: `server.js`
*   **Library**: [morgan](https://github.com/expressjs/morgan)

### Formats

#### Production
*   **Format**: `combined` (Standard Apache combined log format).
*   **Details**: Includes remote IP, date, request method, URL, HTTP version, status code, content length, referer, and user agent.
*   **Example**:
    ```text
    ::1 - - [14/Jan/2026:18:30:00 +0000] "GET / HTTP/1.1" 200 1234 "-" "Mozilla/5.0..."
    ```

#### Development
*   **Format**: `dev`.
*   **Details**: Concise output colored by response status code.
*   **Example**:
    ```text
    GET / 200 123.456 ms - 1234
    ```

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `LOG_LEVEL` | Minimum level of logs to capture (error, warn, info, debug) | `info` |
| `NODE_ENV` | Environment mode (`production` enables file-only, JSON logging) | `development` |

## Best Practices

1.  **Use appropriate levels**: Don't log everything as `error`. Use `debug` for development troubleshooting details.
2.  **Include metadata**: Pass objects as the second argument to capture context (IDs, error details) which helps in debugging and log parsing.
    ```javascript
    logger.info('User logged in', { userId: user.id, ip: req.ip });
    ```
3.  **Don't use `console.log`**: Always use the imported `logger` to ensure logs are properly formatted and persisted.
