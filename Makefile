.DEFAULT_GOAL := help

COMPOSE ?= docker compose
SERVICE ?= backend
CMD ?= bash
LOGS_SERVICE ?=

.PHONY: help up down ls ps exec test backend-test frontend-test logs build restart

help: ## List available targets
	@printf "Targets:\n"
	@grep -E '^[a-zA-Z0-9_-]+:.*?##' Makefile | awk 'BEGIN {FS = ":.*##"} {printf "  %-20s %s\n", $$1, $$2}'

up: ## Start all services (build if needed)
	$(COMPOSE) up -d --build

down: ## Stop and remove containers
	$(COMPOSE) down

ls: ## List running services
	$(COMPOSE) ps

ps: ls ## Alias for ls

exec: ## Run a command in a service (SERVICE=backend CMD="bash")
	$(COMPOSE) exec $(SERVICE) $(CMD)

test: backend-test frontend-test ## Run backend and frontend test suites

backend-test: ## Run Django test suite
	$(COMPOSE) exec backend python manage.py test

frontend-test: ## Run frontend Jest tests
	$(COMPOSE) exec frontend npm run test

logs: ## Tail logs (optionally LOGS_SERVICE=backend)
	$(COMPOSE) logs -f $(LOGS_SERVICE)

build: ## Rebuild images without using cache
	$(COMPOSE) build --no-cache

restart: ## Restart services
	$(COMPOSE) restart
