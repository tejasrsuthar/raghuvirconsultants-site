# Stage 1: Build
# VITE_ vars are baked into JS at build time — Coolify passes them as --build-arg
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Production nginx (minimal attack surface)
FROM nginx:1.27-alpine
# Remove default config
RUN rm /etc/nginx/conf.d/default.conf
# Copy hardened config and built assets
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
