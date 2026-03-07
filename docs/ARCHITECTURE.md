# Architecture Document — AI-Powered Digital Banking Platform

## 1. System Overview

The platform is a full-stack digital banking application built with a microservices-oriented architecture. It consists of four main services orchestrated via Docker Compose:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                ┌────────────▼────────────┐
                │  Next.js Frontend (:3000)│
                │  React 19 · TypeScript   │
                └────────────┬────────────┘
                             │ REST / WebSocket
            ┌────────────────▼─────────────────┐
            │  Django Backend (DRF + Channels)  │
            │           :8000                   │
            ├──────┬──────────────┬─────────────┤
            │ REST │  WebSocket   │   Admin     │
            │ API  │  (support /  │   Panel     │
            │      │  notifications)             │
            └──┬───┴──────┬───────┴──────┬──────┘
               │          │              │
     ┌─────────▼──┐  ┌───▼────┐   ┌─────▼──────┐
     │ PostgreSQL  │  │ Redis  │   │ ML Service │
     │   :5432     │  │ :6379  │   │ (FastAPI)  │
     │             │  │        │   │   :8001    │
     └─────────────┘  └────────┘   └────────────┘
```

## 2. Service Descriptions

### 2.1 Frontend — Next.js 16 + React 19

| Attribute       | Value                                             |
|-----------------|---------------------------------------------------|
| Framework       | Next.js 16 (App Router)                           |
| UI Kit          | shadcn/ui + Tailwind CSS v4                       |
| State / Fetch   | React hooks + fetch via `/lib/api.ts`             |
| Auth            | JWT stored in cookies, middleware-protected routes |
| Port            | 3000                                              |

**Key directories:**

- `app/(customer)/` — Customer-facing pages (dashboard, accounts, transfers, loans, credit cards, bill payments, analytics)
- `app/(admin)/` — Admin pages (dashboard, users, accounts, loans, fraud, credit cards, support)
- `components/` — Shared UI components
- `lib/api.ts` — Central API client (handles JWT refresh, base URL)

### 2.2 Backend — Django 5 + DRF

| Attribute       | Value                                                 |
|-----------------|-------------------------------------------------------|
| Framework       | Django 5.0, Django REST Framework                     |
| Auth            | JWT via `djangorestframework-simplejwt` (1 h / 7 d)  |
| Realtime        | Django Channels (WebSocket for support chat & notifications) |
| Schema          | drf-spectacular (OpenAPI 3.0, Swagger UI at `/api/docs/`) |
| Port            | 8000                                                  |

**Django apps:**

| App              | Responsibility                                      |
|------------------|-----------------------------------------------------|
| `users`          | Custom User model, auth, sessions, TOTP 2FA, notifications, audit logs, credit score |
| `accounts`       | Bank account CRUD                                   |
| `transactions`   | Fund transfers, balance, statements, analytics, PDF export |
| `fraud`          | AI fraud detection flags + admin review             |
| `loans`          | Loan types, applications, approval workflow, EMI calculator |
| `credit_cards`   | Card types, applications, issuance, transactions, statements, rewards |
| `bill_payments`  | Billers, saved billers, bill fetch, payments, recurring payments |
| `support`        | WebSocket support chat consumers                    |

### 2.3 ML Service — FastAPI

| Attribute       | Value                                      |
|-----------------|--------------------------------------------|
| Framework       | FastAPI                                    |
| Model           | scikit-learn Isolation Forest              |
| Port            | 8001                                       |
| Endpoint        | `POST /predict`                            |

Called synchronously by the Django backend during fund transfers. Failure is non-blocking — if the ML service is unreachable the transfer still completes.

### 2.4 PostgreSQL 16

Primary relational store for all application data. UUID primary keys on all financial models (Account, Transaction, FraudFlag, Loan, CreditCard, Bill). `DecimalField` used for all monetary values.

### 2.5 Redis 7

- **Channel layer** for Django Channels (WebSocket support chat and notifications)
- **Cache backend** for rate limiting (`django-ratelimit`), 2FA temp tokens, and general caching

## 3. Data Flow Diagrams

### 3.1 Fund Transfer

```
Customer ──POST /api/transactions/transfer/──► Django Backend
  │                                              │
  │  1. Validate user, accounts, balance         │
  │  2. Check idempotency key                    │
  │  3. Atomic block:                            │
  │     a. Create DEBIT + CREDIT transactions    │
  │     b. Call ML Service /predict              │
  │     c. If fraud → create FraudFlag           │
  │        + push notification                   │
  │  4. Push notification to recipient           │
  │  5. Log audit entry                          │
  │                                              │
  ◄────── 201 {reference, debit, credit} ────────┘
```

### 3.2 Authentication Flow

```
Client ──POST /api/auth/login/──► LoginView
  │                                  │
  │  1. Rate limit check (5/min)     │
  │  2. Authenticate credentials     │
  │  3. If 2FA enabled:              │
  │     → Return temp_token          │
  │     → Client calls /api/auth/2fa/authenticate/
  │  4. Issue JWT (access + refresh) │
  │  5. Create UserSession record    │
  │  6. Log audit entry              │
  │                                  │
  ◄────── {access, refresh, user} ───┘
```

### 3.3 Fraud Detection

```
TransferView ──POST──► ML Service /predict
                           │
                     Feature extraction:
                     - amount, hour, day_of_week
                     - account_age_days
                     - user_transaction_count
                     - avg_transaction_amount
                     - is_new_recipient
                     - amount_to_avg_ratio
                           │
                    Isolation Forest model
                           │
                    ◄── {is_fraud, risk_score, reason}
                           │
                    If fraud:
                      → FraudFlag.create()
                      → Push notification (WebSocket + DB)
                      → Admin reviews in /api/fraud/
