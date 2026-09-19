# ============================================================
# Riqchariy — Makefile
# Comandos de desarrollo para el piloto
# ============================================================

.PHONY: help up down backend frontend db migrate seed lint format test clean

# --- Ayuda ---
help: ## Mostrar esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --- Docker ---
up: ## Levantar todo (backend + db + redis)
	docker compose up -d
	@echo "✅ Servicios levantados"
	@echo "   Backend:  http://localhost:8000"
	@echo "   Postgres: localhost:5432"
	@echo "   Redis:    localhost:6379"

down: ## Bajar todos los servicios
	docker compose down

logs: ## Ver logs de todos los servicios
	docker compose logs -f

# --- Backend ---
backend: ## Correr backend en modo desarrollo (sin Docker)
	cd backend && uvicorn app.main:app --reload --port 8000

backend-shell: ## Abrir shell de Python con contexto de la app
	cd backend && python -c "from app.main import app; print('App loaded')" && python -i

# --- Frontend ---
frontend: ## Correr frontend en modo desarrollo
	cd frontend && npm run dev

frontend-build: ## Build de producción del frontend
	cd frontend && npm run build

frontend-preview: ## Preview del build de producción
	cd frontend && npm run preview

# --- Base de datos ---
db: ## Conectar a PostgreSQL
	docker compose exec db psql -U riqchariy -d riqchariy_db

db-create: ## Crear la base de datos
	docker compose exec db createdb -U riqchariy riqchariy_db 2>/dev/null || true

migrate: ## Correr migraciones de Alembic
	cd backend && alembic upgrade head

migrate-new: ## Crear nueva migración (NAME=nombre)
	cd backend && alembic revision --autogenerate -m "$(NAME)"

migrate-down: ## Revertir última migración
	cd backend && alembic downgrade -1

seed: ## Cargar datos iniciales (balance, events, items, jobs)
	cd backend && python -m scripts.seed_content

# --- Calidad de código ---
lint: ## Correr linters (backend + frontend)
	cd backend && ruff check .
	cd frontend && npm run lint

format: ## Formatear código (backend + frontend)
	cd backend && black . && isort .
	cd frontend && npx prettier --write "src/**/*.{ts,tsx,css}"

format-check: ## Verificar formato sin cambiar archivos
	cd backend && black --check . && isort --check .
	cd frontend && npx prettier --check "src/**/*.{ts,tsx,css}"

typecheck: ## Verificar tipos de TypeScript
	cd frontend && npx tsc --noEmit

# --- Tests ---
test: ## Correr tests (backend)
	cd backend && pytest -v

test-cov: ## Tests con cobertura
	cd backend && pytest --cov=app --cov-report=term-missing

# --- Pacha (motor de simulación) ---
pacha-sim: ## Correr simulación rápida (100 agentes × 28 ticks)
	cd backend && python -m scripts.simulate --agents 100 --ticks 28

pacha-validate: ## Validar balance.yaml contra umbrales
	cd backend && python -m scripts.validate_balance

# --- Deploy ---
deploy-frontend: ## Deploy frontend a Vercel
	cd frontend && npx vercel --prod

deploy-check: ## Verificar estado del deploy
	@echo "Frontend: https://riqchariy.vercel.app"
	@echo "Backend:  https://riqchariy-api.onrender.com/health"
	@curl -s https://riqchariy-api.onrender.com/health | python -m json.tool 2>/dev/null || echo "⚠️  Backend no responde"

# --- Utilidades ---
clean: ## Limpiar archivos generados
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf frontend/dist frontend/node_modules/.vite
	@echo "🧹 Limpio"

install: ## Instalar dependencias (backend + frontend)
	cd backend && pip install -r requirements.txt
	cd frontend && npm install
	@echo "📦 Dependencias instaladas"

env: ## Crear .env desde .env.example si no existe
	@test -f .env || cp .env.example .env && echo "📄 .env creado desde .env.example"
	@test -f .env && echo "📄 .env ya existe"

setup: env install db-create migrate seed ## Setup completo para nuevo dev
	@echo ""
	@echo "🚀 Setup completo. Ejecuta:"
	@echo "   make up        # levantar servicios"
	@echo "   make backend   # correr backend"
	@echo "   make frontend  # correr frontend"