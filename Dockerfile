# Multi-stage production Dockerfile
# Stage 1: Build frontend
FROM node:20-bookworm AS frontend-builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY client/ client/
COPY vite.config.ts tsconfig.json ./
RUN npx vite build

# Stage 2: Build backend
FROM node:20-bookworm AS backend-builder
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY server/ server/
COPY prisma/ prisma/
COPY tsconfig.server.json ./
RUN npx prisma generate

# Stage 3: Production image
FROM node:20-bookworm-slim AS production
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -qq && apt-get install -y -qq openssl && rm -rf /var/lib/apt/lists/*

# Copy built assets
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=frontend-builder /app/dist/client ./dist/client
COPY server/ server/
COPY package.json ./

# Environment
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start (production mode serves both API + static frontend)
CMD ["npx", "tsx", "server/index.ts"]
