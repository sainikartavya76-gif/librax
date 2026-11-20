#include "sorting.h"
#include <stdlib.h>
#include <time.h>

#if defined(_WIN32)
#include <windows.h>
long long get_time_ns() {
    LARGE_INTEGER count, freq;
    QueryPerformanceCounter(&count);
    QueryPerformanceFrequency(&freq);
    return (long long)((count.QuadPart * 1000000000) / freq.QuadPart);
}
#else
long long get_time_ns() {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (long long)ts.tv_sec * 1000000000 + ts.tv_nsec;
}
#endif

static void swap_items(BookSortItem* a, BookSortItem* b) {
    BookSortItem temp = *a; *a = *b; *b = temp;
}

static void swap_int(int* a, int* b) {
    int temp = *a; *a = *b; *b = temp;
}

/**
 * Bubble Sort
 * Time Complexity:
 *   Best Case:    O(n) (with early-exit optimization)
 *   Average Case: O(n^2)
 *   Worst Case:   O(n^2)
 * Space Complexity:
 *   O(1) auxiliary space (O(n) for indices tracking array)
 * Edge Cases Handled: NULL items, n <= 0, n = 1, duplicates, malloc failure.
 */
SortResult bubble_sort(BookSortItem* items, int n) {
    SortResult res;
    res.indices = NULL;
    res.comparisons = 0;
    res.swaps = 0;
    res.time_ns = 0;

    if (!items || n <= 0) return res;

    res.indices = (int*)malloc(sizeof(int) * n);
    if (!res.indices) return res;
    for (int i = 0; i < n; i++) res.indices[i] = i;

    if (n == 1) return res;

    long long start = get_time_ns();
    for (int i = 0; i < n - 1; i++) {
        int swapped = 0;
        for (int j = 0; j < n - i - 1; j++) {
            res.comparisons++;
            if (items[j].sort_key > items[j + 1].sort_key) {
                swap_items(&items[j], &items[j + 1]);
                swap_int(&res.indices[j], &res.indices[j + 1]);
                res.swaps++;
                swapped = 1;
            }
        }
        if (!swapped) break;
    }
    res.time_ns = get_time_ns() - start;
    return res;
}

/**
 * Selection Sort
 * Time Complexity:
 *   Best Case:    O(n^2)
 *   Average Case: O(n^2)
 *   Worst Case:   O(n^2)
 * Space Complexity:
 *   O(1) auxiliary space (O(n) for indices tracking array)
 * Edge Cases Handled: NULL items, n <= 0, n = 1, duplicates, malloc failure.
 */
SortResult selection_sort(BookSortItem* items, int n) {
    SortResult res;
    res.indices = NULL;
    res.comparisons = 0;
    res.swaps = 0;
    res.time_ns = 0;

    if (!items || n <= 0) return res;

    res.indices = (int*)malloc(sizeof(int) * n);
    if (!res.indices) return res;
    for (int i = 0; i < n; i++) res.indices[i] = i;

    if (n == 1) return res;

    long long start = get_time_ns();
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            res.comparisons++;
            if (items[j].sort_key < items[min_idx].sort_key) min_idx = j;
        }
        if (min_idx != i) {
            swap_items(&items[min_idx], &items[i]);
            swap_int(&res.indices[min_idx], &res.indices[i]);
            res.swaps++;
        }
    }
    res.time_ns = get_time_ns() - start;
    return res;
}

/**
 * Insertion Sort
 * Time Complexity:
 *   Best Case:    O(n)
 *   Average Case: O(n^2)
 *   Worst Case:   O(n^2)
 * Space Complexity:
 *   O(1) auxiliary space (O(n) for indices tracking array)
 * Edge Cases Handled: NULL items, n <= 0, n = 1, duplicates, malloc failure.
 */
