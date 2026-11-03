.PHONY: setup db seed dev codegen test stop

setup:   ## install npm packages + Playwright's Chromium, create .env
	npm install
	npx playwright install chromium
	test -f .env || cp .env.example .env

db:      ## start Postgres in Docker (port 5440) and apply migrations to the dev database
	docker compose up -d --wait
	npx prisma migrate deploy

seed:    ## replace the demo user's data with 8 weeks of synthetic history
	npm run db:seed

dev:     ## run the app on http://localhost:3010
	npm run dev

codegen: ## regenerate TypeScript types after editing the GraphQL schema or operations
	npm run codegen

test:    ## the same checks CI runs: codegen, types, lint, Vitest, build, Playwright
	docker compose up -d --wait
	npm run codegen:check
	npm run typecheck
	npm run lint
	npm run test:unit
	npm run build:e2e
	npm run test:e2e

stop:    ## stop the Postgres container (data is kept in a Docker volume)
	docker compose down
