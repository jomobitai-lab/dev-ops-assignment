# Submission screenshots

Evidence for each graded module (M1–M10). All captured from this project running
locally, and on GitHub for the pipeline/registry shots. Embedded in the main
[`README.md`](../../README.md#evidence-m1m10).

| File | Module | What it shows |
|------|--------|---------------|
| `m1-app-home.png`          | M1 | App dashboard in the browser |
| `m1-app-train.png`         | M1 | Train screen (anatomical body map) |
| `m2-pytest.png`            | M2 | `pytest -v` — all tests passing |
| `m3-commits-cli.png`       | M3 | Commit history (`git log`) |
| `m3-commits-github.png`    | M3 | Commit history on GitHub |
| `m4-compose-up-1.png`      | M4 | `docker compose up --build` starting |
| `m4-compose-up-2.png`      | M4 | All three services healthy |
| `m5-pipeline.png`          | M5 | GitHub Actions — green pipeline |
| `m5-ghcr-backend.png`      | M5 | GHCR backend image, SHA tag |
| `m5-ghcr-frontend.png`     | M5 | GHCR frontend image, SHA tag |
| `m6-trivy-backend.png`     | M6 | Trivy scan — backend image |
| `m6-trivy-frontend.png`    | M6 | Trivy scan — frontend image |
| `m7-terraform-plan.png`    | M7 | `terraform plan` (VPC + EKS) |
| `m7-terraform-destroy.png` | M7 | `terraform destroy` complete |
| `m8-pods.png`              | M8 | `kubectl get pods` — all Running |
| `m8-svc.png`               | M8 | `kubectl get svc` |
| `m8-helm.png`              | M8 | `helm list` |
| `m8-ingress-cli.png`       | M8 | Ingress reachable (CLI) |
| `m8-ingress-browser.png`   | M8 | App opened via the Ingress host |
| `m9-metrics.png`           | M9 | `/health`, `/ready`, `/metrics` output |
| `m9-prometheus.png`        | M9 | Prometheus Targets — backend UP |
| `m9-grafana.png`           | M9 | Grafana — backend `http_requests_total` |
| `m9-grafana-2.png`         | M9 | Grafana — live traffic over time |
