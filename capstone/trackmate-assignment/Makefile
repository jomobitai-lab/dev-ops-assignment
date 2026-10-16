# Convenience commands for the TrackMate assignment stack.
.PHONY: help up down logs build test k8s-up k8s-down k8s-images

help:
	@echo "Docker Compose:"
	@echo "  make up          - build & start the full stack (db + api + frontend)"
	@echo "  make down        - stop the stack"
	@echo "  make logs        - tail logs"
	@echo "  make test        - run the API test suite"
	@echo "Kubernetes (kind/minikube):"
	@echo "  make k8s-images  - build the images for the cluster"
	@echo "  make k8s-up      - apply all manifests"
	@echo "  make k8s-down    - delete the namespace"

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
	cd api && pip install -r requirements-dev.txt && pytest -q

# ---- Kubernetes ----
k8s-images:
	docker build -t trackmate-api:local ./api
	docker build -t trackmate-frontend:local ./frontend

k8s-up:
	kubectl apply -k k8s/

k8s-down:
	kubectl delete namespace trackmate
