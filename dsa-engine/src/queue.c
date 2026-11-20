#include "queue.h"
#include <stdlib.h>
#include <string.h>

Queue* create_queue(int capacity) {
    Queue* queue = (Queue*)malloc(sizeof(Queue));
    queue->data = (QueueNode*)malloc(sizeof(QueueNode) * capacity);
    queue->front = 0;
    queue->rear = -1;
    queue->size = 0;
    queue->capacity = capacity;
    return queue;
}
void enqueue(Queue* queue, int user_id, const char* user_name, int book_id) {
    if (queue_is_full(queue)) return;
    queue->rear = (queue->rear + 1) % queue->capacity;
    queue->data[queue->rear].user_id = user_id;
    queue->data[queue->rear].book_id = book_id;
    strncpy(queue->data[queue->rear].user_name, user_name, 99);
    queue->data[queue->rear].user_name[99] = '\0';
    queue->size++;
}
QueueNode dequeue(Queue* queue) {
    QueueNode empty = {-1, -1, ""};
    if (queue_is_empty(queue)) return empty;
    QueueNode item = queue->data[queue->front];
    queue->front = (queue->front + 1) % queue->capacity;
    queue->size--;
    return item;
}
QueueNode queue_peek(Queue* queue) {
    QueueNode empty = {-1, -1, ""};
    if (queue_is_empty(queue)) return empty;
    return queue->data[queue->front];
}
int queue_is_empty(Queue* queue) { return queue->size == 0; }
int queue_is_full(Queue* queue) { return queue->size == queue->capacity; }
int queue_size(Queue* queue) { return queue->size; }
int queue_position(Queue* queue, int user_id) {
    for(int i = 0; i < queue->size; i++) {
        int idx = (queue->front + i) % queue->capacity;
        if(queue->data[idx].user_id == user_id) return i + 1;
    }
    return -1;
}
void destroy_queue(Queue* queue) {
    free(queue->data);
    free(queue);
}
