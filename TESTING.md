# LIBRAX — Testing Guide

---

## Backend Tests

### Setup

```bash
cd backend

# Install dependencies (includes pytest, pytest-asyncio, httpx)
pip install -r requirements.txt

# Set test database (different from production!)
export DATABASE_URL="postgresql+asyncpg://librax_user:librax_secret@localhost:5432/librax_test"
```

### Run All Tests

```bash
pytest tests/ -v
```

### Run Specific Test File

```bash
pytest tests/test_auth.py -v
pytest tests/test_books.py -v
pytest tests/test_transactions.py -v
pytest tests/test_reservations.py -v
pytest tests/test_fines.py -v
```

---

## Test Coverage Areas

### Authentication (`test_auth.py`)

- ✅ Register new user with valid data
- ✅ Register fails with duplicate email
- ✅ Register fails with invalid email format
- ✅ Login with correct credentials
- ✅ Login fails with wrong password
- ✅ Login fails with unknown email
- ✅ `/auth/me` returns current user for authenticated request
- ✅ `/auth/me` returns 401 for unauthenticated request

### Books (`test_books.py`)

- ✅ Create book as ADMIN — success
- ✅ Create book as LIBRARIAN — success
- ✅ Create book as STUDENT — 403 Forbidden
- ✅ Create book with duplicate ISBN — 400 error
- ✅ Get book list — returns paginated results
- ✅ Get book by ID — returns full details
- ✅ Get non-existent book — 404
- ✅ Update book as ADMIN — success
- ✅ Update book as STUDENT — 403
- ✅ Delete book as ADMIN — success
- ✅ Delete book as LIBRARIAN — 403
- ✅ Search books by title
- ✅ Search books by ISBN
- ✅ Filter books by category

### Transactions (`test_transactions.py`)

- ✅ Issue book — success flow
- ✅ Issue book — fails if no copies available
- ✅ Issue book — fails if student at borrowing limit
- ✅ Issue book — fails if book not found
- ✅ Issue book — fails if user not found
- ✅ Issue as STUDENT — 403 Forbidden
- ✅ Return book — success, available_copies incremented
- ✅ Return book — calculates correct fine (₹2/day)
- ✅ Return book — no fine if returned on time
- ✅ Return already-returned book — 400 error
- ✅ Get transaction list — LIBRARIAN sees all, STUDENT sees own

### Reservations (`test_reservations.py`)

- ✅ Create reservation when book unavailable — success
- ✅ Create reservation when book available — returns error (should issue instead)
- ✅ Create duplicate reservation — 400 error
- ✅ Queue position assigned correctly (incremental)
- ✅ Cancel own reservation — success
- ✅ Cancel another user's reservation as STUDENT — 403
- ✅ Cancel as ADMIN — success regardless
- ✅ On return: next reservation in queue is notified
- ✅ Queue positions update after cancellation

### Fines (`test_fines.py`)

- ✅ Fine created automatically on overdue return
- ✅ Fine amount = days_overdue * 2
- ✅ No fine created for on-time return
- ✅ Fine marked as paid by LIBRARIAN — success
- ✅ Fine marked as paid by STUDENT — 403
- ✅ Get own fines as STUDENT

---

## C DSA Engine Tests

### Compile and Run

```bash
cd dsa-engine
make test
./bin/test_all      # Linux/Mac
.\bin\test_all.exe  # Windows
```

Expected output:
```
=== STACK TESTS ===
PASS: stack_push
PASS: stack_pop
PASS: stack_peek_empty
PASS: stack_overflow

=== QUEUE TESTS ===
PASS: enqueue
PASS: dequeue
PASS: queue_position
PASS: queue_empty

=== BST TESTS ===
PASS: bst_insert
PASS: bst_search_found
PASS: bst_search_notfound
PASS: bst_delete
PASS: bst_inorder_sorted

=== HASH TABLE TESTS ===
PASS: ht_insert
PASS: ht_search_found
PASS: ht_collision_handling
PASS: ht_delete
PASS: ht_resize_triggered

=== HEAP TESTS ===
PASS: max_heap_insert
PASS: max_heap_extract_gives_max
PASS: min_heap_extract_gives_min

=== GRAPH TESTS ===
PASS: graph_add_vertex
PASS: graph_add_edge
PASS: bfs_traversal_order
PASS: dfs_traversal_order

=== SORTING TESTS ===
PASS: bubble_sort_correctness
PASS: selection_sort_correctness
PASS: insertion_sort_correctness
PASS: merge_sort_correctness
PASS: quick_sort_correctness
PASS: heap_sort_correctness
PASS: all_sorts_same_result

=== SEARCHING TESTS ===
PASS: linear_search_found
PASS: linear_search_not_found
PASS: binary_search_found
PASS: binary_search_requires_sorted

All tests passed: 35/35
```

---

## Integration Testing (Manual Checklist)

Run this checklist before every demo:

```
[ ] 1. docker compose up --build succeeds without errors
[ ] 2. http://localhost:8000/docs loads API documentation
[ ] 3. http://localhost:5173 loads frontend
[ ] 4. Register new user → success
[ ] 5. Login as admin@librax.com → reaches dashboard
[ ] 6. Dashboard stats show real numbers (not 0 or hardcoded)
[ ] 7. Books page shows 100+ books from seed data
[ ] 8. Search "Python" returns relevant books
[ ] 9. Add a new book → appears in catalogue immediately
[ ] 10. Edit book → changes reflected in catalogue
[ ] 11. Issue a book → available copies decrease by 1
[ ] 12. Return issued book → available copies increase by 1
[ ] 13. Return overdue book → fine generated, notification sent
[ ] 14. Student reserves unavailable book → joins queue
[ ] 15. Return book with reservations → next student notified
[ ] 16. Analytics charts load with real data
[ ] 17. DSA Lab: run a search → shows real results + timing
[ ] 18. DSA Lab: run bubble sort → shows comparisons + swaps
[ ] 19. DSA Lab: queue visualizer shows reservation queue
[ ] 20. DSA Lab: stack visualizer shows recent operations
[ ] 21. Notifications page shows real notifications
[ ] 22. Mark notification as read → blue dot disappears
[ ] 23. Activity log shows all recent actions
[ ] 24. Fines page shows unpaid fines
[ ] 25. Mark fine as paid → status updates
[ ] 26. Refresh browser → data persists (PostgreSQL)
[ ] 27. Mobile layout (360px) → no horizontal scroll
[ ] 28. Mobile layout (768px) → sidebar collapses correctly
[ ] 29. Student cannot access /members page → 403 shown
[ ] 30. Student cannot issue a book via API → 403 returned
```
