# ==========================================
# Stage 1: Builder
# Build assets and compile code
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for build (including devDependencies)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build assets (Webpack)
RUN npm run build

# ==========================================
# Stage 2: Production Runner
# Minimal image for running the app
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8004

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY server.js ./
COPY config ./config
COPY src ./src
COPY bin ./bin
COPY resources ./resources
COPY locales ./locales
COPY views ./views

# Copy built assets from builder stage
COPY --from=builder /app/public ./public

# Create logs directory with permissions
RUN mkdir logs && chown -R node:node logs

# Security: Run as non-root user
USER node

# Expose port
EXPOSE 8004

# Health check (matches your health endpoint)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "server.js"]
