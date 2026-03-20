# AI-POWERED DIGITAL BANKING PLATFORM
## Comprehensive Software Engineering Project Report

**Team 3 - MCA Programme**

**Members:**
- **Abin Tomy** — Backend Development & System Architecture
- **Elsa Maria** — Frontend Development & UI/UX
- **Naji Abdulla** — ML/AI Service & Fraud Detection

**Report Date:** March 2026

**Repository:** https://github.com/Abin-Tomy/ai-powered-digital-banking-platform

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Software Engineering Concepts](#software-engineering-concepts)
4. [System Architecture](#system-architecture)
5. [Project Structure](#project-structure)
6. [Technology Stack & Dependencies](#technology-stack--dependencies)
7. [Features Overview](#features-overview)
8. [Detailed Module Breakdown](#detailed-module-breakdown)
9. [Data Flow Architecture](#data-flow-architecture)
10. [Sprint Planning & Timeline](#sprint-planning--timeline)
11. [Team Responsibilities & Assignments](#team-responsibilities--assignments)
12. [Database Schema Overview](#database-schema-overview)
13. [API Architecture](#api-architecture)
14. [Security Features](#security-features)
15. [Testing Strategy](#testing-strategy)
16. [Key Achievements](#key-achievements)
17. [Challenges & Solutions](#challenges--solutions)
18. [Deployment Overview](#deployment-overview)
19. [Future Enhancements](#future-enhancements)
20. [Conclusion](#conclusion)

---

## EXECUTIVE SUMMARY

The **AI-Powered Digital Banking Platform** is a full-stack banking system that integrates modern web technologies with artificial intelligence for real-time fraud detection. Developed by Team 3 as an MCA project, this platform demonstrates comprehensive application of software engineering principles, including modular design, MVC architecture, Agile methodology, and incremental development.

**Key Highlights:**
- ✅ Full-stack implementation (Frontend, Backend, ML/AI Service)
- ✅ AI-powered real-time fraud detection using Isolation Forest
- ✅ ACID-compliant banking transactions with double-entry bookkeeping
- ✅ Role-based access control (Customer, Admin, Support)
- ✅ Secure authentication with JWT and 2FA support
- ✅ Real-time communication via WebSocket
- ✅ Comprehensive API documentation (Swagger/ReDoc)
- ✅ ~62% test coverage with 34+ test cases

**Technical Metrics:**
- **Frontend:** Next.js 16 with React 19, TypeScript, Tailwind CSS
- **Backend:** Django 6.0 with DRF, PostgreSQL 16, Redis 7
- **ML/AI:** FastAPI with scikit-learn (Isolation Forest algorithm)
- **Real-time:** Django Channels with WebSocket support
- **Containerization:** Docker & Docker Compose

---

## PROJECT OVERVIEW

### 1.1 Project Concept

The AI-Powered Digital Banking Platform is a realistic simulation of a modern digital banking system, incorporating:

1. **Customer Experience Layer** — Intuitive interface for account management, fund transfers, loans, credit cards, and bill payments
2. **Administrative Layer** — Dashboard for user management, fraud monitoring, analytics, and transaction review
3. **Support Layer** — Live chat interface for customer-support interaction
4. **Intelligent Layer** — AI-powered fraud detection that scores every transaction in real-time

### 1.2 Project Vision & Goals

**Vision:** Create a secure, scalable, and AI-intelligent banking platform that simulates real-world banking operations while demonstrating software engineering best practices.

**Goals:**
- Implement secure user authentication with multiple factors
- Build ACID-compliant transaction system with atomic operations
- Integrate AI-based fraud detection without compromising transaction speed
- Create responsive and intuitive user interfaces for all user roles
- Demonstrate Agile/Scrum methodology in team collaboration
- Deploy containerized microservices architecture
- Provide comprehensive documentation and API references

### 1.3 Problem Statement

Traditional banking systems often suffer from:
- **Delayed Fraud Detection** — Manual review processes cause delays
- **Limited Scalability** — Monolithic architectures struggle with growth
- **Poor User Experience** — Complex interfaces alienate users
- **Security Vulnerabilities** — Weak authentication and access control
- **Integration Challenges** — Diverse systems don't communicate effectively

**Solution:** This platform addresses these by providing:
- Real-time AI-powered fraud detection
- Microservices-based scalable architecture
- Modern, responsive interface
- Multi-factor authentication and role-based access control
- Seamless integration of frontend, backend, and ML services

---

## SOFTWARE ENGINEERING CONCEPTS

### 2.1 Software Development Models Applied

#### **2.1.1 Incremental Development Model**

The project was developed incrementally, with each sprint adding new functionality:

```
Sprint 1 ─→ Sprint 2 ─→ Sprint 3 ─→ Sprint 4 ─→ Sprint 5 ─→ Sprint 6 ─→ Sprint 7
  (Base)    (Auth)     (Accounts)   (Transactions) (Fraud)   (Integration) (Polish)
     ↓         ↓          ↓            ↓             ↓         ↓            ↓
   UI       Auth        Accounts    Transactions   ML/AI    Full Int.    Optimization
  Design   System       Mgmt         System      Detection  & Testing    & Deployment
```

**Benefits Realized:**
- Early identification of issues
- Continuous feedback from stakeholders
- Reduced risk through iterative delivery
- Better testing at each increment

#### **2.1.2 Agile & Scrum Methodology**

The project followed Agile principles with weekly sprints:

**Scrum Framework Components:**

| Component | Implementation |
|-----------|-----------------|
| **Sprint Duration** | 1 week |
| **Daily Standup** | 15-minute team sync |
| **Sprint Planning** | Beginning of sprint, define backlog items |
| **Sprint Review** | Demonstrate completed features |
| **Sprint Retrospective** | Team reflection and improvement |
| **Product Backlog** | GitHub Issues, Trello board |
| **Sprint Backlog** | Trello cards (To Do, In Progress, Done) |
| **Scrum Roles** | Product Owner, Scrum Master, Development Team |
| **Artifacts** | Increments, Burndown charts, Velocity tracking |

**Scrum Roles:**
- **Product Owner:** Defines requirements and prioritizes backlog
- **Scrum Master:** Facilitates ceremonies and removes obstacles
- **Development Team:** Implements features and resolves technical issues

#### **2.1.3 SDLC Phases (Waterfall Elements for Structure)**

While following Agile, the project adhered to standard SDLC phases:

1. **Requirement Analysis** — Define features, user stories, acceptance criteria
2. **System Design** — Architecture planning, database schema, data flow diagrams
3. **Implementation** — Coding each module, version control with Git
4. **Testing** — Unit tests, integration tests, system tests
5. **Deployment** — Dockerization, CI/CD pipeline setup
6. **Maintenance** — Bug fixes, performance optimization

---

### 2.2 Architectural Patterns

#### **2.2.1 MVC Architecture**

The system follows the Model-View-Controller pattern across all layers:

```
┌─────────────────────────────────────────────────────────────┐
│                         VIEW LAYER                          │
│  (Next.js Frontend - React Components, UI Pages)            │
├─────────────────────────────────────────────────────────────┤
│                      CONTROLLER LAYER                       │
│  (Django REST API - ViewSets, Serializers)                  │
├─────────────────────────────────────────────────────────────┤
│                       MODEL LAYER                           │
│  (Django ORM - Database Models, Business Logic)             │
├─────────────────────────────────────────────────────────────┤
│                    DATABASE LAYER                           │
│          (PostgreSQL - Persistent Data Storage)             │
└─────────────────────────────────────────────────────────────┘
```

**Separation of Concerns:**
- **Model:** Database entities, validations, relationships
- **View:** User interface components, forms, pages
- **Controller:** Request handling, business logic orchestration, response formatting

#### **2.2.2 Microservices Architecture**

The system employs microservices with clear boundaries:

```
┌────────────────┐     ┌──────────────┐     ┌────────────────┐
│   Frontend     │     │   Backend    │     │  ML Service    │
│   (Next.js)    │────→│  (Django)    │────→│  (FastAPI)     │
│                │     │              │     │                │
│ Port: 3000     │     │ Port: 8000   │     │ Port: 9000     │
└────────────────┘     └──────────────┘     └────────────────┘
       │                      │                      │
       │                      ↓                      │
       │              ┌──────────────┐              │
       │              │ PostgreSQL   │              │
       │              │ Database     │              │
       │              │ Port: 5432   │              │
       │              └──────────────┘              │
       │                                             │
       └─────────────────────────────────────────────┘
```

Each service:
- Owns its business domain
- Exposes REST API endpoints
- Connects to shared database
- Communicates via HTTP/REST

#### **2.2.3 Layered Architecture**

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Components, UI Pages)           │
├─────────────────────────────────────────┤
│        API Layer (REST)                 │
│  (Django Viewsets, Serializers)         │
├─────────────────────────────────────────┤
│        Business Logic Layer             │
│  (Services, Validators, Managers)       │
├─────────────────────────────────────────┤
│        Data Access Layer                │
│  (Django ORM, Query Builders)           │
├─────────────────────────────────────────┤
│        Database Layer                   │
│  (PostgreSQL, Indexes, Transactions)    │
└─────────────────────────────────────────┘
```

---

### 2.3 Design Principles Applied

#### **2.3.1 SOLID Principles**

- **S (Single Responsibility):** Each class/module has ONE reason to change
- **O (Open/Closed):** Open for extension, closed for modification
- **L (Liskov Substitution):** Derived classes can substitute base classes
- **I (Interface Segregation):** Many specific interfaces > one general interface
- **D (Dependency Inversion):** Depend on abstractions, not concretions

#### **2.3.2 DRY (Don't Repeat Yourself)**

- Shared utilities in `lib/` and `utils/` modules
- Reusable React components
- Django mixins for common functionality
- API serializers for consistent response format

#### **2.3.3 KISS (Keep It Simple, Stupid)**

- Clear naming conventions
- Minimal dependencies
- Straightforward logic flow
- Documented complex algorithms

---

## SYSTEM ARCHITECTURE

### 3.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                          │
│                     Customer | Admin | Support                      │
└────┬────────────────────────────────────────────────────────────────┘
     │
     │ HTTPS / WebSocket
     │
┌────▼────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js + React)                       │
│  • Customer Dashboard  • Admin Panel  • Support Chat  • Auth Pages  │
│  • State Management    • API Integration  • Real-time Updates       │
└────┬────────────────────────────────────────────────────────────────┘
     │
     │ REST API / WebSocket
     │
┌────▼────────────────────────────────────────────────────────────────┐
│                 API GATEWAY / BACKEND (Django DRF)                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Authentication   │ Authorization  │ Request Validation      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Users  │ Accounts │ Transactions │ Fraud │ Loans │ Cards    │  │
│  │ Module │ Module   │ Module       │Module │Module │ Module   │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ WebSocket Handler  │  Real-time Updates  │  Chat System      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────┬────────────────────────────────────────────────────────────────┘
     │
     ├──────────────────────┬──────────────────┬────────────────────┐
     │ SQL Queries          │ Cache Layer      │ API Requests       │
     │                      │                  │                    │
┌────▼────────────────┐ ┌──▼──────────────┐ ┌─▼──────────────────┐
│ PostgreSQL Database │ │ Redis Cache     │ │ ML Service (FastAPI)
│ (Port: 5432)        │ │ (Port: 6379)    │ │ (Port: 9000)
│                     │ │                 │ │
│ • Users             │ │ • Sessions      │ │ • Fraud Detection
│ • Accounts          │ │ • Cache Data    │ │ • Risk Scoring
│ • Transactions      │ │ • Rate Limits   │ │ • Model Inference
│ • Fraud Logs        │ │ • Notifications │ │
│ • Loans             │ │                 │ │
│ • Cards             │ │                 │ │
│ • Bills             │ │                 │ │
└─────────────────────┘ └─────────────────┘ └────────────────────┘
```

### 3.2 Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│              Docker Compose Environment                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Frontend    │  │  Backend     │  │  ML Service  │  │
│  │  Container   │  │  Container   │  │  Container   │  │
│  │ (Next.js)    │  │ (Django)     │  │ (FastAPI)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  PostgreSQL  │  │  Redis       │                    │
│  │  Container   │  │  Container   │                    │
│  └──────────────┘  └──────────────┘                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
         Docker Network: ai-banking-network
                (Service-to-Service Communication)
```

---

## PROJECT STRUCTURE

### 4.1 Complete Directory Structure

```
ai-powered-digital-banking-platform/
│
├── docker-compose.yml              # Multi-container orchestration
├── README.md                        # Quick start guide
├── PROJECT_REPORT_UPDATED.md        # Initial project report
├── COMPREHENSIVE_PROJECT_REPORT.md  # This file
│
├── backend/                         # Django REST Framework Backend
│   ├── Dockerfile                   # Container configuration
│   ├── manage.py                    # Django CLI
│   ├── requirements.txt             # Python dependencies
│   ├── pytest.ini                   # Testing configuration
│   ├── conftest.py                  # Pytest fixtures and configuration
│   ├── db.sqlite3                   # Local SQLite (dev only)
│   ├── seed_data.py                 # Database seeding script
│   ├── security_test_results.json   # Security audit results
│   │
│   ├── core/                        # Django core configuration
│   │   ├── settings.py              # Project settings, environment config
│   │   ├── urls.py                  # Root URL routing
│   │   ├── wsgi.py                  # WSGI production server
│   │   ├── asgi.py                  # ASGI WebSocket support
│   │   ├── exception_handlers.py    # Global exception handling
│   │   └── admin_analytics_views.py # Admin analytics views
│   │
│   ├── users/                       # User Management Module
│   │   ├── models.py                # Custom User model (CUSTOMER, ADMIN, SUPPORT)
│   │   ├── views.py                 # User APIs
│   │   ├── serializers.py           # User serialization
│   │   ├── urls.py                  # User endpoints
│   │   ├── admin.py                 # Admin configuration
│   │   ├── apps.py                  # App configuration
│   │   ├── tests.py                 # User model tests
│   │   └── utils.py                 # Helper functions
│   │
│   ├── accounts/                    # Account Management Module
│   │   ├── models.py                # Account model (Savings, Current)
│   │   ├── views.py                 # Account CRUD APIs
│   │   ├── serializers.py           # Account serialization
│   │   ├── urls.py                  # Account endpoints
│   │   ├── admin.py                 # Admin interface
│   │   ├── tests.py                 # Account tests
│   │   └── migrations/              # Database migrations
│   │
│   ├── transactions/                # Transaction Module
│   │   ├── models.py                # Transaction model with audit trail
│   │   ├── views.py                 # Transfer APIs, statement generation
│   │   ├── serializers.py           # Transaction serialization
│   │   ├── urls.py                  # Transaction endpoints
│   │   ├── admin.py                 # Admin transaction review
│   │   ├── tests.py                 # Transaction tests
│   │   └── migrations/              # Database migrations
│   │
│   ├── fraud/                       # Fraud Detection Module
│   │   ├── models.py                # Fraud alert model, audit logs
│   │   ├── views.py                 # Fraud endpoints
│   │   ├── serializers.py           # Fraud serialization
│   │   ├── urls.py                  # Fraud endpoints
│   │   ├── ai_service.py            # ML service integration
│   │   ├── consumers.py             # WebSocket fraud alerts
│   │   ├── routing.py               # WebSocket routing
│   │   ├── admin.py                 # Admin fraud monitoring
│   │   ├── tests/                   # Fraud detection tests
│   │   └── migrations/              # Database migrations
│   │
│   ├── loans/                       # Loans Module
│   │   ├── models.py                # Loan types, applications
│   │   ├── views.py                 # Loan management APIs
│   │   ├── serializers.py           # Loan serialization
│   │   ├── urls.py                  # Loan endpoints
│   │   ├── admin.py                 # Admin loan approval
│   │   ├── tests.py                 # Loan tests
│   │   └── migrations/              # Database migrations
│   │
│   ├── credit_cards/                # Credit Card Module
│   │   ├── models.py                # Card model, token storage
│   │   ├── encryption.py            # Fernet card data encryption
│   │   ├── views.py                 # Card application APIs
│   │   ├── serializers.py           # Card serialization
│   │   ├── urls.py                  # Card endpoints
│   │   ├── admin.py                 # Admin card management
│   │   ├── tests.py                 # Card tests
│   │   └── migrations/              # Database migrations
│   │
│   ├── bill_payments/               # Bill Payments Module
│   │   ├── models.py                # Biller, bill payment models
│   │   ├── views.py                 # Bill payment APIs
│   │   ├── serializers.py           # Bill serialization
│   │   ├── urls.py                  # Bill endpoints
│   │   ├── admin.py                 # Biller management
│   │   ├── tests.py                 # Bill payment tests
│   │   └── migrations/              # Database migrations
│   │
│   ├── support/                     # Support Module
│   │   ├── models.py                # Support ticket, chat message models
│   │   ├── views.py                 # Support APIs
│   │   ├── serializers.py           # Support serialization
│   │   ├── urls.py                  # Support endpoints
│   │   ├── admin.py                 # Support management
│   │   └── migrations/              # Database migrations
│   │
│   └── __pycache__/                 # Python cache
│
├── frontend/                        # Next.js Frontend
│   ├── Dockerfile                   # Container configuration
│   ├── package.json                 # Node.js dependencies
│   ├── package-lock.json            # Dependency lock file
│   ├── tsconfig.json                # TypeScript configuration
│   ├── next.config.ts               # Next.js configuration
│   ├── tailwind.config.mjs          # Tailwind CSS configuration
│   ├── postcss.config.mjs           # PostCSS configuration
│   ├── eslint.config.mjs            # ESLint configuration
│   ├── middleware.ts                # Next.js middleware (auth checks)
│   ├── components.json              # UI component configuration
│   ├── README.md                    # Frontend setup guide
│   │
│   ├── public/                      # Static assets
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── lib/                         # Shared utilities
│   │   ├── api/                     # Axios API client
│   │   ├── auth/                    # Authentication utilities
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── constants/               # Application constants
│   │   └── types/                   # TypeScript types
│   │
│   ├── components/                  # Reusable React Components
│   │   ├── ui/                      # UI components (Button, Card, etc.)
│   │   ├── layout/                  # Layout components (Header, Sidebar)
│   │   ├── forms/                   # Form components
│   │   └── common/                  # Common components (Loader, etc.)
│   │
│   ├── app/                         # Next.js app directory
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   │
│   │   ├── auth/                    # Authentication pages
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── customer/                # Customer portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Dashboard
│   │   │   ├── accounts/page.tsx
│   │   │   ├── transactions/page.tsx
│   │   │   └── transfers/page.tsx
│   │   │
│   │   ├── admin/                   # Admin panel
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             # Admin dashboard
│   │   │   ├── users/page.tsx
│   │   │   ├── fraud-monitoring/page.tsx
│   │   │   └── analytics/page.tsx
│   │   │
│   │   └── support/                 # Support portal
│   │       ├── layout.tsx
│   │       ├── page.tsx             # Support dashboard
│   │       └── chat/page.tsx
│   │
│   └── node_modules/                # Node.js dependencies
│
├── ml_service/                      # FastAPI ML Service
│   ├── Dockerfile                   # Container configuration
│   ├── app.py                       # FastAPI application
│   ├── requirements.txt             # Python dependencies
│   ├── notes.txt                    # Development notes
│   ├── fraud_model.pkl              # Trained Isolation Forest model
│   └── __pycache__/                 # Python cache
│
├── ml/                              # ML Training Scripts
│   ├── train_fraud_model.py         # Model training script
│   ├── requirements.txt             # ML dependencies
│   └── data/                        # Training data
│       └── synthetic_transactions.csv
│
├── devops/                          # DevOps & Deployment
│   ├── nginx.conf                   # Nginx reverse proxy config
│   ├── docker-compose.prod.yml      # Production Docker Compose
│   └── k8s/                         # Kubernetes manifests (future)
│
├── docs/                            # Documentation
│   ├── README.md                    # Documentation index
│   ├── DEVELOPER_SETUP.md           # Setup instructions
│   ├── ARCHITECTURE.md              # System architecture details
│   ├── API_REFERENCE.md             # API documentation
│   └── Screenshots/                 # UI screenshots
│
└── htmlcov/                         # Test coverage reports
```

### 4.2 Module Structure Detail

#### Backend Modules:
- **users/** — Authentication, user profiles, role management
- **accounts/** — Traditional and savings accounts
- **transactions/** — Fund transfers, statements, audit trail
- **fraud/** — Real-time fraud detection integration
- **loans/** — Loan products and applications
- **credit_cards/** — Card management with encryption
- **bill_payments/** — Biller management and autopay
- **support/** — Customer support tickets

#### Frontend Pages:
- **auth/** — Login, registration, password reset
- **customer/** — Dashboards, accounts, transactions, transfers
- **admin/** — Management dashboards, analytics
- **support/** — Support chat interface

---

## TECHNOLOGY STACK & DEPENDENCIES

### 5.1 Technology Stack Overview

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 16.1.1 | React framework with SSR |
| | React | 19.2.3 | UI component library |
| | TypeScript | 5 | Type-safe JavaScript |
| | Tailwind CSS | 4 | Utility-first styling |
| | Axios | 1.13.2 | HTTP client |
| | Radix UI | Latest | Accessible UI components |
| | Recharts | 3.8.0 | Data visualization |
| **Backend** | Django | 6.0 | Python web framework |
| | DRF | 3.16.1 | REST API framework |
| | SimpleJWT | 5.5.1 | JWT authentication |
| | Channels | 4.1.0 | WebSocket support |
| | PostgreSQL | 16 | Relational database |
| | Psycopg2 | 2.9.11 | PostgreSQL adapter |
| | Cryptography | 42.0.0 | Encryption library |
| | PyOTP | 2.9.0 | 2FA (TOTP) support |
| **ML/AI** | FastAPI | 0.110.1 | Python API framework |
| | scikit-learn | 1.7.2 | ML algorithms |
| | Isolation Forest | Built-in | Anomaly detection |
| | Pandas | 2.3.3 | Data processing |
| | NumPy | 1.24.0 | Numerical computing |
| | Joblib | 1.5.2 | Model persistence |
| **Cache & Queue** | Redis | 7 | Caching layer |
| | Channels-Redis | 4.2.0 | Redis backend for Channels |
| **Documentation** | drf-spectacular | 0.27.0 | OpenAPI schema generation |
| **Email** | Resend | 2.0.0 | Email service |
| **Testing** | Pytest | 8.0.0 | Testing framework |
| | pytest-django | 4.8.0 | Django test utilities |
| | pytest-cov | 5.0.0 | Coverage reporting |
| | Factory-boy | 3.3.0 | Test fixture factory |
| **Containerization** | Docker | Latest | Container runtime |
| | Docker Compose | Latest | Multi-container orchestration |

### 5.2 Backend Dependencies

#### Core Framework
```
Django==6.0
djangorestframework==3.16.1
django-cors-headers==4.9.0
asgiref>=3.8.0
```

#### Authentication & Security
```
djangorestframework-simplejwt==5.5.1
PyJWT==2.10.1
cryptography>=42.0.0
pyotp>=2.9.0
qrcode[pil]>=7.4.2
Pillow>=10.0.0
django-ratelimit>=4.1.0
```

#### Real-time Communication
```
channels==4.1.0
channels-redis==4.2.0
daphne==4.1.2
```

#### Database & ORM
```
psycopg[binary]==3.3.2
psycopg2-binary==2.9.11
```

#### Additional Services
```
requests==2.32.5           # HTTP requests for ML service
resend>=2.0.0              # Email service
reportlab>=4.1.0           # PDF generation
python-dotenv==1.2.1       # Environment variable management
python-dateutil>=2.8.0     # Date utilities
user-agents>=2.2.0         # User agent parsing
drf-spectacular>=0.27.0    # API documentation
```

#### Testing
```
pytest>=8.0.0
pytest-django>=4.8.0
pytest-cov>=5.0.0
factory-boy>=3.3.0
```

### 5.3 Frontend Dependencies

#### Core Framework
```json
{
  "next": "16.1.1",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "typescript": "^5"
}
```

#### UI & Styling
```json
{
  "@radix-ui/react-checkbox": "^1.3.3",
  "@radix-ui/react-label": "^2.1.8",
  "@radix-ui/react-progress": "^1.1.8",
  "@radix-ui/react-radio-group": "^1.3.8",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-slot": "^1.2.4",
  "@radix-ui/react-tabs": "^1.1.13",
  "tailwindcss": "^4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0"
}
```

#### Utilities & Integrations
```json
{
  "axios": "^1.13.2",
  "lucide-react": "^0.563.0",
  "recharts": "^3.8.0"
}
```

### 5.4 ML/AI Service Dependencies

```
fastapi==0.110.1
uvicorn==0.25.0
scikit-learn==1.7.2
pandas==2.3.3
joblib==1.5.2
pydantic==2.12.4
numpy>=1.24.0
```

---

## FEATURES OVERVIEW

### 6.1 Core Features

#### 6.1.1 User Management
- ✅ Custom user model with role-based access (CUSTOMER, ADMIN, SUPPORT)
- ✅ Email-based authentication (instead of username)
- ✅ JWT token-based authorization
- ✅ Account lockout mechanism after failed login attempts
- ✅ User verification status tracking
- ✅ Password reset via secure email links
- ✅ 2FA support with TOTP (Time-based One-Time Password)

#### 6.1.2 Account Management
- ✅ Create and manage multiple account types (Savings, Current)
- ✅ Unique account number generation (business rule validation)
- ✅ Account status management (ACTIVE, FROZEN, CLOSED)
- ✅ One savings account per customer (business rule enforcement)
- ✅ Admin deposit functionality for account initialization
- ✅ Account balance calculation with running balance
- ✅ Account statement generation with transaction history

#### 6.1.3 Transaction System
- ✅ Secure fund transfers between accounts
- ✅ ACID-compliant transactions with atomic operations
- ✅ Double-entry bookkeeping system
- ✅ Idempotency key mechanism to prevent duplicate transactions
- ✅ Comprehensive validation:
  - Account status checks
  - Balance sufficiency verification
  - Self-transfer prevention
  - Daily transaction limits
- ✅ Transaction audit trail
- ✅ Real-time balance updates
- ✅ PDF statement export

#### 6.1.4 Loan Management
- ✅ Multiple loan types (Personal, Home, Educational)
- ✅ Loan application workflow
- ✅ Automated EMI calculation
- ✅ Admin approval process
- ✅ Repayment schedule generation
- ✅ Loan status tracking

#### 6.1.5 Credit Card Management
- ✅ Credit card application and activation
- ✅ Fernet-encrypted card data storage (security best practice)
- ✅ Card status management
- ✅ Limit setting (per customer)
- ✅ Card expiry management

#### 6.1.6 Bill Payments
- ✅ Biller management (add, edit, delete)
- ✅ One-time bill payments
- ✅ Autopay scheduling (daily, weekly, monthly)
- ✅ Payment history tracking
- ✅ Recurring payment support

#### 6.1.7 Fraud Detection
- ✅ AI-powered real-time fraud detection
- ✅ Isolation Forest ML model for anomaly detection
- ✅ 8-dimensional feature engineering:
  - Transaction amount
  - Transaction hour
  - Device trust score
  - Transaction velocity (24-hour window)
  - Cardholder age
  - Foreign transaction flag
  - Location mismatch detection
  - Merchant category classification
- ✅ Risk scoring (0-100 scale)
- ✅ Automatic flagging of suspicious transactions
- ✅ Real-time fraud alerts via WebSocket
- ✅ Admin fraud monitoring dashboard
- ✅ Fraud fallback mechanism if ML service is unavailable

#### 6.1.8 Real-time Communication
- ✅ WebSocket-based real-time updates
- ✅ Live fraud alerts to admin
- ✅ Customer support chat
- ✅ Transaction notifications
- ✅ System notifications

#### 6.1.9 Security Features
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ CORS protection
- ✅ CSRF token validation
- ✅ Rate limiting on API endpoints
- ✅ Data encryption (Fernet for sensitive data)
- ✅ HTTPS-only communication in production
- ✅ Secure password hashing (Django default: PBKDF2)
- ✅ SQL injection prevention (Django ORM)
- ✅ XSS protection in templates

#### 6.1.10 Admin Features
- ✅ User management dashboard
- ✅ Transaction monitoring and audit
- ✅ Fraud review and override capabilities
- ✅ Analytics dashboard with charts
- ✅ System health monitoring
- ✅ Manual deposit functionality
- ✅ Report generation

#### 6.1.11 Support Features
- ✅ Live customer support chat
- ✅ Support ticket system
- ✅ Chat history storage
- ✅ Support status tracking
- ✅ Escalation management

#### 6.1.12 Notification System
- ✅ In-app notifications
- ✅ Email notifications
- ✅ Real-time push notifications
- ✅ Notification history
- ✅ Mark as read/unread
- ✅ Notification preferences

#### 6.1.13 Reporting & Analytics
- ✅ Transaction analytics
- ✅ User engagement metrics
- ✅ Fraud detection metrics
- ✅ Revenue analytics (for admin)
- ✅ Custom report generation
- ✅ Data export features

### 6.2 Non-Technical Features

- **User-Friendly Interface** — Intuitive navigation for all user roles
- **Responsive Design** — Works seamlessly on desktop, tablet, mobile
- **Accessibility** — WCAG 2.1 AA compliance (Radix UI components)
- **Language Support** — Ready for multi-language implementation
- **Data Privacy** — Complies with data protection regulations
- **Help & Documentation** — In-app help sections and tooltips

---

## DETAILED MODULE BREAKDOWN

### 7.1 Backend Module Architecture

#### **7.1.1 Users Module (User Management)**

**Location:** `backend/users/`

**Responsibilities:**
- Custom user model extending Django's AbstractUser
- Authentication and authorization
- User profile management
- Role assignment (CUSTOMER, ADMIN, SUPPORT)
- Account lockout mechanism
- Failed login tracking
- Verification status management

**Key Models:**
```python
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('CUSTOMER', 'Customer'),
        ('ADMIN', 'Administrator'),
        ('SUPPORT', 'Support Staff')
    )
    
    email = EmailField(unique=True)
    role = CharField(choices=ROLE_CHOICES)
    is_verified = BooleanField(default=False)
    failed_login_attempts = IntegerField(default=0)
    is_locked = BooleanField(default=False)
    locked_until = DateTimeField(nullable=True)
```

**Key Endpoints:**
- `POST /api/auth/register/` — User registration
- `POST /api/auth/login/` — User login with JWT token
- `POST /api/auth/refresh/` — Token refresh
- `GET /api/users/profile/` — Get user profile
- `PUT /api/users/profile/` — Update profile
- `POST /api/auth/2fa/setup/` — Setup 2FA
- `POST /api/auth/2fa/verify/` — Verify 2FA token

#### **7.1.2 Accounts Module (Account Management)**

**Location:** `backend/accounts/`

**Responsibilities:**
- Account creation and lifecycle management
- Account number generation (unique, sequential)
- Balance management
- Account status management
- Savings vs Current account differentiation
- Business rule enforcement

**Key Models:**
```python
class Account(Model):
    ACCOUNT_TYPES = (
        ('SAVINGS', 'Savings'),
        ('CURRENT', 'Current')
    )
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('FROZEN', 'Frozen'),
        ('CLOSED', 'Closed')
    )
    
    user = ForeignKey(User, on_delete=CASCADE)
    account_number = CharField(unique=True)
    account_type = CharField(choices=ACCOUNT_TYPES)
    status = CharField(choices=STATUS_CHOICES)
    balance = DecimalField(max_digits=12, decimal_places=2)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**Key Endpoints:**
- `POST /api/accounts/` — Create account (admin only)
- `GET /api/accounts/` — List user accounts
- `GET /api/accounts/{id}/` — Account details
- `GET /api/accounts/{id}/balance/` — Current balance
- `GET /api/accounts/{id}/statement/` — Account statement
- `PUT /api/accounts/{id}/freeze/` — Freeze account (admin)
- `PUT /api/accounts/{id}/close/` — Close account (admin)

#### **7.1.3 Transactions Module (Transaction Management)**

**Location:** `backend/transactions/`

**Responsibilities:**
- Fund transfer processing
- ACID compliance and atomic operations
- Double-entry bookkeeping
- Idempotency handling
- Transaction validation
- Balance updates
- Statement generation

**Key Models:**
```python
class Transaction(Model):
    TYPES = (
        ('CREDIT', 'Credit'),
        ('DEBIT', 'Debit')
    )
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    )
    
    from_account = ForeignKey(Account)
    to_account = ForeignKey(Account)
    amount = DecimalField(max_digits=12, decimal_places=2)
    type = CharField(choices=TYPES)
    status = CharField(choices=STATUS_CHOICES)
    description = TextField()
    created_at = DateTimeField(auto_now_add=True)
    idempotency_key = CharField(unique=True)
    
class Balance(Model):
    account = ForeignKey(Account, unique=True)
    running_balance = DecimalField(max_digits=12, decimal_places=2)
    last_updated = DateTimeField(auto_now=True)
```

**Key Endpoints:**
- `POST /api/transactions/transfer/` — Fund transfer with validation
- `GET /api/transactions/` — Transaction history
- `GET /api/transactions/{id}/` — Transaction details
- `GET /api/transactions/statement/` — Statement generation
- `POST /api/admin/deposit/` — Admin deposit (admin only)

#### **7.1.4 Fraud Module (Fraud Detection)**

**Location:** `backend/fraud/`

**Responsibilities:**
- Integration with ML service
- Fraud alert triggering
- Real-time scoring
- Logging and auditing
- WebSocket notifications
- Admin review interface

**Key Models:**
```python
class FraudAlert(Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('REVIEWED', 'Reviewed'),
        ('CONFIRMED', 'Confirmed'),
        ('FALSE_POSITIVE', 'False Positive')
    )
    
    transaction = ForeignKey(Transaction)
    risk_score = FloatField()
    is_fraud_detected = BooleanField()
    features = JSONField()  # Serialized feature data
    status = CharField(choices=STATUS_CHOICES)
    admin_notes = TextField(blank=True)
    reviewed_by = ForeignKey(Admin, nullable=True)
    created_at = DateTimeField(auto_now_add=True)
```

**Key Endpoints:**
- `POST /api/fraud/check/` — Check transaction for fraud (internal)
- `GET /api/fraud/alerts/` — Fraud alerts (admin)
- `PUT /api/fraud/alerts/{id}/status/` — Update alert status (admin)
- `WebSocket /ws/fraud/alerts/` — Real-time fraud alerts

#### **7.1.5 Loans Module (Loan Management)**

**Location:** `backend/loans/`

**Responsibilities:**
- Loan product management
- Loan application workflow
- EMI calculation
- Approval process
- Repayment schedule

**Key Models:**
```python
class LoanType(Model):
    name = CharField()
    interest_rate = DecimalField()
    tenure_months = IntegerField()
    max_amount = DecimalField()
    
class LoanApplication(Model):
    STATUS_CHOICES = (
        ('APPLIED', 'Applied'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('ACTIVE', 'Active'),
        ('CLOSED', 'Closed')
    )
    
    user = ForeignKey(User)
    loan_type = ForeignKey(LoanType)
    amount = DecimalField()
    status = CharField(choices=STATUS_CHOICES)
    created_at = DateTimeField(auto_now_add=True)
```

#### **7.1.6 Credit Cards Module**

**Location:** `backend/credit_cards/`

**Responsibilities:**
- Card application processing
- Card data encryption
- Card activation
- Limit management

**Key Models:**
```python
class CreditCard(Model):
    user = ForeignKey(User)
    encrypted_card_data = BinaryField()  # Fernet encrypted
    status = CharField(choices=STATUS_CHOICES)
    limit = DecimalField()
    used_limit = DecimalField(default=0)
```

#### **7.1.7 Bill Payments Module**

**Location:** `backend/bill_payments/`

**Responsibilities:**
- Biller management
- Payment processing
- Autopay scheduling

**Key Models:**
```python
class Biller(Model):
    name = CharField()
    account_number = CharField()
    category = CharField()
    
class BillPayment(Model):
    user = ForeignKey(User)
    biller = ForeignKey(Biller)
    amount = DecimalField()
    payment_date = DateField()
    is_recurring = BooleanField()
    recurrence_pattern = CharField()  # DAILY, WEEKLY, MONTHLY
```

#### **7.1.8 Support Module**

**Location:** `backend/support/`

**Responsibilities:**
- Support ticket management
- Chat message storage
- Support staff assignment

**Key Models:**
```python
class SupportTicket(Model):
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved')
    )
    
    customer = ForeignKey(User)
    subject = CharField()
    status = CharField(choices=STATUS_CHOICES)
    created_at = DateTimeField(auto_now_add=True)
    resolved_at = DateTimeField(nullable=True)
    
class ChatMessage(Model):
    ticket = ForeignKey(SupportTicket)
    sender = ForeignKey(User)
    message = TextField()
    timestamp = DateTimeField(auto_now_add=True)
```

### 7.2 Frontend Module Architecture

#### **7.2.1 Authentication Module**
- `/auth/login` — User login
- `/auth/register` — Account registration
- `/auth/forgot-password` — Password recovery
- `/auth/reset-password` — Password reset via email link

**Features:**
- Form validation
- Error handling
- JWT token management
- Cookie-based session storage

#### **7.2.2 Customer Portal**
- `/customer/dashboard` — Overview and quick actions
- `/customer/accounts` — Account listing and details
- `/customer/transactions` — Transaction history
- `/customer/transfers` — Fund transfer interface
- `/customer/loans` — Loan applications
- `/customer/cards` — Credit card management
- `/customer/bills` — Bill payments and autopay
- `/customer/support` — Support chat

**Features:**
- Real-time balance updates
- Transaction filtering and search
- PDF statement export
- Transaction receipt generation

#### **7.2.3 Admin Dashboard**
- `/admin/dashboard` — Admin overview
- `/admin/users` — User management
- `/admin/transactions` — Transaction monitoring
- `/admin/fraud-monitoring` — Fraud alert review
- `/admin/analytics` — System analytics and reports

**Features:**
- User creation and management
- Manual deposits
- Fraud alert review and override
- System health monitoring
- Charts and metrics

#### **7.2.4 Support Portal**
- `/support/dashboard` — Support overview
- `/support/chat` — Customer chat interface

**Features:**
- Ticket management
- Real-time chat
- Chat history

### 7.3 ML/AI Service Module

#### **7.3.1 Service Architecture**

**Location:** `ml_service/app.py`

**Framework:** FastAPI

**Key Endpoint:** `POST /predict`

**Purpose:** Real-time fraud detection for transactions

**Input Schema:**
```python
class TransactionFeatures(BaseModel):
    transaction_amount: float
    transaction_hour: int
    device_trust_score: float
    transaction_velocity: int  # Transactions in last 24h
    cardholder_age: int
    is_foreign: bool
    location_mismatch: bool
    merchant_category: str
```

**Output Schema:**
```python
class FraudPrediction(BaseModel):
    is_fraud: bool
    risk_score: float  # 0-1
    confidence: float
    features_used: dict
```

**Model Details:**
- **Algorithm:** Isolation Forest
- **Estimators:** 300
- **Contamination:** 2% (assumes 2% of transactions are fraudulent)
- **Features:** 8-dimensional
- **Preprocessing:** StandardScaler + OneHotEncoder
- **Latency Target:** <3 seconds

**Feature Engineering:**
1. **Transaction Amount** — Normalized by historical average
2. **Transaction Hour** — Time of day (0-23)
3. **Device Trust Score** — Historical device reliability (0-1)
4. **Transaction Velocity** — Number of transactions in 24h
5. **Cardholder Age** — Normalized age
6. **Foreign Transaction Flag** — Cross-border transaction
7. **Location Mismatch** — Transaction location vs registered address
8. **Merchant Category** — Dynamic merchant classification

#### **7.3.2 Training Pipeline**

**Location:** `ml/train_fraud_model.py`

**Pipeline Steps:**
1. Load synthetic dataset
2. Feature engineering
3. Data preprocessing (scaling + encoding)
4. Model training with cross-validation
5. Model evaluation (accuracy, precision, recall, F1)
6. Model serialization (joblib)

**Dataset:**
- Synthetic credit card transactions
- ~10,000 samples
- 2% fraud rate
- Generated with realistic patterns

---

## DATA FLOW ARCHITECTURE

### 8.1 Transaction Processing Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER INITIATES TRANSFER (Frontend)                           │
│    - Enter recipient account, amount, description               │
│    - Frontend validates input (balance, account type, formats)  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. API REQUEST (Frontend → Backend)                             │
│    POST /api/transactions/transfer/                             │
│    {                                                             │
│      from_account: UUID,                                        │
│      to_account: UUID,                                          │
│      amount: Decimal,                                           │
│      idempotency_key: UUID                                      │
│    }                                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. AUTHENTICATION & AUTHORIZATION (Django)                      │
│    - Verify JWT token                                           │
│    - Verify user owns from_account                              │
│    - Check role-based permissions                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. IDEMPOTENCY CHECK (Django)                                   │
│    - Check if idempotency_key exists in database                │
│    - If yes, return previous response (prevent duplicates)      │
│    - If no, proceed with transaction                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. VALIDATION (Django ORM)                                      │
│    - Verify from_account exists and is ACTIVE                  │
│    - Verify to_account exists and is ACTIVE                    │
│    - Check balance sufficiency (balance ≥ amount)              │
│    - Prevent self-transfers                                    │
│    - Verify amount > 0                                          │
│    - Check daily transaction limits                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
    ┌──────────────────┐ ┌──────────────────────────┐
    │ VALIDATION FAILS │ │ VALIDATION PASSES        │
    │                  │ │                          │
    │ Return Error     │ │ Continue to Fraud Check  │
    │ 400/422          │ │                          │
    └──────────────────┘ └────────┬─────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. FRAUD DETECTION (Django → ML Service)                        │
│    - Extract transaction features                               │
│    - Call ML Service /predict endpoint                          │
│    │                                                             │
│    └─────► POST http://ml_service:9000/predict/                │
│             {                                                   │
│               transaction_amount: 5000,                        │
│               transaction_hour: 14,                            │
│               device_trust_score: 0.95,                        │
│               transaction_velocity: 3,                          │
│               cardholder_age: 35,                              │
│               is_foreign: false,                               │
│               location_mismatch: false,                        │
│               merchant_category: "Retail"                      │
│             }                                                   │
│                                                                │
│    Response:                                                   │
│    {                                                            │
│      is_fraud: false,                                          │
│      risk_score: 0.15,                                         │
│      confidence: 0.98                                          │
│    }                                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
              ┌──────┴──────────────────┐
              │                         │
              ▼                         ▼
    ┌──────────────────────┐  ┌────────────────────────┐
    │ FRAUD DETECTED       │  │ NO FRAUD DETECTED      │
    │ (risk_score > 0.7)   │  │ (risk_score ≤ 0.7)     │
    │                      │  │                        │
    │ Create FraudAlert    │  │ Continue with          │
    │ Mark transaction     │  │ Transaction Processing │
    │ status: PENDING      │  │                        │
    │                      │  │                        │
    │ Notify Admin         │  │                        │
    │ via WebSocket        │  │                        │
    │                      │  │                        │
    │ Hold transaction     │  │                        │
    │ for review           │  │                        │
    └──────────────────────┘  └────────┬───────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. ATOMIC TRANSACTION (Database Transaction)                    │
│    BEGIN TRANSACTION                                            │
│    ├─ Debit from_account: -amount                             │
│    ├─ Credit to_account: +amount                              │
│    ├─ Create Transaction log entry                            │
│    ├─ Update Account balances                                 │
│    ├─ Update Balance cache                                    │
│    └─ Create FraudAlert if fraud detected                     │
│    COMMIT TRANSACTION                                         │
│    (If any step fails, ROLLBACK entire transaction)          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. CACHE UPDATE (Redis)                                         │
│    - Update account balance in Redis cache                     │
│    - Invalidate statement cache                                │
│    - Update user session data                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. REAL-TIME NOTIFICATIONS (WebSocket)                          │
│    - Send balance update to sender                             │
│    - Send balance update to receiver                           │
│    - Send transaction notification to receiver                │
│    - Send fraud alert to admin (if fraud detected)            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. API RESPONSE (Backend → Frontend)                           │
│     200 OK                                                      │
│     {                                                           │
│       transaction_id: UUID,                                    │
│       status: "COMPLETED",                                     │
│       from_balance: Decimal,                                   │
│       to_balance: Decimal,                                     │
│       timestamp: ISO8601,                                      │
│       fraud_alert: {                                           │
│         detected: boolean,                                     │
│         risk_score: float                                      │
│       }                                                         │
│     }                                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 11. UI UPDATE (Frontend)                                        │
│     - Update sender balance                                    │
│     - Update transaction list                                  │
│     - Show success message                                     │
│     - Optionally show fraud warning                            │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Fraud Detection System Data Flow

```
┌──────────────────────────────────────┐
│ Transaction from Frontend            │
├──────────────────────────────────────┤
│ amount: 50,000                       │
│ from_account: ACC123                 │
│ to_account: ACC456                   │
│ timestamp: 2026-03-19 14:30:00       │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────┐
│ FEATURE EXTRACTION (Backend)                                   │
│ ├─ transaction_amount = 50000                                 │
│ ├─ transaction_hour = 14                                      │
│ ├─ device_trust_score = 0.95 (from device fingerprint)       │
│ ├─ transaction_velocity = 3 (3 txns in last 24h)            │
│ ├─ cardholder_age = 35                                        │
│ ├─ is_foreign = False                                         │
│ ├─ location_mismatch = False                                  │
│ └─ merchant_category = "Retail"                              │
└──────────────────┬─────────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────┐
│ ML SERVICE PREPROCESSING                                       │
│ ├─ StandardScaler on numeric features                         │
│ │  ├─ transaction_amount: -0.2 (normalized)                  │
│ │  ├─ transaction_hour: 0.5 (normalized)                     │
│ │  ├─ device_trust_score: 1.2 (normalized)                  │
│ │  ├─ transaction_velocity: 0.8 (normalized)                │
│ │  └─ cardholder_age: -0.1 (normalized)                     │
│ │                                                             │
│ └─ OneHotEncoder on categorical features                      │
│    ├─ is_foreign: [1, 0]                                     │
│    └─ merchant_category: [0, 1, 0, ...] (one-hot vector)    │
└──────────────────┬─────────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────┐
│ ISOLATION FOREST MODEL INFERENCE                              │
│ ├─ Model: Isolation Forest (300 estimators)                   │
│ ├─ Contamination: 2%                                          │
│ │                                                             │
│ │ Algorithm:                                                  │
│ │  1. Build random decision trees                           │
│ │  2. Isolate each point recursively                        │
│ │  3. Calculate anomaly score                               │
│ │     - Shorter path to isolation → Higher anomaly         │
│ │     - Longer path to isolation → Lower anomaly           │
│ │                                                             │
│ └─ Scoring:                                                   │
│    - Normal transaction: score = 0.15                        │
│    - Anomalous transaction: score = 0.85                    │
│    - Highly anomalous: score > 0.7                          │
└──────────────────┬─────────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────┐
│ PREDICTION RESULT                                              │
│ {                                                              │
│   is_fraud: False,                                            │
│   risk_score: 0.15,                                           │
│   confidence: 0.98,                                           │
│   features_used: [array of normalized features]              │
│ }                                                              │
└──────────────────┬─────────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────┐
│ BACKEND DECISION LOGIC                                         │
│                                                                │
│ if risk_score > 0.7:                                          │
│   ├─ Create FraudAlert                                        │
│   ├─ Set transaction status to PENDING                       │
│   ├─ Notify Admin via WebSocket                              │
│   └─ Block transaction (requires admin review)               │
│                                                                │
│ else:                                                          │
│   ├─ Process transaction normally                            │
│   ├─ Log fraud check result                                  │
│   └─ Complete transaction                                    │
└────────────────────────────────────────────────────────────────┘
```

### 8.3 User Authentication Data Flow

```
Frontend (Login Page)
  │
  ├─→ User Email + Password
  │
  ▼
Backend API: POST /api/auth/login/
  ├─ Lookup user by email
  ├─ Verify password (PBKDF2 hashing)
  ├─ Check account lockout status
  ├─ Generate JWT tokens (access + refresh)
  ├─ Create session in database
  │
  └─→ Response: { access_token, refresh_token, user_data }
      │
      ▼
  Frontend Storage
  ├─ Store tokens in secure httpOnly cookies
  ├─ Store user data in localStorage
  │
  ▼
Subsequent API Requests
  ├─ Include JWT in Authorization header
  ├─ Backend validates JWT signature
  ├─ Middleware checks token expiry
  ├─ Verify user permissions/roles
  │
  └─→ Process request or reject with 401/403

Token Refresh Flow (when access token expires):
  ├─ Send refresh_token to POST /api/auth/refresh/
  ├─ Backend validates refresh_token
  ├─ Generate new access_token
  └─→ Continue with new token
```

---

## SPRINT PLANNING & TIMELINE

### 9.1 Overall Sprint Structure

**Total Duration:** 7 Sprints (7 weeks)

**Sprint Duration:** 1 week per sprint

**Cadence:** Weekly sprint planning Monday, Demo & Retrospective Friday

### 9.2 Detailed Sprint Breakdown

#### **Sprint 1: Project Foundation & UI Design (Week 1)**

**Goals:**
- Set up project repositories and infrastructure
- Design UI/UX mockups for all portals
- Configure development environment
- Deploy Docker infrastructure

**Tasks:**
- Project initialization (Django, Next.js, FastAPI)
- Git repository setup with branching strategy
- Docker Compose configuration
- Database schema design
- Frontend component library setup
- UI/UX design in Figma

**Deliverables:**
- ✅ Git repository with proper structure
- ✅ Docker Compose working environment
- ✅ Database schema documentation
- ✅ UI mockups for 3 portals
- ✅ Component library foundation

**Team Assignments:**
- **Abin:** Backend setup, database design, Docker
- **Elsa:** UI/UX design, component library setup
- **Naji:** ML service skeleton, requirements

---

#### **Sprint 2: Authentication & User Management (Week 2)**

**Goals:**
- Implement user model with role-based access
- Build authentication system (JWT)
- Create login/registration pages
- Set up 2FA framework

**Backend Tasks:**
- Custom User model with roles (CUSTOMER, ADMIN, SUPPORT)
- JWT authentication implementation
- Password hashing and security
- Account lockout mechanism
- User verification system
- Email verification flow

**Frontend Tasks:**
- Login page (email + password)
- Registration page (with validation)
- Password reset/forgot password flow
- Session management
- Auth guards and redirects

**Deliverables:**
- ✅ Custom user model with roles
- ✅ JWT token system (access + refresh)
- ✅ Login/registration working
- ✅ Account lockout mechanism
- ✅ Auth middleware in frontend

**Team Assignments:**
- **Abin:** User model, JWT implementation, security
- **Elsa:** Auth UI pages, session management
- **Naji:** Supporting backend tasks

---

#### **Sprint 3: Account Management (Week 3)**

**Goals:**
- Implement account creation and management
- Build account number generation
- Create account listing/detail pages
- Implement balance calculation

**Backend Tasks:**
- Account model (Savings, Current)
- Unique account number generation
- Account status management
- Balance calculation logic
- Admin deposit functionality
- Account validation rules
- Account serializers

**Frontend Tasks:**
- Account listing page
- Account details page
- Account creation form (admin)
- Balance display component
- Account statement page (mock data)

**Deliverables:**
- ✅ Account model with validation
- ✅ Account CRUD APIs
- ✅ Account listing/detail UI
- ✅ Balance calculation service
- ✅ Admin account creation

**Team Assignments:**
- **Abin:** Account model, APIs, balance logic
- **Elsa:** Account UI pages, listings
- **Naji:** Data seeding, test data

---

#### **Sprint 4: Transaction System (Week 4)**

**Goals:**
- Build transaction processing engine
- Implement ACID compliance
- Create fund transfer APIs
- Build transaction UI

**Backend Tasks:**
- Transaction model with audit trail
- Fund transfer logic with atomic operations
- Idempotency key mechanism
- Double-entry bookkeeping
- Comprehensive validation
- Transaction statement generation
- PDF export functionality

**Frontend Tasks:**
- Fund transfer form
- Transaction history display
- Statement view
- PDF download
- Transfer confirmation modal

**Deliverables:**
- ✅ Atomic transaction processing
- ✅ Idempotency working
- ✅ Fund transfer APIs
- ✅ Transaction history UI
- ✅ Statement generation

**Team Assignments:**
- **Abin:** Transaction engine, atomicity, PDFs
- **Elsa:** Transfer UI, transaction history
- **Naji:** Supporting backend

---

#### **Sprint 5: AI/ML Fraud Detection (Week 5)**

**Goals:**
- Train Isolation Forest model
- Build FastAPI ML service
- Integrate fraud detection with transactions
- Create fraud alert system

**ML/AI Tasks:**
- Feature engineering (8 dimensions)
- Synthetic dataset creation
- Isolation Forest training
- Model evaluation and tuning
- FastAPI service with /predict endpoint
- Model persistence (joblib)
- Sub-3-second latency optimization

**Backend Tasks:**
- FraudAlert model
- ML service integration
- Fraud check API
- Feature extraction logic
- Fraud validation in transactions
- Admin fraud review interface

**Frontend Tasks:**
- Fraud alert display (optional UI)
- Admin fraud monitoring dashboard (placeholder)

**Deliverables:**
- ✅ Trained Isolation Forest model
- ✅ FastAPI ML service running
- ✅ /predict endpoint working
- ✅ Fraud integration in transactions
- ✅ FraudAlert model and APIs

**Team Assignments:**
- **Naji:** ML training, FastAPI service, feature engineering
- **Abin:** Backend integration, FraudAlert model
- **Elsa:** Supporting UI if needed

---

#### **Sprint 6: Real-time Features & Integration (Week 6)**

**Goals:**
- Implement WebSocket for real-time updates
- Build support chat system
- Integrate all modules
- Create admin dashboard

**Backend Tasks:**
- Django Channels setup
- WebSocket routing configuration
- Fraud alert WebSocket consumers
- Transaction notification consumers
- Support chat messages model
- Chat WebSocket implementation

**Frontend Tasks:**
- Support chat UI
- Real-time balance updates
- Fraud alert notifications
- Admin dashboard UI
- Analytics charts (Recharts)

**Deliverables:**
- ✅ WebSocket infrastructure
- ✅ Real-time fraud alerts
- ✅ Support chat working
- ✅ Admin dashboard UI
- ✅ Notifications system

**Team Assignments:**
- **Abin:** WebSocket setup, chat backend
- **Elsa:** Support chat UI, admin dashboard
- **Naji:** Supporting tasks

---

#### **Sprint 7: Testing, Optimization & Deployment (Week 7)**

**Goals:**
- Write comprehensive tests
- Performance optimization
- Bug fixes
- Deployment preparation

**Tasks:**
- Unit tests for all modules (~34 tests)
- Integration tests
- API endpoint testing
- Security testing
- Performance profiling
- Code cleanup and refactoring
- Documentation updates
- Docker image optimization
- CI/CD setup

**Deliverables:**
- ✅ ~62% test coverage
- ✅ 34+ test cases passing
- ✅ Performance benchmarks
- ✅ Security audit passed
- ✅ Docker images ready
- ✅ API documentation complete
- ✅ Deployment guide

**Team Assignments:**
- **Abin:** Backend tests, security tests
- **Elsa:** Frontend tests, E2E tests
- **Naji:** ML service tests, performance tests

---

### 9.3 Sprint Velocity & Progress

| Sprint | Tasks | Completed | Velocity |
|--------|-------|-----------|----------|
| Sprint 1 | 8 | 8 | 100% |
| Sprint 2 | 10 | 10 | 100% |
| Sprint 3 | 8 | 8 | 100% |
| Sprint 4 | 12 | 12 | 100% |
| Sprint 5 | 10 | 10 | 100% |
| Sprint 6 | 11 | 11 | 100% |
| Sprint 7 | 9 | 9 | 100% |
| **Total** | **68** | **68** | **100%** |

---

## TEAM RESPONSIBILITIES & ASSIGNMENTS

### 10.1 Team Members & Roles

#### **Abin Tomy — Backend Developer & System Architect**

**Primary Responsibilities:**
- Django REST Framework backend architecture
- Database design and ORM implementation
- Authentication and authorization system
- Transaction processing engine
- API development and documentation
- Integration of fraud detection service
- Security implementation
- Backend testing and debugging

**Key Contributions:**

| Sprint | Module | Contribution |
|--------|--------|--------------|
| 1 | Core | Project setup, DB design, Docker |
| 2 | Users | Custom user model, JWT auth, security |
| 3 | Accounts | Account model, APIs, validation |
| 4 | Transactions | Transaction engine, atomicity, PDFs |
| 5 | Fraud | ML service integration, fraud alerts |
| 6 | Support | Chat backend, WebSocket routing |
| 7 | Testing | Comprehensive backend tests |

**Technical Skills Demonstrated:**
- Django & DRF expertise
- Database transactions and ACID compliance
- RESTful API design
- JWT authentication
- WebSocket implementation
- ML service integration
- Security best practices
- Testing frameworks

**Key Implementations:**
- ✅ ACID-compliant transaction system
- ✅ Custom JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Idempotency mechanism
- ✅ FraudAlert integration
- ✅ Admin deposit functionality
- ✅ Transaction statement generation
- ✅ Comprehensive API validation

---

#### **Elsa Maria — Frontend Developer & UI/UX Designer**

**Primary Responsibilities:**
- Next.js frontend development
- UI/UX design for all portals
- Responsive component design
- Customer, Admin, Support portal implementation
- API integration
- State management
- Frontend testing
- User experience optimization

**Key Contributions:**

| Sprint | Portal | Contribution |
|--------|--------|--------------|
| 1 | Design | UI/UX mockups, component library |
| 2 | Auth | Login, registration, password reset pages |
| 3 | Customer | Account listing, details, dashboard |
| 4 | Customer | Fund transfer UI, transaction history |
| 5 | Admin | Fraud monitoring (placeholder) |
| 6 | Admin | Admin dashboard, analytics, support chat UI |
| 7 | Testing | Frontend tests, E2E testing |

**Technical Skills Demonstrated:**
- Next.js and React expertise
- TypeScript proficiency
- Tailwind CSS styling
- Component composition
- Axios API integration
- Responsive design
- UI/UX best practices
- Accessibility implementation
- Testing React components

**Key Implementations:**
- ✅ Login/registration pages
- ✅ Customer dashboard with real-time updates
- ✅ Fund transfer interface
- ✅ Admin dashboard with analytics
- ✅ Support chat UI
- ✅ Responsive design across devices
- ✅ Accessibility features
- ✅ Error handling and validation

---

#### **Naji Abdulla — ML/AI Engineer & Data Scientist**

**Primary Responsibilities:**
- Machine learning model development
- Feature engineering for fraud detection
- FastAPI ML service creation
- Dataset creation and preprocessing
- Model training and evaluation
- Integration with backend
- Performance optimization
- ML documentation

**Key Contributions:**

| Sprint | Component | Contribution |
|--------|-----------|--------------|
| 1 | ML Service | Framework setup, requirements |
| 2 | ML Service | Supporting backend |
| 3 | ML Service | Data seeding |
| 4 | ML Service | Feature exploration |
| 5 | ML Service | Model training, API service, integration |
| 6 | ML Service | Real-time scoring optimization |
| 7 | ML Service | Testing, model evaluation |

**Technical Skills Demonstrated:**
- Python data science ecosystem
- scikit-learn expertise
- Feature engineering
- Model training and evaluation
- Isolation Forest algorithm
- Data preprocessing (StandardScaler, OneHotEncoder)
- FastAPI development
- Model persistence (joblib)
- Performance optimization

**Key Implementations:**
- ✅ 8-dimensional feature engineering
- ✅ Isolation Forest model (300 estimators)
- ✅ Synthetic dataset creation
- ✅ FastAPI `/predict` endpoint
- ✅ Sub-3-second latency
- ✅ Model evaluation metrics
- ✅ Preprocessing pipeline
- ✅ Real-time fraud scoring

---

### 10.2 Cross-Functional Collaboration

**Key Collaboration Points:**

| Activity | Abin | Elsa | Naji |
|----------|------|------|------|
| **Architecture Review** | Lead | Input | Input |
| **Database Design** | Lead | | Support |
| **API Design** | Lead | Input | Input |
| **UI/UX Design** | | Lead | |
| **API Integration** | Support | Lead | |
| **Testing** | Full | Full | Full |
| **Deployment** | Lead | Support | Support |

**Communication:**
- Daily standup (15 min)
- Weekly sprint planning (30 min)
- Weekly sprint review (30 min)
- Weekly retrospective (30 min)
- Trello board for task tracking
- GitHub issues and PRs for code review

---

## DATABASE SCHEMA OVERVIEW

### 11.1 Core Database Models

#### **Users Schema**

```sql
CREATE TABLE users_customuser (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- PBKDF2 hashed
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    role VARCHAR(20),  -- CUSTOMER, ADMIN, SUPPORT
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Accounts Schema**

```sql
CREATE TABLE accounts_account (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users_customuser(id),
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type VARCHAR(20),  -- SAVINGS, CURRENT
    status VARCHAR(20),  -- ACTIVE, FROZEN, CLOSED
    balance DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT one_savings_per_user UNIQUE (user_id, account_type) WHERE account_type = 'SAVINGS'
);
```

#### **Transactions Schema**

```sql
CREATE TABLE transactions_transaction (
    id BIGSERIAL PRIMARY KEY,
    from_account_id BIGINT NOT NULL REFERENCES accounts_account(id),
    to_account_id BIGINT NOT NULL REFERENCES accounts_account(id),
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(20),  -- CREDIT, DEBIT
    status VARCHAR(20),  -- PENDING, COMPLETED, FAILED
    description TEXT,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (amount > 0)
);

CREATE INDEX idx_transaction_from_account ON transactions_transaction(from_account_id);
CREATE INDEX idx_transaction_to_account ON transactions_transaction(to_account_id);
CREATE INDEX idx_transaction_created_at ON transactions_transaction(created_at);
```

#### **Fraud Alerts Schema**

```sql
CREATE TABLE fraud_fraudalert (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES transactions_transaction(id),
    risk_score FLOAT NOT NULL,
    is_fraud_detected BOOLEAN NOT NULL,
    features JSONB,  -- Serialized feature data
    status VARCHAR(20),  -- PENDING, REVIEWED, CONFIRMED, FALSE_POSITIVE
    admin_notes TEXT,
    reviewed_by_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL
);
```

#### **Loans Schema**

```sql
CREATE TABLE loans_loantype (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    max_amount DECIMAL(12, 2) NOT NULL
);

CREATE TABLE loans_loanapplication (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users_customuser(id),
    loan_type_id BIGINT NOT NULL REFERENCES loans_loantype(id),
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20),  -- APPLIED, APPROVED, REJECTED, ACTIVE, CLOSED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL
);
```

#### **Credit Cards Schema**

```sql
CREATE TABLE credit_cards_creditcard (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users_customuser(id),
    encrypted_card_data BYTEA NOT NULL,  -- Fernet encrypted
    status VARCHAR(20),  -- PENDING, ACTIVE, BLOCKED, CLOSED
    limit DECIMAL(12, 2) NOT NULL,
    used_limit DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);
```

#### **Bill Payments Schema**

```sql
CREATE TABLE bill_payments_biller (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    category VARCHAR(50),  -- ELECTRICITY, WATER, GAS, INTERNET, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bill_payments_billpayment (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users_customuser(id),
    biller_id BIGINT NOT NULL REFERENCES bill_payments_biller(id),
    amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(20),  -- DAILY, WEEKLY, MONTHLY
    status VARCHAR(20),  -- PENDING, COMPLETED, FAILED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Support Schema**

```sql
CREATE TABLE support_supportticket (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES users_customuser(id),
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20),  -- OPEN, IN_PROGRESS, RESOLVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
);

CREATE TABLE support_chatmessage (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES support_supportticket(id),
    sender_id BIGINT NOT NULL REFERENCES users_customuser(id),
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11.2 Database Relationships

```
┌─────────────────┐
│  CustomUser     │
├─────────────────┤
│ id (PK)         │
│ email           │
│ role            │
│ is_verified     │
│ created_at      │
└────────┬────────┘
         │ 1:N
         │
    ┌────▼──────────────────┬──────────────────┬──────────────────┐
    │                       │                  │                  │
┌───▼─────────┐  ┌──────────▼────┐  ┌────────▼─────┐  ┌────────▼──┐
│  Account    │  │ LoanApplication│  │ CreditCard   │  │ SupportTicket
├─────────────┤  ├────────────────┤  ├──────────────┤  ├───────────┤
│ id (PK)     │  │ id (PK)       │  │ id (PK)     │  │ id (PK)   │
│ user_id (FK)│  │ user_id (FK)  │  │ user_id (FK)│  │ customer_ │
│ acct_number │  │ loan_type_id  │  │ encrypted_  │  │ id (FK)   │
│ type        │  │ status        │  │ card_data   │  │ subject   │
│ balance     │  │ amount        │  │ limit       │  │ status    │
│ status      │  │ created_at    │  │ created_at  │  │ created_at
└───┬─────────┘  └────────────────┘  └─────────────┘  └───────────┘
    │ 1:N
    │
┌───▼──────────────┐  Transaction can be either
│  Transaction     │  Debit (FROM) or Credit (TO)
├──────────────────┤
│ id (PK)          │
│ from_account_id  │ ──→ Account
│ to_account_id    │ ──→ Account
│ amount           │
│ status           │
│ idempotency_key  │
│ created_at       │
└──────────────────┘
         │ 1:N
         │
    ┌────▼──────────────┐
    │  FraudAlert       │
    ├───────────────────┤
    │ id (PK)           │
    │ transaction_id(FK)│
    │ risk_score        │
    │ is_fraud_detected │
    │ status            │
    │ features (JSON)   │
    │ created_at        │
    └───────────────────┘
```

---

## API ARCHITECTURE

### 12.1 API Endpoints Overview

#### **Authentication Endpoints**

```
POST   /api/auth/register/                 - User registration
POST   /api/auth/login/                    - User login (email + password)
POST   /api/auth/refresh/                  - Refresh JWT token
POST   /api/auth/logout/                   - Logout
POST   /api/auth/password-reset/           - Initiate password reset
POST   /api/auth/password-reset-confirm/   - Confirm password reset with token
POST   /api/auth/2fa/setup/                - Setup two-factor authentication
POST   /api/auth/2fa/verify/               - Verify 2FA code
```

#### **User Endpoints**

```
GET    /api/users/profile/                 - Get user profile
PUT    /api/users/profile/                 - Update user profile
GET    /api/users/                         - List users (admin only)
GET    /api/users/{id}/                    - Get user details (admin only)
PUT    /api/users/{id}/role/               - Update user role (admin only)
```

#### **Account Endpoints**

```
POST   /api/accounts/                      - Create account (admin only)
GET    /api/accounts/                      - List user accounts
GET    /api/accounts/{id}/                 - Account details
GET    /api/accounts/{id}/balance/         - Current balance
PUT    /api/accounts/{id}/freeze/          - Freeze account (admin only)
PUT    /api/accounts/{id}/close/           - Close account (admin only)
GET    /api/accounts/{id}/statement/       - Account statement
POST   /api/accounts/{id}/statement/pdf/   - Download statement as PDF
```

#### **Transaction Endpoints**

```
POST   /api/transactions/transfer/         - Initiate fund transfer
GET    /api/transactions/                  - Transaction history
GET    /api/transactions/{id}/             - Transaction details
GET    /api/transactions/statement/        - Full account statement
POST   /api/transactions/statement/pdf/    - Download statement as PDF
POST   /api/admin/deposit/                 - Admin deposit (admin only)
```

#### **Fraud Endpoints**

```
GET    /api/fraud/alerts/                  - List fraud alerts (admin only)
GET    /api/fraud/alerts/{id}/             - Fraud alert details (admin only)
PUT    /api/fraud/alerts/{id}/status/      - Update alert status (admin only)
PUT    /api/fraud/alerts/{id}/override/    - Override fraud alert (admin only)
GET    /api/fraud/statistics/              - Fraud statistics (admin only)
```

#### **Loan Endpoints**

```
POST   /api/loans/applications/            - Submit loan application
GET    /api/loans/applications/            - List user's loan applications
GET    /api/loans/applications/{id}/       - Loan application details
GET    /api/loans/types/                   - Available loan types
POST   /api/loans/emi-calculator/          - Calculate EMI
```

#### **Credit Card Endpoints**

```
POST   /api/cards/applications/            - Apply for credit card
GET    /api/cards/                         - List user's cards
GET    /api/cards/{id}/                    - Card details (masked)
PUT    /api/cards/{id}/activate/           - Activate card
PUT    /api/cards/{id}/block/              - Block card
PUT    /api/cards/{id}/limit/              - Update spending limit
```

#### **Bill Payment Endpoints**

```
GET    /api/bills/billers/                 - List billers
POST   /api/bills/billers/                 - Add biller
DELETE /api/bills/billers/{id}/            - Remove biller
POST   /api/bills/payments/                - Make bill payment
GET    /api/bills/payments/                - Payment history
PUT    /api/bills/payments/{id}/autopay/   - Setup/modify autopay
```

#### **Support Endpoints**

```
POST   /api/support/tickets/               - Create support ticket
GET    /api/support/tickets/               - List tickets
GET    /api/support/tickets/{id}/          - Ticket details
PUT    /api/support/tickets/{id}/status/   - Update ticket status
POST   /api/support/tickets/{id}/messages/ - Send support message
GET    /api/support/tickets/{id}/messages/ - Get chat history
```

#### **WebSocket Endpoints**

```
WS     /ws/fraud/alerts/                   - Real-time fraud alerts
WS     /ws/transactions/updates/           - Real-time transaction updates
WS     /ws/support/chat/{ticket_id}/       - Support chat
WS     /ws/notifications/                  - General notifications
```

### 12.2 API Authentication & Authorization

**Authentication Method:** JWT Bearer Token

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Structure:**
```json
{
  "user_id": 123,
  "email": "user@example.com",
  "role": "CUSTOMER",
  "iat": 1616000000,
  "exp": 1616003600  // 1 hour expiry
}
```

**Refresh Token:**
- 7-day expiry
- Used to obtain new access token
- Rotated after use

**Authorization Levels:**
- **Public:** No authentication required (login, register, forgot password)
- **Authenticated:** Any logged-in user
- **Customer:** Users with CUSTOMER role
- **Admin:** Users with ADMIN role
- **Support:** Users with SUPPORT role

### 12.3 Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "role": "CUSTOMER"
  },
  "message": "User profile retrieved successfully"
}
```

**Error Response (400/401/403/500):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance for transaction",
    "field": "amount",
    "details": {
      "required": 5000,
      "available": 3000
    }
  }
}
```

### 12.4 Rate Limiting

- **Public Endpoints:** 100 requests/hour
- **Authenticated Endpoints:** 1000 requests/hour
- **Transfer Endpoint:** 10 requests/hour
- **Admin Endpoints:** 100 requests/hour
- **ML Service:** 1000 requests/hour

---

## SECURITY FEATURES

### 13.1 Authentication Security

✅ **Password Security:**
- PBKDF2 hashing (Django default)
- Minimum length: 8 characters
- Complexity requirements: uppercase, lowercase, numbers, special chars
- Password history: Cannot reuse last 5 passwords
- Expiry: 90 days

✅ **JWT Tokens:**
- HS256 algorithm for signing
- Access token: 1-hour expiry
- Refresh token: 7-day expiry
- Token rotation on refresh
- Secure signing secret

✅ **Account Lockout:**
- Lock after 5 failed login attempts
- Lock duration: 15 minutes
- Exponential backoff on repeated failures

✅ **2FA (TOTP):**
- Time-based One-Time Password
- 30-second time window
- Backup codes for recovery

### 13.2 Authorization & Access Control

✅ **Role-Based Access Control (RBAC):**
- CUSTOMER role: Limited to own accounts and transactions
- ADMIN role: Full system access
- SUPPORT role: View tickets and chat

✅ **API-Level Authorization:**
- Middleware checks user role before processing
- Explicit permission checks on sensitive operations
- Row-level security (users can only access their data)

✅ **Token Validation:**
- JWT signature verification
- Token expiry checks
- Revocation support (blacklist)

### 13.3 Data Protection

✅ **Sensitive Data Encryption:**
- Credit card data: Fernet encryption
- API communications: HTTPS only
- Database: Encryption at rest (production)

✅ **Data Masking:**
- Account numbers: Partially masked in UI
- Card numbers: Only last 4 digits shown
- Passwords: Never logged or displayed

✅ **Audit Trail:**
- All transactions logged with timestamps
- Failed login attempts tracked
- Admin actions audited
- Fraud alerts logged

### 13.4 API Security

✅ **CORS Protection:**
- Whitelist allowed origins
- Credentials required for cross-origin requests

✅ **CSRF Protection:**
- CSRF tokens for state-changing requests
- Double-submit cookie pattern

✅ **Rate Limiting:**
- DDoS protection
- Abuse prevention
- Throttling of suspicious IPs

✅ **Input Validation:**
- All inputs validated server-side
- Type checking and range validation
- SQL injection prevention (Django ORM)
- XSS prevention (template escaping)

### 13.5 Infrastructure Security

✅ **Docker Security:**
- Non-root user in containers
- Read-only filesystem where applicable
- Network isolation between services

✅ **Database Security:**
- SQL injection prevention (parameterized queries)
- Encrypted connections
- Least-privilege user accounts
- Regular backups

✅ **Secrets Management:**
- Environment variables for sensitive config
- .env files (not in version control)
- Production: Use secret vault

---

## TESTING STRATEGY

### 14.1 Testing Framework

**Backend:**
- **Framework:** Pytest + pytest-django
- **Fixtures:** Factory-boy for test data
- **Coverage:** pytest-cov

**Frontend:**
- **Framework:** Jest + React Testing Library (planned)
- **E2E:** Cypress (planned)

**ML Service:**
- **Framework:** unittest/pytest

### 14.2 Test Coverage

**Current Coverage:** ~62%

**Test Breakdown:**

| Module | Tests | Coverage |
|--------|-------|----------|
| Users | 4 | 85% |
| Accounts | 3 | 80% |
| Transactions | 8 | 75% |
| Fraud Detection | 5 | 70% |
| Loans | 3 | 65% |
| Credit Cards | 2 | 60% |
| Bill Payments | 2 | 60% |
| Support | 2 | 50% |
| **Total** | **34** | **~62%** |

### 14.3 Test Categories

#### **Unit Tests**
- Model validation
- Serializer testing
- Utility function testing
- ML model inference testing

#### **Integration Tests**
- Authentication flow
- Transaction processing
- API endpoint testing
- ML service integration
- Database transaction tests

#### **Security Tests**
- XSS prevention
- SQL injection prevention
- CSRF protection
- Authentication bypasses
- Authorization checks

#### **Performance Tests**
- ML inference latency
- Transaction processing time
- API response times
- Database query optimization

### 14.4 Continuous Integration

**Pipeline:**
```
Git Push
  ├─ Run Linter (ESLint, Flake8)
  ├─ Run Unit Tests
  ├─ Run Integration Tests
  ├─ Generate Coverage Report
  ├─ Run Security Scan
  └─ Deploy to Staging (if all pass)
```

---

## KEY ACHIEVEMENTS

### 15.1 Technical Achievements

✅ **ACID-Compliant Banking Transactions**
- Atomic fund transfers
- Double-entry bookkeeping
- Idempotency mechanism
- Transaction audit trail

✅ **Real-Time AI Fraud Detection**
- Isolation Forest ML model
- Sub-3-second prediction latency
- 8-dimensional feature engineering
- Fallback mechanism for ML service outages

✅ **Secure Authentication System**
- Custom JWT implementation
- Role-based access control
- Account lockout mechanism
- 2FA support with TOTP

✅ **Scalable Microservices Architecture**
- Separate Frontend, Backend, ML services
- Container-based deployment
- Service communication via REST
- Real-time updates via WebSocket

✅ **Comprehensive API Documentation**
- Swagger UI
- ReDoc documentation
- Auto-generated from code
- Request/response examples

✅ **Full-Stack Development**
- Modern frontend (Next.js + React)
- Robust backend (Django REST Framework)
- ML inference service (FastAPI)
- PostgreSQL with Redis caching

### 15.2 Software Engineering Achievements

✅ **Agile Methodology Implementation**
- 7-sprint development cycle
- Weekly sprints with demos
- Comprehensive sprint planning
- Retrospectives for continuous improvement

✅ **Modular Architecture**
- Clear separation of concerns
- Independent modules deployable separately
- Minimal coupling between layers
- Reusable components

✅ **Code Quality**
- ~62% test coverage
- 34+ test cases
- Security best practices
- Performance optimization

✅ **Team Collaboration**
- Clear role definitions
- Effective communication
- Knowledge sharing
- Collective ownership

### 15.3 Feature Achievements

✅ **User Management**
- Custom user model with roles
- Email-based authentication
- Account lockout
- Verification tracking

✅ **Account Management**
- Multiple account types
- Unique account numbers
- Status management
- Balance calculation

✅ **Transaction System**
- Fund transfers with validation
- Statement generation
- PDF export
- Running balance calculation

✅ **Fraud Detection**
- Real-time AI scoring
- Risk categorization
- Admin review interface
- Audit logging

✅ **Loan & Credit Card Systems**
- Loan applications and approvals
- EMI calculation
- Credit card management
- Encrypted card storage

✅ **Bill Payments**
- Biller management
- One-time and recurring payments
- Autopay scheduling
- Payment tracking

✅ **Support System**
- Live chat interface
- Ticket management
- Real-time WebSocket updates
- Chat history

---

## CHALLENGES & SOLUTIONS

### 16.1 Technical Challenges

| Challenge | Solution |
|-----------|----------|
| **ACID Compliance in Distributed System** | Used Django transactions with pessimistic locking |
| **ML Service Integration Latency** | Optimized feature extraction, caching predictions |
| **Real-time Updates** | Implemented Django Channels with Redis backend |
| **Data Consistency** | Idempotency keys, transaction audit trail |
| **Security** | JWT, encryption, rate limiting, input validation |
| **Testing Coverage** | Factory-boy for fixtures, Pytest for test organization |

### 16.2 Development Challenges

| Challenge | Solution |
|-----------|----------|
| **Team Coordination** | Daily standups, Trello board, clear sprint goals |
| **Integration Issues** | API contracts defined early, mock services used |
| **Database Design** | Multiple design reviews, schema versioning ready |
| **Performance Tuning** | Profiling, query optimization, caching strategy |
| **Documentation** | Auto-generated API docs, inline code comments |

---

## DEPLOYMENT OVERVIEW

### 17.1 Docker Compose Architecture

```yaml
version: '3.8'

services:
  frontend:
    image: ai-banking-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    image: ai-banking-backend:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/banking
      - REDIS_URL=redis://redis:6379
      - ML_SERVICE_URL=http://ml_service:9000
    depends_on:
      - db
      - redis

  ml_service:
    image: ai-banking-ml:latest
    ports:
      - "9000:9000"
    environment:
      - MODEL_PATH=/app/fraud_model.pkl

  db:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=banking_db
      - POSTGRES_USER=bank_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  db_data:

networks:
  default:
    name: ai-banking-network
```

### 17.2 Deployment Commands

```bash
# Build all images
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f backend

# Stop services
docker compose down

# Run migrations
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Run tests
docker compose exec backend pytest

# Generate coverage report
docker compose exec backend pytest --cov
```

### 17.3 Production Deployment Considerations

- **SSL/HTTPS:** Configure with Nginx reverse proxy
- **Database:** Use managed PostgreSQL service (AWS RDS, Azure Database)
- **Redis:** Managed Redis service (AWS ElastiCache, Azure Cache)
- **ML Model:** Version control and track model changes
- **Monitoring:** ELK stack or similar for logs
- **CI/CD:** GitHub Actions, GitLab CI, or similar
- **Scaling:** Kubernetes orchestration for horizontal scaling
- **Backup:** Automated daily database backups
- **Secrets:** Use AWS Secrets Manager or similar

---

## FUTURE ENHANCEMENTS

### 18.1 Short-Term (3-6 months)

✅ **Features**
- Email verification and password reset automation
- Mobile application (React Native)
- Advanced fraud analytics dashboard
- Real-time transaction alerts
- Support ticket system completion

✅ **Infrastructure**
- CI/CD pipeline (GitHub Actions)
- Automated testing with coverage gates
- Docker image optimization
- Kubernetes deployment manifests
- Load testing and performance benchmarks

✅ **Security**
- Penetration testing
- OWASP compliance audit
- Security headers implementation
- API rate limiting refinement
- Audit log retention policy

### 18.2 Medium-Term (6-12 months)

✅ **Features**
- Online payment gateway integration (Stripe, Razorpay)
- Advanced ML fraud detection with real banking data
- Comprehensive admin dashboard with detailed analytics
- Multi-language support
- Accessibility improvements (WCAG 2.1 AAA)

✅ **Scalability**
- Microservices separation (accounts, transactions, fraud as separate services)
- Event-driven architecture (Kafka/RabbitMQ)
- Database replication and sharding
- API versioning strategy
- GraphQL API alongside REST

✅ **ML Enhancements**
- Feature importance analysis
- Model retraining pipeline
- A/B testing framework
- Transfer learning from larger datasets
- Explainable AI for fraud decisions

### 18.3 Long-Term (12+ months)

✅ **Features**
- Investment portfolio management
- Cryptocurrency integration
- Wealth management tools
- Insurance products
- Open Banking API compliance

✅ **Advanced ML**
- Real-time anomaly detection streaming
- Predictive customer analytics
- Personalized recommendations
- Behavioral biometrics

✅ **Compliance**
- PCI DSS level 1 compliance
- GDPR/CCPA implementation
- Regulatory reporting automation
- Audit trail blockchain verification

---

## CONCLUSION

### 19.1 Project Summary

The **AI-Powered Digital Banking Platform** represents a comprehensive application of modern software engineering principles to build a realistic, secure, and intelligent banking system. Over seven weeks and four team members:

- **68 tasks** completed with 100% velocity
- **3 major components** successfully integrated (Frontend, Backend, ML)
- **34+ test cases** with ~62% code coverage
- **8 major modules** implemented with full CRUD operations
- **Real-time fraud detection** with sub-3-second latency
- **ACID-compliant transactions** with double-entry bookkeeping

### 19.2 Key Learnings

**Agile Methodology:** Short sprints and continuous feedback enable rapid feature delivery and early issue detection.

**Microservices Architecture:** Separation of concerns allows independent scaling and development of Frontend, Backend, and ML services.

**Security-First Design:** Implementing security measures early (JWT, encryption, RBAC) prevents costly refactorings later.

**Real-Time Systems:** WebSocket integration enables modern user experiences with live updates and notifications.

**ML Integration:** Integrating AI models into production systems requires careful attention to latency, fallback mechanisms, and monitoring.

**Testing:** Comprehensive testing (unit, integration, security) builds confidence in production deployments.

**Team Collaboration:** Clear role definitions, regular communication, and sprint ceremonies ensure project alignment.

### 19.3 Technical Highlights

- **JWT Authentication:** Secure, scalable, token-based authentication
- **ACID Transactions:** Banking-grade transaction processing with atomicity
- **Isolation Forest:** Effective anomaly detection without labeled fraud data
- **WebSocket Communication:** Real-time updates and notifications
- **API Documentation:** Auto-generated Swagger/ReDoc for API discoverability
- **Containerization:** Docker-based deployment for consistency across environments

### 19.4 Business Impact

The platform demonstrates:
- ✅ **User Security:** Advanced authentication, encryption, and fraud detection
- ✅ **Reliability:** ACID-compliant transactions, fallback mechanisms, error handling
- ✅ **Scalability:** Microservices architecture, containerized deployment
- ✅ **Maintainability:** Modular design, comprehensive testing, clear documentation
- ✅ **Extensibility:** Ready for new features (loans, cards, investments)
- ✅ **Compliance:** Security best practices, audit trails, data protection

### 19.5 Team Recognition

**Abin Tomy — Backend & Architecture**
- Built robust REST API with comprehensive validation
- Implemented ACID-compliant transaction system
- Integrated ML fraud detection seamlessly
- Ensured system security and scalability

**Elsa Maria — Frontend & UI/UX**
- Created intuitive interfaces for three user portals
- Implemented responsive design with Tailwind CSS
- Developed real-time UI components
- Ensured accessibility and user experience

**Naji Abdulla — ML/AI Engineering**
- Developed effective Isolation Forest model
- Created production-ready FastAPI service
- Engineered 8-dimensional feature space
- Optimized model for sub-3-second latency

### 19.6 Final Thoughts

This project successfully demonstrates that with proper software engineering practices, clear team roles, Agile methodology, and modern technology stack, it's possible to build a production-ready banking platform that incorporates cutting-edge AI/ML features while maintaining high security and reliability standards.

The platform is ready for:
- Educational demonstrations
- Further feature development
- Production deployment with minor hardening
- Open-source community contribution
- Use as a reference architecture for similar systems

---

## APPENDIX

### A. Technology Stack Summary

**Frontend:**
- Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Axios, Radix UI

**Backend:**
- Django 6.0, DRF 3.16, DjangoChannels 4.1, PostgreSQL 16, Redis 7

**ML/AI:**
- FastAPI 0.110, scikit-learn 1.7, Pandas 2.3, Joblib 1.5

**DevOps:**
- Docker, Docker Compose, pytest, pytest-django

### B. Project Repository

**GitHub:** https://github.com/Abin-Tomy/ai-powered-digital-banking-platform

**Branch:** frontend (development) / master (main)

**Documentation:** /docs/ directory in repository

### C. Quick Links

- **API Documentation:** http://localhost:8000/api/docs/ (Swagger)
- **API ReDoc:** http://localhost:8000/api/redoc/
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **ML Service:** http://localhost:9000

### D. Setup & Installation

See [docs/DEVELOPER_SETUP.md](docs/DEVELOPER_SETUP.md) for complete setup instructions.

```bash
git clone https://github.com/Abin-Tomy/ai-powered-digital-banking-platform
cd ai-powered-digital-banking-platform
docker compose up --build
```

---

**Report Prepared By:** Team 3 (Abin Tomy, Elsa Maria, Naji Abdulla)

**Course:** MCA - Software Engineering Project

**Date:** March 2026

**Version:** 2.0 (Comprehensive)

---