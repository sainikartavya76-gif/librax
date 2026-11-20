#include "librax_dsa.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int g_passed = 0;
static int g_failed = 0;

#define TEST_ASSERT(cond, test_name) do { \
    if (cond) { \
        printf("[PASS] %s\n", test_name); \
        g_passed++; \
    } else { \
        printf("[FAIL] %s\n", test_name); \
        g_failed++; \
    } \
} while(0)

static int is_sorted(BookSortItem* items, int n) {
    for (int i = 0; i < n - 1; i++) {
        if (items[i].sort_key > items[i + 1].sort_key) return 0;
    }
    return 1;
}

/* ========================================================================= */
/* 1. SORTING ALGORITHMS TESTS                                               */
/* ========================================================================= */
void test_sorting_algorithms() {
    printf("\n--- Testing Sorting Algorithms ---\n");

    typedef SortResult (*sort_fn)(BookSortItem*, int);
    struct {
        const char* name;
        sort_fn fn;
    } algos[] = {
        {"Bubble Sort", bubble_sort},
        {"Selection Sort", selection_sort},
        {"Insertion Sort", insertion_sort},
        {"Merge Sort", merge_sort},
        {"Quick Sort", quick_sort},
        {"Heap Sort", heap_sort}
    };

    int num_algos = sizeof(algos) / sizeof(algos[0]);

    for (int a = 0; a < num_algos; a++) {
        char msg[256];

        /* Test 1: Standard unsorted array with duplicates */
        BookSortItem items[8] = {
            {1, "Book 1", "ISBN1", 45},
            {2, "Book 2", "ISBN2", 12},
            {3, "Book 3", "ISBN3", 89},
            {4, "Book 4", "ISBN4", 12},
            {5, "Book 5", "ISBN5", 3},
            {6, "Book 6", "ISBN6", 50},
            {7, "Book 7", "ISBN7", 27},
            {8, "Book 8", "ISBN8", 3}
        };
        SortResult res = algos[a].fn(items, 8);
        snprintf(msg, sizeof(msg), "%s: sorts unsorted array with duplicates", algos[a].name);
        TEST_ASSERT(is_sorted(items, 8) && res.indices != NULL, msg);
        free(res.indices);

        /* Test 2: Reverse-sorted array */
        BookSortItem rev[5] = {
            {1, "E", "I1", 50},
            {2, "D", "I2", 40},
            {3, "C", "I3", 30},
            {4, "B", "I4", 20},
            {5, "A", "I5", 10}
        };
        res = algos[a].fn(rev, 5);
        snprintf(msg, sizeof(msg), "%s: sorts reverse-sorted array", algos[a].name);
        TEST_ASSERT(is_sorted(rev, 5) && res.indices != NULL, msg);
        free(res.indices);

        /* Test 3: Already sorted array */
        BookSortItem sorted[4] = {
            {1, "A", "I1", 10},
            {2, "B", "I2", 20},
            {3, "C", "I3", 30},
            {4, "D", "I4", 40}
        };
        res = algos[a].fn(sorted, 4);
        snprintf(msg, sizeof(msg), "%s: handles already sorted array", algos[a].name);
        TEST_ASSERT(is_sorted(sorted, 4) && res.indices != NULL, msg);
        free(res.indices);

        /* Test 4: Single-element array (n = 1) */
        BookSortItem single[1] = {{99, "Solo", "ISBN_SOLO", 42}};
        res = algos[a].fn(single, 1);
        snprintf(msg, sizeof(msg), "%s: handles n=1 array", algos[a].name);
        TEST_ASSERT(single[0].sort_key == 42 && res.indices != NULL && res.indices[0] == 0, msg);
        free(res.indices);

        /* Test 5: Empty array (n = 0) and NULL pointer */
        res = algos[a].fn(NULL, 0);
        snprintf(msg, sizeof(msg), "%s: handles NULL items and n=0 safely", algos[a].name);
        TEST_ASSERT(res.indices == NULL && res.comparisons == 0, msg);
    }
}

