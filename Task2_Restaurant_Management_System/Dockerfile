FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user (security best practice — don't run as root)
RUN addgroup -g 1001 -S nodejs && adduser -S restaurant -u 1001

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy application source
COPY --chown=restaurant:nodejs . .

# Create required directories
RUN mkdir -p uploads/menu logs && chown -R restaurant:nodejs uploads logs

# Switch to non-root user
USER restaurant

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Use dumb-init as PID 1 for graceful shutdown
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
