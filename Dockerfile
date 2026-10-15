# ==============================================================================
# Multi-Stage Production Dockerfile for EduSprint
# Aligned with SAKEC DevSecOps Lab & NIST SP 800-190 Container Security Guidelines
# ==============================================================================

# --- Stage 1: Build React Frontend ---
FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Backend TypeScript ---
FROM node:24-alpine AS backend-builder
WORKDIR /app/backend

# Install python/make/g++ for building native sqlite3 bindings if needed
RUN apk add --no-cache python3 make g++

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# Prune dev dependencies for lean production image
RUN npm prune --production

# --- Stage 3: Production Minimal Runtime ---
FROM node:24-alpine AS runner
WORKDIR /app

# Add security labels
LABEL maintainer="Sujal Shah <sujal.shah@sakec.ac.in>"
LABEL course="DevSecOps Lab (CSCOR1PC302)"
LABEL project="EduSprint E-Learning Platform"
LABEL version="1.1.0"
LABEL description="Secure containerized Agile & Risk Monitoring Platform"

# Install curl/wget for healthchecks and sqlite runtime libraries
RUN apk upgrade --no-cache && apk add --no-cache curl wget sqlite-libs

ENV NODE_ENV=production
ENV PORT=5000
ENV DB_PATH=/app/data/database.sqlite

# Create dedicated directory for persistent SQLite database
RUN mkdir -p /app/data /app/public && chown -R node:node /app

# Copy production backend artifacts
COPY --from=backend-builder --chown=node:node /app/backend/node_modules ./node_modules
COPY --from=backend-builder --chown=node:node /app/backend/dist ./dist
COPY --from=backend-builder --chown=node:node /app/backend/package.json ./package.json

# Copy compiled frontend build to public directory served by Express
COPY --from=frontend-builder --chown=node:node /app/frontend/dist ./public

# Expose standard application port (matching SAKEC lab port 5000)
EXPOSE 5000

# Non-root user execution (DevSecOps security hardening)
USER node

# Healthcheck to verify container health automatically
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Launch application
CMD ["node", "dist/index.js"]
