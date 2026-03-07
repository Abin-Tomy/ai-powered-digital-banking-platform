# API Reference — AI-Powered Digital Banking Platform

> **Interactive docs:** Swagger UI at `/api/docs/` · ReDoc at `/api/redoc/` · OpenAPI schema at `/api/schema/`

## Authentication

All endpoints marked **Auth** require a JWT `Authorization: Bearer <access_token>` header.

Obtain tokens via `POST /api/auth/login/` → `{"access": "...", "refresh": "..."}`.

Refresh expired access tokens via `POST /api/auth/token/refresh/` with `{"refresh": "..."}`.

---

## Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register/` | Register a new user account | No |
| POST | `/api/auth/login/` | Login with email & password (returns JWT) | No |
| POST | `/api/auth/logout/` | Logout and blacklist refresh token | Yes |
| GET | `/api/auth/me/` | Get current authenticated user profile | Yes |
| POST | `/api/auth/token/refresh/` | Refresh JWT access token | No |
| POST | `/api/auth/send-verification/` | Resend email verification link | No |
| POST | `/api/auth/verify-email/` | Verify email with token | No |
| POST | `/api/auth/forgot-password/` | Request password reset email | No |
| GET | `/api/auth/reset-password/?token=<uuid>` | Validate password reset token | No |
| POST | `/api/auth/reset-password/` | Reset password with token | No |

## Two-Factor Authentication (2FA)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/2fa/setup/` | Generate TOTP secret and QR code | Yes |
| POST | `/api/auth/2fa/verify/` | Verify TOTP code to enable 2FA | Yes |
| POST | `/api/auth/2fa/disable/` | Disable 2FA (requires TOTP code) | Yes |
| POST | `/api/auth/2fa/authenticate/` | Authenticate with TOTP after login | No |

## Sessions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/sessions/` | List active sessions | Yes |
| DELETE | `/api/users/sessions/` | Revoke all other sessions | Yes |
| DELETE | `/api/users/sessions/<session_id>/` | Revoke a specific session | Yes |

## Accounts

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/accounts/create/` | Create a bank account | Admin |
| GET | `/api/accounts/my/` | List current user's accounts | Yes |
| GET | `/api/accounts/<account_id>/` | Get account details | Yes (owner) |
| GET | `/api/accounts/admin/all/` | List all accounts | Admin |
| POST | `/api/accounts/admin/<account_id>/status/` | Update account status | Admin |
| GET | `/api/users/credit-score/` | Get calculated credit score | Yes |

## Transactions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/transactions/transfer/` | Transfer funds (requires `Idempotency-Key` header) | Yes |
| POST | `/api/transactions/deposit/` | Deposit/fund an account | Admin |
| GET | `/api/transactions/<account_id>/` | List transactions (paginated, filterable) | Yes (owner) |
| GET | `/api/transactions/<account_id>/balance/` | Get account balance | Yes (owner) |
| GET | `/api/transactions/<account_id>/statement/` | Get statement (JSON, date range) | Yes (owner) |
| GET | `/api/transactions/<account_id>/statement/pdf/` | Download statement as PDF | Yes (owner) |

### Transfer Request Example

```json
POST /api/transactions/transfer/
Headers: { "Authorization": "Bearer <token>", "Idempotency-Key": "<uuid>" }
Body: {
  "from_account": "<account_uuid>",
  "to_account_number": "1234567890",
  "amount": "5000.00"
}
```

## Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/transactions/analytics/` | Customer spending analytics (6 months) | Yes |

## Fraud Detection

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/fraud/flags/` | List flagged transactions (paginated) | Admin/Support |
| POST | `/api/fraud/review/<fraud_id>/` | Review fraud flag (CONFIRMED_FRAUD / FALSE_POSITIVE) | Admin |

## Loans

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/loans/types/` | List available loan types | No |
| POST | `/api/loans/calculate-emi/` | Calculate EMI for given principal, rate, tenure | No |
| GET | `/api/loans/applications/` | List user's loan applications | Yes |
| POST | `/api/loans/applications/` | Submit a loan application | Yes |
| GET | `/api/loans/` | List user's active loans | Yes |
| GET | `/api/loans/<loan_id>/` | Get loan details with payment schedule | Yes |
| GET | `/api/loans/admin/applications/` | List all loan applications | Admin |
| POST | `/api/loans/admin/applications/<id>/approve/` | Approve or reject a loan | Admin |
| GET | `/api/loans/admin/all/` | List all loans | Admin |

### EMI Calculator Example

