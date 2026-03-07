# AI-Powered Digital Banking Platform

## Team
Abin Tomy, Elsa Maria, Naji Abdulla — MCA Team 3

## Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Django 6.0, Django REST Framework, JWT Auth
- **ML Service:** FastAPI, Isolation Forest (scikit-learn)
- **Database:** PostgreSQL 16
- **Real-time:** Django Channels, Redis
- **Security:** Fernet encryption, bcrypt, token-based auth

## Features
- Full digital banking (accounts, transfers, loans, credit cards, bill payments)
- AI fraud detection with real behavioral signals
- Live support chat (WebSocket)
- Real-time fraud alerts for admin dashboard
- Email verification and password reset
- Role-based access: Customer / Support / Admin

## Quick Start (Docker)

```bash
# 1. Clone the repo
git clone <repo-url>
cd ai-powered-digital-banking-platform

# 2. Copy env files and fill in values
cp backend/.env.example backend/.env
cp .env.example .env

# 3. Run the entire stack
docker compose up --build

# 4. Open http://localhost:3000
```

## Manual Setup (Development)

### Backend
```bash
cd backend
python -m venv venv && venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
daphne -p 8000 core.asgi:application
```

### ML Service
```bash
cd ml_service
pip install -r requirements.txt
uvicorn app:app --port 9000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Redis (required for WebSockets)
```bash
# Windows — start portable Redis:
%TEMP%\redis\redis-server.exe

# Or use Docker:
docker run -p 6379:6379 redis:7-alpine
```

## Environment Variables

See `backend/.env.example` for all required variables.

| Variable | Description |
|----------|-------------|
| `DJANGO_SECRET_KEY` | Django secret key |
| `DB_PASSWORD` | PostgreSQL password |
| `RESEND_API_KEY` | Resend email API key |
| `REDIS_URL` | Redis connection URL |
| `ML_SERVICE_URL` | ML fraud detection service URL |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins |
