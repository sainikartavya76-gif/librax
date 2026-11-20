# LIBRAX — API Reference

Base URL: `http://localhost:8000`

All protected endpoints require: `Authorization: Bearer <access_token>`

Interactive docs: http://localhost:8000/docs

---

## Authentication

### POST /auth/register
Create a new student account.
```json
Request:
{
  "email": "student@example.com",
  "username": "student01",
  "full_name": "Student Name",
  "password": "Student@123",
  "phone": "+91-9876543210"
}

Response 201:
{
  "id": "uuid",
  "email": "student@example.com",
  "username": "student01",
  "full_name": "Student Name",
  "role": "STUDENT"
}
```

### POST /auth/login
Authenticate and receive a JWT token.
```json
Request:
{
  "email": "admin@librax.com",
  "password": "Admin@123"
}

Response 200:
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": { "id": "...", "email": "...", "role": "ADMIN" }
}
```

### GET /auth/me
Returns the currently authenticated user.
```
Response 200: User object
Response 401: { "detail": "Not authenticated" }
```

---

## Books

### GET /books
List all books with optional filtering.
```
Query params:
  skip         (int, default 0)
  limit        (int, default 100)
  search       (string) — search in title, author, isbn
  category_id  (UUID)
  available    (boolean) — true = only available books
  language     (string)
  sort_by      (title | publication_year | available_copies)
  sort_order   (asc | desc)

Response 200: Book[]
```

### POST /books (ADMIN, LIBRARIAN)
```json
Request:
{
  "isbn": "978-0-13-468599-1",
  "title": "Clean Code",
  "subtitle": "A Handbook of Agile Software Craftsmanship",
  "description": "...",
  "language": "English",
  "pages": 464,
  "edition": "1st",
  "publication_year": 2008,
  "total_copies": 5,
  "shelf_location": "CS-1.2",
  "category_id": "uuid",
  "publisher_id": "uuid",
  "author_ids": ["uuid1", "uuid2"]
}

Response 201: Book object
Response 400: { "detail": "ISBN already exists" }
```

### GET /books/{id}
```
Response 200: Book object with authors, category, publisher
Response 404: { "detail": "Book not found" }
```

### PUT /books/{id} (ADMIN, LIBRARIAN)
Same as POST body (all fields optional). Returns updated Book.

### DELETE /books/{id} (ADMIN only)
```
Response 200: { "message": "Book deleted successfully" }
Response 400: { "detail": "Cannot delete book with active transactions" }
```

### GET /books/{id}/history (ADMIN, LIBRARIAN)
Returns transaction history for a book.

### GET /books/search
```
Query params: q (required), field (title|isbn|author|category), category_id, available, skip, limit
Response 200: Book[]
```

---

## Transactions

### POST /transactions/issue (ADMIN, LIBRARIAN)
Issue a book to a student.
```json
Request:
{
  "book_id": "uuid",
  "user_id": "uuid",
  "notes": "optional note"
}

Response 201: Transaction object
Errors:
  400: "No copies available"
  400: "Maximum books allowed reached"
  400: "Student has overdue books"
  404: "Book not found"
  404: "User not found"
```

### POST /transactions/return/{id} (ADMIN, LIBRARIAN)
Return a book. Automatically calculates fines if overdue.
```
Response 200: Transaction object
Errors:
  400: "Invalid or already returned transaction"
```

### GET /transactions
```
Query params: skip, limit, status (ACTIVE|RETURNED|OVERDUE)
- ADMIN/LIBRARIAN: see all
- STUDENT: sees own only
Response 200: Transaction[]
```

### GET /transactions/overdue (ADMIN, LIBRARIAN)
Returns all active transactions past their due date.

### GET /transactions/{id}
Returns single transaction. Students can only see their own.

---

## Reservations

### POST /reservations
Reserve a book (student joins queue).
```json
Request: { "book_id": "uuid" }
Errors:
  400: "Book is currently available — please issue it directly"
  400: "You already have a pending reservation for this book"
Response 201: Reservation object with queue_position
```

### GET /reservations
```
- ADMIN/LIBRARIAN: all reservations
- STUDENT: own reservations only
```

### GET /reservations/book/{book_id}
Returns the reservation queue for a specific book (PENDING only, ordered by position).

