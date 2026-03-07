# Developer Setup Guide

## Prerequisites

| Tool       | Version  | Required |
|------------|----------|----------|
| Python     | 3.11+    | Yes      |
| Node.js    | 18+      | Yes      |
| PostgreSQL | 14+      | Yes      |
| Redis      | 6+       | Yes      |
| Docker     | 24+      | Optional (for quick start) |

---

## Option A — Docker Quick Start (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd ai-powered-digital-banking-platform
   ```

2. **Create backend environment file:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and fill in required values (see Environment Variables below)
   ```

3. **Start all services:**
   ```bash
   docker compose up --build
   ```

4. **Services will be available at:**
   | Service    | URL                          |
   |------------|------------------------------|
   | Frontend   | http://localhost:3000         |
   | Backend    | http://localhost:8000         |
   | Swagger UI | http://localhost:8000/api/docs/ |
   | ReDoc      | http://localhost:8000/api/redoc/ |
   | ML Service | http://localhost:9000         |

5. **Create a superuser (optional):**
   ```bash
   docker compose exec backend python manage.py createsuperuser
   ```

---

## Option B — Manual Setup

### 1. Database & Redis

#### PostgreSQL

```bash
# Create database
psql -U postgres
CREATE DATABASE banking_db;
\q
```

#### Redis

```bash
# macOS
brew install redis && redis-server

# Ubuntu/Debian
sudo apt install redis-server && sudo systemctl start redis

# Windows
# Use WSL2 or download from https://github.com/tporadowski/redis/releases
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials (see Environment Variables below)

# Run migrations
python manage.py migrate

# Seed initial data (bill payment categories, loan types, credit card types)
python manage.py seed_billers
python manage.py seed_loan_types
python manage.py seed_credit_card_types

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
# Or for WebSocket support:
daphne -b 0.0.0.0 -p 8000 core.asgi:application
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start at http://localhost:3000.

### 4. ML Service

```bash
cd ml_service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Start the service
uvicorn app:app --host 0.0.0.0 --port 9000
```

---

## Environment Variables

Create `backend/.env` with the following:

| Variable                | Required | Default               | Description                    |
|-------------------------|----------|-----------------------|--------------------------------|
| `DJANGO_SECRET_KEY`     | Yes      | —                     | Django secret key              |
| `DJANGO_DEBUG`          | No       | `False`               | Enable debug mode              |
| `DJANGO_ALLOWED_HOSTS`  | No       | `""`                  | Comma-separated allowed hosts  |
| `DB_ENGINE`             | Yes      | —                     | `django.db.backends.postgresql`|
| `DB_NAME`               | Yes      | —                     | Database name                  |
| `DB_USER`               | Yes      | —                     | Database user                  |
| `DB_PASSWORD`           | Yes      | —                     | Database password              |
| `DB_HOST`               | Yes      | —                     | Database host                  |
| `DB_PORT`               | Yes      | —                     | Database port (usually `5432`) |
| `REDIS_URL`             | No       | `redis://127.0.0.1:6379` | Redis connection URL        |
| `ML_SERVICE_URL`        | No       | `http://localhost:9000`| ML service base URL            |
| `RESEND_API_KEY`        | No       | —                     | Resend email API key           |
| `FRONTEND_URL`          | No       | `http://localhost:3000`| Frontend URL for email links   |
| `DEFAULT_FROM_EMAIL`    | No       | `onboarding@resend.dev`| Default sender email          |
| `CORS_ALLOWED_ORIGINS`  | No       | `http://localhost:3000`| Comma-separated CORS origins  |

**Example `.env` file:**

```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=django.db.backends.postgresql
DB_NAME=banking_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

REDIS_URL=redis://127.0.0.1:6379
ML_SERVICE_URL=http://localhost:9000
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

## Running Tests

```bash
cd backend

# Run all tests with coverage
python -m pytest

# Run a specific test file
python -m pytest users/tests/test_auth.py

# Run tests with short traceback
python -m pytest --tb=short -q

# Generate HTML coverage report
python -m pytest --cov-report=html
# Open htmlcov/index.html in your browser
```

### Test Structure

```
backend/
├── conftest.py                          # Shared fixtures (users, auth clients)
├── pytest.ini                           # Pytest configuration
├── .coveragerc                          # Coverage omit rules
├── users/tests/
│   ├── test_auth.py                     # Auth endpoint tests (12 tests)
│   └── test_security.py                 # Security policy tests (6 tests)
├── transactions/tests/
│   └── test_transactions.py             # Account & transfer tests (9 tests)
├── fraud/tests/
│   └── test_fraud.py                    # Fraud detection tests (3 tests)
└── loans/tests/
    └── test_emi.py                      # EMI calculator tests (4 tests)
```

---

## API Documentation

After starting the backend, interactive API docs are available at:

- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/
- **OpenAPI Schema:** http://localhost:8000/api/schema/

To generate the schema as a file:

```bash
python manage.py spectacular --file schema.yml
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError: No module named 'psycopg2'` | Install via `pip install psycopg2-binary` |
| `django.db.utils.OperationalError: could not connect to server` | Ensure PostgreSQL is running and `.env` credentials are correct |
| `redis.exceptions.ConnectionError` | Ensure Redis server is running |
| `pytest: error: unrecognized arguments: --cov-omit` | Coverage omit rules are in `.coveragerc`, not the command line |
| Port 8000 already in use | Kill the process: `lsof -ti:8000 \| xargs kill` (Unix) or `netstat -ano \| findstr 8000` (Windows) |
| Frontend can't reach backend | Check `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000` |
| WebSocket connection refused | Use `daphne` instead of `runserver` for WebSocket support |

---

## Project Structure

```
ai-powered-digital-banking-platform/
├── backend/                    # Django REST API
│   ├── core/                   # Settings, root URLs, admin analytics
│   ├── users/                  # Auth, sessions, 2FA, notifications, audit
│   ├── accounts/               # Bank accounts
│   ├── transactions/           # Fund transfers, statements, analytics
│   ├── fraud/                  # AI fraud detection
│   ├── loans/                  # Loan products and EMI
│   ├── credit_cards/           # Credit card management
│   ├── bill_payments/          # Bill payments and autopay
│   └── support/                # WebSocket chat
├── frontend/                   # Next.js frontend
│   ├── app/(customer)/         # Customer pages
│   ├── app/(admin)/            # Admin pages
│   ├── components/             # Shared UI components
│   └── lib/                    # API client, utilities
├── ml_service/                 # FastAPI fraud detection service
├── ml/                         # ML model training scripts
├── docs/                       # Documentation
├── devops/                     # DevOps configuration
└── docker-compose.yml          # Docker orchestration
```
