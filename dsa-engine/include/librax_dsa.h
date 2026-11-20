#ifndef LIBRAX_DSA_H
#define LIBRAX_DSA_H

#include "array.h"
#include "linkedlist.h"
#include "doubly_linkedlist.h"
#include "stack.h"
#include "queue.h"
#include "circular_queue.h"
#include "bst.h"
#include "hashtable.h"
#include "heap.h"
#include "graph.h"
#include "sorting.h"
#include "searching.h"

typedef struct {
    Stack* operation_stack;
    Queue* reservation_queue;
    BST* book_index;
    HashTable* isbn_table;
    Heap* popular_books;
    Graph* recommendation_graph;
} LibraxDSA;

LibraxDSA* librax_init();
void librax_add_book(LibraxDSA* dsa, int id, const char* isbn, const char* title, int copies);
void librax_remove_book(LibraxDSA* dsa, int id);
BookRecord* librax_search_by_isbn(LibraxDSA* dsa, const char* isbn);
BSTNode* librax_search_by_id(LibraxDSA* dsa, int id);
void librax_push_operation(LibraxDSA* dsa, int type, const char* description);
StackNode librax_undo_operation(LibraxDSA* dsa);
void librax_enqueue_reservation(LibraxDSA* dsa, int book_id, int user_id, const char* user_name);
QueueNode librax_dequeue_reservation(LibraxDSA* dsa, int book_id);
int librax_get_queue_position(LibraxDSA* dsa, int book_id, int user_id);
void librax_add_recommendation(LibraxDSA* dsa, int src_id, int dest_id, int weight);
int* librax_get_recommendations_bfs(LibraxDSA* dsa, int book_id, int* result_size);
int* librax_get_recommendations_dfs(LibraxDSA* dsa, int book_id, int* result_size);
void librax_record_request(LibraxDSA* dsa, int book_id, const char* title);
HeapNode* librax_top_requested(LibraxDSA* dsa, int max, int* count);
SortResult librax_sort_books(BookSortItem* items, int n, const char* algorithm);
SearchResult librax_linear_search(BookSortItem* items, int n, int query);
SearchResult librax_binary_search(BookSortItem* items, int n, int query);
void librax_destroy(LibraxDSA* dsa);

#endif