SortResult insertion_sort(BookSortItem* items, int n) {
    SortResult res;
    res.indices = NULL;
    res.comparisons = 0;
    res.swaps = 0;
    res.time_ns = 0;

    if (!items || n <= 0) return res;

    res.indices = (int*)malloc(sizeof(int) * n);
    if (!res.indices) return res;
    for (int i = 0; i < n; i++) res.indices[i] = i;

    if (n == 1) return res;

    long long start = get_time_ns();
    for (int i = 1; i < n; i++) {
        BookSortItem key = items[i];
        int key_idx = res.indices[i];
        int j = i - 1;
        while (j >= 0) {
            res.comparisons++;
            if (items[j].sort_key > key.sort_key) {
                items[j + 1] = items[j];
                res.indices[j + 1] = res.indices[j];
                res.swaps++;
                j--;
            } else {
                break;
            }
        }
        items[j + 1] = key;
        res.indices[j + 1] = key_idx;
    }
    res.time_ns = get_time_ns() - start;
    return res;
}

/**
 * Merge Sort
 * Time Complexity:
 *   Best Case:    O(n log n)
 *   Average Case: O(n log n)
 *   Worst Case:   O(n log n)
 * Space Complexity:
 *   O(n) auxiliary space
 * Edge Cases Handled: NULL items, n <= 0, n = 1, duplicates, malloc failure.
 */
static void merge(BookSortItem* items, int* indices, int l, int m, int r, int* comparisons, int* swaps) {
    int n1 = m - l + 1, n2 = r - m;
    BookSortItem* L = (BookSortItem*)malloc(n1 * sizeof(BookSortItem));
    BookSortItem* R = (BookSortItem*)malloc(n2 * sizeof(BookSortItem));
    int* iL = (int*)malloc(n1 * sizeof(int));
    int* iR = (int*)malloc(n2 * sizeof(int));

    if (!L || !R || !iL || !iR) {
        free(L); free(R); free(iL); free(iR);
        return;
    }

    for (int i = 0; i < n1; i++) { L[i] = items[l + i]; iL[i] = indices[l + i]; }
    for (int j = 0; j < n2; j++) { R[j] = items[m + 1 + j]; iR[j] = indices[m + 1 + j]; }

    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        (*comparisons)++;
        if (L[i].sort_key <= R[j].sort_key) {
            items[k] = L[i]; indices[k] = iL[i]; i++;
        } else {
            items[k] = R[j]; indices[k] = iR[j]; j++;
        }
        (*swaps)++;
        k++;
    }
    while (i < n1) {
        items[k] = L[i]; indices[k] = iL[i]; i++; k++;
        (*swaps)++;
    }
    while (j < n2) {
        items[k] = R[j]; indices[k] = iR[j]; j++; k++;
        (*swaps)++;
    }
    free(L); free(R); free(iL); free(iR);
}

static void merge_sort_rec(BookSortItem* items, int* indices, int l, int r, int* comparisons, int* swaps) {
    if (l < r) {
        int m = l + (r - l) / 2;
        merge_sort_rec(items, indices, l, m, comparisons, swaps);
        merge_sort_rec(items, indices, m + 1, r, comparisons, swaps);
        merge(items, indices, l, m, r, comparisons, swaps);
    }
}

SortResult merge_sort(BookSortItem* items, int n) {
    SortResult res;
    res.indices = NULL;
    res.comparisons = 0;
    res.swaps = 0;
    res.time_ns = 0;

    if (!items || n <= 0) return res;

    res.indices = (int*)malloc(sizeof(int) * n);
    if (!res.indices) return res;
    for (int i = 0; i < n; i++) res.indices[i] = i;

    if (n == 1) return res;

    long long start = get_time_ns();
    merge_sort_rec(items, res.indices, 0, n - 1, &res.comparisons, &res.swaps);
    res.time_ns = get_time_ns() - start;
    return res;
}

