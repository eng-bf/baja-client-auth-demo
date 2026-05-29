# syntax=docker/dockerfile:1

# ---- Build stage: compile the Vite SPA into static assets ----
FROM node:22-alpine AS build
WORKDIR /app

# pnpm via corepack (repo uses pnpm-lock.yaml).
RUN corepack enable

# Install deps first for better layer caching.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest (including .env, which Vite reads to inline VITE_* at build time)
# and produce dist/.
COPY . .
RUN pnpm build

# ---- Serve stage: nginx serving the static bundle with SPA fallback ----
FROM nginx:1.27-alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
