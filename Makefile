.PHONY: help bootstrap install api-install ui-install dev dev-api dev-ui test test-e2e build deploy clean

help:
	@echo "Targets:"
	@echo "  make bootstrap   # Install api+ui deps and create ui/.env if missing"
	@echo "  make dev         # Run API (sam local) and UI (vite) together"
	@echo "  make dev-api     # Run only API locally"
	@echo "  make dev-ui      # Run only UI dev server"
	@echo "  make test        # Run API unit tests"
	@echo "  make test-e2e    # Run API E2E tests (set E2E_BASE_URL)"
	@echo "  make build       # Build API and UI"
	@echo "  make deploy      # Deploy API to AWS"
	@echo "  make clean       # Remove build artifacts and node_modules"

bootstrap: install

install: api-install ui-install
	@test -f ui/.env || cp ui/.env.example ui/.env

api-install:
	npm install --prefix api

ui-install:
	npm install --prefix ui

dev-api:
	cd api && sam local start-api

dev-ui:
	npm run dev --prefix ui

dev:
	@trap 'kill 0' EXIT; \
	(cd api && sam local start-api) & \
	(npm run dev --prefix ui) & \
	wait

test:
	npm test --prefix api

test-e2e:
	npm run test:e2e --prefix api

build:
	cd api && sam build
	npm run build --prefix ui

deploy:
	cd api && sam deploy

clean:
	rm -rf api/node_modules ui/node_modules api/.aws-sam ui/dist
