-include .env

CANDIDATE_ID ?= demo
export CANDIDATE_ID

.PHONY: help up down seed logs test detection reset

help:
	@echo "Ledn Token — Security Challenge"
	@echo ""
	@echo "Candidate targets:"
	@echo "  make up                 # start Postgres + API locally (localhost only)"
	@echo "  make seed               # (re)load the synthetic dataset for CANDIDATE_ID"
	@echo "  make down               # stop everything"
	@echo "  make test               # run the starter test suite"
	@echo "  make detection          # optional: run Module D detection against supplied logs"
	@echo ""
	@echo "Set CANDIDATE_ID in .env or on a target to use a specific dataset."

up:
	docker compose up -d --build
	@echo "waiting for api..."
	@until curl -sf http://localhost:4000/health >/dev/null 2>&1; do sleep 1; done
	@$(MAKE) seed
	@echo "ready: http://localhost:4000"

down:
	docker compose down -v

seed:
	docker compose exec -T api npm run seed

logs:
	docker compose logs -f api

reset: down up

# --- local (non-docker) developer targets ---------------------------------
test:
	npm ci
	npm test

detection:
	npm ci
	npm run detection
