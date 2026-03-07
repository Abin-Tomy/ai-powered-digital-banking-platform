# AI-POWERED DIGITAL BANKING PLATFORM
**Software Engineering Project Report**

**TEAM 3**

**Members:** Abin Tomy, Elsa Maria, Naji Abdulla

**Course:** MCA

---

## 1. INTRODUCTION TO SOFTWARE ENGINEERING CONCEPTS

Software Engineering is a systematic and disciplined approach to designing, developing, testing, deploying, and maintaining software systems. It ensures that software is high-quality, reliable, scalable, and maintainable.

The AI-Powered Digital Banking Platform project applies these principles to build a full-stack digital banking system with AI-powered fraud detection. The project emphasizes:
- Modular design
- MVC-based architecture
- Agile methodology
- Incremental development

It delivers a secure, interactive, and robust banking experience for customers, administrators, and support staff.

---

### 1.1 Software Development Models

**Incremental Model:**

Development was carried out in stages, with each increment adding new functionality. Key increments included:
- User interface design
- Authentication system
- Account management module
- Transaction module
- AI-based fraud detection integration
- Testing and optimization

This approach allowed continuous improvement and easier debugging.

**Agile Model:**

Agile methodology ensured flexible and rapid development. Features were implemented in short iterations with continuous feedback, enabling the team to adapt efficiently to changes.

---

### 1.2 MVC Architecture

The system follows the Model–View–Controller (MVC) pattern:
- **Model:** Manages database structure, business logic, and data validation.
- **View:** Handles user interface and presentation layer.
- **Controller:** Acts as an intermediary between model and view, handling requests and responses.

This separation improves maintainability, scalability, and modularity.

---

### 1.3 Agile and Scrum Methodology

**Scrum Roles:**
- Product Owner: Defines project features and requirements.
- Scrum Master: Oversees sprint execution and removes obstacles.
- Development Team: Implements and tests modules.

**Scrum Artifacts:**
- Product Backlog
- Sprint Backlog
- Increment

Trello was used for tracking tasks. Boards were organized into To Do, In Progress, and Completed to ensure transparency and accountability.

---

### 1.4 Sprint Concept

A sprint is a fixed-duration development cycle where specific tasks are completed. Each sprint focused on modules such as frontend design, backend integration, or ML/AI service development, ensuring steady progress and quality delivery.

---

## 2. PROJECT IMPLEMENTATION DETAILS

### 2.1 Project Concept

The platform is a full-stack AI-powered digital banking system with three primary components:
- **Backend:** Django REST Framework for authentication, accounts, and transaction management.
- **Frontend:** Next.js with TypeScript and Tailwind CSS for responsive, modern interfaces.
- **ML/AI Service:** FastAPI with scikit-learn for real-time fraud detection.

The system supports secure user authentication, bank account management, fund transfers, and AI-powered fraud detection, simulating a real-world banking system.

---

### 2.2 Roles and Responsibilities

#### **Frontend Responsibilities (Elsa Maria):**

- Designing responsive interfaces for Customer, Admin, and Support portals.
- Implementing public pages: login, registration, password reset, and forget password.
- Managing sessions, routing, and role-based access control.
- Partial integration with backend APIs.
- Testing and debugging UI components.

#### **Backend Responsibilities (Abin Tomy):**

- Designing and implementing Django REST Framework-based backend architecture.
- Developing custom user authentication system with email-based login and JWT tokens.
- Implementing role-based access control (CUSTOMER, SUPPORT, ADMIN).
- Building User Management module with account lockout, failed login tracking, and verification status.
- Developing Account Management system with UUID-based accounts, unique account number generation, and business rule enforcement (one savings account per user).
- Creating Transaction module with ACID-compliant fund transfers, atomic operations, and double-entry bookkeeping.
- Implementing balance calculation service with credit/debit aggregation.
- Developing idempotency key mechanism to prevent duplicate transactions.
- Building comprehensive validation logic (account status checks, balance sufficiency, self-transfer prevention).
- Integrating fraud detection AI service with backend transaction flow.
- Creating RESTful API endpoints for all modules with proper authentication and permissions.
- Implementing database models with appropriate relationships, constraints, and indexes.
- Setting up Django project structure (core settings, URL routing, CORS configuration).
- Implementing transaction statement generation with running balance calculation.
- Developing admin deposit functionality for account initialization.
- Building secure authentication backends and custom JWT authentication classes.
- Creating serializers for data validation and API response formatting.
- Testing and debugging backend services.

#### **ML/AI Service Responsibilities (Naji Abdulla):**

- Researching and selecting appropriate machine learning algorithm for fraud detection (Isolation Forest).
- Designing feature engineering pipeline with 8 key fraud indicators:
  - Transaction amount
  - Transaction hour
  - Device trust score
  - Transaction velocity (last 24 hours)
  - Cardholder age
  - Foreign transaction flag
  - Location mismatch detection
  - Merchant category classification
