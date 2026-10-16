# Submission screenshots

Save every screenshot in **this folder** with the filename shown below, so the
set is complete and self-contained. Four are already generated; the rest you
capture by running the commands here (all are free except M7, which needs AWS).

| File | Module | What it shows | Status |
|------|--------|---------------|--------|
| `m1-app-home.png`   | M1 | App dashboard in the browser          | ✅ generated |
| `m1-app-train.png`  | M1 | App "Train" screen (body map)         | ✅ generated |
| `m2-pytest.png`     | M2 | `pytest -v` — all tests passing       | ✅ generated |
| `m9-metrics.png`    | M9 | `/health`, `/ready`, `/metrics` output | ✅ generated |
| `m3-commits.png`    | M3 | GitHub commit history (10+ commits)   | ⬜ you capture |
| `m4-compose.png`    | M4 | `docker compose up --build` running   | ⬜ you capture |
| `m5-pipeline.png`   | M5 | GitHub Actions — green pipeline       | ⬜ you capture |
| `m5-ghcr.png`       | M5 | GHCR packages with SHA tags           | ⬜ you capture |
| `m6-trivy.png`      | M6 | Trivy scan output in the pipeline     | ⬜ you capture |
| `m7-plan.png`       | M7 | `terraform plan` output               | ⬜ needs AWS |
| `m7-aws-console.png`| M7 | AWS Console — VPC + EKS cluster       | ⬜ needs AWS |
| `m7-destroy.png`    | M7 | `terraform destroy` complete          | ⬜ needs AWS |
| `m8-pods.png`       | M8 | `kubectl get pods` (all Running)      | ⬜ you capture |
| `m8-svc.png`        | M8 | `kubectl get svc`                     | ⬜ you capture |
| `m8-helm.png`       | M8 | `helm list`                           | ⬜ you capture |
| `m8-ingress.png`    | M8 | App opened via the Ingress host       | ⬜ you capture |
| `m9-prometheus.png` | M9 | Prometheus Targets page — backend UP  | ⬜ you capture |
| `m9-grafana.png`    | M9 | Grafana panel with live metrics       | ⬜ you capture |

---

## How to capture the remaining ones

Run these from the project root (`trackmate/`).

### M3 — commit history
Push the repo to GitHub, open the repo's **Commits** page, screenshot it
(needs 10+ commits). → `m3-commits.png`

### M4 — Docker Compose
```bash
cp .env.example .env
docker compose up --build
```
Screenshot the terminal once all three services are up → `m4-compose.png`.
(The browser view is already `m1-app-home.png`; open http://localhost:3000 to retake if you want the URL bar.)

### M5 + M6 — CI/CD + Trivy (GitHub does the work)
```bash
# one-time, so the workflow runs from the repo root:
cp .github/workflows/ci-cd.yml .github/workflows/   # already there if this folder IS the repo root
git push origin main
```
Then on GitHub:
- **Actions** tab → open the latest green run → `m5-pipeline.png`
- open the run's **Trivy** step logs → `m6-trivy.png`
- profile/repo → **Packages** → the two `trackmate-*` images with SHA tags → `m5-ghcr.png`

### M8 — Kubernetes + Helm (free on minikube/kind)
```bash
minikube start                 # or: kind create cluster
minikube addons enable ingress
eval $(minikube docker-env)    # build images into the cluster (kind: use `kind load`)
docker build -t trackmate-backend:local ./backend
docker build -t trackmate-frontend:local ./frontend

kubectl apply -f k8s/namespace.yaml
helm upgrade --install trackmate ./helm/trackmate -n trackmate -f helm/trackmate/values-dev.yaml

kubectl get pods -n trackmate       # -> m8-pods.png (wait until all Running)
kubectl get svc  -n trackmate       # -> m8-svc.png
helm list -n trackmate              # -> m8-helm.png

echo "127.0.0.1 trackmate.local" | sudo tee -a /etc/hosts
minikube tunnel                     # then open http://trackmate.local -> m8-ingress.png
```

### M9 — Prometheus + Grafana (free, same cluster)
```bash
make monitoring-up      # installs kube-prometheus-stack

kubectl -n monitoring port-forward svc/kube-prometheus-stack-prometheus 9090:9090
#   open http://localhost:9090/targets  ->  trackmate-backend = UP  ->  m9-prometheus.png

kubectl -n monitoring port-forward svc/kube-prometheus-stack-grafana 3001:80
#   open http://localhost:3001  (admin / prom-operator)
#   add a panel: sum(rate(http_requests_total{job="trackmate-backend"}[1m])) by (handler)
#   generate traffic first (click around the app), then  ->  m9-grafana.png
```

### M7 — Terraform (needs an AWS account; billable)
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan        # -> m7-plan.png
terraform apply       # creates VPC + EKS
#   AWS Console -> VPC and EKS in ap-south-1  ->  m7-aws-console.png
terraform destroy     # -> m7-destroy.png   (tear down so there's no bill)
```
If you can't get an AWS account, submit the Terraform code and note that EKS
wasn't provisioned — don't fake the console screenshots.
