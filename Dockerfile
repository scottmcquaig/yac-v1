# Multi-stage build for YAC Fantasy League
# Stage 1: Build the React frontend
FROM node:20-alpine AS web-build

WORKDIR /app/web

# Copy web package files
COPY web/package*.json ./
RUN npm ci

# Copy web source and build
COPY web/ ./
RUN npm run build

# Stage 2: Setup the Node.js backend
FROM node:20-alpine AS production

WORKDIR /app

# Copy server package files
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server source
COPY server/ ./

# Copy built frontend from web-build stage
COPY --from=web-build /app/web/dist ./public

# Expose port (default 3000, can be overridden)
EXPOSE 3000

# Start the server
CMD ["node", "src/index.js"]
