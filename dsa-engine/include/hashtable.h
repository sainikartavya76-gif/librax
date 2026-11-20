#ifndef HASHTABLE_H
#define HASHTABLE_H
typedef struct BookRecord {
    char isbn[20];
    int book_id;
    char title[256];
    int available_copies;
    struct BookRecord* next;
} BookRecord;
typedef struct {
    BookRecord** buckets;
    int size;
    int count;
} HashTable;
HashTable* create_hashtable(int size);
void ht_insert(HashTable* ht, const char* isbn, int book_id, const char* title, int available_copies);
BookRecord* ht_search(HashTable* ht, const char* isbn);
void ht_delete(HashTable* ht, const char* isbn);
float ht_load_factor(HashTable* ht);
void ht_resize(HashTable* ht);
void destroy_hashtable(HashTable* ht);
unsigned long hash_function(const char* str);
#endif
