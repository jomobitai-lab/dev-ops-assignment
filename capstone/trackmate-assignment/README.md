# TrackMate

TrackMate is a personal fitness and life tracker I built to keep everything I
care about in one place — my **gym training**, **body weight**, **daily
nutrition**, **sleep**, **earnings**, and **personal goals** — and to see my
progress over time instead of scattered notes on my phone.

It's a full-stack app (React + FastAPI + PostgreSQL) taken from a developer
laptop all the way to a monitored Kubernetes environment: **Docker**, **Alembic**
migrations, **Pytest**, **GitHub Actions** CI/CD with **Trivy** scanning and
**GHCR**, **Terraform** (AWS VPC + EKS), **Helm**, **Ingress**, **HPA**, and
**Prometheus + Grafana**.

---

## What it does

- **Train** — start a session, pick muscle groups and exercises for the day (or
  load a saved **workout plan**), and log each set (weight × reps, with comments
  for dropsets). A front + back **body map** highlights the muscles each exercise
  targets; every exercise shows your **PR** and **last session**. Built-in rest timer.
- **Workout plans** — create reusable plans and start a session from one in a tap.
- **Nutrition** — daily calories + protein/carbs/fat vs targets (animated macro donut).
- **Progress** — body-weight trend chart and personal records.
- **Home** — weekly streak, quick stats, workout activity heatmap, muscle-balance radar.
- **More** — sleep, earnings, wins, goals, profile.
- **Private** — single-password login.

---

## Architecture

```
Developer → Git/GitHub → GitHub Actions ─ pytest ─ frontend build
                                        ─ docker build
                                        ─ Trivy scan
                                        └ push images → GHCR
                                                           │
                                    Terraform → AWS VPC + EKS
                                                           │
                                                         Helm
                                              ┌────────────┴───────────┐
                                           frontend                 backend
                                            (nginx)                 (FastAPI)
                                              └──────── /api ──────────┤
                                                                   PostgreSQL
                                                                       │
                                                              Prometheus → Grafana
```

- **frontend** — React build served by **non-root nginx** (uid 101, listens 8080);
  reverse-proxies `/api` to the backend. Health: `/healthz`.
- **backend** — FastAPI/uvicorn. Runs Alembic migrations on startup. Endpoints:
  `/health` (liveness), `/ready` (DB check), `/metrics` (Prometheus), and the
  `/api/*` application routes. Swagger at `/docs`.
- **db** — PostgreSQL 16 with a persistent volume.

---

## Backend API (sample)

```
GET  /health     GET /ready     GET /metrics     GET /docs
POST /api/login
GET/POST/PUT/DELETE  /api/workouts        (and nutrition, body-weight, sleep,
GET/POST/PUT/DELETE  /api/plans            earnings, achievements, goals, profile)
GET  /api/exercises   POST /api/exercises  (custom exercises)
GET  /api/stats/summary | /prs | /activity | /muscle-balance
```

---

## Run with Docker Compose (quickest)

```bash
cp .env.example .env            # edit APP_PASSWORD / SECRET_KEY if you like
docker compose up --build       # or: make up
```

Open **http://localhost:3000** and log in with `APP_PASSWORD` (default `trackmate`).
Backend docs/health: `http://localhost:8000/docs`, `/health`, `/metrics` (uncomment
the backend `ports:` in `docker-compose.yml` to reach them directly).

```bash
docker compose down             # stop
docker compose down -v          # stop and wipe the database volume
```

