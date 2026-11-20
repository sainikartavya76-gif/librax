#ifndef QUEUE_H
#define QUEUE_H
typedef struct {
    int user_id;
    int book_id;
    char user_name[100];
} QueueNode;
typedef struct {
    QueueNode* data;
    int front;
    int rear;
    int size;
    int capacity;
} Queue;
Queue* create_queue(int capacity);
void enqueue(Queue* queue, int user_id, const char* user_name, int book_id);
QueueNode dequeue(Queue* queue);
QueueNode queue_peek(Queue* queue);
int queue_is_empty(Queue* queue);
int queue_is_full(Queue* queue);
int queue_size(Queue* queue);
int queue_position(Queue* queue, int user_id);
void destroy_queue(Queue* queue);
#endif
