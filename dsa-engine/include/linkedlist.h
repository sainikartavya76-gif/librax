#ifndef LINKEDLIST_H
#define LINKEDLIST_H
typedef struct ListNode {
    int key;
    int value;
    struct ListNode* next;
} ListNode;
typedef struct {
    ListNode* head;
    int size;
} LinkedList;
LinkedList* create_list();
void list_append(LinkedList* list, int value, int key);
void list_prepend(LinkedList* list, int value, int key);
void list_insert_at(LinkedList* list, int index, int value, int key);
void list_delete(LinkedList* list, int key);
ListNode* list_search(LinkedList* list, int key);
ListNode* list_get_at(LinkedList* list, int index);
int list_size(LinkedList* list);
void destroy_list(LinkedList* list);
void list_print(LinkedList* list);
#endif