/**
 * Quick Sort (Lomuto Partition Scheme)
 * Time Complexity:
 *   Best Case:    O(n log n)
 *   Average Case: O(n log n)
 *   Worst Case:   O(n^2)
 * Space Complexity:
 *   O(log n) auxiliary stack space (O(n) worst case)
 * Edge Cases Handled: NULL items, n <= 0, n = 1, duplicates, malloc failure.
 */
static int partition(BookSortItem* items, int* indices, int low, int high, int* comparisons, int* swaps) {
    BookSortItem pivot = items[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        (*comparisons)++;
        if (items[j].sort_key <= pivot.sort_key) {
            i++;
            if (i != j) {
                swap_items(&items[i], &items[j]);
                swap_int(&indices[i], &indices[j]);
                (*swaps)++;
            }
        }
    }
    if (i + 1 != high) {
        swap_items(&items[i + 1], &items[high]);
        swap_int(&indices[i + 1], &indices[high]);
        (*swaps)++;
    }
    return i + 1;
}

static void quick_sort_rec(BookSortItem* items, int* indices, int low, int high, int* comparisons, int* swaps) {
    if (low < high) {
        int pi = partition(items, indices, low, high, comparisons, swaps);
        quick_sort_rec(items, indices, low, pi - 1, comparisons, swaps);
        quick_sort_rec(items, indices, pi + 1, high, comparisons, swaps);
    }
}

SortResult quick_sort(BookSortItem* items, int n) {
    SortResult res;
    res.indices = NULL;
    res.comparisons = 0;
    res.swaps = 0;
    res.time_ns = 0;

    if (!items || n <= 0) return res;

    res.indices = (int*)malloc(sizeof(int) * n);
    if (!res.indices) return res;
    for (int i = 0; i < n; i++) res.indices[i] = i;

    if (n == 1) return res;

    long long start = get_time_ns();
    quick_sort_rec(items, res.indices, 0, n - 1, &res.comparisons, &res.swaps);
    res.time_ns = get_time_ns() - start;
    return res;
}

/**
 * Heap Sort (Max-Heap Construction followed by extraction)
 * Time Complexity:
 *   Best Case:    O(n log n)
 *   Average Case: O(n log n)
 *   Worst Case:   O(n log n)
 * Space Complexity:
 *   O(1) auxiliary space (in-place)
 * Edge Cases Handled: NULL items, n <= 0, n = 1, duplicates, malloc failure.
 */
static void heapify(BookSortItem* items, int* indices, int n, int i, int* comparisons, int* swaps) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;

    if (left < n) {
        (*comparisons)++;
        if (items[left].sort_key > items[largest].sort_key) {
            largest = left;
        }
    }
    if (right < n) {
        (*comparisons)++;
        if (items[right].sort_key > items[largest].sort_key) {
            largest = right;
        }
    }
    if (largest != i) {
        swap_items(&items[i], &items[largest]);
        swap_int(&indices[i], &indices[largest]);
        (*swaps)++;
        heapify(items, indices, n, largest, comparisons, swaps);
    }
}

SortResult heap_sort(BookSortItem* items, int n) {
    SortResult res;
    res.indices = NULL;
    res.comparisons = 0;
    res.swaps = 0;
    res.time_ns = 0;

    if (!items || n <= 0) return res;

    res.indices = (int*)malloc(sizeof(int) * n);
    if (!res.indices) return res;
    for (int i = 0; i < n; i++) res.indices[i] = i;

    if (n == 1) return res;

    long long start = get_time_ns();

    // 1. Build max heap (rearrange array)
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(items, res.indices, n, i, &res.comparisons, &res.swaps);
    }

    // 2. One by one extract elements from heap
    for (int i = n - 1; i > 0; i--) {
        swap_items(&items[0], &items[i]);
        swap_int(&res.indices[0], &res.indices[i]);
        res.swaps++;
        heapify(items, res.indices, i, 0, &res.comparisons, &res.swaps);
    }

    res.time_ns = get_time_ns() - start;
    return res;
}