---

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest -q                       # or, from the project root: make test
```

9 tests run against a throwaway SQLite DB (not the production database) and cover
`/health`, `/ready`, `/metrics`, auth, the seeded exercise library, workout-plan
CRUD, custom exercises, and the profile endpoint.

---

## Database migrations (Alembic)

Schema is managed by Alembic (`backend/alembic/versions/`). The backend container
runs `alembic upgrade head` before starting uvicorn.

```bash
cd backend
alembic upgrade head            # apply migrations
alembic revision --autogenerate -m "describe change"   # create a new one
```

---

## Kubernetes with Helm (minikube / kind)

**1. Build images into the cluster.**
```bash
# minikube:
eval $(minikube docker-env)
# kind: build then `kind load docker-image trackmate-backend:local trackmate-frontend:local`
docker build -t trackmate-backend:local ./backend
docker build -t trackmate-frontend:local ./frontend     # or: make images
```

**2. Deploy.**
```bash
kubectl apply -f k8s/namespace.yaml
helm upgrade --install trackmate ./helm/trackmate -n trackmate -f helm/trackmate/values-dev.yaml
kubectl -n trackmate get pods -w            # wait for Running/Ready   (or: make helm-up)
```

**3. Open it.**
```bash
# port-forward:
kubectl -n trackmate port-forward svc/trackmate-frontend 3000:80
# or via Ingress (needs an ingress controller; minikube addons enable ingress):
echo "127.0.0.1 trackmate.local" | sudo tee -a /etc/hosts     # then http://trackmate.local
```

The Helm chart provisions: Postgres (Deployment + PVC + Secret), backend & frontend
Deployments (2 replicas, readiness/liveness probes, resource limits), ClusterIP
Services, an Ingress routing `/` → frontend and `/api` → backend, an HPA on the
backend, and a Prometheus ServiceMonitor.

---

## Monitoring (Prometheus + Grafana)

```bash
make monitoring-up      # installs kube-prometheus-stack with monitoring/prometheus-values.yaml
```

See `monitoring/README.md` for port-forwarding Prometheus (check the
`trackmate-backend` target is **UP**) and Grafana (build a panel on
`http_requests_total` / request latency).

---

## Terraform (AWS VPC + EKS)

`terraform/` provisions a VPC (public/private subnets + NAT) and an EKS cluster
with a managed node group.

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init && terraform plan
terraform apply        # billable — run `terraform destroy` when done
```

See `terraform/README.md`. Never commit AWS credentials (state and `*.tfvars` are
git-ignored).

---

## CI/CD

`.github/workflows/ci-cd.yml` (runs on push to `main`):

1. **test** — `pytest` + frontend build.
2. **build-scan-push** — build backend & frontend images tagged with the commit
   **SHA**, scan both with **Trivy** (fails on HIGH/CRITICAL), push to **GHCR**.
3. **deploy** — `helm upgrade --install` to the cluster (needs a `KUBE_CONFIG_DATA` secret).

---

## Troubleshooting lab

`troubleshooting/` has two deliberately broken manifests (`broken-image.yaml`,
`broken-service.yaml`) for practising `kubectl describe` / `get events` /
`get endpoints`. Each file has the investigation steps in its header.

---

## Project structure

```
trackmate/
├── backend/            # FastAPI: app/, tests/, alembic/, Dockerfile, requirements*.txt
├── frontend/           # React + Vite, nginx config, Dockerfile
├── k8s/                # namespace
├── helm/trackmate/     # Helm chart (Chart.yaml, values*.yaml, templates/)
├── terraform/          # AWS VPC + EKS (HCL)
├── monitoring/         # Prometheus/Grafana values + how-to
├── troubleshooting/    # broken manifests for the troubleshooting lab
├── .github/workflows/  # CI/CD
├── docker-compose.yml
├── Makefile
└── .env.example
```

---

## Environment variables

| Variable            | Used by        | Default                       |
|---------------------|----------------|-------------------------------|
| `APP_PASSWORD`      | backend        | `trackmate`                   |
| `SECRET_KEY`        | backend        | (change it)                   |
| `TOKEN_HOURS`       | backend        | `720`                         |
| `DATABASE_URL`      | backend        | built from the Postgres vars  |
| `POSTGRES_USER/PASSWORD/DB` | db + backend | `trackmate`           |
| `BACKEND_URL`       | frontend nginx | `http://backend:8000`         |
| `WEB_PORT`          | compose        | `3000`                        |
