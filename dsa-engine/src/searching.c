#include "searching.h"
#include <string.h>

#if defined(_WIN32)
#include <windows.h>
extern long long get_time_ns();
#else
extern long long get_time_ns();
#endif

SearchResult linear_search(BookSortItem* items, int n, int query) {
    SearchResult res = {0, -1, 0, 0, "Linear Search", "O(n)"};
    long long start = get_time_ns();
    for(int i=0; i<n; i++) {
        res.comparisons++;
        if(items[i].id == query) {
            res.found = 1; res.index = i; break;
        }
    }
    res.time_ns = get_time_ns() - start;
    return res;
}
SearchResult binary_search(BookSortItem* items, int n, int query) {
    SearchResult res = {0, -1, 0, 0, "Binary Search", "O(log n)"};
    long long start = get_time_ns();
    int l = 0, r = n - 1;
    while(l <= r) {
        res.comparisons++;
        int m = l + (r - l) / 2;
        if(items[m].id == query) { res.found = 1; res.index = m; break; }
        if(items[m].id < query) l = m + 1;
        else r = m - 1;
    }
    res.time_ns = get_time_ns() - start;
    return res;
}
SearchResult hash_search(HashTable* ht, const char* isbn) {
    SearchResult res = {0, -1, 0, 0, "Hash Search", "O(1)"};
    long long start = get_time_ns();
    BookRecord* rec = ht_search(ht, isbn);
    res.comparisons++;
    if(rec) { res.found = 1; res.index = rec->book_id; }
    res.time_ns = get_time_ns() - start;
    return res;
}
SearchResult bst_search_timed(BST* tree, int book_id) {
    SearchResult res = {0, -1, 0, 0, "BST Search", "O(log n)"};
    long long start = get_time_ns();
    BSTNode* n = bst_search(tree, book_id);
    res.comparisons++;
    if(n) { res.found = 1; res.index = n->book_id; }
    res.time_ns = get_time_ns() - start;
    return res;
}