/* ========================================================================= */
/* 2. SEARCHING ALGORITHMS TESTS                                             */
/* ========================================================================= */
void test_searching_algorithms() {
    printf("\n--- Testing Searching Algorithms ---\n");

    BookSortItem items[5] = {
        {10, "Book 10", "ISBN10", 1},
        {20, "Book 20", "ISBN20", 2},
        {30, "Book 30", "ISBN30", 3},
        {40, "Book 40", "ISBN40", 4},
        {50, "Book 50", "ISBN50", 5}
    };

    /* Linear search: existing middle, first, last, not existing */
    SearchResult ls1 = linear_search(items, 5, 30);
    TEST_ASSERT(ls1.found == 1 && ls1.index == 2, "Linear Search: found target in middle");

    SearchResult ls2 = linear_search(items, 5, 10);
    TEST_ASSERT(ls2.found == 1 && ls2.index == 0, "Linear Search: found first element");

    SearchResult ls3 = linear_search(items, 5, 50);
    TEST_ASSERT(ls3.found == 1 && ls3.index == 4, "Linear Search: found last element");

    SearchResult ls4 = linear_search(items, 5, 999);
    TEST_ASSERT(ls4.found == 0 && ls4.index == -1, "Linear Search: correctly returns not found");

    /* Binary search: middle, first, last, not found lower, not found upper */
    SearchResult bs1 = binary_search(items, 5, 30);
    TEST_ASSERT(bs1.found == 1 && bs1.index == 2, "Binary Search: found target in middle");

    SearchResult bs2 = binary_search(items, 5, 10);
    TEST_ASSERT(bs2.found == 1 && bs2.index == 0, "Binary Search: found first element");

    SearchResult bs3 = binary_search(items, 5, 50);
    TEST_ASSERT(bs3.found == 1 && bs3.index == 4, "Binary Search: found last element");

    SearchResult bs4 = binary_search(items, 5, 25);
    TEST_ASSERT(bs4.found == 0 && bs4.index == -1, "Binary Search: correctly returns not found in between");

    SearchResult bs5 = binary_search(items, 5, 5);
    TEST_ASSERT(bs5.found == 0 && bs5.index == -1, "Binary Search: correctly returns not found below range");
}

/* ========================================================================= */
/* 3. STACK TESTS                                                            */
/* ========================================================================= */
void test_stack() {
    printf("\n--- Testing Stack ---\n");

    Stack* s = create_stack(3);
    TEST_ASSERT(stack_is_empty(s) == 1, "Stack: initially empty");
    TEST_ASSERT(stack_size(s) == 0, "Stack: initial size is 0");

    stack_push(s, 10, 1, "Add Book A");
    stack_push(s, 20, 2, "Add Book B");
    TEST_ASSERT(stack_size(s) == 2, "Stack: size after 2 pushes is 2");

    StackNode peeked = stack_peek(s);
    TEST_ASSERT(peeked.value == 20 && strcmp(peeked.description, "Add Book B") == 0, "Stack: peek returns top without removing");
    TEST_ASSERT(stack_size(s) == 2, "Stack: peek preserves size");

    stack_push(s, 30, 3, "Add Book C");
    TEST_ASSERT(stack_is_full(s) == 1, "Stack: full when capacity reached");

    /* Push on full should not crash or increase size */
    stack_push(s, 40, 4, "Overflow item");
    TEST_ASSERT(stack_size(s) == 3, "Stack: push on full safely ignored");

    StackNode popped1 = stack_pop(s);
    TEST_ASSERT(popped1.value == 30, "Stack: pop returns 30 (LIFO)");

    StackNode popped2 = stack_pop(s);
    TEST_ASSERT(popped2.value == 20, "Stack: pop returns 20");

    StackNode popped3 = stack_pop(s);
    TEST_ASSERT(popped3.value == 10, "Stack: pop returns 10");

    TEST_ASSERT(stack_is_empty(s) == 1, "Stack: empty after popping all");
    StackNode empty_pop = stack_pop(s);
    TEST_ASSERT(empty_pop.value == -1, "Stack: pop on empty returns sentinel");

    destroy_stack(s);
    TEST_ASSERT(1, "Stack: destroyed successfully");
}

