# LIBRAX — System Architecture

---

## Overview

LIBRAX follows a strict layered architecture. No layer can bypass another — this ensures correctness, testability, and maintainability.

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│   (TypeScript, TanStack Query, Zustand, Tailwind CSS)        │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP / REST (Axios)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                            │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Routes    │→ │   Services   │→ │  Repositories    │   │
│  │  (HTTP in)  │  │ (business    │  │  (DB queries)    │   │
│  │  JWT auth   │  │  logic)      │  │                  │   │
│  └─────────────┘  └──────────────┘  └────────┬─────────┘   │
│                                               │             │
│                          ┌────────────────────┘             │
│                          ▼                                  │
│                   SQLAlchemy ORM                            │
│                          │                                  │
│                          ▼                                  │
│                    PostgreSQL 16                             │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ (optional)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               C DSA Engine (Shared Library)                  │
│   array.c · linkedlist.c · bst.c · hashtable.c · heap.c    │
│   graph.c · sorting.c · searching.c                         │
│                                                             │
│   Python Bridge (ctypes) → dsa_service.py                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Layer Details

### Routes Layer (`app/routes/`)
- Receives HTTP requests
- Validates JWT token via dependency injection
- Checks role authorization
- Calls service layer
- Returns response with proper HTTP status code
- Does NOT contain business logic

### Services Layer (`app/services/`)
- Contains all business logic
- Calls one or more repositories
- Coordinates multi-step operations
- Handles domain errors (raises HTTPException)
- All critical operations use DB transactions (atomic)

### Repositories Layer (`app/repositories/`)
- Direct database access
- All SQL queries live here
- Returns SQLAlchemy model objects
- No business logic

### Models (`app/models/`)
- SQLAlchemy ORM table definitions
- All constraints defined here: NOT NULL, UNIQUE, CHECK, FK
- Relationships defined with `relationship()`

### Schemas (`app/schemas/`)
- Pydantic models for request validation and response serialization
- Request schemas: validate incoming data
- Response schemas: define what gets returned
- Keeps API contract explicit

---

## Data Flow: Issue Book

```
POST /transactions/issue
    │
    ▼ (routes/transactions.py)
    ├── Verify JWT token
    ├── Check role: LIBRARIAN or ADMIN
    └── Call TransactionService.issue_book()
         │
         ▼ (services/transaction_service.py)
         ├── BookRepository.get(book_id) — verify book exists
         ├── Check available_copies > 0
         ├── UserRepository.get(user_id) — verify user exists
         ├── TransactionRepository.get_active_by_user(user_id)
         ├── Check len(active_txs) < user.max_books_allowed
         │
         │   ── BEGIN TRANSACTION ──
         ├── BookRepository.update(book_id, available_copies - 1)
         ├── TransactionRepository.create({...})
         ├── ActivityLogRepository.create({action: ISSUE_BOOK})
         ├── NotificationRepository.create({user_id, message})
         │   ── COMMIT ──
         │   (if any step fails → ROLLBACK)
         │
         └── Return Transaction object
              │
              ▼ (routes layer)
              Return TransactionResponse (201 Created)
```

---

## Data Flow: Return Book

```
POST /transactions/return/{id}
    │
    ▼ TransactionService.return_book()
    ├── Find active transaction
    ├── Calculate days_overdue = (today - due_date).days
    │
    │   ── BEGIN TRANSACTION ──
    ├── Update transaction: status=RETURNED, return_date=today
    ├── BookRepository.update(book_id, available_copies + 1)
    ├── if days_overdue > 0:
    │   ├── FineRepository.create({amount, days_overdue})
    │   └── NotificationRepository.create({type: FINE})
    ├── ReservationRepository.get_next_pending(book_id)
    │   └── if found: update status=NOTIFIED + send notification
    ├── ActivityLogRepository.create({action: RETURN_BOOK})
    │   ── COMMIT ──
    └── Return transaction
```

---

## Authentication Flow

```
POST /auth/login  {email, password}
    │
    ▼ AuthService.login()
    ├── UserRepository.get_by_email(email)
    ├── security.verify_password(plain, hashed)
    ├── if invalid: raise 401
    └── security.create_access_token({sub: user.id, role: user.role})
         └── Returns: {access_token, token_type, user}

Protected Route:
    Authorization: Bearer <token>
    │
    ▼ core/dependencies.py: get_current_user()
    ├── Decode JWT
    ├── Extract user_id
    ├── Load user from DB
    └── Inject into route handler

Role Check:
    require_role([RoleEnum.ADMIN, RoleEnum.LIBRARIAN])
    └── Compare current_user.role to allowed list
```

---

## Frontend Architecture

```
React App
│
├── Router (React Router v6)
│   ├── Public routes: /login, /register
│   └── Protected routes: everything else
│       └── ProtectedRoute checks auth store
│
├── State Management
│   ├── Zustand: auth state (token, user) — persisted to localStorage
│   └── TanStack Query: all server state (books, transactions, etc.)
│       ├── Automatic caching (staleTime: 30s)
│       ├── Background refetch
│       └── Optimistic updates via mutation invalidation
│
├── API Layer
│   └── Axios instance (api/client.ts)
│       ├── Base URL: http://localhost:8000
│       ├── Request interceptor: attach Bearer token
│       └── Response interceptor: 401 → logout + redirect
│
└── Component Hierarchy
    ├── AppLayout (sidebar + topbar)
    │   ├── Sidebar (navigation)
    │   └── TopBar (search, notifications, user menu)
    └── Page components
        └── Custom hooks (useBooks, useTransactions, etc.)
            └── API calls via TanStack Query
```

---

## Database Design

See [DATABASE.md](DATABASE.md) for full schema.

Key design decisions:
- **UUIDs for all primary keys** — globally unique, safe to expose in URLs
- **Enum types for status fields** — prevents invalid data at DB level
- **Foreign keys with CASCADE** — maintains referential integrity
- **Indexes on** isbn, title, email, username — fast lookups
- **CHECK constraints**: available_copies >= 0, fine.amount >= 0
- **Separate book_authors join table** — many-to-many books ↔ authors
- **Atomic transactions** for all multi-table operations

---

## Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens signed with HS256, configurable expiry
- Role checked server-side on every protected route
- CORS restricted to known frontend origins
- No sensitive data in error responses (generic messages for production)
- SQL injection impossible — SQLAlchemy parameterized queries only
