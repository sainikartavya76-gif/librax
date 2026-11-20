# LIBRAX — DSA Engine Documentation

The DSA engine is implemented in C (`dsa-engine/`) and integrated with the Python backend via a `ctypes` bridge.

---

## Architecture

```
FastAPI Route
    ↓
Python DSA Service (dsa_service.py)
    ↓
ctypes Bridge (python_bridge/dsa_bridge.py)
    ↓
Compiled C Shared Library (librax_dsa.so / .dll)
    ↓
Real C implementations
```

---

## Data Structures

### Stack — Librarian Undo Operations
- **File**: `src/stack.c`
- **Implementation**: Array-based stack with dynamic capacity
- **Library Use**: Each librarian action (issue, return, add book) is pushed onto the stack. The UI "Activity Stack" visualizes recent undoable operations.
- **Operations**: push, pop, peek — O(1) each
- **Complexity**: Time O(1) push/pop, Space O(n)

### Queue — Book Reservation Queue
- **File**: `src/queue.c`, `src/circular_queue.c`
- **Implementation**: Array-based FIFO queue
- **Library Use**: When a book has no available copies, students join the reservation queue. First-in, first-notified when a copy becomes available.
- **Operations**: enqueue, dequeue, position lookup
- **Complexity**: Time O(1) enqueue/dequeue, Space O(n)

### Singly Linked List — Borrow History
- **File**: `src/linkedlist.c`
- **Implementation**: Node-based singly linked list with head pointer
- **Library Use**: Represents a student's chronological borrow history
- **Complexity**: Append O(1), Search O(n), Delete O(n)

### Doubly Linked List — Bidirectional Traversal
- **File**: `src/doubly_linkedlist.c`
- **Implementation**: Doubly linked with prev/next pointers
- **Library Use**: When traversal in both directions is needed
- **Complexity**: Same as singly but bidirectional

### BST (Binary Search Tree) — Book ID Index
- **File**: `src/bst.c`
- **Implementation**: Standard BST with recursive insert/delete/search
- **Library Use**: Book IDs are indexed in a BST for O(log n) average lookup
- **Operations**: insert, search, delete, inorder traversal, height
- **Complexity**: Average O(log n), Worst O(n) — insert/search/delete

### Hash Table — ISBN Lookup
- **File**: `src/hashtable.c`
- **Implementation**: Separate chaining with djb2 hash function, auto-resize at 0.75 load factor
- **Library Use**: ISBN → book record lookup in O(1) average time
- **Operations**: insert, search, delete, resize
- **Complexity**: Average O(1), Worst O(n) — all operations

### Max Heap — Popular Books
- **File**: `src/heap.c`
- **Implementation**: Binary heap stored in array, heapify up/down
- **Library Use**: Tracks most requested books; max-heap gives top popular books efficiently
- **Operations**: insert, extract-max, peek
- **Complexity**: O(log n) insert/extract, O(1) peek

### Graph — Book Recommendations
- **File**: `src/graph.c`
- **Implementation**: Adjacency list with edge weights (relationship strength)
- **Library Use**: Books with shared categories/authors are connected. BFS/DFS traverses recommendation paths.
- **Operations**: add vertex, add edge, BFS, DFS, neighbor list
- **Complexity**: BFS/DFS O(V + E), Space O(V + E)

---

## Algorithms

### Searching

| Algorithm | File | Complexity | Library Use |
|-----------|------|-----------|-------------|
| Linear Search | `searching.c` | O(n) | General field search, works on unsorted data |
| Binary Search | `searching.c` | O(log n) | Title search on sorted array |
| Hash Search | `hashtable.c` | O(1) avg | ISBN lookup |
| BST Search | `bst.c` | O(log n) avg | Book ID lookup |

Each search returns: `found`, `index`, `comparisons`, `time_ns`, `algorithm`, `complexity`.

### Sorting

| Algorithm | Time (Avg) | Time (Worst) | Space | Stable |
|-----------|------------|--------------|-------|--------|
| Bubble Sort | O(n²) | O(n²) | O(1) | Yes |
| Selection Sort | O(n²) | O(n²) | O(1) | No |
| Insertion Sort | O(n²) | O(n²) | O(1) | Yes |
| Merge Sort | O(n log n) | O(n log n) | O(n) | Yes |
| Quick Sort | O(n log n) | O(n²) | O(log n) | No |
| Heap Sort | O(n log n) | O(n log n) | O(1) | No |

Each sort returns: `comparisons`, `swaps`, `time_ns`, sorted result, complexity info.

### Graph Traversal (BFS/DFS)

Used for book recommendation traversal:
- **BFS**: Level-order traversal — finds closely related books first
- **DFS**: Depth-first — explores deep recommendation chains

---

## Compilation

### Linux / Mac

```bash
cd dsa-engine
make all      # Compiles everything
make lib      # Shared library only: librax_dsa.so
make test     # Run unit tests
make clean    # Remove built files
```

### Windows (MinGW)

```bash
cd dsa-engine
mingw32-make all
```

---

## Python Bridge

```python
from python_bridge.dsa_bridge import LibraxDSABridge

bridge = LibraxDSABridge()

# Search by ISBN (hash table)
result = bridge.search_by_isbn('978-0-13-468599-1')
print(result)  # {'found': True, 'book_id': 42, 'time_ns': 1250}

# Sort books
result = bridge.sort_books(book_list, algorithm='quicksort')
print(result)  # {'sorted': [...], 'comparisons': 45, 'swaps': 12, 'time_ns': 8000}

# Get recommendations (BFS)
result = bridge.get_recommendations(book_id=5, method='bfs', max_results=10)
```

The bridge gracefully falls back to pure Python implementations if the compiled library is not found.

---

## DSA ↔ Library Feature Mapping

| DSA | Library Feature |
|-----|----------------|
| Stack | Librarian undo stack — recent operations |
| Queue | Reservation queue — FIFO waiting list |
| Linked List | Student borrow history chain |
| BST | Book catalog index by ID |
| Hash Table | O(1) ISBN lookup in catalogue |
| Max Heap | Most borrowed/requested books ranking |
| Graph + BFS | Book recommendation traversal |
| Graph + DFS | Deep recommendation chains |
| Merge Sort | Stable catalogue sorting |
| Quick Sort | Fast in-place catalogue sort |
| Binary Search | O(log n) title search |
| Hash Search | O(1) ISBN lookup |
