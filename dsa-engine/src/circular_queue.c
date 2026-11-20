#include "circular_queue.h"
CircularQueue* create_circular_queue(int capacity) { return create_queue(capacity); }
void cq_enqueue(CircularQueue* cq, int user_id, const char* user_name, int book_id) { enqueue(cq, user_id, user_name, book_id); }
QueueNode cq_dequeue(CircularQueue* cq) { return dequeue(cq); }
void destroy_circular_queue(CircularQueue* cq) { destroy_queue(cq); }
