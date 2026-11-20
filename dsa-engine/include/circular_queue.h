#ifndef CIRCULAR_QUEUE_H
#define CIRCULAR_QUEUE_H
#include "queue.h"
typedef Queue CircularQueue;
CircularQueue* create_circular_queue(int capacity);
void cq_enqueue(CircularQueue* cq, int user_id, const char* user_name, int book_id);
QueueNode cq_dequeue(CircularQueue* cq);
void destroy_circular_queue(CircularQueue* cq);
#endif
