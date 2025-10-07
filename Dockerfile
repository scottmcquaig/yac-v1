# Multi-stage build for YAC Fantasy League
# Stage 1: Build the React frontend
FROM node:20-alpine AS web-build

WORKDIR /app/web

# Copy web package files
COPY web/package*.json ./
RUN npm ci

# Copy web source
COPY web/ ./

# Accept build args for Vite env variables
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID

# Set as environment variables for the build
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID

# Build the app
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
