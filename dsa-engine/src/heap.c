#include "heap.h"
#include <stdlib.h>
#include <string.h>

Heap* create_heap(int capacity, HeapType type) {
    Heap* heap = (Heap*)malloc(sizeof(Heap));
    heap->capacity = capacity;
    heap->size = 0;
    heap->type = type;
    heap->data = (HeapNode*)malloc(sizeof(HeapNode) * capacity);
    return heap;
}
static void swap(HeapNode* a, HeapNode* b) {
    HeapNode temp = *a; *a = *b; *b = temp;
}
void heapify_up(Heap* heap, int index) {
    if(index && ((heap->type == MIN_HEAP && heap->data[index].request_count < heap->data[(index-1)/2].request_count) ||
                 (heap->type == MAX_HEAP && heap->data[index].request_count > heap->data[(index-1)/2].request_count))) {
        swap(&heap->data[index], &heap->data[(index-1)/2]);
        heapify_up(heap, (index-1)/2);
    }
}
void heap_insert(Heap* heap, int book_id, int request_count, const char* title) {
    if(heap->size == heap->capacity) return; 
    heap->data[heap->size].book_id = book_id;
    heap->data[heap->size].request_count = request_count;
    strncpy(heap->data[heap->size].title, title, 255);
    heap->data[heap->size].title[255] = '\0';
    heap->size++;
    heapify_up(heap, heap->size - 1);
}
void heapify_down(Heap* heap, int index) {
    int left = 2 * index + 1;
    int right = 2 * index + 2;
    int target = index;
    if (left < heap->size && ((heap->type == MIN_HEAP && heap->data[left].request_count < heap->data[target].request_count) ||
                              (heap->type == MAX_HEAP && heap->data[left].request_count > heap->data[target].request_count)))
        target = left;
    if (right < heap->size && ((heap->type == MIN_HEAP && heap->data[right].request_count < heap->data[target].request_count) ||
                               (heap->type == MAX_HEAP && heap->data[right].request_count > heap->data[target].request_count)))
        target = right;
    if (target != index) {
        swap(&heap->data[index], &heap->data[target]);
        heapify_down(heap, target);
    }
}
HeapNode heap_extract_top(Heap* heap) {
    HeapNode empty = {-1, -1, ""};
    if (heap->size == 0) return empty;
    HeapNode top = heap->data[0];
    heap->data[0] = heap->data[heap->size - 1];
    heap->size--;
    heapify_down(heap, 0);
    return top;
}
HeapNode heap_peek(Heap* heap) {
    HeapNode empty = {-1, -1, ""};
    if (heap->size == 0) return empty;
    return heap->data[0];
}
int heap_size(Heap* heap) { return heap->size; }
void destroy_heap(Heap* heap) {
    free(heap->data);
    free(heap);
}
