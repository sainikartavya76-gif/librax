#include "doubly_linkedlist.h"
#include <stdlib.h>
#include <stdio.h>

DoublyLinkedList* create_dlist() {
    DoublyLinkedList* list = (DoublyLinkedList*)malloc(sizeof(DoublyLinkedList));
    list->head = NULL;
    list->tail = NULL;
    list->size = 0;
    return list;
}
void dlist_append(DoublyLinkedList* list, int value, int key) {
    DListNode* node = (DListNode*)malloc(sizeof(DListNode));
    node->value = value;
    node->key = key;
    node->next = NULL;
    node->prev = list->tail;
    if (!list->head) {
        list->head = node;
    } else {
        list->tail->next = node;
    }
    list->tail = node;
    list->size++;
}
void dlist_prepend(DoublyLinkedList* list, int value, int key) {
    DListNode* node = (DListNode*)malloc(sizeof(DListNode));
    node->value = value;
    node->key = key;
    node->next = list->head;
    node->prev = NULL;
    if (list->head) list->head->prev = node;
    else list->tail = node;
    list->head = node;
    list->size++;
}
void dlist_insert_at(DoublyLinkedList* list, int index, int value, int key) {
    if (index <= 0) { dlist_prepend(list, value, key); return; }
    if (index >= list->size) { dlist_append(list, value, key); return; }
    DListNode* cur = list->head;
    for (int i = 0; i < index - 1; i++) cur = cur->next;
    DListNode* node = (DListNode*)malloc(sizeof(DListNode));
    node->value = value;
    node->key = key;
    node->next = cur->next;
    node->prev = cur;
    cur->next->prev = node;
    cur->next = node;
    list->size++;
}
void dlist_delete(DoublyLinkedList* list, int key) {
    DListNode* cur = list->head;
    while (cur) {
        if (cur->key == key) {
            if (cur->prev) cur->prev->next = cur->next;
            else list->head = cur->next;
            if (cur->next) cur->next->prev = cur->prev;
            else list->tail = cur->prev;
            free(cur);
            list->size--;
            return;
        }
        cur = cur->next;
    }
}
DListNode* dlist_search(DoublyLinkedList* list, int key) {
    DListNode* cur = list->head;
    while (cur) {
        if (cur->key == key) return cur;
        cur = cur->next;
    }
    return NULL;
}
DListNode* dlist_get_at(DoublyLinkedList* list, int index) {
    if (index < 0 || index >= list->size) return NULL;
    DListNode* cur = list->head;
    for (int i = 0; i < index; i++) cur = cur->next;
    return cur;
}
int dlist_size(DoublyLinkedList* list) { return list->size; }
void destroy_dlist(DoublyLinkedList* list) {
    DListNode* cur = list->head;
    while (cur) {
        DListNode* next = cur->next;
        free(cur);
        cur = next;
    }
    free(list);
}
void dlist_print(DoublyLinkedList* list) {
    DListNode* cur = list->head;
    while (cur) {
        printf("[%d:%d]<->", cur->key, cur->value);
        cur = cur->next;
    }
    printf("NULL\n");
}
