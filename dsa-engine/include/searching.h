#ifndef SEARCHING_H
#define SEARCHING_H
#include "sorting.h"
#include "bst.h"
#include "hashtable.h"

typedef struct {
    int found;
    int index;
    int comparisons;
    long long time_ns;
    char algorithm[50];
    char complexity[50];
} SearchResult;

SearchResult linear_search(BookSortItem* items, int n, int query);
SearchResult binary_search(BookSortItem* items, int n, int query);
SearchResult hash_search(HashTable* ht, const char* isbn);
SearchResult bst_search_timed(BST* tree, int book_id);
#endif
