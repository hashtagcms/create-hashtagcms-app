# Performance Optimization

Guide to optimizing performance.

## Caching

### Enable Caching

```env
HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=120
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=60
```

### Cache Strategy

- **Config Cache**: 120 minutes (rarely changes)
- **Data Cache**: 60 minutes (moderate updates)
- **No Cache**: Development only

## Asset Optimization

### Production Build

```bash
npm run build
```

- Minifies JavaScript
- Minifies CSS
- Removes source maps
- Optimizes images

### CDN

```env
ASSET_URL=https://cdn.example.com
```

### Gzip Compression

Enable in Nginx:

```nginx
gzip on;
gzip_types text/css application/javascript;
```

## Database Optimization

- Use indexes
- Optimize queries
- Enable query caching

## Node.js Optimization

### Cluster Mode

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    const cpus = os.cpus().length;
    for (let i = 0; i < cpus; i++) {
        cluster.fork();
    }
} else {
    // Start server
}
```

### PM2 Cluster

```bash
pm2 start server.js -i max
```

## Monitoring

### Response Times

```javascript
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${duration}ms`);
    });
    next();
});
```

### Memory Usage

```bash
pm2 monit
```

## Best Practices

1. **Enable Caching**: Use appropriate TTL
2. **Use CDN**: Serve static assets from CDN
3. **Minify Assets**: Always build for production
4. **Monitor**: Track performance metrics
5. **Optimize Images**: Compress images
6. **Use Gzip**: Enable compression
7. **Cluster Mode**: Use all CPU cores

---

**Previous:** [Deployment](./18-deployment.md) | **Next:** [Troubleshooting](./20-troubleshooting.md)
