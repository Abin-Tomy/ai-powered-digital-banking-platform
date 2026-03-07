# AI-Powered Digital Banking Platform

A full-stack digital banking platform with AI-powered fraud detection, built with Django REST Framework, Next.js, and FastAPI.

## Team

Abin Tomy, Elsa Maria, Naji Abdulla — MCA Team 3

## Tech Stack

| Layer      | Technology                                           |
|------------|------------------------------------------------------|
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS       |
| Backend    | Django 6.0, Django REST Framework, JWT (SimpleJWT)    |
| ML Service | FastAPI, scikit-learn (Isolation Forest)              |
| Database   | PostgreSQL 16                                        |
| Cache      | Redis 7                                              |
| Real-time  | Django Channels (WebSocket)                          |
| Docs       | drf-spectacular (Swagger / ReDoc)                    |

## Features

- **Accounts** — Create, manage, and view bank accounts
- **Transactions** — Fund transfers with idempotency, statements, PDF export
- **Loans** — Loan types, applications, EMI calculator, admin approval
- **Credit Cards** — Application, activation, Fernet-encrypted card data
- **Bill Payments** — Biller management, autopay scheduling
- **Fraud Detection** — AI model scoring every transfer in real-time
- **2FA** — TOTP-based two-factor authentication
- **Notifications** — In-app notifications with mark-read support
- **Admin Dashboard** — Analytics, user management, fraud review
- **Live Support** — WebSocket-based customer-support chat
- **Email** — Verification, password reset via Resend API

## Quick Start

```bash
# Clone and configure
git clone <repo-url>
cd ai-powered-digital-banking-platform
cp backend/.env.example backend/.env   # Fill in values

# Start everything
docker compose up --build
```

| Service    | URL                                |
|------------|------------------------------------|
| Frontend   | http://localhost:3000               |
| Backend    | http://localhost:8000               |
| Swagger UI | http://localhost:8000/api/docs/     |
| ReDoc      | http://localhost:8000/api/redoc/    |
| ML Service | http://localhost:9000               |

## Documentation

| Document | Description |
|----------|-------------|
| [Developer Setup](docs/DEVELOPER_SETUP.md) | Full setup guide (Docker + manual), environment variables, running tests |
| [Architecture](docs/ARCHITECTURE.md) | System design, data flows, security model, database schema |
| [API Reference](docs/API_REFERENCE.md) | All endpoints with request/response examples |
| [Swagger UI](http://localhost:8000/api/docs/) | Interactive API explorer (requires running backend) |

## Running Tests

```bash
cd backend
python -m pytest          # 34 tests, ~62% coverage
```

## Environment Variables

See [docs/DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md#environment-variables) for the full reference. Key variables:

| Variable             | Description                |
|----------------------|----------------------------|
| `DJANGO_SECRET_KEY`  | Django secret key          |
| `DB_NAME`            | PostgreSQL database name   |
| `DB_USER`            | PostgreSQL user            |
| `DB_PASSWORD`        | PostgreSQL password        |
| `REDIS_URL`          | Redis connection URL       |
| `ML_SERVICE_URL`     | Fraud detection service    |
| `RESEND_API_KEY`     | Email service API key      |