```

## 4. Security Architecture

| Layer              | Mechanism                                                  |
|--------------------|------------------------------------------------------------|
| Authentication     | JWT (access 1 h, refresh 7 d, rotate on refresh, blacklist) |
| Two-Factor Auth    | TOTP (pyotp) with QR code provisioning                     |
| Rate Limiting      | `django-ratelimit` — login 5/min, register 3/min, password reset 3/hr |
| IDOR Protection    | All queries scoped to `request.user` (owner checks)        |
| Password Policy    | Minimum 8 chars, validated at serializer + reset endpoint   |
| Account Lockout    | 5 failed login attempts → `is_locked = True`               |
| Idempotency        | `Idempotency-Key` header required on transfers (duplicate → 409) |
| CORS               | Configured in settings, restricted origins                  |
| CSRF               | Exempt for API (JWT-based auth), active for admin panel     |
| Encryption         | Credit card numbers stored via `EncryptedCharField` (Fernet) |
| Audit Logging      | All sensitive actions logged to `AuditLog` model            |
| Session Management | Track active sessions, revoke individual or all sessions    |
| Email Verification | UUID token, 24 h expiry, single use                        |

## 5. Database Schema Summary

### 5.1 Users App (5 models)

- **User** — Custom user with email login, role (CUSTOMER/SUPPORT/ADMIN), 2FA support
- **VerificationToken** — Email verification and password reset tokens (UUID, expiry, single-use)
- **UserSession** — Active login sessions with device/browser/IP tracking
- **Notification** — In-app notifications (TRANSACTION/LOAN/FRAUD/CREDIT_CARD/SYSTEM)
- **AuditLog** — Immutable audit trail of all sensitive operations

### 5.2 Accounts App (1 model)

- **Account** — UUID PK, unique account number, owner FK → User, type (SAVINGS/CURRENT), status (ACTIVE/FROZEN/CLOSED). One SAVINGS per customer enforced.

### 5.3 Transactions App (2 models)

- **Transaction** — UUID PK, FK → Account, amount (Decimal 12,2), type (DEBIT/CREDIT), reference, status. Double-entry: every transfer creates one DEBIT + one CREDIT.
- **IdempotencyKey** — Prevents duplicate transfers. Unique on (key, user).

### 5.4 Fraud App (1 model)

- **FraudFlag** — UUID PK, OneToOne → Transaction, status (SUSPICIOUS/CONFIRMED_FRAUD/FALSE_POSITIVE/CLEAR), risk_score, reasons (JSON), reviewer FK.

### 5.5 Loans App (4 models)

- **LoanType** — Configurable loan products (rate, amount range, tenure range)
- **LoanApplication** — Customer applications with approval workflow
- **Loan** — Disbursed loans with EMI schedule, outstanding balance
- **LoanPayment** — Individual EMI records (principal + interest split, status, late fees)

### 5.6 Credit Cards App (5 models)

- **CreditCardType** — Card products (fees, limits, rewards rate)
- **CreditCardApplication** — Applications with admin review workflow
- **CreditCard** — Issued cards with encrypted card number, limits, rewards, status
- **CreditCardTransaction** — Card transactions (PURCHASE/PAYMENT/CASH_ADVANCE/etc.)
- **CreditCardStatement** — Monthly billing statements

### 5.7 Bill Payments App (5 models)

- **BillerCategory** — Categories (Electricity, Water, Internet, etc.)
- **Biller** — Individual billers with fees, processing time, bill fetch support
- **SavedBiller** — User's saved biller accounts (nickname, customer ID)
- **Bill** — Fetched bills with amounts and due dates
- **BillPayment** — Payment records
- **RecurringBillPayment** — Autopay configuration (frequency, amount limits)

### 5.8 Support App (1 model)

- **SupportChat** — WebSocket-based real-time chat (messages stored as JSON)

**Total: 24 models across 8 apps**

## 6. API Summary

The backend exposes ~80 REST endpoints grouped into 11 tag categories:

| Tag           | Endpoints | Description                          |
|---------------|-----------|--------------------------------------|
| auth          | 13        | Register, login, logout, JWT, sessions, email verify, password reset |
| accounts      | 6         | Create, list, detail, status, credit score |
| transactions  | 6         | Transfer, balance, history, statement, PDF |
| analytics     | 1         | Spending analytics for customers     |
| fraud         | 2         | Flagged transactions, review          |
| loans         | 9         | Loan types, applications, approval, EMI calculator |
| credit-cards  | 21        | Card types, applications, cards, transactions, statements, rewards |
| bill-payments | 25        | Billers, saved billers, bills, payments, recurring, dashboard |
| notifications | 3         | List, mark read, mark all read        |
| 2fa           | 4         | TOTP setup, verify, disable, authenticate |
| admin         | 9         | User list, audit logs, analytics, customer 360 |

Full interactive documentation available at `/api/docs/` (Swagger UI) and `/api/redoc/` (ReDoc).

## 7. Key Design Decisions

| Decision                      | Rationale                                                    |
|-------------------------------|--------------------------------------------------------------|
| UUID primary keys             | Prevents IDOR via sequential ID enumeration                  |
| Double-entry transactions     | Each transfer = 1 DEBIT + 1 CREDIT for accurate audit trail |
| Idempotency keys              | Prevents duplicate transfers from network retries            |
| Non-blocking fraud detection  | ML failure should never block a valid transfer               |
| JWT with rotation + blacklist | Stateless auth with secure refresh token handling            |
| Separate ML microservice      | Independent scaling and model retraining without backend deploy |
| Django Channels for WS        | Real-time notifications and support chat without polling     |
| Encrypted card numbers        | PCI-DSS compliance for credit card data at rest              |