- Implementing data preprocessing pipeline with StandardScaler for numeric features and OneHotEncoder for categorical features.
- Training Isolation Forest model with 300 estimators and 2% contamination rate.
- Creating synthetic credit card transaction dataset with fraud patterns.
- Building scikit-learn pipeline combining preprocessing and model training.
- Developing FastAPI-based inference service for real-time fraud prediction.
- Implementing `/predict` endpoint for transaction risk scoring.
- Creating Pydantic models for API input validation.
- Generating fraud detection outputs: `is_fraud` boolean and `risk_score` numeric value.
- Optimizing model for sub-3-second prediction latency.
- Saving and loading trained model using joblib for persistence.
- Integrating dynamic merchant category assignment based on transaction amount.
- Implementing device trust score calculation based on user behavior patterns.
- Building location mismatch detection logic.
- Testing ML service with various transaction scenarios.
- Documenting model training process and feature importance.

---

### 2.3 Functionalities Implemented

#### **Frontend**

- **Public Pages:** Login, Registration, Password Reset, Forget Password.
- **Customer Portal:** Dashboard, transaction statements (mock data), fund transfer interface, balance overview, session management.
- **Admin Panel:** Dashboard, User Management (placeholder), Transaction Monitoring (placeholder), Support Chat Access.
- **Support Portal:** Dashboard, chat interface (placeholder).
- **Infrastructure:** Axios API client, CSRF handling, cookie-based authentication, responsive UI, gradient backgrounds, smooth transitions.

#### **Backend**

- **User Management:** Custom model (CUSTOMER, SUPPORT, ADMIN), email & JWT authentication, account lockout, verification tracking.
- **Account Management:** Savings & Current accounts, UUID IDs, status (ACTIVE/FROZEN/CLOSED), unique account numbers, admin-controlled creation, business rules.
- **Transaction System:** Secure transfers, idempotency validation, atomic transactions, balance calculation, admin deposits, account statements, validations for account status, balance sufficiency, and self-transfers.

#### **ML/AI Service**

- **Fraud Detection Model:** Isolation Forest algorithm, preprocessing (StandardScaler, OneHotEncoder), features: amount, transaction hour, device trust score, velocity, cardholder age, foreign transaction flag, location mismatch, merchant category.
- **FastAPI Service:** POST /predict endpoint returning is_fraud and risk_score in <3 seconds.
- **Dataset:** Synthetic credit card transactions with 2% contamination, 300 estimators.

---

### 2.4 System Structure

- **Backend Modules:** users, accounts, transactions, fraud, core
- **Frontend Folders:** public, customer, admin, support, lib
- **ML Components:** ml (training scripts), ml_service (FastAPI inference service)

---

### 2.5 Technical Stack

- **Backend:** Django 6.0, DRF, JWT, SQLite
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Axios
- **ML/AI Service:** FastAPI, scikit-learn, pandas, joblib, Isolation Forest
- **Database:** SQLite
- **Authentication:** JWT tokens, Email login

---

### 2.6 Pending / Future Work

- Full frontend-backend integration (login, transfer pages)
- Complete admin user management
- Email verification & password reset automation
- Support chat backend
- Real-time fraud alerts
- Advanced ML feature engineering with real banking data
- DevOps: Docker setup, CI/CD, production deployment
- Testing: Unit, integration, end-to-end

---

### 2.7 Key Achievements

- ACID-compliant banking transactions
- Real-time AI fraud detection with fallback
- Role-based access control across all layers
- Idempotency handling for transactions
- Secure account number generation
- Complete REST API
- Modern, responsive UI
- ML pipeline with preprocessing and accurate risk scoring
- Account statement generation with accurate balances

---

## 3. PROJECT MANAGEMENT WITH TRELLO

**Purpose:** Manage tasks using Scrum-based Agile methodology.

**Sprints Overview:**
- **Sprint 1:** Project setup & UI design
- **Sprint 2:** Authentication system
- **Sprint 3:** Account management
- **Sprint 4:** Transaction system
- **Sprint 5:** AI/ML fraud detection
- **Sprint 6:** Frontend-backend integration & testing
- **Sprint 7:** Optimization, debugging, deployment preparation

**Trello Board Status:** To Do, In Progress, Completed

---

## 4. ADVANTAGES OF THE SYSTEM

- Secure, AI-powered real-time banking transactions
- ACID-compliant transaction system
- Role-based access for Customer, Admin, Support
- Modern, interactive, responsive UI
- Scalable and modular design
- Accurate account statements
- Cloud-ready backend for deployment

---

## 5. FUTURE ENHANCEMENTS

- Full support chat integration
- Real-time fraud notifications
- Email verification & password reset automation
- Mobile application version
- Online payment gateway integration
- Advanced ML fraud detection with real banking data
- Comprehensive admin dashboard
- Production deployment with Docker & CI/CD

---

## 6. CONCLUSION

The AI-Powered Digital Banking Platform demonstrates practical application of software engineering principles, MVC architecture, and Agile methodology. Integrating frontend, backend, and AI services, the system delivers a secure, intelligent, and interactive banking solution, ready for future enhancement and production deployment.

---

## 7. TECHNOLOGY STACK

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Axios
- **Backend:** Django REST Framework, JWT, SQLite
- **ML/AI Service:** FastAPI, scikit-learn, pandas, joblib, Isolation Forest
- **Database:** SQLite
- **Project Management:** Trello
- **Version Control:** GitHub