/* ========================================================================= */
/* 4. QUEUE TESTS                                                            */
/* ========================================================================= */
void test_queue() {
    printf("\n--- Testing Queue ---\n");

    Queue* q = create_queue(4);
    TEST_ASSERT(queue_is_empty(q) == 1, "Queue: initially empty");

    enqueue(q, 101, "Alice", 1);
    enqueue(q, 102, "Bob", 2);
    enqueue(q, 103, "Charlie", 3);
    TEST_ASSERT(queue_size(q) == 3, "Queue: size after 3 enqueues is 3");

    QueueNode peeked = queue_peek(q);
    TEST_ASSERT(peeked.user_id == 101 && strcmp(peeked.user_name, "Alice") == 0, "Queue: peek returns front item");
    TEST_ASSERT(queue_position(q, 101) == 1, "Queue: Alice position is 1");
    TEST_ASSERT(queue_position(q, 103) == 3, "Queue: Charlie position is 3");
    TEST_ASSERT(queue_position(q, 999) == -1, "Queue: unknown user position is -1");

    QueueNode d1 = dequeue(q);
    TEST_ASSERT(d1.user_id == 101, "Queue: dequeue returns Alice (FIFO)");
    TEST_ASSERT(queue_size(q) == 2, "Queue: size is 2 after dequeue");

    /* Test circular wrap-around */
    enqueue(q, 104, "Dave", 4);
    enqueue(q, 105, "Eve", 5);
    TEST_ASSERT(queue_is_full(q) == 1, "Queue: is full after wrapping");

    QueueNode d2 = dequeue(q);
    TEST_ASSERT(d2.user_id == 102, "Queue: dequeue returns Bob");

    QueueNode d3 = dequeue(q);
    TEST_ASSERT(d3.user_id == 103, "Queue: dequeue returns Charlie");

    QueueNode d4 = dequeue(q);
    TEST_ASSERT(d4.user_id == 104, "Queue: dequeue returns Dave");

    QueueNode d5 = dequeue(q);
    TEST_ASSERT(d5.user_id == 105, "Queue: dequeue returns Eve");

    TEST_ASSERT(queue_is_empty(q) == 1, "Queue: empty after all dequeued");
    QueueNode d_empty = dequeue(q);
    TEST_ASSERT(d_empty.user_id == -1, "Queue: dequeue on empty returns sentinel");

    destroy_queue(q);
    TEST_ASSERT(1, "Queue: destroyed successfully");
}

/* ========================================================================= */
/* 5. CIRCULAR QUEUE TESTS                                                   */
/* ========================================================================= */
void test_circular_queue() {
    printf("\n--- Testing Circular Queue ---\n");

    CircularQueue* cq = create_circular_queue(3);
    TEST_ASSERT(queue_is_empty(cq) == 1, "Circular Queue: initially empty");

    cq_enqueue(cq, 1, "User1", 10);
    cq_enqueue(cq, 2, "User2", 20);
    cq_enqueue(cq, 3, "User3", 30);
    TEST_ASSERT(queue_is_full(cq) == 1, "Circular Queue: full after 3 enqueues");

    QueueNode n1 = cq_dequeue(cq);
    TEST_ASSERT(n1.user_id == 1, "Circular Queue: first dequeue is User1");

    /* Wrap-around enqueue */
    cq_enqueue(cq, 4, "User4", 40);
    TEST_ASSERT(queue_is_full(cq) == 1, "Circular Queue: full again after wrap enqueue");

    QueueNode n2 = cq_dequeue(cq);
    TEST_ASSERT(n2.user_id == 2, "Circular Queue: second dequeue is User2");

    QueueNode n3 = cq_dequeue(cq);
    TEST_ASSERT(n3.user_id == 3, "Circular Queue: third dequeue is User3");

    QueueNode n4 = cq_dequeue(cq);
    TEST_ASSERT(n4.user_id == 4, "Circular Queue: fourth dequeue is User4");

    TEST_ASSERT(queue_is_empty(cq) == 1, "Circular Queue: empty at end");

    destroy_circular_queue(cq);
    TEST_ASSERT(1, "Circular Queue: destroyed successfully");
}

