#include "hashtable.h"
#include <stdlib.h>
#include <string.h>

unsigned long hash_function(const char* str) {
    unsigned long hash = 5381;
    int c;
    while ((c = *str++)) hash = ((hash << 5) + hash) + c;
    return hash;
}
HashTable* create_hashtable(int size) {
    HashTable* ht = (HashTable*)malloc(sizeof(HashTable));
    ht->size = size;
    ht->count = 0;
    ht->buckets = (BookRecord**)calloc(size, sizeof(BookRecord*));
    return ht;
}
void ht_insert(HashTable* ht, const char* isbn, int book_id, const char* title, int available_copies) {
    if (ht_load_factor(ht) > 0.75) ht_resize(ht);
    unsigned long idx = hash_function(isbn) % ht->size;
    BookRecord* rec = (BookRecord*)malloc(sizeof(BookRecord));
    strcpy(rec->isbn, isbn);
    rec->book_id = book_id;
    strcpy(rec->title, title);
    rec->available_copies = available_copies;
    rec->next = ht->buckets[idx];
    ht->buckets[idx] = rec;
    ht->count++;
}
BookRecord* ht_search(HashTable* ht, const char* isbn) {
    unsigned long idx = hash_function(isbn) % ht->size;
    BookRecord* cur = ht->buckets[idx];
    while(cur) {
        if(strcmp(cur->isbn, isbn) == 0) return cur;
        cur = cur->next;
    }
    return NULL;
}
void ht_delete(HashTable* ht, const char* isbn) {
    unsigned long idx = hash_function(isbn) % ht->size;
    BookRecord* cur = ht->buckets[idx];
    BookRecord* prev = NULL;
    while(cur) {
        if(strcmp(cur->isbn, isbn) == 0) {
            if(prev) prev->next = cur->next;
            else ht->buckets[idx] = cur->next;
            free(cur);
            ht->count--;
            return;
        }
        prev = cur;
        cur = cur->next;
    }
}
float ht_load_factor(HashTable* ht) { return (float)ht->count / ht->size; }
void ht_resize(HashTable* ht) {
    int old_size = ht->size;
    BookRecord** old_buckets = ht->buckets;
    ht->size *= 2;
    ht->buckets = (BookRecord**)calloc(ht->size, sizeof(BookRecord*));
    ht->count = 0;
    for(int i = 0; i < old_size; i++) {
        BookRecord* cur = old_buckets[i];
        while(cur) {
            ht_insert(ht, cur->isbn, cur->book_id, cur->title, cur->available_copies);
            BookRecord* temp = cur;
            cur = cur->next;
            free(temp);
        }
    }
    free(old_buckets);
}
void destroy_hashtable(HashTable* ht) {
    for(int i=0; i<ht->size; i++) {
        BookRecord* cur = ht->buckets[i];
        while(cur) {
            BookRecord* temp = cur;
            cur = cur->next;
            free(temp);
        }
    }
    free(ht->buckets);
    free(ht);
}
