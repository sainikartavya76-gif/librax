#ifndef HEAP_H
#define HEAP_H
typedef enum { MIN_HEAP, MAX_HEAP } HeapType;
typedef struct {
    int book_id;
    int request_count;
    char title[256];
} HeapNode;
typedef struct {
    HeapNode* data;
    int size;
    int capacity;
    HeapType type;
} Heap;
Heap* create_heap(int capacity, HeapType type);
void heap_insert(Heap* heap, int book_id, int request_count, const char* title);
HeapNode heap_extract_top(Heap* heap);
HeapNode heap_peek(Heap* heap);
int heap_size(Heap* heap);
void heapify_up(Heap* heap, int index);
void heapify_down(Heap* heap, int index);
void destroy_heap(Heap* heap);
#endif