### DELETE /reservations/{id}
Cancel a reservation. Students can cancel own; ADMIN can cancel any.

---

## Fines

### GET /fines
```
Query params: paid (boolean filter)
- ADMIN/LIBRARIAN: all fines
- STUDENT: own fines
```

### PATCH /fines/{id}/pay (ADMIN, LIBRARIAN)
Mark a fine as paid.
```
Response 200: Updated Fine object
```

### GET /fines/unpaid (ADMIN, LIBRARIAN)
All unpaid fines.

---

## Notifications

### GET /notifications
Returns current user's notifications, newest first (max 100).

### PATCH /notifications/{id}/read
Mark a notification as read.

### PATCH /notifications/read-all
Mark all current user's notifications as read.
```
Response 200: { "marked_read": N }
```

### DELETE /notifications/{id}
Delete a notification.

---

## Analytics

### GET /analytics/dashboard (ADMIN, LIBRARIAN)
```json
Response 200:
{
  "total_books": 100,
  "total_users": 30,
  "books_issued_today": 5,
  "books_returned_today": 3,
  "overdue_count": 8,
  "active_reservations": 12,
  "fines_collected_today": 40.0,
  "books_added_this_month": 10,
  "new_members_this_month": 5,
  "recent_activity": [...],
  "overdue_books": [...],
  "popular_books": [...],
  "popular_categories": [...]
}
```

### GET /analytics/charts/issuance (ADMIN, LIBRARIAN)
```
Query: days (int, default 30)
Response: { "labels": ["2024-01-01", ...], "data": [5, 3, 8, ...] }
```

### GET /analytics/charts/categories (ADMIN, LIBRARIAN)
```
Response: { "labels": ["Science Fiction", ...], "data": [25, 15, ...] }
```

### GET /analytics/charts/fines (ADMIN, LIBRARIAN)
```
Response: { "labels": [...dates], "data": [...amounts] }
```

### GET /analytics/top-books (ADMIN, LIBRARIAN)
```
Query: limit (int, default 10)
Response: [{ "id": "uuid", "title": "...", "isbn": "...", "issue_count": 15 }]
```

### GET /analytics/member-activity (ADMIN, LIBRARIAN)
Top members by borrow count.

---

## DSA

### GET /dsa/search
```
Query params:
  q         (string, required) — search query
  field     (title|isbn|author|category)
  algorithm (linear|binary|hash|bst)

Response:
{
  "results": [...books],
  "algorithm_used": "linear",
  "execution_time_ms": 2.341,
  "complexity_info": "O(N)",
  "comparisons": 100
}
```

### GET /dsa/sort
```
Query params:
  field     (title|isbn)
  algorithm (bubble|selection|insertion|merge|quick|heap)
  limit     (int, default 50)

Response:
{
  "sorted_data": [...books],
  "algorithm_used": "merge",
  "execution_time_ms": 0.891,
  "comparisons": 287,
  "swaps": 145,
  "time_complexity": "O(N log N)",
  "space_complexity": "O(N)"
}
```

### GET /dsa/visualize/queue
Returns the current reservation queue for Stack/Queue DSA visualization.

### GET /dsa/visualize/stack
Returns recent librarian operations for Stack DSA visualization.

---

## Activity Log

### GET /activity (ADMIN, LIBRARIAN)
```
Query params: skip, limit, action (filter by action type)
Response: ActivityLog[]
```

---

## Users (Admin/Librarian)

### GET /users (ADMIN, LIBRARIAN)
```
Query: skip, limit, search (name/email), role, is_active
```

### GET /users/{id}
ADMIN or own user only.

### PUT /users/{id}
Update user profile. ADMIN can update any; users can update own limited fields.

### DELETE /users/{id} (ADMIN only)

### PATCH /users/{id}/activate (ADMIN only)
### PATCH /users/{id}/deactivate (ADMIN only)

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error or business rule violation) |
| 401 | Unauthorized (no token or invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 422 | Unprocessable Entity (Pydantic validation failed) |
| 500 | Internal Server Error |

Error response format:
```json
{ "detail": "Error message here" }
```
For validation errors (422):
```json
{
  "detail": [
    { "loc": ["body", "email"], "msg": "value is not a valid email address", "type": "value_error.email" }
  ]
}
```
