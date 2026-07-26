.PHONY: up build down logs dev test lint typecheck db-generate

up:
	docker compose up -d

build:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

dev:
	mise exec -- pnpm dev

test:
	mise exec -- pnpm test

lint:
	mise exec -- pnpm lint

typecheck:
	mise exec -- pnpm exec tsc --noEmit

db-generate:
	mise exec -- pnpm run db:generate
