# Convenience commands for the TrackMate stack.
.PHONY: help up down logs build test images helm-up helm-down monitoring-up

help:
	@echo "Docker Compose:"
	@echo "  make up          - build & start the full stack (db + backend + frontend)"
	@echo "  make down        - stop the stack"
	@echo "  make logs        - tail logs"
	@echo "  make test        - run the backend test suite"
	@echo "Kubernetes (kind/minikube + Helm):"
	@echo "  make images      - build the images for the cluster"
	@echo "  make helm-up     - deploy with Helm (dev values, ingress on)"
	@echo "  make helm-down   - uninstall the release"
	@echo "  make monitoring-up - install Prometheus + Grafana"

# ---- Docker Compose ----
up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

test:
	cd backend && pip install -r requirements-dev.txt && pytest -q

# ---- Kubernetes + Helm ----
images:
	docker build -t trackmate-backend:local ./backend
	docker build -t trackmate-frontend:local ./frontend

helm-up:
	kubectl apply -f k8s/namespace.yaml
	helm upgrade --install trackmate ./helm/trackmate -n trackmate -f helm/trackmate/values-dev.yaml

helm-down:
	helm uninstall trackmate -n trackmate

monitoring-up:
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
	helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
		-n monitoring --create-namespace -f monitoring/prometheus-values.yaml