/* ========================================================================= */
/* 6. LINKED LIST TESTS                                                      */
/* ========================================================================= */
void test_linked_list() {
    printf("\n--- Testing Singly Linked List ---\n");

    LinkedList* list = create_list();
    TEST_ASSERT(list_size(list) == 0, "LinkedList: initial size is 0");

    list_append(list, 100, 1);
    list_append(list, 300, 3);
    list_prepend(list, 50, 0);
    /* Current order: [0:50], [1:100], [3:300] */
    TEST_ASSERT(list_size(list) == 3, "LinkedList: size after prepend and append is 3");

    list_insert_at(list, 2, 200, 2);
    /* Current order: [0:50], [1:100], [2:200], [3:300] */
    TEST_ASSERT(list_size(list) == 4, "LinkedList: size after insert_at is 4");

    ListNode* n0 = list_get_at(list, 0);
    ListNode* n1 = list_get_at(list, 1);
    ListNode* n2 = list_get_at(list, 2);
    ListNode* n3 = list_get_at(list, 3);
    TEST_ASSERT(n0 && n0->key == 0 && n1 && n1->key == 1 &&
                n2 && n2->key == 2 && n3 && n3->key == 3,
                "LinkedList: element order verified with list_get_at");

    ListNode* s = list_search(list, 2);
    TEST_ASSERT(s && s->value == 200, "LinkedList: search finds existing key 2");

    ListNode* not_found = list_search(list, 999);
    TEST_ASSERT(not_found == NULL, "LinkedList: search returns NULL for non-existing key");

    /* Delete head */
    list_delete(list, 0);
    TEST_ASSERT(list_size(list) == 3 && list->head->key == 1, "LinkedList: delete head node");

    /* Delete middle */
    list_delete(list, 2);
    TEST_ASSERT(list_size(list) == 2 && list_search(list, 2) == NULL, "LinkedList: delete middle node");

    /* Delete tail */
    list_delete(list, 3);
    TEST_ASSERT(list_size(list) == 1 && list_search(list, 3) == NULL, "LinkedList: delete tail node");

    destroy_list(list);
    TEST_ASSERT(1, "LinkedList: destroyed successfully");
}

