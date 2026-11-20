#ifndef SORTING_H
#define SORTING_H
typedef struct {
    int id;
    char title[256];
    char isbn[20];
    int sort_key;
} BookSortItem;
typedef struct {
    int* indices;
    int comparisons;
    int swaps;
    long long time_ns;
} SortResult;

SortResult bubble_sort(BookSortItem* items, int n);
SortResult selection_sort(BookSortItem* items, int n);
SortResult insertion_sort(BookSortItem* items, int n);
SortResult merge_sort(BookSortItem* items, int n);
SortResult quick_sort(BookSortItem* items, int n);
SortResult heap_sort(BookSortItem* items, int n);
#endif
