# ============================================
# Stage 1: Build Astro static assets
# ============================================
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY astro.config.mjs tailwind.config.cjs tsconfig.json ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm run build

# ============================================
# Stage 2: Build Go backend
# ============================================
FROM golang:1.23-alpine AS backend-build

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/api

# ============================================
# Stage 3: Production — NGINX for static files
# ============================================
FROM nginx:alpine AS production

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=frontend-build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