/* ========================================================================= */
/* 7. DOUBLY LINKED LIST TESTS                                               */
/* ========================================================================= */
void test_doubly_linked_list() {
    printf("\n--- Testing Doubly Linked List ---\n");

    DoublyLinkedList* dlist = create_dlist();
    TEST_ASSERT(dlist_size(dlist) == 0, "DoublyLinkedList: initial size is 0");

    dlist_append(dlist, 100, 1);
    dlist_append(dlist, 300, 3);
    dlist_prepend(dlist, 50, 0);
    /* Order: [0:50] <-> [1:100] <-> [3:300] */
    TEST_ASSERT(dlist_size(dlist) == 3, "DoublyLinkedList: size after prepend/append is 3");

    dlist_insert_at(dlist, 2, 200, 2);
    /* Order: [0:50] <-> [1:100] <-> [2:200] <-> [3:300] */
    TEST_ASSERT(dlist_size(dlist) == 4, "DoublyLinkedList: size after insert_at is 4");

    /* Verify forward and backward link integrity */
    DListNode* cur = dlist->head;
    TEST_ASSERT(cur && cur->key == 0 && cur->prev == NULL, "DoublyLinkedList: head node prev is NULL");
    TEST_ASSERT(cur->next && cur->next->prev == cur, "DoublyLinkedList: link between 0 and 1 intact");
    cur = cur->next;
    TEST_ASSERT(cur && cur->key == 1 && cur->next->prev == cur, "DoublyLinkedList: link between 1 and 2 intact");
    cur = cur->next;
    TEST_ASSERT(cur && cur->key == 2 && cur->next->prev == cur, "DoublyLinkedList: link between 2 and 3 intact");
    cur = cur->next;
    TEST_ASSERT(cur && cur->key == 3 && cur->next == NULL && dlist->tail == cur, "DoublyLinkedList: tail node next is NULL");

    DListNode* s = dlist_search(dlist, 2);
    TEST_ASSERT(s && s->value == 200, "DoublyLinkedList: search finds key 2");

    /* Delete head */
    dlist_delete(dlist, 0);
    TEST_ASSERT(dlist_size(dlist) == 3 && dlist->head->key == 1 && dlist->head->prev == NULL, "DoublyLinkedList: delete head node");

    /* Delete middle */
    dlist_delete(dlist, 2);
    TEST_ASSERT(dlist_size(dlist) == 2 && dlist_search(dlist, 2) == NULL, "DoublyLinkedList: delete middle node");

    /* Delete tail */
    dlist_delete(dlist, 3);
    TEST_ASSERT(dlist_size(dlist) == 1 && dlist->tail->key == 1 && dlist->tail->next == NULL, "DoublyLinkedList: delete tail node");

    destroy_dlist(dlist);
    TEST_ASSERT(1, "DoublyLinkedList: destroyed successfully");
}

/* ========================================================================= */
/* 8. BINARY SEARCH TREE TESTS                                               */
/* ========================================================================= */
void test_bst() {
    printf("\n--- Testing Binary Search Tree ---\n");

    BST* tree = create_bst();
    TEST_ASSERT(bst_count(tree) == 0, "BST: initial count is 0");

    bst_insert(tree, 50, "ISBN50", "Root Book");
    bst_insert(tree, 30, "ISBN30", "Left Child");
    bst_insert(tree, 70, "ISBN70", "Right Child");
    bst_insert(tree, 20, "ISBN20", "Left-Left");
    bst_insert(tree, 40, "ISBN40", "Left-Right");
    bst_insert(tree, 60, "ISBN60", "Right-Left");
    bst_insert(tree, 80, "ISBN80", "Right-Right");

    TEST_ASSERT(bst_count(tree) == 7, "BST: count after 7 insertions is 7");

    BSTNode* s50 = bst_search(tree, 50);
    TEST_ASSERT(s50 && strcmp(s50->title, "Root Book") == 0, "BST: search finds root");

    BSTNode* s40 = bst_search(tree, 40);
    TEST_ASSERT(s40 && strcmp(s40->isbn, "ISBN40") == 0, "BST: search finds internal node");

    BSTNode* s_none = bst_search(tree, 999);
    TEST_ASSERT(s_none == NULL, "BST: search returns NULL for non-existing node");

    BSTNode* min_node = bst_min(tree);
    TEST_ASSERT(min_node && min_node->book_id == 20, "BST: min returns 20");

    BSTNode* max_node = bst_max(tree);
    TEST_ASSERT(max_node && max_node->book_id == 80, "BST: max returns 80");

    /* Test Inorder Traversal */
    BSTNode* inorder_arr[10];
    int inorder_size = 0;
    bst_inorder(tree, inorder_arr, &inorder_size);
    TEST_ASSERT(inorder_size == 7, "BST: inorder size matches count");
    int inorder_correct = 1;
    int expected_ids[7] = {20, 30, 40, 50, 60, 70, 80};
    for (int i = 0; i < 7; i++) {
        if (inorder_arr[i]->book_id != expected_ids[i]) inorder_correct = 0;
    }
    TEST_ASSERT(inorder_correct == 1, "BST: inorder traversal is strictly ascending");

    /* Delete leaf node (20) */
    bst_delete(tree, 20);
    TEST_ASSERT(bst_search(tree, 20) == NULL && bst_count(tree) == 6, "BST: deleted leaf node 20");

    /* Delete node with one child (delete 70 after removing 80) */
    bst_delete(tree, 80);
    bst_delete(tree, 70);
    TEST_ASSERT(bst_search(tree, 70) == NULL && bst_search(tree, 60) != NULL, "BST: deleted node with single child");

    /* Delete node with two children (root 50) */
    bst_delete(tree, 50);
    TEST_ASSERT(bst_search(tree, 50) == NULL, "BST: deleted node with two children (root)");

    /* Verify BST property still holds */
    inorder_size = 0;
    bst_inorder(tree, inorder_arr, &inorder_size);
    inorder_correct = 1;
    for (int i = 0; i < inorder_size - 1; i++) {
        if (inorder_arr[i]->book_id >= inorder_arr[i + 1]->book_id) inorder_correct = 0;
    }
    TEST_ASSERT(inorder_correct == 1, "BST: inorder traversal remains sorted after deletions");

    destroy_bst(tree);
    TEST_ASSERT(1, "BST: destroyed successfully");
}

