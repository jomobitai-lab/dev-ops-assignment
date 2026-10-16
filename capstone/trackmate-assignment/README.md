# TrackMate — Containerised / DevOps Edition

This is the **assignment edition** of TrackMate: the same application as
`trackmate-personal`, packaged for a real deployment pipeline with **Docker**,
**Docker Compose**, **Kubernetes**, and a **CI/CD** workflow.

> The personal edition deploys serverless (Vercel + Neon). This edition runs as
> containers you build and orchestrate yourself — Postgres, the FastAPI API, and
> an nginx-served frontend — so it can run anywhere Docker/Kubernetes runs, with
> no paid cloud required (works on Docker Desktop, minikube, or kind).

---

## Architecture

```
                         ┌──────────────────────────────────────────┐
                         │                 Cluster / Compose         │
  Browser                │                                           │
  ───────▶  :8080 / Ingress ─▶  frontend (nginx)                     │
                         │          │  serves the React SPA          │
                         │          │  proxies /api/* ──▶ api (FastAPI/uvicorn)
                         │          │                        │        │
                         │          │                        ▼        │
                         │          │                   db (Postgres) │
                         │          └── /healthz              │       │
                         │                      /api/health ◀─┘       │
                         └──────────────────────────────────────────┘
```

- **frontend** — Vite build served by nginx; also reverse-proxies `/api` to the
  API (so the browser only ever talks to one origin). Health: `/healthz`.
- **api** — FastAPI on uvicorn. Creates/migrates its schema and seeds the
  exercise library on startup. Health: `/api/health`.
- **db** — PostgreSQL 16 with a persistent volume.

**Stack:** FastAPI · SQLAlchemy · PostgreSQL · React + Vite · nginx · Docker ·
Kubernetes · GitHub Actions.

---

## Prerequisites