```json
POST /api/loans/calculate-emi/
Body: {
  "principal": 100000,
  "annual_interest_rate": 12.5,
  "tenure_months": 24
}
Response: {
  "emi": 4727.53,
  "total_payment": 113460.72,
  "total_interest": 13460.72,
  "amortization_schedule": [...]
}
```

## Credit Cards

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/credit-cards/types/` | List credit card types | No |
| POST | `/api/credit-cards/applications/create/` | Apply for a credit card | Customer |
| GET | `/api/credit-cards/applications/` | List card applications | Yes |
| GET/PATCH | `/api/credit-cards/applications/<pk>/` | View/update application | Yes |
| GET | `/api/credit-cards/` | List user's credit cards | Customer |
| GET/PATCH | `/api/credit-cards/<pk>/` | View/update credit card | Customer |
| POST | `/api/credit-cards/<card_id>/payment/` | Make a card payment | Customer |
| POST | `/api/credit-cards/<card_id>/block/` | Block a credit card | Customer |
| POST | `/api/credit-cards/<card_id>/unblock/` | Unblock a credit card | Customer |
| POST | `/api/credit-cards/<card_id>/pin/` | Set/change card PIN | Customer |
| GET | `/api/credit-cards/<card_id>/rewards/` | View reward points | Customer |
| GET/POST | `/api/credit-cards/transactions/` | List/create card transactions | Customer |
| GET/POST | `/api/credit-cards/<card_id>/transactions/` | Card-specific transactions | Customer |
| GET | `/api/credit-cards/statements/` | List all statements | Customer |
| GET | `/api/credit-cards/<card_id>/statements/` | Card-specific statements | Customer |
| GET | `/api/credit-cards/admin/cards/` | List all credit cards | Admin |
| GET | `/api/credit-cards/admin/applications/` | List all applications | Admin |

## Bill Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/bill-payments/dashboard/` | Bill payment dashboard overview | Customer |
| GET | `/api/bill-payments/categories/` | List biller categories | No |
| GET | `/api/bill-payments/billers/` | List billers (filter by `?category=<id>`) | No |
| GET | `/api/bill-payments/billers/<pk>/` | Get biller details | No |
| GET/POST | `/api/bill-payments/saved-billers/` | List/save billers | Customer |
| GET/PUT/DELETE | `/api/bill-payments/saved-billers/<pk>/` | Manage saved biller | Customer |
| GET | `/api/bill-payments/bills/` | List user's bills | Customer |
| GET | `/api/bill-payments/bills/<pk>/` | Get bill details | Customer |
| POST | `/api/bill-payments/bills/fetch/` | Fetch outstanding bills | Customer |
| GET/POST | `/api/bill-payments/payments/` | List/create bill payments | Customer |
| GET | `/api/bill-payments/payments/<pk>/` | Get payment details | Customer |
| POST | `/api/bill-payments/payments/summary/` | Get payment preview | Customer |
| GET/POST | `/api/bill-payments/recurring-payments/` | List/create recurring payments | Customer |
| GET/PUT/DELETE | `/api/bill-payments/recurring-payments/<pk>/` | Manage recurring payment | Customer |
| POST | `/api/bill-payments/recurring-payments/<pk>/pause/` | Pause recurring payment | Customer |
| POST | `/api/bill-payments/recurring-payments/<pk>/resume/` | Resume recurring payment | Customer |
| GET | `/api/bill-payments/admin/payments/` | List all payments | Admin |
| GET | `/api/bill-payments/admin/recurring-payments/` | List all recurring payments | Admin |

## Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications/` | List notifications (last 50) | Yes |
| POST | `/api/notifications/<pk>/read/` | Mark notification as read | Yes |
| POST | `/api/notifications/read-all/` | Mark all notifications as read | Yes |

## Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users/` | List all users (paginated) | Admin |
| GET | `/api/admin/audit-log/` | View audit logs (filterable) | Admin |
| GET | `/api/admin/analytics/` | Platform-wide dashboard analytics | Admin |
| GET | `/api/support/customer360/<user_id>/` | Customer 360° view | Admin/Support |

## Documentation

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/schema/` | OpenAPI 3.0 schema (JSON) | No |
| GET | `/api/docs/` | Swagger UI | No |
| GET | `/api/redoc/` | ReDoc | No |

## WebSocket Endpoints

| Endpoint | Description | Protocol |
|----------|-------------|----------|
| `ws://host/ws/support/<room>/` | Support chat room | WebSocket |
| `ws://host/ws/notifications/` | Real-time notifications | WebSocket |

## Error Responses

All endpoints return standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (success, no body) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid JWT) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate idempotency key) |
| 429 | Too Many Requests (rate limited) |

Error response body format:
```json
{ "detail": "Error message here" }
```