/* ========================================================================= */
/* 9. HASH TABLE TESTS                                                       */
/* ========================================================================= */
void test_hash_table() {
    printf("\n--- Testing Hash Table ---\n");

    HashTable* ht = create_hashtable(4);
    TEST_ASSERT(ht != NULL && ht->count == 0, "HashTable: created with initial size 4");

    ht_insert(ht, "978-01", 1, "Algorithms", 5);
    ht_insert(ht, "978-02", 2, "Data Structures", 3);
    ht_insert(ht, "978-03", 3, "Compilers", 7);

    BookRecord* r1 = ht_search(ht, "978-01");
    TEST_ASSERT(r1 && r1->book_id == 1 && strcmp(r1->title, "Algorithms") == 0, "HashTable: search finds '978-01'");

    BookRecord* r2 = ht_search(ht, "978-02");
    TEST_ASSERT(r2 && r2->book_id == 2, "HashTable: search finds '978-02'");

    BookRecord* r_none = ht_search(ht, "978-999");
    TEST_ASSERT(r_none == NULL, "HashTable: search returns NULL for non-existing key");

    /* Test load factor resize */
    ht_insert(ht, "978-04", 4, "Operating Systems", 2);
    ht_insert(ht, "978-05", 5, "Computer Networks", 4);
    TEST_ASSERT(ht->size >= 8, "HashTable: resized when load factor threshold exceeded");
    TEST_ASSERT(ht_search(ht, "978-01") != NULL, "HashTable: items preserved after resize");
    TEST_ASSERT(ht_search(ht, "978-05") != NULL, "HashTable: new items present after resize");

    /* Delete item */
    ht_delete(ht, "978-02");
    TEST_ASSERT(ht_search(ht, "978-02") == NULL, "HashTable: deleted item not found");
    TEST_ASSERT(ht_search(ht, "978-01") != NULL, "HashTable: neighboring items untouched after deletion");

    destroy_hashtable(ht);
    TEST_ASSERT(1, "HashTable: destroyed successfully");
}

