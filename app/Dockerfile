# ============================================
# Stage 1: Dependencies (Production only)
# ============================================
FROM node:20-alpine AS deps

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files
COPY package.json ./

# Install production dependencies only
RUN npm install --omit=dev && \
    npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build with placeholder env vars (will be overridden at runtime)
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
ENV REDIS_URL="redis://:placeholder@placeholder:6379"
ENV NEXTAUTH_URL="http://placeholder"
ENV NEXTAUTH_SECRET="placeholder-secret-for-build-only"
ENV SKIP_ENV_VALIDATION=1

RUN npm run build

# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy built assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy entrypoint script and make executable
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh && \
    chown nextjs:nodejs /app/docker-entrypoint.sh

# Create directories for volumes
RUN mkdir -p /app/logs /app/public/uploads && \
    chown -R nextjs:nodejs /app/logs /app/public/uploads

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Start application
CMD ["node", "server.js"]
