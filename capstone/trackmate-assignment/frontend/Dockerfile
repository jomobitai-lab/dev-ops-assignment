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
FROM nginx:1.27-alpine
# The browser calls /api/* ; nginx proxies that to the backend. BACKEND_URL is
# substituted into the config at container start (envsubst), so the same image
# works in docker-compose (http://api:8000) and k8s (http://trackmate-api:8000).
ENV BACKEND_URL=http://api:8000
# Only substitute BACKEND_URL, so nginx's own $host/$uri/$scheme are left intact.
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# The nginx image's entrypoint renders /etc/nginx/templates/*.template with
# envsubst, then starts nginx — no custom CMD needed.