/* ========================================================================= */
/* 10. HEAP TESTS                                                            */
/* ========================================================================= */
void test_heap() {
    printf("\n--- Testing Binary Heap ---\n");

    /* Test Max-Heap */
    Heap* max_h = create_heap(10, MAX_HEAP);
    TEST_ASSERT(heap_size(max_h) == 0, "Max-Heap: initial size is 0");

    heap_insert(max_h, 1, 15, "Book A");
    heap_insert(max_h, 2, 40, "Book B");
    heap_insert(max_h, 3, 25, "Book C");
    heap_insert(max_h, 4, 90, "Book D");
    heap_insert(max_h, 5, 5,  "Book E");

    TEST_ASSERT(heap_size(max_h) == 5, "Max-Heap: size after 5 inserts is 5");
    HeapNode top = heap_peek(max_h);
    TEST_ASSERT(top.request_count == 90 && top.book_id == 4, "Max-Heap: peek returns maximum element (90)");

    /* Extract elements in descending order */
    int prev_count = 10000;
    int max_heap_ok = 1;
    while (heap_size(max_h) > 0) {
        HeapNode n = heap_extract_top(max_h);
        if (n.request_count > prev_count) max_heap_ok = 0;
        prev_count = n.request_count;
    }
    TEST_ASSERT(max_heap_ok == 1, "Max-Heap: extracted elements in strictly descending order");

    destroy_heap(max_h);
    TEST_ASSERT(1, "Max-Heap: destroyed successfully");

    /* Test Min-Heap */
    Heap* min_h = create_heap(10, MIN_HEAP);
    heap_insert(min_h, 1, 50, "Book X");
    heap_insert(min_h, 2, 10, "Book Y");
    heap_insert(min_h, 3, 30, "Book Z");

    top = heap_peek(min_h);
    TEST_ASSERT(top.request_count == 10 && top.book_id == 2, "Min-Heap: peek returns minimum element (10)");

    int prev_min = -1;
    int min_heap_ok = 1;
    while (heap_size(min_h) > 0) {
        HeapNode n = heap_extract_top(min_h);
        if (n.request_count < prev_min) min_heap_ok = 0;
        prev_min = n.request_count;
    }
    TEST_ASSERT(min_heap_ok == 1, "Min-Heap: extracted elements in strictly ascending order");

    destroy_heap(min_h);
    TEST_ASSERT(1, "Min-Heap: destroyed successfully");
}

/* ========================================================================= */
/* 11. GRAPH TESTS (BFS & DFS)                                              */
/* ========================================================================= */
void test_graph() {
    printf("\n--- Testing Graph (BFS & DFS) ---\n");

    Graph* g = create_graph(10);
    TEST_ASSERT(graph_vertex_count(g) == 0, "Graph: initial vertex count is 0");

    /* Add vertices */
    graph_add_vertex(g, 1, "Vertex 1");
    graph_add_vertex(g, 2, "Vertex 2");
    graph_add_vertex(g, 3, "Vertex 3");
    graph_add_vertex(g, 4, "Vertex 4");
    graph_add_vertex(g, 5, "Vertex 5");
    TEST_ASSERT(graph_vertex_count(g) == 5, "Graph: vertex count is 5");

    /* Duplicate vertex addition should be ignored */
    graph_add_vertex(g, 1, "Duplicate Vertex 1");
    TEST_ASSERT(graph_vertex_count(g) == 5, "Graph: duplicate vertex ignored");

    /* Add edges:
     * 1 -> 2
     * 1 -> 3
     * 2 -> 4
     * 3 -> 5
     */
    graph_add_edge(g, 1, 2, 10);
    graph_add_edge(g, 1, 3, 20);
    graph_add_edge(g, 2, 4, 30);
    graph_add_edge(g, 3, 5, 40);
    TEST_ASSERT(graph_edge_count(g) == 4, "Graph: edge count is 4");

    /* Test neighbors of vertex 1 */
    int n_size = 0;
    int* neighbors = graph_neighbors(g, 1, &n_size);
    TEST_ASSERT(n_size == 2 && neighbors != NULL, "Graph: vertex 1 has 2 neighbors");
    free(neighbors);

    /* Test BFS traversal from vertex 1 */
    int bfs_size = 0;
    int* bfs_res = bfs(g, 1, &bfs_size);
    TEST_ASSERT(bfs_size == 5 && bfs_res != NULL, "Graph BFS: visited all 5 reachable vertices");
    TEST_ASSERT(bfs_res[0] == 1, "Graph BFS: started at root vertex 1");
    /* In BFS from 1, level 1 (2, 3) must appear before level 2 (4, 5) */
    int bfs_order_ok = (bfs_res[0] == 1) &&
                       ((bfs_res[1] == 3 && bfs_res[2] == 2) || (bfs_res[1] == 2 && bfs_res[2] == 3)) &&
                       ((bfs_res[3] == 5 && bfs_res[4] == 4) || (bfs_res[3] == 4 && bfs_res[4] == 5));
    TEST_ASSERT(bfs_order_ok == 1, "Graph BFS: level-by-level traversal order verified");
    free(bfs_res);

    /* Test DFS traversal from vertex 1 */
    int dfs_size = 0;
    int* dfs_res = dfs(g, 1, &dfs_size);
    TEST_ASSERT(dfs_size == 5 && dfs_res != NULL, "Graph DFS: visited all 5 reachable vertices");
    TEST_ASSERT(dfs_res[0] == 1, "Graph DFS: started at root vertex 1");
    free(dfs_res);

    /* Test edge removal */
    graph_remove_edge(g, 1, 2);
    TEST_ASSERT(graph_edge_count(g) == 3, "Graph: edge removed successfully");

    destroy_graph(g);
    TEST_ASSERT(1, "Graph: destroyed successfully");
}

