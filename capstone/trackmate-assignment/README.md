# TrackMate

TrackMate is a personal fitness and life tracker I built to keep everything I
care about in one place — my **gym training**, **body weight**, **daily
nutrition**, **sleep**, **earnings**, and **personal goals** — and to see my
progress over time instead of scattered notes on my phone.

It's a full-stack app (React + FastAPI + PostgreSQL) packaged to run anywhere
with **Docker**, orchestrated on **Kubernetes**, and shipped through a **CI/CD**
pipeline.

---

## What it does

- **Train** — start a workout session, pick the muscle groups and exercises for
  the day (or load a saved **workout plan**), and log each set (weight × reps,
  with comments for things like dropsets). An interactive **front + back body map**
  highlights the muscles each exercise targets, and every exercise shows your
  **personal record** and **last session** so you know what to beat. A built-in
  **rest timer** keeps rest honest between sets.
- **Workout plans** — create reusable plans (e.g. "Pull day — Back + Biceps")
  and start a session from one in a tap.
- **Nutrition** — log daily calories and protein/carbs/fat; a live macro donut
  and target bars show how the day is going.
- **Progress** — body-weight trend chart and a list of personal records.
- **Home dashboard** — weekly training streak, quick stats, a workout activity
  heatmap, and a muscle-balance radar.
- **More** — sleep (bedtime/wake, hours auto-calculated), earnings with a running
  total, "wins" (milestones), goals, and a profile (name, weekly target, default
  rest time).
- **Private** — a single-password login so the data stays mine.

**Stack:** React + Vite · FastAPI · SQLAlchemy · PostgreSQL · nginx · Docker ·
Kubernetes · GitHub Actions.

---

## Architecture

```
                         ┌──────────────────────────────────────────┐
                         │             Cluster / Compose             │
  Browser                │                                           │
  ───────▶  :8080 / Ingress ─▶  frontend (nginx)                     │
                         │          │  serves the React app          │
                         │          │  proxies /api/* ──▶ api (FastAPI/uvicorn)
                         │          │                        │        │
                         │          │                        ▼        │
                         │          │                   db (Postgres) │
                         │          └── /healthz              │       │
                         │                      /api/health ◀─┘       │
                         └──────────────────────────────────────────┘
```

- **frontend** — the React build served by nginx, which also reverse-proxies
  `/api` to the backend so the browser talks to a single origin. Health: `/healthz`.
- **api** — FastAPI on uvicorn; creates/migrates its schema and seeds the exercise
  library on startup. Health: `/api/health`.
- **db** — PostgreSQL 16 with a persistent volume.

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

Compose starts Postgres, waits for it to be healthy, starts the API (which
creates tables and seeds the exercise library), then starts the nginx frontend
on port 8080 which proxies `/api` to the API.

---

## Run the tests

```bash
cd api
pip install -r requirements-dev.txt
pytest -q                     # or, from the project root: make test
```

The suite runs the API against a throwaway SQLite database (no Postgres needed)
and covers health, authentication, the seeded exercise library, workout-plan
CRUD, custom exercises, and the profile endpoint.

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
  the ConfigMap + Secret using Kubernetes `$(VAR)` substitution.
- **Ingress** routing the host to the frontend.
- **HorizontalPodAutoscaler** scaling the API on CPU (needs metrics-server).

---

## CI/CD

`.github/workflows/ci-cd.yml` defines the pipeline:

1. **API tests** — install dependencies, run `pytest`.
2. **Frontend build** — `npm ci` + `npm run build`.
3. **Docker** — build both images and push them to **GHCR**
   (`ghcr.io/<owner>/<repo>/trackmate-api` and `-frontend`) on branch pushes;
   pull requests build but don't push. Uses the built-in `GITHUB_TOKEN` (no extra
   secrets needed) and GitHub Actions layer caching.

> GitHub only runs workflows located at the **repository root** `.github/workflows/`.
> This copy lives in the project folder; to activate it on GitHub, copy it up:
> ```bash
> cp .github/workflows/ci-cd.yml <repo-root>/.github/workflows/
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
trackmate/
├── api/                      # FastAPI service
│   ├── app/                  # application code (routers, models, auth, seed)
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
| `column exercises.target_part does not exist` | An old database from before a schema change. The API adds missing columns on startup — restart the API pod/container. To reset in Compose: `docker compose down -v`. |
| Frontend loads but API calls 404/502 | `BACKEND_URL` is wrong or the API isn't reachable. Check `kubectl -n trackmate get pods` / `docker compose ps`. |
| K8s pods stuck `ImagePullBackOff` | The `:local` images aren't in the cluster. Re-run the image build step for your cluster (minikube `docker-env` or `kind load`). |
| HPA shows `<unknown>` targets | metrics-server isn't installed (`minikube addons enable metrics-server`). |
| Ingress host doesn't resolve | Add `127.0.0.1 trackmate.local` to `/etc/hosts`; for minikube run `minikube tunnel`. |

---

## Notes

- **Schema management:** the API creates its tables and applies additive column
  migrations on startup (safe for both SQLite and Postgres), so there's no manual
  migration step. Credentials and the database connection are all driven by
  environment variables, so nothing sensitive is committed.
