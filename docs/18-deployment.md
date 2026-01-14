# Production Deployment

Guide to deploying to production.

## Pre-Deployment Checklist

- [ ] Build production assets
- [ ] Configure environment variables
- [ ] Set NODE_ENV=production
- [ ] Use strong session secret
- [ ] Enable HTTPS
- [ ] Configure caching
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (Nginx)


## 🐳 Docker Deployment (Recommended)

### **1. Build Image**

```bash
docker build -t hashtagcms-frontend .
```

### **2. Run Container**

```bash
docker run -d \
  -p 8004:8004 \
  --name hashtagcms \
  --env-file .env \
  hashtagcms-frontend
```

### **3. Production with Compose**

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "8004:8004"
    env_file: .env
    restart: always
```

Run:
```bash
docker-compose up -d
```

---

## Standard Deployment (PM2)

## Build Assets

```bash
npm run build
```

## Environment Configuration

```env
NODE_ENV=production
PORT=3000

HASHTAGCMS_CONTEXT=mysite
HASHTAGCMS_API_BASE_URL=https://api.example.com/api/hashtagcms/public
HASHTAGCMS_API_SECRET=production_api_key

HASHTAG_CMS_EXTERNAL_CONFIG_CACHE_TTL=120
HASHTAG_CMS_EXTERNAL_DATA_CACHE_TTL=60

SESSION_SECRET=very_long_random_secret_key

ASSET_URL=https://cdn.example.com
```

## Process Manager (PM2)

### Install PM2

```bash
npm install -g pm2
```

### Start Application

```bash
pm2 start server.js --name hashtagcms
```

### PM2 Commands

```bash
# Status
pm2 status

# Logs
pm2 logs hashtagcms

# Restart
pm2 restart hashtagcms

# Stop
pm2 stop hashtagcms

# Auto-start on boot
pm2 startup
pm2 save
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /assets {
        alias /path/to/project/public/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## SSL/HTTPS

### Using Let's Encrypt

```bash
sudo certbot --nginx -d example.com
```

## Monitoring

### PM2 Monitoring

```bash
pm2 monit
```

### Logs

```bash
pm2 logs hashtagcms --lines 100
```

## Backup

```bash
# Backup .env
cp .env .env.backup

# Backup database (if applicable)
# Backup uploaded files
```

## Updates

```bash
# Pull latest code
git pull

# Install dependencies
npm install

# Build assets
npm run build

# Restart
pm2 restart hashtagcms
```

---

**Previous:** [Authentication](./17-authentication.md) | **Next:** [Performance](./19-performance.md)
