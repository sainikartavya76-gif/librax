#ifndef DOUBLY_LINKEDLIST_H
#define DOUBLY_LINKEDLIST_H
typedef struct DListNode {
    int key;
    int value;
    struct DListNode* next;
    struct DListNode* prev;
} DListNode;
typedef struct {
    DListNode* head;
    DListNode* tail;
    int size;
} DoublyLinkedList;
DoublyLinkedList* create_dlist();
void dlist_append(DoublyLinkedList* list, int value, int key);
void dlist_prepend(DoublyLinkedList* list, int value, int key);
void dlist_insert_at(DoublyLinkedList* list, int index, int value, int key);
void dlist_delete(DoublyLinkedList* list, int key);
DListNode* dlist_search(DoublyLinkedList* list, int key);
DListNode* dlist_get_at(DoublyLinkedList* list, int index);
int dlist_size(DoublyLinkedList* list);
void destroy_dlist(DoublyLinkedList* list);
void dlist_print(DoublyLinkedList* list);
#endif
