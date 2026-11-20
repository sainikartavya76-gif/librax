# LIBRAX — Database Schema

---

## Entity Relationship Diagram

```
users
  ├──< transactions (user_id)
  ├──< transactions (issued_by)
  ├──< reservations (user_id)
  ├──< fines (user_id)
  ├──< notifications (user_id)
  └──< activity_logs (user_id)

books
  ├──< transactions (book_id)
  ├──< reservations (book_id)
  ├──>  categories (category_id)
  ├──>  publishers (publisher_id)
  └──<> authors (via book_authors)

authors
  └──<> books (via book_authors)

categories
  └──< books

publishers
  └──< books

transactions
  └──< fines (transaction_id)
```

---

## Tables

### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default uuid4 |
| email | VARCHAR | UNIQUE, NOT NULL, INDEX |
| username | VARCHAR | UNIQUE, NOT NULL, INDEX |
| full_name | VARCHAR | NOT NULL |
| hashed_password | VARCHAR | NOT NULL |
| role | ENUM(ADMIN,LIBRARIAN,STUDENT) | NOT NULL, default STUDENT |
| is_active | BOOLEAN | default TRUE |
| phone | VARCHAR | nullable |
| address | TEXT | nullable |
| membership_date | DATE | default today |
| membership_expiry | DATE | nullable |
| max_books_allowed | INTEGER | default 3 |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | auto-updated |

### `books`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| isbn | VARCHAR | UNIQUE, NOT NULL, INDEX |
| title | VARCHAR | NOT NULL, INDEX |
| subtitle | VARCHAR | nullable |
| description | TEXT | nullable |
| language | VARCHAR | default 'English' |
| pages | INTEGER | nullable, CHECK > 0 |
| edition | VARCHAR | nullable |
| publication_year | INTEGER | nullable |
| total_copies | INTEGER | NOT NULL, CHECK >= 0 |
| available_copies | INTEGER | NOT NULL, CHECK >= 0 |
| shelf_location | VARCHAR | nullable |
| cover_image_url | VARCHAR | nullable |
| category_id | UUID | FK → categories.id, nullable |
| publisher_id | UUID | FK → publishers.id, nullable |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `authors`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR | UNIQUE, NOT NULL |
| bio | TEXT | nullable |
| created_at | TIMESTAMP | |

### `categories`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR | UNIQUE, NOT NULL |
| description | TEXT | nullable |
| color_code | VARCHAR | nullable (hex color for UI) |

### `publishers`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR | UNIQUE, NOT NULL |
| address | TEXT | nullable |
| website | VARCHAR | nullable |

### `book_authors` (join table)
| Column | Type | Constraints |
|--------|------|-------------|
| book_id | UUID | FK → books.id, composite PK |
| author_id | UUID | FK → authors.id, composite PK |

### `transactions`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| book_id | UUID | FK → books.id, NOT NULL |
| user_id | UUID | FK → users.id, NOT NULL |
| issued_by | UUID | FK → users.id, NOT NULL |
| issue_date | DATE | NOT NULL |
| due_date | DATE | NOT NULL |
| return_date | DATE | nullable |
| status | ENUM(ACTIVE,RETURNED,OVERDUE) | NOT NULL, default ACTIVE |
| notes | TEXT | nullable |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `reservations`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| book_id | UUID | FK → books.id, NOT NULL |
| user_id | UUID | FK → users.id, NOT NULL |
| queue_position | INTEGER | NOT NULL |
| status | ENUM(PENDING,NOTIFIED,CANCELLED,FULFILLED) | default PENDING |
| created_at | TIMESTAMP | |
| notified_at | TIMESTAMP | nullable |
| expires_at | TIMESTAMP | nullable |

### `fines`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| transaction_id | UUID | FK → transactions.id, NOT NULL |
| user_id | UUID | FK → users.id, NOT NULL |
| amount | DECIMAL(10,2) | NOT NULL, CHECK >= 0 |
| days_overdue | INTEGER | NOT NULL |
| paid | BOOLEAN | default FALSE |
| paid_at | TIMESTAMP | nullable |
| created_at | TIMESTAMP | |

### `notifications`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| title | VARCHAR | NOT NULL |
| message | TEXT | NOT NULL |
| type | ENUM(DUE_REMINDER,AVAILABLE,FINE,SYSTEM) | NOT NULL |
| is_read | BOOLEAN | default FALSE |
| created_at | TIMESTAMP | |
| read_at | TIMESTAMP | nullable |

### `activity_logs`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, nullable |
| action | VARCHAR | NOT NULL (e.g. ISSUE_BOOK, ADD_BOOK) |
| entity_type | VARCHAR | NOT NULL (e.g. Transaction, Book) |
| entity_id | UUID | nullable |
| description | TEXT | nullable |
| ip_address | VARCHAR | nullable |
| created_at | TIMESTAMP | |

---

## Key Business Rules (Enforced in DB + Code)

1. `books.available_copies` cannot go below 0 (CHECK constraint + service validation)
2. `fines.amount` cannot be negative (CHECK constraint)
3. `books.isbn` must be globally unique
4. `users.email` and `users.username` must be globally unique
5. A user cannot have two active transactions for the same book simultaneously (enforced in service layer)
6. A user cannot reserve a book they currently have borrowed (enforced in service)
7. `transactions.due_date` must be after `issue_date` (enforced in service)
8. When a transaction is returned and `available_copies` increases, the next PENDING reservation is notified (service layer triggers this)

---

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_book_id ON transactions(book_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_reservations_book_id ON reservations(book_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_fines_user_id ON fines(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

---

## Migrations

LIBRAX uses Alembic for database migrations.

```bash
# Generate migration from model changes
alembic revision --autogenerate -m "description"

# Apply all pending migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1

# View migration history
alembic history
```

Alembic is configured in `alembic.ini` and `alembic/env.py` to use the same DATABASE_URL from settings.
