#include "librax_dsa.h"
#include <stdlib.h>
#include <string.h>

LibraxDSA* librax_init() {
    LibraxDSA* dsa = (LibraxDSA*)malloc(sizeof(LibraxDSA));
    dsa->operation_stack = create_stack(100);
    dsa->reservation_queue = create_queue(100);
    dsa->book_index = create_bst();
    dsa->isbn_table = create_hashtable(100);
    dsa->popular_books = create_heap(100, MAX_HEAP);
    dsa->recommendation_graph = create_graph(100);
    return dsa;
}
void librax_add_book(LibraxDSA* dsa, int id, const char* isbn, const char* title, int copies) {
    bst_insert(dsa->book_index, id, isbn, title);
    ht_insert(dsa->isbn_table, isbn, id, title, copies);
    graph_add_vertex(dsa->recommendation_graph, id, title);
}
void librax_remove_book(LibraxDSA* dsa, int id) {
    BSTNode* node = bst_search(dsa->book_index, id);
    if(node) {
        ht_delete(dsa->isbn_table, node->isbn);
        bst_delete(dsa->book_index, id);
    }
}
BookRecord* librax_search_by_isbn(LibraxDSA* dsa, const char* isbn) {
    return ht_search(dsa->isbn_table, isbn);
}
BSTNode* librax_search_by_id(LibraxDSA* dsa, int id) {
    return bst_search(dsa->book_index, id);
}
void librax_push_operation(LibraxDSA* dsa, int type, const char* description) {
    stack_push(dsa->operation_stack, type, type, description);
}
StackNode librax_undo_operation(LibraxDSA* dsa) {
    return stack_pop(dsa->operation_stack);
}
void librax_enqueue_reservation(LibraxDSA* dsa, int book_id, int user_id, const char* user_name) {
    enqueue(dsa->reservation_queue, user_id, user_name, book_id);
}
QueueNode librax_dequeue_reservation(LibraxDSA* dsa, int book_id) {
    return dequeue(dsa->reservation_queue);
}
int librax_get_queue_position(LibraxDSA* dsa, int book_id, int user_id) {
    return queue_position(dsa->reservation_queue, user_id);
}
void librax_add_recommendation(LibraxDSA* dsa, int src_id, int dest_id, int weight) {
    graph_add_edge(dsa->recommendation_graph, src_id, dest_id, weight);
}
int* librax_get_recommendations_bfs(LibraxDSA* dsa, int book_id, int* result_size) {
    return bfs(dsa->recommendation_graph, book_id, result_size);
}
int* librax_get_recommendations_dfs(LibraxDSA* dsa, int book_id, int* result_size) {
    return dfs(dsa->recommendation_graph, book_id, result_size);
}
void librax_record_request(LibraxDSA* dsa, int book_id, const char* title) {
    heap_insert(dsa->popular_books, book_id, 1, title);
}
HeapNode* librax_top_requested(LibraxDSA* dsa, int max, int* count) {
    *count = max < heap_size(dsa->popular_books) ? max : heap_size(dsa->popular_books);
    HeapNode* res = (HeapNode*)malloc(sizeof(HeapNode) * (*count));
    for(int i=0; i<*count; i++) res[i] = heap_extract_top(dsa->popular_books);
    return res;
}
SortResult librax_sort_books(BookSortItem* items, int n, const char* algorithm) {
    if(strcmp(algorithm, "bubble") == 0) return bubble_sort(items, n);
    if(strcmp(algorithm, "selection") == 0) return selection_sort(items, n);
    if(strcmp(algorithm, "insertion") == 0) return insertion_sort(items, n);
    if(strcmp(algorithm, "merge") == 0) return merge_sort(items, n);
    if(strcmp(algorithm, "heap") == 0) return heap_sort(items, n);
    return quick_sort(items, n);
}
SearchResult librax_linear_search(BookSortItem* items, int n, int query) {
    return linear_search(items, n, query);
}
SearchResult librax_binary_search(BookSortItem* items, int n, int query) {
    return binary_search(items, n, query);
}
void librax_destroy(LibraxDSA* dsa) {
    destroy_stack(dsa->operation_stack);
    destroy_queue(dsa->reservation_queue);
    destroy_bst(dsa->book_index);
    destroy_hashtable(dsa->isbn_table);
    destroy_heap(dsa->popular_books);
    destroy_graph(dsa->recommendation_graph);
    free(dsa);
}
