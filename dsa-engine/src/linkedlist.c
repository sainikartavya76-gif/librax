#include "linkedlist.h"
#include <stdlib.h>
#include <stdio.h>

LinkedList* create_list() {
    LinkedList* list = (LinkedList*)malloc(sizeof(LinkedList));
    list->head = NULL;
    list->size = 0;
    return list;
}
void list_append(LinkedList* list, int value, int key) {
    ListNode* node = (ListNode*)malloc(sizeof(ListNode));
    node->value = value;
    node->key = key;
    node->next = NULL;
    if (!list->head) {
        list->head = node;
    } else {
        ListNode* cur = list->head;
        while (cur->next) cur = cur->next;
        cur->next = node;
    }
    list->size++;
}
void list_prepend(LinkedList* list, int value, int key) {
    ListNode* node = (ListNode*)malloc(sizeof(ListNode));
    node->value = value;
    node->key = key;
    node->next = list->head;
    list->head = node;
    list->size++;
}
void list_insert_at(LinkedList* list, int index, int value, int key) {
    if (index <= 0) { list_prepend(list, value, key); return; }
    if (index >= list->size) { list_append(list, value, key); return; }
    ListNode* cur = list->head;
    for (int i = 0; i < index - 1; i++) cur = cur->next;
    ListNode* node = (ListNode*)malloc(sizeof(ListNode));
    node->value = value;
    node->key = key;
    node->next = cur->next;
    cur->next = node;
    list->size++;
}
void list_delete(LinkedList* list, int key) {
    ListNode* cur = list->head;
    ListNode* prev = NULL;
    while (cur) {
        if (cur->key == key) {
            if (prev) prev->next = cur->next;
            else list->head = cur->next;
            free(cur);
            list->size--;
            return;
        }
        prev = cur;
        cur = cur->next;
    }
}
ListNode* list_search(LinkedList* list, int key) {
    ListNode* cur = list->head;
    while (cur) {
        if (cur->key == key) return cur;
        cur = cur->next;
    }
    return NULL;
}
ListNode* list_get_at(LinkedList* list, int index) {
    if (index < 0 || index >= list->size) return NULL;
    ListNode* cur = list->head;
    for (int i = 0; i < index; i++) cur = cur->next;
    return cur;
}
int list_size(LinkedList* list) { return list->size; }
void destroy_list(LinkedList* list) {
    ListNode* cur = list->head;
    while (cur) {
        ListNode* next = cur->next;
        free(cur);
        cur = next;
    }
    free(list);
}
void list_print(LinkedList* list) {
    ListNode* cur = list->head;
    while (cur) {
        printf("[%d:%d]->", cur->key, cur->value);
        cur = cur->next;
    }
    printf("NULL\n");
}