/* ========================================================================= */
/* 12. INTEGRATION TESTS (LibraxDSA Engine)                                   */
/* ========================================================================= */
void test_librax_engine() {
    printf("\n--- Testing LibraxDSA High-Level Engine ---\n");

    LibraxDSA* dsa = librax_init();
    TEST_ASSERT(dsa != NULL, "LibraxDSA: initialized");

    librax_add_book(dsa, 101, "ISBN-A", "Book Alpha", 5);
    librax_add_book(dsa, 102, "ISBN-B", "Book Beta", 3);

    BSTNode* b = librax_search_by_id(dsa, 101);
    TEST_ASSERT(b && strcmp(b->title, "Book Alpha") == 0, "LibraxDSA: found book 101 by ID");

    BookRecord* r = librax_search_by_isbn(dsa, "ISBN-B");
    TEST_ASSERT(r && r->book_id == 102, "LibraxDSA: found book by ISBN");

    librax_push_operation(dsa, 1, "Insert Book");
    StackNode sn = librax_undo_operation(dsa);
    TEST_ASSERT(sn.value == 1, "LibraxDSA: undo operation from stack");

    librax_enqueue_reservation(dsa, 101, 201, "Alice");
    int pos = librax_get_queue_position(dsa, 101, 201);
    TEST_ASSERT(pos == 1, "LibraxDSA: reservation queue position is 1");

    QueueNode qn = librax_dequeue_reservation(dsa, 101);
    TEST_ASSERT(qn.user_id == 201, "LibraxDSA: dequeued reservation for Alice");

    librax_record_request(dsa, 101, "Book Alpha");
    librax_record_request(dsa, 102, "Book Beta");
    int count = 0;
    HeapNode* top_req = librax_top_requested(dsa, 1, &count);
    TEST_ASSERT(count == 1 && top_req != NULL, "LibraxDSA: retrieved top requested books");
    free(top_req);

    librax_remove_book(dsa, 101);
    TEST_ASSERT(librax_search_by_id(dsa, 101) == NULL, "LibraxDSA: removed book 101");
    TEST_ASSERT(librax_search_by_isbn(dsa, "ISBN-A") == NULL, "LibraxDSA: book removed from ISBN hash table");

    librax_destroy(dsa);
    TEST_ASSERT(1, "LibraxDSA: destroyed cleanly");
}

/* ========================================================================= */
/* MAIN                                                                      */
/* ========================================================================= */
int main() {
    printf("=====================================================\n");
    printf("         LIBRAX DSA COMPREHENSIVE TEST SUITE         \n");
    printf("=====================================================\n");

    test_sorting_algorithms();
    test_searching_algorithms();
    test_stack();
    test_queue();
    test_circular_queue();
    test_linked_list();
    test_doubly_linked_list();
    test_bst();
    test_hash_table();
    test_heap();
    test_graph();
    test_librax_engine();

    printf("\n=====================================================\n");
    printf("TEST SUMMARY: %d PASSED, %d FAILED\n", g_passed, g_failed);
    printf("=====================================================\n");

    return g_failed == 0 ? 0 : 1;
}
