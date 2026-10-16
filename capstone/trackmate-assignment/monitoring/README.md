# Monitoring — Prometheus + Grafana

The backend exposes Prometheus metrics at `/metrics` (via
`prometheus-fastapi-instrumentator`). The Helm chart ships a **ServiceMonitor**
that tells the Prometheus Operator to scrape it. This folder installs the
monitoring stack.

## Install (local cluster)

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm upgrade --install kube-prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace \
  -f monitoring/prometheus-values.yaml
```

(The release name `kube-prometheus-stack` matches the `release:` label on the
chart's ServiceMonitor so Prometheus selects it.)

## See the metrics

**Prometheus — confirm the target is UP**
```bash
kubectl -n monitoring port-forward svc/kube-prometheus-stack-prometheus 9090:9090
# open http://localhost:9090/targets  ->  trackmate-backend should be UP
```

**Grafana — build a panel**
```bash
kubectl -n monitoring port-forward svc/kube-prometheus-stack-grafana 3001:80
# open http://localhost:3001  (login: admin / prom-operator)
```
Create a panel with a PromQL query against the app's metrics, e.g.:

```promql
sum(rate(http_requests_total{job="trackmate-backend"}[1m])) by (handler)   # request rate per endpoint
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))  # p95 latency
```

Generate some traffic first (open the app, or `curl` a few endpoints) so the
panels have data.