- Docker + Docker Compose (for the Compose path)
- For Kubernetes: `kubectl` and a local cluster — [minikube](https://minikube.sigs.k8s.io/)
  or [kind](https://kind.sigs.k8s.io/)

---

## Run with Docker Compose (quickest)

```bash
cp .env.example .env          # edit APP_PASSWORD / SECRET_KEY if you like
docker compose up --build     # or: make up
```

Open **http://localhost:8080** and log in with `APP_PASSWORD` (default `trackmate`).

```bash
docker compose down           # stop
docker compose down -v        # stop and wipe the database volume
```

What happens: Compose starts Postgres, waits for it to be healthy, starts the API
(which creates tables + seeds exercises), then starts the nginx frontend on port
8080 which proxies `/api` to the API.

---

## Run the tests

```bash
cd api
pip install -r requirements-dev.txt
pytest -q                     # or, from the project root: make test
```

The suite runs the API against a throwaway SQLite DB (no Postgres needed) and
covers health, auth, the seeded exercise library, workout-plan CRUD, custom
exercises, and the profile endpoint.

---

## Run on Kubernetes (minikube / kind)

The manifests are in `k8s/` (namespace, ConfigMap, Secret, Postgres StatefulSet,
API + frontend Deployments/Services, Ingress, and an HPA).

**1. Build the images and make them available to the cluster.**

minikube:
```bash
eval $(minikube docker-env)                     # build straight into minikube
docker build -t trackmate-api:local ./api
docker build -t trackmate-frontend:local ./frontend
```

kind:
```bash
docker build -t trackmate-api:local ./api
docker build -t trackmate-frontend:local ./frontend
kind load docker-image trackmate-api:local trackmate-frontend:local
```

**2. Apply everything.**
```bash
kubectl apply -k k8s/                            # or: make k8s-up
kubectl -n trackmate get pods -w                 # wait for all Running/Ready
```

**3. Open it.**

Via port-forward (simplest):
```bash
kubectl -n trackmate port-forward svc/trackmate-frontend 8080:80
# open http://localhost:8080
```

Via Ingress (needs an ingress controller, e.g. `minikube addons enable ingress`):
```bash
echo "127.0.0.1 trackmate.local" | sudo tee -a /etc/hosts
# open http://trackmate.local   (minikube tunnel may be required)
```

**Clean up:** `kubectl delete namespace trackmate` (or `make k8s-down`).

### What the manifests show
- **ConfigMap / Secret** — non-secret config vs. password/keys, injected as env.
- **StatefulSet + PVC** for Postgres (stable identity + durable storage).
- **Deployments** with readiness/liveness probes, resource requests/limits, 2 replicas.
- **Services** for in-cluster DNS; the API connection string is assembled from
  ConfigMap + Secret using Kubernetes `$(VAR)` substitution.
- **Ingress** routing the host to the frontend.
- **HorizontalPodAutoscaler** scaling the API on CPU (needs metrics-server).

---

## CI/CD

`.github/workflows/ci-cd.yml` defines the pipeline:

1. **API tests** — install deps, run `pytest`.
2. **Frontend build** — `npm ci` + `npm run build`.
3. **Docker** — build both images and push them to **GHCR**
   (`ghcr.io/<owner>/<repo>/trackmate-api` and `-frontend`) on branch pushes;
   pull requests build but don't push. Uses the built-in `GITHUB_TOKEN` (no extra
   secrets needed) and GitHub Actions layer caching.

> GitHub only runs workflows located at the **repository root** `.github/workflows/`.
> This file lives in the project folder as the deliverable; to activate it, copy it up:
> ```bash
> cp capstone/trackmate-assignment/.github/workflows/ci-cd.yml .github/workflows/
> ```

---

## Environment variables

| Variable            | Used by        | Default                         | Notes |
|---------------------|----------------|---------------------------------|-------|
| `APP_PASSWORD`      | api            | `trackmate`                     | the login password |
| `SECRET_KEY`        | api            | (change it)                     | signs login tokens |
| `TOKEN_HOURS`       | api            | `720`                           | token lifetime |
| `DATABASE_URL`      | api            | built from the Postgres vars    | SQLAlchemy URL; SQLite if unset |
| `POSTGRES_USER/PASSWORD/DB` | db + api | `trackmate`                  | database credentials |
| `BACKEND_URL`       | frontend nginx | `http://api:8000`               | where `/api` is proxied |
| `WEB_PORT`          | compose        | `8080`                          | host port for the UI |

---

## Project structure

```
trackmate-assignment/
├── api/                      # FastAPI service
│   ├── app/                  # application code (shared with personal edition)
│   ├── tests/                # pytest suite (runs on SQLite)
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── Dockerfile
├── frontend/                 # React + Vite app
│   ├── src/
│   ├── nginx/default.conf.template
│   └── Dockerfile
├── k8s/                      # Kubernetes manifests (kubectl apply -k k8s/)
├── .github/workflows/        # CI/CD pipeline
├── docker-compose.yml
├── Makefile
└── .env.example
```

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `docker compose up` hangs on `db` | Postgres is still starting; the API waits for the healthcheck. Give it a few seconds. |
| API logs `could not connect to server` | DB not ready yet, or `DATABASE_URL` points at the wrong host. In-cluster the host is `trackmate-db`; in Compose it's `db`. |
| `column exercises.target_part does not exist` | An old DB from before the schema change. The API auto-adds missing columns on startup — restart the API pod/container. To reset in Compose: `docker compose down -v`. |
| Frontend loads but API calls 404/502 | `BACKEND_URL` is wrong or the API isn't reachable. Check `kubectl -n trackmate get pods` / `docker compose ps`. |
| K8s pods stuck `ImagePullBackOff` | The `:local` images aren't in the cluster. Re-run the image build step for your cluster (minikube `docker-env` or `kind load`). |
| HPA shows `<unknown>` targets | metrics-server isn't installed (`minikube addons enable metrics-server`). |
| Ingress host doesn't resolve | Add `127.0.0.1 trackmate.local` to `/etc/hosts`; for minikube run `minikube tunnel`. |

---

## Notes & scope

- **Schema management:** the API creates tables and applies additive column
  migrations on startup (safe for SQLite and Postgres), so no manual migration
  step is needed. A dedicated migration tool (Alembic) could replace this later.
- **Not included (deliberately):** Terraform/EKS and a full monitoring stack were
  left out because this edition targets a free, local cluster. A Helm chart and
  Prometheus/Grafana monitoring can be added on request.
- This edition is a copy of `trackmate-personal` with the Vercel-specific files
  removed and the Docker/K8s/CI-CD layer added; application behaviour is identical.
