# TrackMate frontend — build the Vite app, then serve it with nginx.
# Build context: this directory (capstone/trackmate-assignment/frontend).

# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app
# Install deps from the lockfile first (cached unless the lockfile changes).
COPY package.json package-lock.json ./
RUN npm ci
# Build the static bundle.
COPY . .
RUN npm run build

# ---- serve stage ----
# Unprivileged nginx: runs as a non-root user (uid 101) and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine
# The browser calls /api/* ; nginx proxies that to the backend. BACKEND_URL is
# substituted into the config at container start (envsubst), so the same image
# works in docker-compose (http://backend:8000) and k8s (the backend Service).
ENV BACKEND_URL=http://backend:8000
# Only substitute BACKEND_URL, so nginx's own $host/$uri/$scheme are left intact.
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
# The nginx image's entrypoint renders /etc/nginx/templates/*.template with
# envsubst, then starts nginx — no custom CMD needed.
